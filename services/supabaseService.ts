import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Group, Notification, User } from '../types';

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

export const sbCreateGroup = async (name: string, creator: User): Promise<Group | null> => {
  if (!supabase) return null;
  
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Use 'buzz_groups' to avoid collision with other apps in the same Supabase project
  const { data, error } = await supabase
    .from('buzz_groups')
    .insert([{ name, code }])
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating group:', error);
    return null;
  }

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

  // 1. Find group in 'buzz_groups'
  const { data: groupData, error } = await supabase
    .from('buzz_groups')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !groupData) {
    return null;
  }

  // 2. Fetch recent history from 'buzz_notifications'
  const { data: historyData } = await supabase
    .from('buzz_notifications')
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
    .from('buzz_notifications')
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
        table: 'buzz_notifications', // Listen to the prefixed table
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