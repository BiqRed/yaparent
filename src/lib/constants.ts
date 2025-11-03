// App Configuration
export const APP_NAME = 'Ya Родители';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Знакомства и взаимопомощь для родителей';

// Colors
export const COLORS = {
  primary: '#FF3B30',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#6C6C70',
  border: '#E5E5EA',
} as const;

// Routes
export const ROUTES = {
  home: '/',
  match: '/match',
  map: '/map',
  events: '/events',
  nanny: '/nanny',
  sos: '/sos',
  chats: '/chats',
  profile: '/profile',
  notifications: '/notifications',
  aiAssistant: '/ai-assistant',
  onboarding: '/onboarding',
} as const;

// Karma System
export const KARMA = {
  helpOthers: 50,
  createBoardPost: 5,
  respondToPost: 10,
  createEvent: 10,
  attendEvent: 5,
  bookNanny: 5,
  cancelBooking: -10,
  positiveReview: 20,
  negativeReview: -15,
} as const;

// Distance Settings
export const DISTANCE = {
  nearby: 1, // km
  close: 3, // km
  medium: 5, // km
  far: 10, // km
} as const;

// Age Ranges
export const AGE_RANGES = [
  { value: '0-1', label: '0-1 год' },
  { value: '1-3', label: '1-3 года' },
  { value: '3-5', label: '3-5 лет' },
  { value: '5-7', label: '5-7 лет' },
  { value: '7-10', label: '7-10 лет' },
  { value: '10+', label: '10+ лет' },
] as const;

// Event Categories
export const EVENT_CATEGORIES = [
  'Театр',
  'Творчество',
  'Праздник',
  'Наука',
  'Развлечения',
  'Природа',
  'Спорт',
  'Музей',
  'Концерт',
] as const;

// Interests
export const INTERESTS = [
  'Йога',
  'Детские площадки',
  'Творчество',
  'Музеи',
  'Книги',
  'Театр',
  'Спорт',
  'Плавание',
  'Футбол',
  'Рисование',
  'Музыка',
  'Танцы',
  'Природа',
  'Кулинария',
  'Путешествия',
] as const;

// Time Slots
export const TIME_SLOTS = [
  { value: 'morning', label: 'Утро (9:00-12:00)' },
  { value: 'afternoon', label: 'День (12:00-15:00)' },
  { value: 'evening', label: 'Вечер (15:00-18:00)' },
  { value: 'late', label: 'Поздний вечер (18:00-21:00)' },
] as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  match: 'Новое совпадение',
  message: 'Новое сообщение',
  event: 'Событие',
  board: 'Доска объявлений',
  system: 'Системное',
  nanny: 'Групповая няня',
} as const;

// Max Values
export const MAX_VALUES = {
  bioLength: 500,
  messageLength: 1000,
  photosCount: 6,
  interestsCount: 10,
  kidsCount: 10,
} as const;

// Board Post Types
export const BOARD_POST_TYPES = [
  { value: 'all', label: 'Все', icon: '📋' },
  { value: 'need_nanny', label: 'Нужна няня', icon: '👶' },
  { value: 'can_babysit', label: 'Посижу', icon: '🤗' },
  { value: 'playdate', label: 'Прогулка', icon: '🎈' },
  { value: 'coffee_meetup', label: 'Кофе', icon: '☕' },
  { value: 'looking_for_friends', label: 'Друзья', icon: '👥' },
  { value: 'offer_help', label: 'Помощь', icon: '🤝' },
  { value: 'need_help', label: 'Нужна помощь', icon: '🆘' },
  { value: 'other', label: 'Другое', icon: '📝' }
] as const;

// Cities for Board Posts
export const BOARD_CITIES = [
  'Все города',
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Екатеринбург',
  'Новосибирск'
] as const;

// API Endpoints (для будущей интеграции)
export const API_ENDPOINTS = {
  auth: '/api/auth',
  users: '/api/users',
  matches: '/api/matches',
  events: '/api/events',
  nannies: '/api/nannies',
  board: '/api/board',
  chats: '/api/chats',
  notifications: '/api/notifications',
} as const;

