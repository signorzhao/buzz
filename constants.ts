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
    label: 'Coffee',
    iconName: 'Coffee',
    color: 'bg-amber-100 text-amber-700',
    messages: [
      "Coffee time? ☕️",
      "I need caffeine.",
      "Starbucks run?",
      "Coffee break, anyone?",
      "☕️☕️☕️"
    ]
  },
  {
    id: 'smoke',
    label: 'Smoke',
    iconName: 'Cigarette',
    color: 'bg-gray-200 text-gray-700',
    messages: [
      "Smoke break? 🚬",
      "Meet outside.",
      "Nicotine loading...",
      "🚬 5 mins?",
      "Fresh air break."
    ]
  },
  {
    id: 'food',
    label: 'Food',
    iconName: 'Utensils',
    color: 'bg-orange-100 text-orange-600',
    messages: [
      "Lunch? 🍔",
      "I'm starving.",
      "Food court?",
      "Order delivery?",
      "Tacos today?"
    ]
  },
  {
    id: 'drink',
    label: 'Drink',
    iconName: 'Beer',
    color: 'bg-yellow-100 text-yellow-700',
    messages: [
      "Happy Hour? 🍺",
      "Drinks tonight?",
      "Beer o'clock.",
      "Thirsty? 🍸",
      "Pub run."
    ]
  },
  {
    id: 'game',
    label: 'Game',
    iconName: 'Gamepad2',
    color: 'bg-purple-100 text-purple-600',
    messages: [
      "Game on? 🎮",
      "Hop on Discord.",
      "Ranked match?",
      "Let's play.",
      "🎮🎮🎮"
    ]
  },
  {
    id: 'break',
    label: 'Break',
    iconName: 'Timer',
    color: 'bg-blue-100 text-blue-600',
    messages: [
      "BRB 5 mins.",
      "Bio break. 🚽",
      "Zoning out...",
      "AFK for a bit.",
      "Brain break."
    ]
  },
  {
    id: 'go',
    label: 'Let\'s Go',
    iconName: 'Car',
    color: 'bg-emerald-100 text-emerald-600',
    messages: [
      "Let's go! 🚗",
      "I'm leaving.",
      "Car is downstairs.",
      "On my way.",
      "Move out!"
    ]
  },
  {
    id: 'query',
    label: 'Where?',
    iconName: 'HelpCircle',
    color: 'bg-rose-100 text-rose-600',
    messages: [
      "Where is everyone? 🧐",
      "Status report?",
      "Anyone there?",
      "Hello???",
      "👀"
    ]
  }
];