package expo.modules.notificationstore

import android.content.Context
import android.util.Log
import androidx.annotation.Keep
import com.onesignal.notifications.IDisplayableMutableNotification
import com.onesignal.notifications.INotificationServiceExtension
import com.onesignal.notifications.INotificationReceivedEvent
import org.json.JSONObject

@Keep
class NotificationServiceExtension : INotificationServiceExtension {
  override fun onNotificationReceived(event: INotificationReceivedEvent) {
    event.preventDefault()

    val context: Context = event.context
    val notification: IDisplayableMutableNotification = event.notification

    val record = NotificationRecord(
      id = notification.notificationId ?: "",
      title = notification.title ?: "",
      body = notification.body ?: "",
      receivedAt = System.currentTimeMillis(),
      imageUrl = notification.bigPicture,
      launchUrl = notification.launchURL,
      deeplink = extractDeeplink(notification.additionalData),
      webUrl = extractWebUrl(notification.additionalData, notification.launchURL),
      isRead = false,
    )

    try {
      NotificationStore.append(context, record)
      Log.d("NotificationStore", "Saved notification ${record.id}: ${record.title}")
    } catch (e: Exception) {
      Log.e("NotificationStore", "Failed to save notification", e)
    }

    event.notification.display()
  }

  private fun extractDeeplink(data: JSONObject?): String? {
    if (data == null) return null
    val candidate = data.optString("deeplink").takeIf { it.isNotEmpty() }
      ?: data.optString("deep_link").takeIf { it.isNotEmpty() }
    return candidate?.takeIf { !it.startsWith("http://") && !it.startsWith("https://") }
  }

  private fun extractWebUrl(data: JSONObject?, launchUrl: String?): String? {
    if (launchUrl != null && (launchUrl.startsWith("http://") || launchUrl.startsWith("https://"))) {
      return launchUrl
    }
    val fromData = data?.optString("url")?.takeIf { it.isNotEmpty() }
    return fromData?.takeIf { it.startsWith("http://") || it.startsWith("https://") }
  }
}
