import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { OneSignal, LogLevel, NotificationClickEvent, NotificationWillDisplayEvent } from 'react-native-onesignal';
import NotificationStore, { NotificationRecord } from './modules/notification-store';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ?? '';

export default function App() {
  const [records, setRecords] = useState<NotificationRecord[]>([]);

  const refresh = useCallback(async () => {
    const data = await NotificationStore.getAll();
    setRecords(data);
  }, []);

  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);

    const onNotificationClick = (event: NotificationClickEvent) => {
      console.log('OneSignal: notification clicked:', event);
      refresh();
    };

    const onForegroundWillDisplay = (event: NotificationWillDisplayEvent) => {
      event.getNotification().display();
      setTimeout(refresh, 500);
    };

    OneSignal.Notifications.addEventListener('click', onNotificationClick);
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', onForegroundWillDisplay);

    refresh();

    return () => {
      OneSignal.Notifications.removeEventListener('click', onNotificationClick);
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', onForegroundWillDisplay);
    };
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications ({records.length})</Text>
      <View style={styles.row}>
        <Button title="Refresh" onPress={refresh} />
        <Button title="Mark all read" onPress={async () => { await NotificationStore.markAllRead(); refresh(); }} />
        <Button title="Clear" onPress={async () => { await NotificationStore.clear(); refresh(); }} />
      </View>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.isRead ? '' : '● '}{item.title}</Text>
            <Text>{item.body}</Text>
            <Text style={styles.meta}>{new Date(item.receivedAt).toLocaleString()}</Text>
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 16 },
  heading: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  item: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
});
