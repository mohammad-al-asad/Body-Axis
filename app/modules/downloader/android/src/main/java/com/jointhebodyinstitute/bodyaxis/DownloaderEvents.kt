package com.jointhebodyinstitute.bodyaxis

import android.os.Handler
import android.os.Looper
import java.lang.ref.WeakReference

object DownloaderEvents {
  private val mainHandler = Handler(Looper.getMainLooper())
  private var moduleRef: WeakReference<DownloaderModule>? = null

  fun attach(module: DownloaderModule) {
    moduleRef = WeakReference(module)
  }

  fun emit(eventName: String, payload: Map<String, Any?>) {
    mainHandler.post {
      moduleRef?.get()?.sendEvent(eventName, payload)
    }
  }
}
