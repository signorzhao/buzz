export interface Contact {
  id: string;
  name: string;
  barkKey: string; // The key part of https://api.day.app/KEY/
  avatarColor: string;
}

export enum AppView {
  HOME = 'HOME',
  SETTINGS = 'SETTINGS',
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

export interface User {
  id: string;
  name: string;
  avatarColor?: string;
  barkUrl?: string;
}

export interface Notification {
  id: string;
  senderName: string;
  senderId: string;
  message: string;
  timestamp: number;
  type: 'buzz' | 'message';
}

export interface Group {
  id: string;
  name: string;
  code: string;
  members: User[];
  history: Notification[];
}
