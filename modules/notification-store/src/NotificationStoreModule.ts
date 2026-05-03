import { NativeModule, requireNativeModule } from 'expo';

import { NotificationRecord, NotificationStoreModuleEvents } from './NotificationStore.types';

declare class NotificationStoreModule extends NativeModule<NotificationStoreModuleEvents> {
  getAll(): Promise<NotificationRecord[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  clear(): Promise<void>;
}

export default requireNativeModule<NotificationStoreModule>('NotificationStore');
