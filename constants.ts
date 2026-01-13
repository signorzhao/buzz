export const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-cyan-500',
];

// Bark API Base
export const BARK_SERVER = 'https://api.day.app';

export const TABLES = {
  MEMBERS: 'members',
  GROUPS: 'groups',
  NOTIFICATIONS: 'notifications',
};

// Icon names map to Lucide icons in App.tsx
export const QUICK_ACTIONS = [
  {
    id: 'coffee',
    label: '续命咖啡',
    iconName: 'Coffee',
    color: 'bg-amber-100 text-amber-700',
    messages: [
      "咖啡时间到！☕️",
      "有人一起去打咖啡吗？",
      "急需咖啡续命...😵",
      "走，去买杯星巴克？",
      "☕️ 下楼喝一杯？"
    ]
  },
  {
    id: 'smoke',
    label: '中路抽烟',
    iconName: 'Cigarette',
    color: 'bg-gray-200 text-gray-700',
    messages: [
      "走，中路抽烟！🚬",
      "下来抽一根？",
      "去透透气？",
      "老地方见 🚬",
      "带薪摸鱼时间（抽烟）"
    ]
  },
  {
    id: 'food',
    label: '干饭人',
    iconName: 'Utensils',
    color: 'bg-orange-100 text-orange-600',
    messages: [
      "干饭了干饭了！🍔",
      "饿死我了，吃饭去？",
      "今天中午吃啥？",
      "点外卖吗？来个搭子。",
      "干饭人集合！🥣"
    ]
  },
  {
    id: 'drink',
    label: '整两杯',
    iconName: 'Beer',
    color: 'bg-yellow-100 text-yellow-700',
    messages: [
      "今晚整两杯？🍺",
      "Happy Hour 走起！",
      "微醺时刻 🍸",
      "去喝一杯吗？",
      "酒局缺人，速来！"
    ]
  },
  {
    id: 'game',
    label: '上号',
    iconName: 'Gamepad2',
    color: 'bg-purple-100 text-purple-600',
    messages: [
      "上号！上号！🎮",
      "启动！",
      "来把排位？缺一！",
      "别睡了，起来嗨。",
      "🎮 峡谷见！"
    ]
  },
  {
    id: 'break',
    label: '摸鱼',
    iconName: 'Timer',
    color: 'bg-blue-100 text-blue-600',
    messages: [
      "带薪拉屎去了 🚽",
      "摸鱼五分钟 🐟",
      "休息一下，脑壳疼。",
      "下楼溜达一圈？",
      "暂时离开一下。"
    ]
  },
  {
    id: 'go',
    label: '出发',
    iconName: 'Car',
    color: 'bg-emerald-100 text-emerald-600',
    messages: [
      "出发了！🚗",
      "车在楼下，人呢？",
      "我走了，不等了。",
      "我在路上了，马上到。",
      "GOGOGO！"
    ]
  },
  {
    id: 'query',
    label: '人呢',
    iconName: 'HelpCircle',
    color: 'bg-rose-100 text-rose-600',
    messages: [
      "人呢？都去哪了？🧐",
      "在吗？收到请回复。",
      "Hello？有人吗？",
      "👀",
      "急急急！看到回话！"
    ]
  }
];