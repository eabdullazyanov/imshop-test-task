package expo.modules.notificationstore

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject

object NotificationStore {
  private const val TAG = "NotificationStore"
  private const val PREFS_NAME = "notification_store"
  private const val KEY_RECORDS = "records"
  private const val MAX_RECORDS = 200

  private val lock = Any()

  private fun prefs(context: Context): SharedPreferences =
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun append(context: Context, record: NotificationRecord) {
    synchronized(lock) {
      val current = readAll(context).toMutableList()
      current.removeAll { it.id == record.id }
      current.add(0, record)
      val trimmed = if (current.size > MAX_RECORDS) current.take(MAX_RECORDS) else current
      writeAll(context, trimmed)
      Log.d(TAG, "Appended notification ${record.id}, total: ${trimmed.size}")
    }
  }

  fun readAll(context: Context): List<NotificationRecord> {
    val raw = prefs(context).getString(KEY_RECORDS, null) ?: return emptyList()
    return try {
      val arr = JSONArray(raw)
      buildList {
        for (i in 0 until arr.length()) {
          add(NotificationRecord.fromJson(arr.getJSONObject(i)))
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Failed to parse records", e)
      emptyList()
    }
  }

  fun markRead(context: Context, id: String) {
    synchronized(lock) {
      val updated = readAll(context).map {
        if (it.id == id) it.copy(isRead = true) else it
      }
      writeAll(context, updated)
    }
  }

  fun markAllRead(context: Context) {
    synchronized(lock) {
      val updated = readAll(context).map { it.copy(isRead = true) }
      writeAll(context, updated)
    }
  }

  fun clear(context: Context) {
    synchronized(lock) {
      prefs(context).edit().remove(KEY_RECORDS).apply()
    }
  }

  private fun writeAll(context: Context, records: List<NotificationRecord>) {
    val arr = JSONArray()
    records.forEach { arr.put(it.toJson()) }
    prefs(context).edit().putString(KEY_RECORDS, arr.toString()).apply()
  }
}
