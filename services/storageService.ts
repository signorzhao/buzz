import { Contact, QuickActionConfig, UserProfile } from "../types";
import { AVATAR_COLORS, DEFAULT_QUICK_ACTIONS } from "../constants";

const STORAGE_KEY = 'buzzsync_contacts';
const MY_PROFILE_KEY = 'buzzsync_my_profile';
const ACTIONS_KEY = 'buzzsync_quick_actions';

export const getContacts = (): Contact[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveContact = (name: string, barkUrlOrKey: string): Contact => {
  const contacts = getContacts();
  let key = barkUrlOrKey.trim();
  if (key.includes('api.day.app/')) {
    const parts = key.split('api.day.app/');
    if (parts[1]) key = parts[1].split('/')[0];
  }

  const newContact: Contact = {
    id: crypto.randomUUID(),
    name: name.trim(),
    barkKey: key,
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  };

  const updated = [...contacts, newContact];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newContact;
};

export const deleteContact = (id: string) => {
  const contacts = getContacts();
  const updated = contacts.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const getMyProfile = (): UserProfile => {
  const data = localStorage.getItem(MY_PROFILE_KEY);
  return data ? JSON.parse(data) : { name: '', barkKey: '' };
};

export const saveMyProfile = (profile: UserProfile) => {
  localStorage.setItem(MY_PROFILE_KEY, JSON.stringify(profile));
};

export const getQuickActions = (): QuickActionConfig[] => {
  const data = localStorage.getItem(ACTIONS_KEY);
  return data ? JSON.parse(data) : DEFAULT_QUICK_ACTIONS;
};

export const saveQuickActions = (actions: QuickActionConfig[]) => {
  localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
};

/**
 * 方案 2: 导出完整配置为 JSON 字符串 (UTF-8 安全)
 */
export const exportFullConfig = (): string => {
  const config = {
    contacts: getContacts(),
    profile: getMyProfile(),
    actions: getQuickActions(),
    version: '1.0',
    timestamp: Date.now()
  };
  const jsonStr = JSON.stringify(config);
  // Use a UTF-8 safe way to encode to Base64
  return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

/**
 * 方案 2: 从 JSON 字符串恢复配置 (UTF-8 安全)
 */
export const importFullConfig = (base64Config: string): boolean => {
  try {
    // Use a UTF-8 safe way to decode from Base64
    const jsonStr = decodeURIComponent(atob(base64Config).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const config = JSON.parse(jsonStr);
    
    if (config.contacts) localStorage.setItem(STORAGE_KEY, JSON.stringify(config.contacts));
    if (config.profile) localStorage.setItem(MY_PROFILE_KEY, JSON.stringify(config.profile));
    if (config.actions) localStorage.setItem(ACTIONS_KEY, JSON.stringify(config.actions));
    
    return true;
  } catch (e) {
    console.error("Import failed:", e);
    return false;
  }
};