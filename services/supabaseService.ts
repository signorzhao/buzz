import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Group, Notification, User } from '../types';
import { TABLES } from '../constants';

let supabase: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string) => {
  if (!url || !key) return false;
  try {
    supabase = createClient(url, key);
    return true;
  } catch (e) {
    console.error("Failed to init supabase", e);
    return false;
  }
};

export const isSupabaseConfigured = () => !!supabase;

// Helper to register presence and Bark URL
const registerMember = async (groupId: string, user: User) => {
  if (!supabase) return;
  
  // Upsert member to store/update their Bark URL
  const { error } = await supabase
    .from(TABLES.MEMBERS)
    .upsert({
      group_id: groupId,
      user_id: user.id,
      user_name: user.name,
      bark_url: user.barkUrl || null,
      last_seen: new Date().toISOString()
    }, { onConflict: 'group_id,user_id' });

  if (error) {
    console.warn(`Could not register member (table '${TABLES.MEMBERS}' might be missing):`, error.message);
  }
};

export const sbGetGroupMembers = async (groupId: string): Promise<User[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLES.MEMBERS)
    .select('*')
    .eq('group_id', groupId);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.user_id,
    name: row.user_name,
    avatarColor: 'bg-gray-500',
    barkUrl: row.bark_url
  }));
};

export const sbCreateGroup = async (name: string, creator: User): Promise<Group | null> => {
  if (!supabase) return null;
  
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  const { data, error } = await supabase
    .from(TABLES.GROUPS)
    .insert([{ name, code }])
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating group:', error);
    return null;
  }

  // Register creator
  await registerMember(data.id, creator);

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    members: [creator], 
    history: []
  };
};

export const sbJoinGroup = async (code: string, user: User): Promise<Group | null> => {
  if (!supabase) return null;

  // 1. Find group
  const { data: groupData, error } = await supabase
    .from(TABLES.GROUPS)
    .select('*')
    .eq('code', code)
    .single();

  if (error || !groupData) {
    return null;
  }

  // 2. Register User (and their Bark URL)
  await registerMember(groupData.id, user);

  // 3. Fetch recent history
  const { data: historyData } = await supabase
    .from(TABLES.NOTIFICATIONS)
    .select('*')
    .eq('group_id', groupData.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const history: Notification[] = (historyData || []).map((row: any) => ({
    id: row.id,
    senderName: row.sender_name,
    senderId: row.sender_id,
    message: row.message,
    timestamp: new Date(row.created_at).getTime(),
    type: row.type as any
  }));

  return {
    id: groupData.id,
    name: groupData.name,
    code: groupData.code,
    members: [user], 
    history
  };
};

export const sbSendNotification = async (groupId: string, user: User, message: string, type: string = 'buzz') => {
  if (!supabase) return;

  await supabase
    .from(TABLES.NOTIFICATIONS)
    .insert([{
      group_id: groupId,
      sender_id: user.id,
      sender_name: user.name,
      message,
      type
    }]);
};

export const sbSubscribeToGroup = (groupId: string, onNotification: (n: Notification) => void) => {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`group-${groupId}`)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: TABLES.NOTIFICATIONS, 
        filter: `group_id=eq.${groupId}` 
      },
      (payload) => {
        const row = payload.new;
        const notif: Notification = {
          id: row.id,
          senderName: row.sender_name,
          senderId: row.sender_id,
          message: row.message,
          timestamp: new Date(row.created_at).getTime(),
          type: row.type as any
        };
        onNotification(notif);
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
};