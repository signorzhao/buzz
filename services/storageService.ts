import { Contact } from "../types";
import { COLORS } from "../constants";

const STORAGE_KEY = 'buzzsync_contacts';
const MY_PROFILE_KEY = 'buzzsync_my_profile';

export const getContacts = (): Contact[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveContact = (name: string, barkUrlOrKey: string): Contact => {
  const contacts = getContacts();
  
  // Extract key if full URL is pasted
  let key = barkUrlOrKey.trim();
  if (key.includes('api.day.app/')) {
    const parts = key.split('api.day.app/');
    if (parts[1]) {
      key = parts[1].split('/')[0]; // Handle cases like key/message...
    }
  }

  const newContact: Contact = {
    id: crypto.randomUUID(),
    name: name.trim(),
    barkKey: key,
    avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
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

// Manage "Me"
export const getMyProfile = () => {
  const data = localStorage.getItem(MY_PROFILE_KEY);
  return data ? JSON.parse(data) : { name: '', barkKey: '' };
};

export const saveMyProfile = (name: string, key: string) => {
  localStorage.setItem(MY_PROFILE_KEY, JSON.stringify({ name, barkKey: key }));
};