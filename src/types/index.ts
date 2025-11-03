// User Types
export type UserType = 'parent' | 'nanny';

export interface BaseUser {
  id: string;
  name: string;
  age: number;
  photo: string;
  location: string;
  bio: string;
  rating: number;
  userType: UserType;
  phone: string;
  email: string;
}

export interface ParentUser extends BaseUser {
  userType: 'parent';
  kids: Kid[];
  interests: string[];
  karma: number;
}

export interface NannyUser extends BaseUser {
  userType: 'nanny';
  hourlyRate: number;
  experience: number;
  specialization: string[];
  certifications: string[];
  ageRange: string; // например "0-3 года"
  availableHours: string[];
  education: string;
  languages: string[];
  verified: boolean;
  reviews: number;
}

export type User = ParentUser | NannyUser;

export interface Kid {
  name: string;
  age: number;
  gender: 'boy' | 'girl';
}

// Match Types
export interface Profile {
  id: number;
  name: string;
  age: number;
  kids: Kid[];
  interests: string[];
  bio: string;
  distance: number;
  photo: string;
  location: string;
}

// Nanny Types
export interface Nanny {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  experience: number;
  photo: string;
  specialization: string[];
  available: boolean;
}

export interface GroupBooking {
  id: number;
  families: number;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: 'open' | 'confirmed' | 'full';
}

// Event Types
export interface Event {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  distance: number;
  price: number | 'free';
  ageRange: string;
  image: string;
  attendees: number;
  maxAttendees?: number;
  hasNanny: boolean;
  autoGroup: boolean;
  liked: boolean;
}

// Board Types
export type PostType = 
  | 'need_nanny'
  | 'can_babysit' 
  | 'playdate'
  | 'looking_for_friends'
  | 'offer_help'
  | 'need_help'
  | 'coffee_meetup'
  | 'other';

export interface BoardPost {
  id: number;
  type: PostType;
  author: string;
  authorType: 'parent' | 'nanny';
  time: string;
  city: string;
  district?: string;
  description: string;
  status: 'active' | 'closed';
  responses: number;
}

// Chat Types
export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
  type: 'personal' | 'group';
  userId?: string;
  phone?: string;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
}

export interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  reactions: MessageReaction[];
}

// Map Types
export interface MapMarker {
  id: number;
  type: 'parent' | 'nanny' | 'place';
  name: string;
  position: { x: number; y: number };
  status: 'online' | 'offline';
  info?: string;
  rating?: number;
  distance?: number;
}

// Notification Types
export interface Notification {
  id: number;
  type: 'match' | 'message' | 'event' | 'board' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
}

