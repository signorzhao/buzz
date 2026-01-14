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