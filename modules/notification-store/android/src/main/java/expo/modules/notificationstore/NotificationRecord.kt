package expo.modules.notificationstore

import org.json.JSONObject

data class NotificationRecord(
  val id: String,
  val title: String,
  val body: String,
  val receivedAt: Long,
  val imageUrl: String?,
  val launchUrl: String?,
  val deeplink: String?,
  val webUrl: String?,
  val isRead: Boolean
) {
  fun toJson(): JSONObject = JSONObject().apply {
    put("id", id)
    put("title", title)
    put("body", body)
    put("receivedAt", receivedAt)
    put("imageUrl", imageUrl ?: JSONObject.NULL)
    put("launchUrl", launchUrl ?: JSONObject.NULL)
    put("deeplink", deeplink ?: JSONObject.NULL)
    put("webUrl", webUrl ?: JSONObject.NULL)
    put("isRead", isRead)
  }

  fun toMap(): Map<String, Any?> = mapOf(
    "id" to id,
    "title" to title,
    "body" to body,
    "receivedAt" to receivedAt,
    "imageUrl" to imageUrl,
    "launchUrl" to launchUrl,
    "deeplink" to deeplink,
    "webUrl" to webUrl,
    "isRead" to isRead,
  )

  companion object {
    fun fromJson(json: JSONObject): NotificationRecord = NotificationRecord(
      id = json.getString("id"),
      title = json.optString("title", ""),
      body = json.optString("body", ""),
      receivedAt = json.getLong("receivedAt"),
      imageUrl = json.optString("imageUrl").takeIf { it.isNotEmpty() && it != "null" },
      launchUrl = json.optString("launchUrl").takeIf { it.isNotEmpty() && it != "null" },
      deeplink = json.optString("deeplink").takeIf { it.isNotEmpty() && it != "null" },
      webUrl = json.optString("webUrl").takeIf { it.isNotEmpty() && it != "null" },
      isRead = json.optBoolean("isRead", false),
    )
  }
}
