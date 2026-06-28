package com.jointhebodyinstitute.bodyaxis

import android.content.Context
import android.net.Uri
import org.json.JSONObject
import java.io.File
import java.net.URL
import java.util.Locale

object DownloadStatus {
  const val QUEUED = "queued"
  const val DOWNLOADING = "downloading"
  const val PAUSED = "paused"
  const val COMPLETED = "completed"
  const val FAILED = "failed"
  const val CANCELED = "canceled"
}

data class OfflineSession(
  val id: String,
  val title: String?,
  val metadataJson: String,
  val status: String,
  val createdAt: Long,
  val updatedAt: Long
) {
  fun toMap(): Map<String, Any?> = mapOf(
    "id" to id,
    "title" to title,
    "metadataJson" to metadataJson,
    "status" to status,
    "createdAt" to createdAt,
    "updatedAt" to updatedAt
  )
}

data class OfflineDownload(
  val id: String,
  val sessionId: String,
  val planId: String?,
  val exerciseId: String?,
  val videoId: String?,
  val title: String?,
  val sourceUrl: String,
  val filePath: String,
  val partialPath: String,
  val mimeType: String?,
  val headersJson: String?,
  val metadataJson: String?,
  val bytesDownloaded: Long,
  val totalBytes: Long,
  val progress: Double,
  val status: String,
  val error: String?,
  val createdAt: Long,
  val updatedAt: Long
) {
  fun toMap(): Map<String, Any?> {
    val file = File(filePath)
    return mapOf(
      "id" to id,
      "downloadId" to id,
      "sessionId" to sessionId,
      "planId" to planId,
      "exerciseId" to exerciseId,
      "videoId" to videoId,
      "title" to title,
      "url" to sourceUrl,
      "filePath" to filePath,
      "localUri" to if (status == DownloadStatus.COMPLETED && file.exists()) Uri.fromFile(file).toString() else null,
      "mimeType" to mimeType,
      "bytesDownloaded" to bytesDownloaded,
      "totalBytes" to totalBytes,
      "progress" to progress,
      "percentage" to progress,
      "status" to status,
      "error" to error,
      "createdAt" to createdAt,
      "updatedAt" to updatedAt
    )
  }
}

object OfflineDownloadPaths {
  fun videosRoot(context: Context): File = File(context.filesDir, "offline-videos")

  fun finalFile(context: Context, sessionId: String, downloadId: String, fileName: String?, sourceUrl: String): File {
    val sessionDir = File(videosRoot(context), sanitize(sessionId))
    val preferredName = fileName?.takeIf { it.isNotBlank() } ?: "${sanitize(downloadId)}${extensionFromUrl(sourceUrl)}"
    return File(sessionDir, sanitizeFileName(preferredName, sourceUrl))
  }

  fun partialFile(context: Context, sessionId: String, downloadId: String, fileName: String?, sourceUrl: String): File {
    return File(finalFile(context, sessionId, downloadId, fileName, sourceUrl).absolutePath + ".partial")
  }

  fun sanitize(value: String): String {
    val sanitized = value.replace(Regex("[^A-Za-z0-9._-]"), "_").trim('_')
    return sanitized.take(96).ifBlank { "download" }
  }

  private fun sanitizeFileName(fileName: String, sourceUrl: String): String {
    val sanitized = sanitize(fileName)
    if (sanitized.contains('.')) return sanitized
    return sanitized + extensionFromUrl(sourceUrl)
  }

  private fun extensionFromUrl(sourceUrl: String): String {
    return try {
      val path = URL(sourceUrl).path
      val name = path.substringAfterLast('/')
      val extension = name.substringAfterLast('.', "")
      if (extension.isNotBlank() && extension.length <= 8) ".${extension.lowercase(Locale.US)}" else ".mp4"
    } catch (_: Exception) {
      ".mp4"
    }
  }
}

object DownloadPayloadParser {
  fun parse(context: Context, payload: Map<String, Any?>): Pair<OfflineSession, List<OfflineDownload>> {
    val now = System.currentTimeMillis()
    val sessionId = payload.stringValue("sessionId") ?: error("saveSessionAsync requires sessionId")
    val metadataJson = payload.jsonValue("metadata") ?: "{}"
    val session = OfflineSession(
      id = sessionId,
      title = payload.stringValue("title"),
      metadataJson = metadataJson,
      status = DownloadStatus.QUEUED,
      createdAt = now,
      updatedAt = now
    )

    val assets = payload["assets"] as? List<*> ?: emptyList<Any?>()
    val downloads = assets.mapNotNull { item ->
      val asset = item as? Map<*, *> ?: return@mapNotNull null
      val url = asset.stringValue("url") ?: return@mapNotNull null
      val downloadId = asset.stringValue("id")
        ?: asset.stringValue("downloadId")
        ?: "${sessionId}_${url.hashCode()}"
      val fileName = asset.stringValue("fileName")
      val finalFile = OfflineDownloadPaths.finalFile(context, sessionId, downloadId, fileName, url)
      val partialFile = OfflineDownloadPaths.partialFile(context, sessionId, downloadId, fileName, url)
      OfflineDownload(
        id = downloadId,
        sessionId = sessionId,
        planId = asset.stringValue("planId"),
        exerciseId = asset.stringValue("exerciseId"),
        videoId = asset.stringValue("videoId"),
        title = asset.stringValue("title"),
        sourceUrl = url,
        filePath = finalFile.absolutePath,
        partialPath = partialFile.absolutePath,
        mimeType = asset.stringValue("mimeType"),
        headersJson = asset.jsonValue("headers"),
        metadataJson = asset.jsonValue("metadata"),
        bytesDownloaded = 0L,
        totalBytes = -1L,
        progress = 0.0,
        status = DownloadStatus.QUEUED,
        error = null,
        createdAt = now,
        updatedAt = now
      )
    }

    return session to downloads
  }
}

fun Map<*, *>.stringValue(key: String): String? = this[key]?.toString()?.takeIf { it.isNotBlank() }

fun Map<*, *>.jsonValue(key: String): String? {
  val value = this[key] ?: return null
  if (value is String) return value
  return try {
    JSONObject.wrap(value)?.toString()
  } catch (_: Exception) {
    null
  }
}
