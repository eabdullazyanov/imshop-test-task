import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { OneSignal, LogLevel, NotificationClickEvent, NotificationWillDisplayEvent } from 'react-native-onesignal';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ?? '';

export default function App() {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);

    const onNotificationClick = (event: NotificationClickEvent) => {
      console.log('OneSignal: notification clicked:', event);
    };

    const onForegroundWillDisplay = (event: NotificationWillDisplayEvent) => {
      event.getNotification().display();
    };

    OneSignal.Notifications.addEventListener('click', onNotificationClick);
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', onForegroundWillDisplay);

    return () => {
      OneSignal.Notifications.removeEventListener('click', onNotificationClick);
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', onForegroundWillDisplay);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
