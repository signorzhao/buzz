import { Group, Notification, User } from "../types";
import { COLORS } from "../constants";

// In-memory store
let groups: Group[] = [];

export const createGroup = (name: string, creator: User): Group => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const newGroup: Group = {
    id: crypto.randomUUID(),
    name,
    code,
    members: [creator],
    history: [],
  };
  groups.push(newGroup);
  return newGroup;
};

export const joinGroup = (code: string, user: User): Group | null => {
  const group = groups.find((g) => g.code === code);
  if (group) {
    if (!group.members.find((m) => m.id === user.id)) {
      group.members.push(user);
    }
    return group;
  }
  return null;
};

export const getGroup = (groupId: string): Group | undefined => {
  return groups.find((g) => g.id === groupId);
};

export const sendNotification = (groupId: string, notification: Notification): boolean => {
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    group.history.unshift(notification);
    // Keep history manageable
    if (group.history.length > 50) group.history.pop();
    return true;
  }
  return false;
};

// --- Simulation Logic ---

const MOCK_MESSAGES = [
  "Where is everyone?",
  "Meeting starts in 5!",
  "Anyone want coffee?",
  "Check the doc I sent.",
  "Buzzzz! 🐝",
];

const MOCK_NAMES = ["Alice", "Bob", "Charlie", "Diana"];

export const simulateIncomingNotification = (
  groupId: string, 
  currentUserIsSender: boolean,
  callback: (n: Notification) => void
) => {
  if (currentUserIsSender) return;

  const group = getGroup(groupId);
  if (!group) return;

  // 30% chance a fake user sends a message if the group has < 2 members (to make it feel alive)
  if (Math.random() > 0.7 || group.members.length < 2) {
    const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    const message = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
    
    const notif: Notification = {
      id: crypto.randomUUID(),
      senderName: randomName,
      senderId: 'mock-user',
      message: message,
      timestamp: Date.now(),
      type: Math.random() > 0.5 ? 'buzz' : 'message',
    };

    // Add to state
    sendNotification(groupId, notif);
    
    // Trigger callback
    callback(notif);
  }
};