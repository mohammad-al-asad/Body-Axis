import ExpoModulesCore
import Foundation
import SQLite3
import UIKit

private enum DownloadStatus {
  static let queued = "queued"
  static let downloading = "downloading"
  static let paused = "paused"
  static let completed = "completed"
  static let failed = "failed"
  static let canceled = "canceled"
}

private struct OfflineSessionRecord {
  let id: String
  let title: String?
  let metadataJson: String
  let status: String
  let createdAt: Int64
  let updatedAt: Int64

  func toMap() -> [String: Any?] {
    [
      "id": id,
      "title": title,
      "metadataJson": metadataJson,
      "status": status,
      "createdAt": createdAt,
      "updatedAt": updatedAt
    ]
  }
}

private struct OfflineDownloadRecord {
  let id: String
  let sessionId: String
  let planId: String?
  let exerciseId: String?
  let videoId: String?
  let title: String?
  let sourceUrl: String
  let filePath: String
  let partialPath: String
  let mimeType: String?
  let headersJson: String?
  let metadataJson: String?
  let bytesDownloaded: Int64
  let totalBytes: Int64
  let progress: Double
  let status: String
  let error: String?
  let createdAt: Int64
  let updatedAt: Int64

  func toMap() -> [String: Any?] {
    let hasPlayableFile = status == DownloadStatus.completed && FileManager.default.fileExists(atPath: filePath)
    return [
      "id": id,
      "downloadId": id,
      "sessionId": sessionId,
      "planId": planId,
      "exerciseId": exerciseId,
      "videoId": videoId,
      "title": title,
      "url": sourceUrl,
      "filePath": filePath,
      "localUri": hasPlayableFile ? URL(fileURLWithPath: filePath).absoluteString : nil,
      "mimeType": mimeType,
      "bytesDownloaded": bytesDownloaded,
      "totalBytes": totalBytes,
      "progress": progress,
      "percentage": progress,
      "status": status,
      "error": error,
      "createdAt": createdAt,
      "updatedAt": updatedAt
    ]
  }
}

private enum OfflineDownloadPaths {
  static var root: URL {
    let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
    let root = base.appendingPathComponent("BodyAxisOffline", isDirectory: true)
    try? FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    var mutableRoot = root
    try? mutableRoot.setResourceValues(values)
    return root
  }

  static var videosRoot: URL {
    let url = root.appendingPathComponent("offline-videos", isDirectory: true)
    try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
    return url
  }

  static var databaseURL: URL {
    root.appendingPathComponent("body_axis_offline.sqlite")
  }

  static func finalURL(sessionId: String, downloadId: String, fileName: String?, sourceUrl: String) -> URL {
    let sessionDirectory = videosRoot.appendingPathComponent(sanitize(sessionId), isDirectory: true)
    try? FileManager.default.createDirectory(at: sessionDirectory, withIntermediateDirectories: true)
    let preferredName = (fileName?.isEmpty == false ? fileName : nil) ?? "\(sanitize(downloadId))\(fileExtension(from: sourceUrl))"
    return sessionDirectory.appendingPathComponent(sanitizeFileName(preferredName, sourceUrl: sourceUrl))
  }

  static func resumeDataURL(sessionId: String, downloadId: String, fileName: String?, sourceUrl: String) -> URL {
    URL(fileURLWithPath: finalURL(sessionId: sessionId, downloadId: downloadId, fileName: fileName, sourceUrl: sourceUrl).path + ".resume")
  }

  static func sanitize(_ value: String) -> String {
    let allowed = CharacterSet(charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-")
    let scalars = value.unicodeScalars.map { allowed.contains($0) ? Character($0) : "_" }
    let sanitized = String(scalars).trimmingCharacters(in: CharacterSet(charactersIn: "_"))
    return String((sanitized.isEmpty ? "download" : sanitized).prefix(96))
  }

  private static func sanitizeFileName(_ fileName: String, sourceUrl: String) -> String {
    let sanitized = sanitize(fileName)
    return sanitized.contains(".") ? sanitized : sanitized + fileExtension(from: sourceUrl)
  }

  private static func fileExtension(from sourceUrl: String) -> String {
    guard let extensionValue = URL(string: sourceUrl)?.pathExtension, !extensionValue.isEmpty, extensionValue.count <= 8 else {
      return ".mp4"
    }
    return ".\(extensionValue.lowercased())"
  }
}

private final class DownloadPayloadParser {
  static func parse(_ payload: [String: Any]) throws -> (OfflineSessionRecord, [OfflineDownloadRecord]) {
    guard let sessionId = string(payload["sessionId"]) else {
      throw NSError(domain: "Downloader", code: 1, userInfo: [NSLocalizedDescriptionKey: "saveSessionAsync requires sessionId"])
    }

    let now = Int64(Date().timeIntervalSince1970 * 1000)
    let session = OfflineSessionRecord(
      id: sessionId,
      title: string(payload["title"]),
      metadataJson: jsonString(payload["metadata"]) ?? "{}",
      status: DownloadStatus.queued,
      createdAt: now,
      updatedAt: now
    )

    let rawAssets = payload["assets"] as? [Any] ?? []
    let downloads: [OfflineDownloadRecord] = rawAssets.compactMap { item in
      guard let asset = item as? [String: Any], let url = string(asset["url"]) else {
        return nil
      }
      let downloadId = string(asset["id"]) ?? string(asset["downloadId"]) ?? "\(sessionId)_\(stableHash(url))"
      let fileName = string(asset["fileName"])
      let finalURL = OfflineDownloadPaths.finalURL(sessionId: sessionId, downloadId: downloadId, fileName: fileName, sourceUrl: url)
      let resumeURL = OfflineDownloadPaths.resumeDataURL(sessionId: sessionId, downloadId: downloadId, fileName: fileName, sourceUrl: url)
      return OfflineDownloadRecord(
        id: downloadId,
        sessionId: sessionId,
        planId: string(asset["planId"]),
        exerciseId: string(asset["exerciseId"]),
        videoId: string(asset["videoId"]),
        title: string(asset["title"]),
        sourceUrl: url,
        filePath: finalURL.path,
        partialPath: resumeURL.path,
        mimeType: string(asset["mimeType"]),
        headersJson: jsonString(asset["headers"]),
        metadataJson: jsonString(asset["metadata"]),
        bytesDownloaded: 0,
        totalBytes: -1,
        progress: 0,
        status: DownloadStatus.queued,
        error: nil,
        createdAt: now,
        updatedAt: now
      )
    }

    return (session, downloads)
  }

  private static func string(_ value: Any?) -> String? {
    guard let value, !(value is NSNull) else { return nil }
    if let stringValue = value as? String {
      return stringValue.isEmpty ? nil : stringValue
    }
    return "\(value)"
  }

  private static func jsonString(_ value: Any?) -> String? {
    guard let value, !(value is NSNull) else { return nil }
    if let stringValue = value as? String {
      return stringValue
    }
    guard JSONSerialization.isValidJSONObject(value),
          let data = try? JSONSerialization.data(withJSONObject: value),
          let string = String(data: data, encoding: .utf8) else {
      return nil
    }
    return string
  }

  private static func stableHash(_ value: String) -> UInt64 {
    value.utf8.reduce(UInt64(5381)) { (($0 << 5) &+ $0) &+ UInt64($1) }
  }
}

private final class OfflineDownloadDatabase {
  private let lock = NSLock()
  private var db: OpaquePointer?

  init() {
    sqlite3_open(OfflineDownloadPaths.databaseURL.path, &db)
    createTables()
  }

  deinit {
    sqlite3_close(db)
  }

  func upsertSession(_ session: OfflineSessionRecord) {
    let existing = getSession(session.id)
    run(
      """
      INSERT OR REPLACE INTO offline_sessions
      (id, title, metadata_json, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      """,
      [
        session.id,
        session.title,
        session.metadataJson,
        existing?.status ?? session.status,
        existing?.createdAt ?? session.createdAt,
        session.updatedAt
      ]
    )
  }

  func upsertDownload(_ download: OfflineDownloadRecord) {
    let existing = getDownload(download.id)
    // Only preserve completed status when the source URL and file path match exactly
    // AND the completed file actually exists on disk. This prevents stale "completed"
    // records from blocking fresh download requests.
    let completedFileExists = existing?.status == DownloadStatus.completed
      && existing?.sourceUrl == download.sourceUrl
      && existing?.filePath == download.filePath
      && FileManager.default.fileExists(atPath: existing?.filePath ?? "")
    let status: String
    let bytesDownloaded: Int64
    let totalBytes: Int64
    let progress: Double

    if completedFileExists {
      status = DownloadStatus.completed
      bytesDownloaded = existing?.bytesDownloaded ?? download.bytesDownloaded
      totalBytes = existing?.totalBytes ?? download.totalBytes
      progress = existing?.progress ?? download.progress
    } else {
      status = download.status
      bytesDownloaded = download.bytesDownloaded
      totalBytes = download.totalBytes
      progress = download.progress
    }

    run(
      """
      INSERT OR REPLACE INTO offline_downloads
      (id, session_id, plan_id, exercise_id, video_id, title, source_url, file_path, partial_path,
       mime_type, headers_json, metadata_json, bytes_downloaded, total_bytes, progress, status, error,
       created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      [
        download.id,
        download.sessionId,
        download.planId,
        download.exerciseId,
        download.videoId,
        download.title,
        download.sourceUrl,
        download.filePath,
        download.partialPath,
        download.mimeType,
        download.headersJson,
        download.metadataJson,
        bytesDownloaded,
        totalBytes,
        progress,
        status,
        status == DownloadStatus.completed ? nil : existing?.error,
        existing?.createdAt ?? download.createdAt,
        Int64(Date().timeIntervalSince1970 * 1000)
      ]
    )
  }

  func getDownloads(sessionId: String? = nil) -> [OfflineDownloadRecord] {
    if let sessionId, !sessionId.isEmpty {
      return query("SELECT * FROM offline_downloads WHERE session_id = ? ORDER BY created_at ASC", [sessionId], mapDownload)
    }
    return query("SELECT * FROM offline_downloads ORDER BY created_at ASC", [], mapDownload)
  }

  func getSessions() -> [OfflineSessionRecord] {
    query("SELECT * FROM offline_sessions ORDER BY updated_at DESC", [], mapSession)
  }

  func getSession(sessionId: String) -> OfflineSessionRecord? {
    query("SELECT * FROM offline_sessions WHERE id = ? LIMIT 1", [sessionId], mapSession).first
  }

  func getDownload(_ downloadId: String) -> OfflineDownloadRecord? {
    query("SELECT * FROM offline_downloads WHERE id = ? LIMIT 1", [downloadId], mapDownload).first
  }

  func getDownloads(ids: [String]) -> [OfflineDownloadRecord] {
    guard !ids.isEmpty else { return [] }
    let placeholders = ids.map { _ in "?" }.joined(separator: ",")
    return query("SELECT * FROM offline_downloads WHERE id IN (\(placeholders))", ids, mapDownload)
  }

  func getDownloads(statuses: [String]) -> [OfflineDownloadRecord] {
    guard !statuses.isEmpty else { return [] }
    let placeholders = statuses.map { _ in "?" }.joined(separator: ",")
    return query("SELECT * FROM offline_downloads WHERE status IN (\(placeholders)) ORDER BY created_at ASC", statuses, mapDownload)
  }

  func updateProgress(downloadId: String, bytesDownloaded: Int64, totalBytes: Int64) {
    let progress = totalBytes > 0 ? min(max((Double(bytesDownloaded) / Double(totalBytes)) * 100, 0), 100) : 0
    run(
      """
      UPDATE offline_downloads
      SET bytes_downloaded = ?, total_bytes = ?, progress = ?, status = ?, error = NULL, updated_at = ?
      WHERE id = ?
      """,
      [bytesDownloaded, totalBytes, progress, DownloadStatus.downloading, now(), downloadId]
    )
  }

  func updateStatus(downloadId: String, status: String, error: String? = nil) {
    run(
      "UPDATE offline_downloads SET status = ?, error = ?, updated_at = ? WHERE id = ?",
      [status, error, now(), downloadId]
    )
  }

  func markCompleted(downloadId: String) {
    guard let current = getDownload(downloadId) else { return }
    let size = max((try? FileManager.default.attributesOfItem(atPath: current.filePath)[.size] as? NSNumber)?.int64Value ?? 0, current.bytesDownloaded)
    run(
      """
      UPDATE offline_downloads
      SET bytes_downloaded = ?, total_bytes = ?, progress = 100, status = ?, error = NULL, updated_at = ?
      WHERE id = ?
      """,
      [size, size, DownloadStatus.completed, now(), downloadId]
    )
  }

  func removeSession(_ sessionId: String) -> [OfflineDownloadRecord] {
    let downloads = getDownloads(sessionId: sessionId)
    run("DELETE FROM offline_downloads WHERE session_id = ?", [sessionId])
    run("DELETE FROM offline_sessions WHERE id = ?", [sessionId])
    return downloads
  }

  private func getSession(_ sessionId: String) -> OfflineSessionRecord? {
    getSession(sessionId: sessionId)
  }

  private func createTables() {
    run(
      """
      CREATE TABLE IF NOT EXISTS offline_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT,
        metadata_json TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
      """
    )
    run(
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
      """
    )
  }

  private func run(_ sql: String, _ values: [Any?] = []) {
    lock.lock()
    defer { lock.unlock() }

    var statement: OpaquePointer?
    guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
      return
    }
    defer { sqlite3_finalize(statement) }

    bind(values, to: statement)
    sqlite3_step(statement)
  }

  private func query<T>(_ sql: String, _ values: [Any?] = [], _ mapper: (OpaquePointer?) -> T) -> [T] {
    lock.lock()
    defer { lock.unlock() }

    var statement: OpaquePointer?
    guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
      return []
    }
    defer { sqlite3_finalize(statement) }

    bind(values, to: statement)

    var rows: [T] = []
    while sqlite3_step(statement) == SQLITE_ROW {
      rows.append(mapper(statement))
    }
    return rows
  }

  private func bind(_ values: [Any?], to statement: OpaquePointer?) {
    for (index, value) in values.enumerated() {
      let position = Int32(index + 1)
      guard let value, !(value is NSNull) else {
        sqlite3_bind_null(statement, position)
        continue
      }
      switch value {
      case let string as String:
        sqlite3_bind_text(statement, position, string, -1, SQLITE_TRANSIENT)
      case let number as Int:
        sqlite3_bind_int64(statement, position, Int64(number))
      case let number as Int64:
        sqlite3_bind_int64(statement, position, number)
      case let number as Double:
        sqlite3_bind_double(statement, position, number)
      case let number as Bool:
        sqlite3_bind_int(statement, position, number ? 1 : 0)
      default:
        sqlite3_bind_text(statement, position, "\(value)", -1, SQLITE_TRANSIENT)
      }
    }
  }

  private func mapDownload(_ statement: OpaquePointer?) -> OfflineDownloadRecord {
    OfflineDownloadRecord(
      id: columnString(statement, 0) ?? "",
      sessionId: columnString(statement, 1) ?? "",
      planId: columnString(statement, 2),
      exerciseId: columnString(statement, 3),
      videoId: columnString(statement, 4),
      title: columnString(statement, 5),
      sourceUrl: columnString(statement, 6) ?? "",
      filePath: columnString(statement, 7) ?? "",
      partialPath: columnString(statement, 8) ?? "",
      mimeType: columnString(statement, 9),
      headersJson: columnString(statement, 10),
      metadataJson: columnString(statement, 11),
      bytesDownloaded: sqlite3_column_int64(statement, 12),
      totalBytes: sqlite3_column_int64(statement, 13),
      progress: sqlite3_column_double(statement, 14),
      status: columnString(statement, 15) ?? DownloadStatus.queued,
      error: columnString(statement, 16),
      createdAt: sqlite3_column_int64(statement, 17),
      updatedAt: sqlite3_column_int64(statement, 18)
    )
  }

  private func mapSession(_ statement: OpaquePointer?) -> OfflineSessionRecord {
    OfflineSessionRecord(
      id: columnString(statement, 0) ?? "",
      title: columnString(statement, 1),
      metadataJson: columnString(statement, 2) ?? "{}",
      status: columnString(statement, 3) ?? DownloadStatus.queued,
      createdAt: sqlite3_column_int64(statement, 4),
      updatedAt: sqlite3_column_int64(statement, 5)
    )
  }

  private func now() -> Int64 {
    Int64(Date().timeIntervalSince1970 * 1000)
  }
}

private func columnString(_ statement: OpaquePointer?, _ index: Int32) -> String? {
  guard sqlite3_column_type(statement, index) != SQLITE_NULL, let chars = sqlite3_column_text(statement, index) else {
    return nil
  }
  return String(cString: chars)
}

private let SQLITE_TRANSIENT = unsafeBitCast(OpaquePointer(bitPattern: -1), to: sqlite3_destructor_type.self)

private final class DownloaderManager: NSObject, URLSessionDownloadDelegate, URLSessionTaskDelegate {
  static let shared = DownloaderManager()

  private let database = OfflineDownloadDatabase()
  private let stateLock = NSLock()
  private var pausingIds = Set<String>()
  private var backgroundCompletionHandlers: [String: () -> Void] = [:]
  private weak var module: DownloaderModule?

  private lazy var session: URLSession = {
    let configuration = URLSessionConfiguration.background(withIdentifier: Self.backgroundIdentifier)
    configuration.sessionSendsLaunchEvents = true
    configuration.isDiscretionary = false
    configuration.allowsCellularAccess = true
    return URLSession(configuration: configuration, delegate: self, delegateQueue: nil)
  }()

  func attach(_ module: DownloaderModule) {
    self.module = module
  }

  func saveSession(_ payload: [String: Any]) throws -> [[String: Any?]] {
    let (sessionRecord, downloads) = try DownloadPayloadParser.parse(payload)
    database.upsertSession(sessionRecord)
    downloads.forEach { database.upsertDownload($0) }

    let queued = downloads.compactMap { database.getDownload($0.id) }.filter { $0.status != DownloadStatus.completed }

    // Wait for all download tasks to be created before returning results.
    // start() uses session.getAllTasks which is async; without waiting, the
    // returned records would still have "queued" status.
    let group = DispatchGroup()
    queued.forEach { record in
      group.enter()
      startAndNotify(record, group: group)
    }
    _ = group.wait(timeout: .now() + 5)

    return database.getDownloads(sessionId: sessionRecord.id).map { $0.toMap() }
  }

  func getDownloads(sessionId: String?) -> [[String: Any?]] {
    database.getDownloads(sessionId: sessionId?.isEmpty == false ? sessionId : nil).map { $0.toMap() }
  }

  func getSessions() -> [[String: Any?]] {
    database.getSessions().map { $0.toMap() }
  }

  func getSession(sessionId: String) -> [String: Any?]? {
    database.getSession(sessionId: sessionId)?.toMap()
  }

  func getDownload(downloadId: String) -> [String: Any?]? {
    database.getDownload(downloadId)?.toMap()
  }

  func getPlayableUri(downloadId: String) -> String? {
    guard let download = database.getDownload(downloadId),
          download.status == DownloadStatus.completed,
          FileManager.default.fileExists(atPath: download.filePath) else {
      return nil
    }
    return URL(fileURLWithPath: download.filePath).absoluteString
  }

  func pause(downloadId: String) {
    stateLock.withLock {
      pausingIds.insert(downloadId)
    }

    task(for: downloadId) { [weak self] task in
      guard let self else { return }
      guard let task else {
        self.database.updateStatus(downloadId: downloadId, status: DownloadStatus.paused)
        self.emit("downloadPaused", downloadId: downloadId)
        self.stateLock.withLock { self.pausingIds.remove(downloadId) }
        return
      }

      task.cancel { resumeData in
        if let resumeData, let record = self.database.getDownload(downloadId) {
          try? resumeData.write(to: URL(fileURLWithPath: record.partialPath), options: .atomic)
        }
        self.database.updateStatus(downloadId: downloadId, status: DownloadStatus.paused)
        self.emit("downloadPaused", downloadId: downloadId)
        self.stateLock.withLock { self.pausingIds.remove(downloadId) }
      }
    }
  }

  func resume(downloadId: String) {
    guard let record = database.getDownload(downloadId) else { return }
    database.updateStatus(downloadId: downloadId, status: DownloadStatus.queued)
    emit("downloadResumed", downloadId: downloadId)
    start(record)
  }

  func cancel(downloadId: String) {
    task(for: downloadId) { task in
      task?.cancel()
    }
    if let record = database.getDownload(downloadId) {
      try? FileManager.default.removeItem(atPath: record.filePath)
      try? FileManager.default.removeItem(atPath: record.partialPath)
    }
    database.updateStatus(downloadId: downloadId, status: DownloadStatus.canceled, error: "Canceled")
    emit("downloadCanceled", downloadId: downloadId)
  }

  func removeSession(sessionId: String) {
    let removed = database.removeSession(sessionId)
    removed.forEach { record in
      cancel(downloadId: record.id)
      try? FileManager.default.removeItem(atPath: record.filePath)
      try? FileManager.default.removeItem(atPath: record.partialPath)
    }
  }

  func resumePending() {
    database.getDownloads(statuses: [DownloadStatus.queued, DownloadStatus.downloading, DownloadStatus.failed]).forEach {
      start($0)
    }
  }

  func setBackgroundCompletionHandler(_ completionHandler: @escaping () -> Void, for identifier: String) {
    stateLock.withLock {
      backgroundCompletionHandlers[identifier] = completionHandler
    }
  }

  private func start(_ record: OfflineDownloadRecord) {
    startImpl(record, group: nil)
  }

  private func startAndNotify(_ record: OfflineDownloadRecord, group: DispatchGroup) {
    startImpl(record, group: group)
  }

  private func startImpl(_ record: OfflineDownloadRecord, group: DispatchGroup?) {
    task(for: record.id) { [weak self] existingTask in
      defer { group?.leave() }
      guard let self, existingTask == nil else { return }
      guard let url = URL(string: record.sourceUrl) else {
        self.database.updateStatus(downloadId: record.id, status: DownloadStatus.failed, error: "Invalid URL")
        self.emit("downloadFailed", downloadId: record.id)
        return
      }

      let resumeURL = URL(fileURLWithPath: record.partialPath)
      let task: URLSessionDownloadTask
      if let resumeData = try? Data(contentsOf: resumeURL), !resumeData.isEmpty {
        task = self.session.downloadTask(withResumeData: resumeData)
      } else {
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        if let headers = Self.headers(from: record.headersJson) {
          headers.forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        }
        task = self.session.downloadTask(with: request)
      }

      task.taskDescription = record.id
      self.database.updateStatus(downloadId: record.id, status: DownloadStatus.downloading)
      self.emit("downloadProgress", downloadId: record.id)
      task.resume()
    }
  }

  private func task(for downloadId: String, completion: @escaping (URLSessionTask?) -> Void) {
    session.getAllTasks { tasks in
      completion(tasks.first { $0.taskDescription == downloadId })
    }
  }

  private func emit(_ eventName: String, downloadId: String) {
    guard let record = database.getDownload(downloadId) else { return }
    emit(eventName, record: record)
  }

  private func emit(_ eventName: String, record: OfflineDownloadRecord) {
    DispatchQueue.main.async { [weak self] in
      self?.module?.sendEvent(eventName, record.toMap())
    }
  }

  private static func headers(from json: String?) -> [String: String]? {
    guard let json,
          let data = json.data(using: .utf8),
          let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
      return nil
    }
    return object.reduce(into: [String: String]()) { result, item in
      result[item.key] = "\(item.value)"
    }
  }

  func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didWriteData bytesWritten: Int64, totalBytesWritten: Int64, totalBytesExpectedToWrite: Int64) {
    guard let downloadId = downloadTask.taskDescription else { return }
    let totalBytes = totalBytesExpectedToWrite > 0 ? totalBytesExpectedToWrite : -1
    database.updateProgress(downloadId: downloadId, bytesDownloaded: totalBytesWritten, totalBytes: totalBytes)
    emit("downloadProgress", downloadId: downloadId)
  }

  func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
    guard let downloadId = downloadTask.taskDescription, let record = database.getDownload(downloadId) else {
      return
    }

    do {
      let finalURL = URL(fileURLWithPath: record.filePath)
      try FileManager.default.createDirectory(at: finalURL.deletingLastPathComponent(), withIntermediateDirectories: true)
      if FileManager.default.fileExists(atPath: finalURL.path) {
        try FileManager.default.removeItem(at: finalURL)
      }
      try FileManager.default.moveItem(at: location, to: finalURL)
      try? FileManager.default.removeItem(atPath: record.partialPath)
      database.markCompleted(downloadId: downloadId)
      emit("downloadCompleted", downloadId: downloadId)
    } catch {
      database.updateStatus(downloadId: downloadId, status: DownloadStatus.failed, error: error.localizedDescription)
      emit("downloadFailed", downloadId: downloadId)
    }
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    guard let error, let downloadId = task.taskDescription else { return }
    let isPausing = stateLock.withLock {
      pausingIds.contains(downloadId)
    }
    let status = database.getDownload(downloadId)?.status
    if isPausing || status == DownloadStatus.paused || status == DownloadStatus.canceled {
      return
    }

    if let resumeData = (error as NSError).userInfo[NSURLSessionDownloadTaskResumeData] as? Data,
       let record = database.getDownload(downloadId) {
      try? resumeData.write(to: URL(fileURLWithPath: record.partialPath), options: .atomic)
    }

    database.updateStatus(downloadId: downloadId, status: DownloadStatus.failed, error: error.localizedDescription)
    emit("downloadFailed", downloadId: downloadId)
  }

  func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
    guard let identifier = session.configuration.identifier else { return }
    let completion = stateLock.withLock {
      backgroundCompletionHandlers.removeValue(forKey: identifier)
    }
    DispatchQueue.main.async {
      completion?()
    }
  }

  private static let backgroundIdentifier = "com.jointhebodyinstitute.bodyaxis.downloader.background"
}

private extension NSLock {
  func withLock<T>(_ body: () -> T) -> T {
    lock()
    defer { unlock() }
    return body()
  }
}

public class DownloaderAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, handleEventsForBackgroundURLSession identifier: String, completionHandler: @escaping () -> Void) {
    DownloaderManager.shared.setBackgroundCompletionHandler(completionHandler, for: identifier)
  }
}

public class DownloaderModule: Module {
  public func definition() -> ModuleDefinition {
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
      DownloaderManager.shared.attach(self)
    }

    AsyncFunction("saveSessionAsync") { (payload: [String: Any]) throws -> [[String: Any?]] in
      try DownloaderManager.shared.saveSession(payload)
    }

    AsyncFunction("getDownloadsAsync") { (sessionId: String?) -> [[String: Any?]] in
      DownloaderManager.shared.getDownloads(sessionId: sessionId)
    }

    AsyncFunction("getSessionsAsync") { () -> [[String: Any?]] in
      DownloaderManager.shared.getSessions()
    }

    AsyncFunction("getSessionAsync") { (sessionId: String) -> [String: Any?]? in
      DownloaderManager.shared.getSession(sessionId: sessionId)
    }

    AsyncFunction("getDownloadAsync") { (downloadId: String) -> [String: Any?]? in
      DownloaderManager.shared.getDownload(downloadId: downloadId)
    }

    AsyncFunction("getPlayableUriAsync") { (downloadId: String) -> String? in
      DownloaderManager.shared.getPlayableUri(downloadId: downloadId)
    }

    AsyncFunction("pauseDownloadAsync") { (downloadId: String) -> Bool in
      DownloaderManager.shared.pause(downloadId: downloadId)
      return true
    }

    AsyncFunction("resumeDownloadAsync") { (downloadId: String) -> Bool in
      DownloaderManager.shared.resume(downloadId: downloadId)
      return true
    }

    AsyncFunction("cancelDownloadAsync") { (downloadId: String) -> Bool in
      DownloaderManager.shared.cancel(downloadId: downloadId)
      return true
    }

    AsyncFunction("removeSessionAsync") { (sessionId: String) -> Bool in
      DownloaderManager.shared.removeSession(sessionId: sessionId)
      return true
    }

    AsyncFunction("resumePendingDownloadsAsync") { () -> Bool in
      DownloaderManager.shared.resumePending()
      return true
    }
  }
}
