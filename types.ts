
export interface Contact {
  id: string;
  name: string;
  barkKey: string;
  avatarColor: string;
}

export interface QuickActionConfig {
  id: string;
  label: string;
  iconName: string;
  colorClass: string;
  messages: string[];
}

export interface UserProfile {
  name: string;
  barkKey: string;
  avatarColor?: string;
}

export interface Notification {
  id: string;
  senderName: string;
  senderId: string;
  message: string;
  timestamp: number;
  type: 'buzz' | 'message';
}

/**
 * User interface used in group/collaboration services
 */
export interface User {
  id: string;
  name: string;
  avatarColor?: string;
  barkUrl?: string;
}

/**
 * Group interface for group-based notification syncing
 */
export interface Group {
  id: string;
  name: string;
  code: string;
  members: User[];
  history: Notification[];
}
