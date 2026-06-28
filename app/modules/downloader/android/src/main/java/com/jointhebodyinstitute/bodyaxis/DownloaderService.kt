package com.jointhebodyinstitute.bodyaxis

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

class DownloaderService : Service() {
  private val executor = Executors.newFixedThreadPool(2)
  private val runningIds = Collections.newSetFromMap(ConcurrentHashMap<String, Boolean>())
  private val pausedIds = Collections.newSetFromMap(ConcurrentHashMap<String, Boolean>())
  private val canceledIds = Collections.newSetFromMap(ConcurrentHashMap<String, Boolean>())
  private val db by lazy { OfflineDownloadDatabase(applicationContext) }
  private val notificationManager by lazy { getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    ensureForeground()

    if (intent == null) {
      val pending = db.getDownloadsByStatus(listOf(DownloadStatus.QUEUED, DownloadStatus.DOWNLOADING))
      startDownloads(pending.map { it.id })
      updateNotification()
      return START_STICKY
    }

    when (intent.action) {
      ACTION_ENQUEUE -> {
        val ids = intent.getStringArrayListExtra(EXTRA_DOWNLOAD_IDS).orEmpty()
        startDownloads(ids)
      }
      ACTION_PAUSE -> pauseDownload(intent.getStringExtra(EXTRA_DOWNLOAD_ID))
      ACTION_RESUME -> resumeDownload(intent.getStringExtra(EXTRA_DOWNLOAD_ID))
      ACTION_CANCEL -> cancelDownload(intent.getStringExtra(EXTRA_DOWNLOAD_ID))
      ACTION_RESUME_PENDING -> {
        val pending = db.getDownloadsByStatus(listOf(DownloadStatus.QUEUED, DownloadStatus.DOWNLOADING, DownloadStatus.FAILED))
        startDownloads(pending.map { it.id })
      }
    }

    updateNotification()
    return START_STICKY
  }

  override fun onDestroy() {
    executor.shutdownNow()
    super.onDestroy()
  }

  private fun startDownloads(ids: List<String>) {
    db.getDownloadsByIds(ids).forEach { record ->
      if (record.status == DownloadStatus.COMPLETED || runningIds.contains(record.id)) return@forEach
      canceledIds.remove(record.id)
      if (record.status != DownloadStatus.PAUSED) {
        db.updateStatus(record.id, DownloadStatus.QUEUED)
      }
      runningIds.add(record.id)
      executor.execute { download(record.id) }
    }
  }

  private fun pauseDownload(downloadId: String?) {
    if (downloadId.isNullOrBlank()) return
    pausedIds.add(downloadId)
    db.updateStatus(downloadId, DownloadStatus.PAUSED)
    db.getDownload(downloadId)?.let {
      DownloaderEvents.emit("downloadPaused", it.toMap())
    }
  }

  private fun resumeDownload(downloadId: String?) {
    if (downloadId.isNullOrBlank()) return
    pausedIds.remove(downloadId)
    canceledIds.remove(downloadId)
    db.updateStatus(downloadId, DownloadStatus.QUEUED)
    db.getDownload(downloadId)?.let {
      DownloaderEvents.emit("downloadResumed", it.toMap())
      startDownloads(listOf(downloadId))
    }
  }

  private fun cancelDownload(downloadId: String?) {
    if (downloadId.isNullOrBlank()) return
    canceledIds.add(downloadId)
    pausedIds.remove(downloadId)
    db.updateStatus(downloadId, DownloadStatus.CANCELED, "Canceled")
    db.getDownload(downloadId)?.let {
      File(it.filePath).delete()
      File(it.partialPath).delete()
      DownloaderEvents.emit("downloadCanceled", it.toMap())
    }
  }

  private fun download(downloadId: String) {
    try {
      var record = db.getDownload(downloadId) ?: return
      if (record.status == DownloadStatus.PAUSED) {
        runningIds.remove(downloadId)
        return
      }

      File(record.filePath).parentFile?.mkdirs()
      File(record.partialPath).parentFile?.mkdirs()

      val finalFile = File(record.filePath)
      if (finalFile.exists() && finalFile.length() > 0L) {
        db.markCompleted(downloadId)
        db.getDownload(downloadId)?.let {
          DownloaderEvents.emit("downloadCompleted", it.toMap())
        }
        return
      }

      val partialFile = File(record.partialPath)
      var existingBytes = if (partialFile.exists()) partialFile.length() else 0L
      db.updateProgress(downloadId, existingBytes, record.totalBytes)
      emitProgress(downloadId)

      val connection = (URL(record.sourceUrl).openConnection() as HttpURLConnection).apply {
        connectTimeout = 20_000
        readTimeout = 30_000
        instanceFollowRedirects = true
        requestMethod = "GET"
        record.headersJson?.let { json ->
          val headers = JSONObject(json)
          headers.keys().forEach { key ->
            setRequestProperty(key, headers.optString(key))
          }
        }
        if (existingBytes > 0L) {
          setRequestProperty("Range", "bytes=$existingBytes-")
        }
      }

      connection.connect()
      val responseCode = connection.responseCode
      if (responseCode !in 200..299) {
        throw IllegalStateException("HTTP $responseCode")
      }

      val isPartialResponse = responseCode == HttpURLConnection.HTTP_PARTIAL
      if (existingBytes > 0L && !isPartialResponse) {
        partialFile.delete()
        existingBytes = 0L
      }

      val contentLength = connection.getHeaderFieldLong("Content-Length", -1L)
      val totalBytes = if (isPartialResponse && contentLength > -1L) {
        existingBytes + contentLength
      } else if (contentLength > -1L) {
        contentLength
      } else {
        record.totalBytes
      }

      db.updateProgress(downloadId, existingBytes, totalBytes)
      db.updateStatus(downloadId, DownloadStatus.DOWNLOADING)
      emitProgress(downloadId)

      var downloaded = existingBytes
      var lastPublishAt = 0L

      BufferedInputStream(connection.inputStream).use { input ->
        BufferedOutputStream(FileOutputStream(partialFile, existingBytes > 0L && isPartialResponse)).use { output ->
          val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
          while (true) {
            if (canceledIds.contains(downloadId)) {
              partialFile.delete()
              db.updateStatus(downloadId, DownloadStatus.CANCELED, "Canceled")
              emitFailure(downloadId)
              return
            }

            if (pausedIds.contains(downloadId)) {
              db.updateProgress(downloadId, downloaded, totalBytes)
              db.updateStatus(downloadId, DownloadStatus.PAUSED)
              emitPaused(downloadId)
              return
            }

            val read = input.read(buffer)
            if (read == -1) break

            output.write(buffer, 0, read)
            downloaded += read.toLong()

            val now = System.currentTimeMillis()
            if (now - lastPublishAt >= EVENT_THROTTLE_MS || (totalBytes > 0 && downloaded >= totalBytes)) {
              db.updateProgress(downloadId, downloaded, totalBytes)
              emitProgress(downloadId)
              updateNotification()
              lastPublishAt = now
            }
          }
          output.flush()
        }
      }

      connection.disconnect()

      if (finalFile.exists()) finalFile.delete()
      if (!partialFile.renameTo(finalFile)) {
        partialFile.copyTo(finalFile, overwrite = true)
        partialFile.delete()
      }

      db.markCompleted(downloadId)
      db.getDownload(downloadId)?.let {
        DownloaderEvents.emit("downloadCompleted", it.toMap())
      }
    } catch (exception: Exception) {
      db.updateStatus(downloadId, DownloadStatus.FAILED, exception.message ?: "Download failed")
      emitFailure(downloadId)
    } finally {
      runningIds.remove(downloadId)
      updateNotification()
      stopIfIdle()
    }
  }

  private fun emitProgress(downloadId: String) {
    db.getDownload(downloadId)?.let {
      DownloaderEvents.emit("downloadProgress", it.toMap())
    }
  }

  private fun emitFailure(downloadId: String) {
    db.getDownload(downloadId)?.let {
      DownloaderEvents.emit("downloadFailed", it.toMap())
    }
  }

  private fun emitPaused(downloadId: String) {
    db.getDownload(downloadId)?.let {
      DownloaderEvents.emit("downloadPaused", it.toMap())
    }
  }

  private fun ensureForeground() {
    createNotificationChannel()
    val notification = buildNotification()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }

  private fun updateNotification() {
    createNotificationChannel()
    notificationManager.notify(NOTIFICATION_ID, buildNotification())
  }

  private fun buildNotification(): Notification {
    val activeDownloads = db.getDownloadsByStatus(listOf(DownloadStatus.QUEUED, DownloadStatus.DOWNLOADING))
    val runningCount = activeDownloads.size
    val title = when {
      runningCount == 0 -> "Downloads paused"
      runningCount == 1 -> activeDownloads.first().title ?: "Downloading video"
      else -> "Downloading $runningCount videos"
    }
    val knownTotal = activeDownloads.sumOf { if (it.totalBytes > 0L) it.totalBytes else 0L }
    val knownDownloaded = activeDownloads.sumOf { it.bytesDownloaded.coerceAtLeast(0L) }
    val hasKnownProgress = runningCount > 0 && knownTotal > 0L
    val percent = if (hasKnownProgress) ((knownDownloaded.toDouble() / knownTotal.toDouble()) * 100).toInt().coerceIn(0, 100) else 0
    val text = if (hasKnownProgress) "$percent% complete" else "Preparing offline videos"
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pendingIntent = launchIntent?.let {
      PendingIntent.getActivity(
        this,
        0,
        it,
        PendingIntent.FLAG_UPDATE_CURRENT or immutableFlag()
      )
    }

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      Notification.Builder(this)
    }

    builder
      .setSmallIcon(android.R.drawable.stat_sys_download)
      .setContentTitle(title)
      .setContentText(text)
      .setOngoing(runningCount > 0)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)

    pendingIntent?.let { builder.setContentIntent(it) }
    builder.setProgress(100, percent, !hasKnownProgress && runningCount > 0)

    return builder.build()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Offline downloads",
      NotificationManager.IMPORTANCE_LOW
    ).apply {
      description = "Shows progress for Body Axis offline video downloads"
      setSound(null, null)
    }
    notificationManager.createNotificationChannel(channel)
  }

  private fun stopIfIdle() {
    val activeDownloads = db.getDownloadsByStatus(listOf(DownloadStatus.QUEUED, DownloadStatus.DOWNLOADING))
    if (runningIds.isEmpty() && activeDownloads.isEmpty()) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        stopForeground(STOP_FOREGROUND_REMOVE)
      } else {
        @Suppress("DEPRECATION")
        stopForeground(true)
      }
      stopSelf()
    }
  }

  private fun immutableFlag(): Int = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0

  companion object {
    private const val ACTION_ENQUEUE = "com.jointhebodyinstitute.bodyaxis.downloader.ENQUEUE"
    private const val ACTION_PAUSE = "com.jointhebodyinstitute.bodyaxis.downloader.PAUSE"
    private const val ACTION_RESUME = "com.jointhebodyinstitute.bodyaxis.downloader.RESUME"
    private const val ACTION_CANCEL = "com.jointhebodyinstitute.bodyaxis.downloader.CANCEL"
    private const val ACTION_RESUME_PENDING = "com.jointhebodyinstitute.bodyaxis.downloader.RESUME_PENDING"
    private const val EXTRA_DOWNLOAD_IDS = "downloadIds"
    private const val EXTRA_DOWNLOAD_ID = "downloadId"
    private const val CHANNEL_ID = "body_axis_offline_downloads"
    private const val NOTIFICATION_ID = 4242
    private const val EVENT_THROTTLE_MS = 500L
    private const val DEFAULT_BUFFER_SIZE = 64 * 1024

    fun enqueue(context: Context, downloadIds: List<String>) {
      if (downloadIds.isEmpty()) return
      val intent = Intent(context, DownloaderService::class.java).apply {
        action = ACTION_ENQUEUE
        putStringArrayListExtra(EXTRA_DOWNLOAD_IDS, ArrayList(downloadIds))
      }
      context.startForegroundDownloaderService(intent)
    }

    fun pause(context: Context, downloadId: String) {
      context.startForegroundDownloaderService(Intent(context, DownloaderService::class.java).apply {
        action = ACTION_PAUSE
        putExtra(EXTRA_DOWNLOAD_ID, downloadId)
      })
    }

    fun resume(context: Context, downloadId: String) {
      context.startForegroundDownloaderService(Intent(context, DownloaderService::class.java).apply {
        action = ACTION_RESUME
        putExtra(EXTRA_DOWNLOAD_ID, downloadId)
      })
    }

    fun cancel(context: Context, downloadId: String) {
      context.startForegroundDownloaderService(Intent(context, DownloaderService::class.java).apply {
        action = ACTION_CANCEL
        putExtra(EXTRA_DOWNLOAD_ID, downloadId)
      })
    }

    fun resumePending(context: Context) {
      context.startForegroundDownloaderService(Intent(context, DownloaderService::class.java).apply {
        action = ACTION_RESUME_PENDING
      })
    }
  }
}

private fun Context.startForegroundDownloaderService(intent: Intent) {
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    startForegroundService(intent)
  } else {
    startService(intent)
  }
}
