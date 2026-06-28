package com.jointhebodyinstitute.bodyaxis

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import java.io.File

class OfflineDownloadDatabase(context: Context) : SQLiteOpenHelper(
  context.applicationContext,
  DATABASE_NAME,
  null,
  DATABASE_VERSION
) {
  override fun onCreate(db: SQLiteDatabase) {
    db.execSQL(
      """
      CREATE TABLE IF NOT EXISTS offline_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT,
        metadata_json TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
      """.trimIndent()
    )

    db.execSQL(
      """
      CREATE TABLE IF NOT EXISTS offline_downloads (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        plan_id TEXT,
        exercise_id TEXT,
        video_id TEXT,
        title TEXT,
        source_url TEXT NOT NULL,
        file_path TEXT NOT NULL,
        partial_path TEXT NOT NULL,
        mime_type TEXT,
        headers_json TEXT,
        metadata_json TEXT,
        bytes_downloaded INTEGER NOT NULL DEFAULT 0,
        total_bytes INTEGER NOT NULL DEFAULT -1,
        progress REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
      """.trimIndent()
    )
  }

  override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
    if (oldVersion < 2) {
      db.execSQL("ALTER TABLE offline_downloads ADD COLUMN headers_json TEXT")
    }
  }

  @Synchronized
  fun upsertSession(session: OfflineSession) {
    val existing = getSession(session.id)
    val values = ContentValues().apply {
      put("id", session.id)
      put("title", session.title)
      put("metadata_json", session.metadataJson)
      put("status", existing?.status ?: session.status)
      put("created_at", existing?.createdAt ?: session.createdAt)
      put("updated_at", session.updatedAt)
    }
    writableDatabase.insertWithOnConflict("offline_sessions", null, values, SQLiteDatabase.CONFLICT_REPLACE)
  }

  @Synchronized
  fun upsertDownload(download: OfflineDownload) {
    val existing = getDownload(download.id)
    val nextStatus = if (existing?.status == DownloadStatus.COMPLETED && File(existing.filePath).exists()) {
      DownloadStatus.COMPLETED
    } else {
      download.status
    }
    val values = ContentValues().apply {
      put("id", download.id)
      put("session_id", download.sessionId)
      put("plan_id", download.planId)
      put("exercise_id", download.exerciseId)
      put("video_id", download.videoId)
      put("title", download.title)
      put("source_url", download.sourceUrl)
      put("file_path", download.filePath)
      put("partial_path", download.partialPath)
      put("mime_type", download.mimeType)
      put("headers_json", download.headersJson)
      put("metadata_json", download.metadataJson)
      put("bytes_downloaded", existing?.bytesDownloaded ?: download.bytesDownloaded)
      put("total_bytes", existing?.totalBytes ?: download.totalBytes)
      put("progress", existing?.progress ?: download.progress)
      put("status", nextStatus)
      put("error", if (nextStatus == DownloadStatus.COMPLETED) null else existing?.error)
      put("created_at", existing?.createdAt ?: download.createdAt)
      put("updated_at", System.currentTimeMillis())
    }
    writableDatabase.insertWithOnConflict("offline_downloads", null, values, SQLiteDatabase.CONFLICT_REPLACE)
  }

  @Synchronized
  fun getSession(sessionId: String): OfflineSession? {
    readableDatabase.query(
      "offline_sessions",
      null,
      "id = ?",
      arrayOf(sessionId),
      null,
      null,
      null,
      "1"
    ).use { cursor ->
      return if (cursor.moveToFirst()) cursor.toSession() else null
    }
  }

  @Synchronized
  fun getSessions(): List<OfflineSession> {
    readableDatabase.query(
      "offline_sessions",
      null,
      null,
      null,
      null,
      null,
      "updated_at DESC"
    ).use { cursor ->
      val sessions = mutableListOf<OfflineSession>()
      while (cursor.moveToNext()) {
        sessions.add(cursor.toSession())
      }
      return sessions
    }
  }

  @Synchronized
  fun getDownload(downloadId: String): OfflineDownload? {
    readableDatabase.query(
      "offline_downloads",
      null,
      "id = ?",
      arrayOf(downloadId),
      null,
      null,
      null,
      "1"
    ).use { cursor ->
      return if (cursor.moveToFirst()) cursor.toDownload() else null
    }
  }

  @Synchronized
  fun getDownloads(sessionId: String? = null): List<OfflineDownload> {
    val selection = sessionId?.let { "session_id = ?" }
    val args = sessionId?.let { arrayOf(it) }
    readableDatabase.query(
      "offline_downloads",
      null,
      selection,
      args,
      null,
      null,
      "created_at ASC"
    ).use { cursor ->
      return cursor.toDownloads()
    }
  }

  @Synchronized
  fun getDownloadsByIds(ids: List<String>): List<OfflineDownload> {
    if (ids.isEmpty()) return emptyList()
    val placeholders = ids.joinToString(",") { "?" }
    readableDatabase.rawQuery(
      "SELECT * FROM offline_downloads WHERE id IN ($placeholders)",
      ids.toTypedArray()
    ).use { cursor ->
      return cursor.toDownloads()
    }
  }

  @Synchronized
  fun getDownloadsByStatus(statuses: List<String>): List<OfflineDownload> {
    if (statuses.isEmpty()) return emptyList()
    val placeholders = statuses.joinToString(",") { "?" }
    readableDatabase.rawQuery(
      "SELECT * FROM offline_downloads WHERE status IN ($placeholders) ORDER BY created_at ASC",
      statuses.toTypedArray()
    ).use { cursor ->
      return cursor.toDownloads()
    }
  }

  @Synchronized
  fun updateProgress(downloadId: String, bytesDownloaded: Long, totalBytes: Long) {
    val progress = if (totalBytes > 0) ((bytesDownloaded.toDouble() / totalBytes.toDouble()) * 100.0).coerceIn(0.0, 100.0) else 0.0
    val values = ContentValues().apply {
      put("bytes_downloaded", bytesDownloaded)
      put("total_bytes", totalBytes)
      put("progress", progress)
      put("status", DownloadStatus.DOWNLOADING)
      put("error", null as String?)
      put("updated_at", System.currentTimeMillis())
    }
    writableDatabase.update("offline_downloads", values, "id = ?", arrayOf(downloadId))
  }

  @Synchronized
  fun updateStatus(downloadId: String, status: String, error: String? = null) {
    val values = ContentValues().apply {
      put("status", status)
      put("error", error)
      put("updated_at", System.currentTimeMillis())
    }
    writableDatabase.update("offline_downloads", values, "id = ?", arrayOf(downloadId))
  }

  @Synchronized
  fun markCompleted(downloadId: String) {
    val current = getDownload(downloadId) ?: return
    val finalSize = File(current.filePath).length().coerceAtLeast(current.bytesDownloaded)
    val values = ContentValues().apply {
      put("bytes_downloaded", finalSize)
      put("total_bytes", finalSize)
      put("progress", 100.0)
      put("status", DownloadStatus.COMPLETED)
      put("error", null as String?)
      put("updated_at", System.currentTimeMillis())
    }
    writableDatabase.update("offline_downloads", values, "id = ?", arrayOf(downloadId))
  }

  @Synchronized
  fun removeSession(sessionId: String): List<OfflineDownload> {
    val downloads = getDownloads(sessionId)
    writableDatabase.delete("offline_downloads", "session_id = ?", arrayOf(sessionId))
    writableDatabase.delete("offline_sessions", "id = ?", arrayOf(sessionId))
    return downloads
  }

  companion object {
    private const val DATABASE_NAME = "body_axis_offline.db"
    private const val DATABASE_VERSION = 2
  }
}

private fun Cursor.toSession(): OfflineSession = OfflineSession(
  id = getString(getColumnIndexOrThrow("id")),
  title = getNullableString("title"),
  metadataJson = getString(getColumnIndexOrThrow("metadata_json")),
  status = getString(getColumnIndexOrThrow("status")),
  createdAt = getLong(getColumnIndexOrThrow("created_at")),
  updatedAt = getLong(getColumnIndexOrThrow("updated_at"))
)

private fun Cursor.toDownloads(): List<OfflineDownload> {
  val downloads = mutableListOf<OfflineDownload>()
  while (moveToNext()) {
    downloads.add(toDownload())
  }
  return downloads
}

private fun Cursor.toDownload(): OfflineDownload = OfflineDownload(
  id = getString(getColumnIndexOrThrow("id")),
  sessionId = getString(getColumnIndexOrThrow("session_id")),
  planId = getNullableString("plan_id"),
  exerciseId = getNullableString("exercise_id"),
  videoId = getNullableString("video_id"),
  title = getNullableString("title"),
  sourceUrl = getString(getColumnIndexOrThrow("source_url")),
  filePath = getString(getColumnIndexOrThrow("file_path")),
  partialPath = getString(getColumnIndexOrThrow("partial_path")),
  mimeType = getNullableString("mime_type"),
  headersJson = getNullableString("headers_json"),
  metadataJson = getNullableString("metadata_json"),
  bytesDownloaded = getLong(getColumnIndexOrThrow("bytes_downloaded")),
  totalBytes = getLong(getColumnIndexOrThrow("total_bytes")),
  progress = getDouble(getColumnIndexOrThrow("progress")),
  status = getString(getColumnIndexOrThrow("status")),
  error = getNullableString("error"),
  createdAt = getLong(getColumnIndexOrThrow("created_at")),
  updatedAt = getLong(getColumnIndexOrThrow("updated_at"))
)

private fun Cursor.getNullableString(column: String): String? {
  val index = getColumnIndexOrThrow(column)
  return if (isNull(index)) null else getString(index)
}
