export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  receivedAt: number;
  imageUrl: string | null;
  launchUrl: string | null;
  deeplink: string | null;
  webUrl: string | null;
  isRead: boolean;
};

export type NotificationStoreChangeEvent =
  | { type: 'append'; record: NotificationRecord }
  | { type: 'markRead'; id: string }
  | { type: 'markAllRead' }
  | { type: 'clear' };

export type NotificationStoreModuleEvents = {
  onChange: (event: NotificationStoreChangeEvent) => void;
};
