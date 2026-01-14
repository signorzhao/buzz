
export const AVATAR_COLORS = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-emerald-400 to-emerald-600',
  'bg-gradient-to-br from-indigo-400 to-indigo-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-red-400 to-red-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
];

export const ACTION_LIGHT_COLORS = [
  { id: 'amber', class: 'bg-amber-100 text-amber-700' },
  { id: 'blue', class: 'bg-blue-100 text-blue-700' },
  { id: 'green', class: 'bg-green-100 text-green-700' },
  { id: 'red', class: 'bg-red-100 text-red-700' },
  { id: 'purple', class: 'bg-purple-100 text-purple-700' },
  { id: 'pink', class: 'bg-pink-100 text-pink-700' },
  { id: 'indigo', class: 'bg-indigo-100 text-indigo-700' },
  { id: 'gray', class: 'bg-gray-100 text-gray-700' },
  { id: 'cyan', class: 'bg-cyan-100 text-cyan-700' },
  { id: 'orange', class: 'bg-orange-100 text-orange-700' },
];

export const BARK_SERVER = 'https://api.day.app';

export const DEFAULT_QUICK_ACTIONS = [
  { id: '1', label: '续命咖啡', iconName: 'Coffee', colorClass: 'bg-amber-100 text-amber-700', messages: ["咖啡时间到！☕️", "有人一起去打咖啡吗？"] },
  { id: '2', label: '中路抽烟', iconName: 'Cigarette', colorClass: 'bg-gray-100 text-gray-700', messages: ["走，中路抽烟！🚬", "下来抽一根？"] },
  { id: '3', label: '干饭人', iconName: 'Utensils', colorClass: 'bg-orange-100 text-orange-700', messages: ["干饭了干饭了！🍔", "今天中午吃啥？"] },
  { id: '4', label: '整两杯', iconName: 'Beer', colorClass: 'bg-yellow-100 text-yellow-700', messages: ["今晚整两杯？🍺", "Happy Hour 走起！"] },
  { id: '5', label: '麦门！', iconName: 'Beef', colorClass: 'bg-red-100 text-red-700', messages: ["麦门万岁！🍔", "M记走起？"] },
  { id: '6', label: 'OK', iconName: 'CheckCircle2', colorClass: 'bg-green-100 text-green-700', messages: ["👌 没问题！", "收到收到。"] },
  { id: '7', label: 'Sorry', iconName: 'Ban', colorClass: 'bg-gray-200 text-gray-700', messages: ["🙏 不好意思...", "我的锅。"] },
  { id: '8', label: '思考', iconName: 'Brain', colorClass: 'bg-indigo-100 text-indigo-700', messages: ["🤔 容我三思...", "让我想想..."] }
];

/**
 * Database table names for Supabase integration
 */
export const TABLES = {
  GROUPS: 'groups',
  MEMBERS: 'group_members',
  NOTIFICATIONS: 'notifications'
};
