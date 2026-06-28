package com.jointhebodyinstitute.bodyaxis

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class DownloaderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Downloader")

    Events(
      "downloadProgress",
      "downloadCompleted",
      "downloadFailed",
      "downloadPaused",
      "downloadResumed",
      "downloadCanceled"
    )

    OnCreate {
      DownloaderEvents.attach(this@DownloaderModule)
    }

    AsyncFunction("saveSessionAsync") { payload: Map<String, Any?> ->
      val context = requireContext()
      val db = OfflineDownloadDatabase(context)
      val (session, downloads) = DownloadPayloadParser.parse(context, payload)

      db.upsertSession(session)
      downloads.forEach { db.upsertDownload(it) }

      val queuedIds = downloads
        .mapNotNull { db.getDownload(it.id) }
        .filter { it.status != DownloadStatus.COMPLETED }
        .map { it.id }
      DownloaderService.enqueue(context, queuedIds)

      db.getDownloads(session.id).map { it.toMap() }
    }

    AsyncFunction("getDownloadsAsync") { sessionId: String? ->
      OfflineDownloadDatabase(requireContext())
        .getDownloads(sessionId?.takeIf { it.isNotBlank() })
        .map { it.toMap() }
    }

    AsyncFunction("getSessionsAsync") {
      OfflineDownloadDatabase(requireContext())
        .getSessions()
        .map { it.toMap() }
    }

    AsyncFunction("getSessionAsync") { sessionId: String ->
      OfflineDownloadDatabase(requireContext()).getSession(sessionId)?.toMap()
    }

    AsyncFunction("getDownloadAsync") { downloadId: String ->
      OfflineDownloadDatabase(requireContext()).getDownload(downloadId)?.toMap()
    }

    AsyncFunction("getPlayableUriAsync") { downloadId: String ->
      val download = OfflineDownloadDatabase(requireContext()).getDownload(downloadId)
      if (download?.status == DownloadStatus.COMPLETED && File(download.filePath).exists()) {
        download.toMap()["localUri"] as? String
      } else {
        null
      }
    }

    AsyncFunction("pauseDownloadAsync") { downloadId: String ->
      DownloaderService.pause(requireContext(), downloadId)
      true
    }

    AsyncFunction("resumeDownloadAsync") { downloadId: String ->
      DownloaderService.resume(requireContext(), downloadId)
      true
    }

    AsyncFunction("cancelDownloadAsync") { downloadId: String ->
      DownloaderService.cancel(requireContext(), downloadId)
      true
    }

    AsyncFunction("removeSessionAsync") { sessionId: String ->
      val context = requireContext()
      val removed = OfflineDownloadDatabase(context).removeSession(sessionId)
      removed.forEach {
        File(it.filePath).delete()
        File(it.partialPath).delete()
      }
      true
    }

    AsyncFunction("resumePendingDownloadsAsync") {
      DownloaderService.resumePending(requireContext())
      true
    }
  }

  private fun requireContext(): Context {
    return appContext.reactContext ?: throw IllegalStateException("React context is not available")
  }
}
