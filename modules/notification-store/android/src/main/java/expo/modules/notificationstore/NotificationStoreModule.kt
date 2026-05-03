package expo.modules.notificationstore

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationStoreModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NotificationStore")

    Events("onChange")

    AsyncFunction("getAll") {
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any?>>()
      NotificationStore.readAll(context).map { it.toMap() }
    }

    AsyncFunction("markRead") { id: String ->
      val context = appContext.reactContext ?: return@AsyncFunction null
      NotificationStore.markRead(context, id)
      sendEvent("onChange", mapOf("type" to "markRead", "id" to id))
      null
    }

    AsyncFunction("markAllRead") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      NotificationStore.markAllRead(context)
      sendEvent("onChange", mapOf("type" to "markAllRead"))
      null
    }

    AsyncFunction("clear") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      NotificationStore.clear(context)
      sendEvent("onChange", mapOf("type" to "clear"))
      null
    }
  }
}
