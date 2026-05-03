import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import {
  LogLevel,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
  OneSignal,
} from 'react-native-onesignal';
import NotificationStore, { NotificationRecord } from './modules/notification-store';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ?? '';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

async function openNotificationAction(item: NotificationRecord): Promise<void> {
  if (item.deeplink) {
    await Linking.openURL(item.deeplink);
  } else if (item.webUrl) {
    await WebBrowser.openBrowserAsync(item.webUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  }
}

function NotificationItem({
  item,
  onPress,
}: {
  item: NotificationRecord;
  onPress: (item: NotificationRecord) => void;
}) {
  const hasAction = !!(item.deeplink || item.webUrl);
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemRow}>
        <View style={styles.dotContainer}>
          {!item.isRead && <View style={styles.dot} />}
        </View>
        <View style={styles.content}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}
          <Text style={[styles.title, item.isRead && styles.titleRead]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={3}>
            {item.body}
          </Text>
          <Text style={styles.date}>{formatDate(item.receivedAt)}</Text>
        </View>
        {hasAction && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<NotificationRecord[]>([]);

  const refresh = useCallback(async () => {
    const data = await NotificationStore.getAll();
    setRecords(data);
  }, []);

  useEffect(() => {
    if (__DEV__) OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);

    const onForegroundWillDisplay = (event: NotificationWillDisplayEvent) => {
      event.getNotification().display();
      setTimeout(refresh, 300);
    };

    const onNotificationClick = (_event: NotificationClickEvent) => {
      setTimeout(refresh, 300);
    };

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', onForegroundWillDisplay);
    OneSignal.Notifications.addEventListener('click', onNotificationClick);

    refresh();

    return () => {
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', onForegroundWillDisplay);
      OneSignal.Notifications.removeEventListener('click', onNotificationClick);
    };
  }, [refresh]);

  const handleTap = useCallback(async (item: NotificationRecord) => {
    if (!item.isRead) {
      await NotificationStore.markRead(item.id);
      setRecords(prev => prev.map(r => r.id === item.id ? { ...r, isRead: true } : r));
    }
    await openNotificationAction(item);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await NotificationStore.markAllRead();
    setRecords(prev => prev.map(r => ({ ...r, isRead: true })));
  }, []);

  const unreadCount = records.filter(r => !r.isRead).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.heading}>
          Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        <TouchableOpacity onPress={handleMarkAllRead} disabled={unreadCount === 0}>
          <Text style={[styles.markAllBtn, unreadCount === 0 && styles.markAllDisabled]}>
            Mark all as read
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet</Text>
        }
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={handleTap} />
        )}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  markAllBtn: {
    fontSize: 14,
    color: '#007AFF',
  },
  markAllDisabled: {
    color: '#C7C7CC',
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dotContainer: {
    width: 12,
    paddingTop: 4,
    marginRight: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  titleRead: {
    color: '#555',
  },
  body: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#C7C7CC',
    marginLeft: 8,
    alignSelf: 'center',
    lineHeight: 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    color: '#999',
    fontSize: 15,
  },
});
