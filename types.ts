export interface User {
  id: string;
  name: string;
  avatarColor: string;
  barkUrl?: string;
}

export interface Notification {
  id: string;
  senderName: string;
  senderId: string;
  message: string;
  timestamp: number;
  type: 'buzz' | 'message' | 'system';
}

export interface Group {
  id: string;
  name: string;
  code: string;
  members: User[];
  history: Notification[];
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  GROUP = 'GROUP',
}

export enum NotificationPriority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
}