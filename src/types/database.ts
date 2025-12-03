export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  email_public: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  address: string | null;
  room_type: 'single' | 'shared' | 'studio' | 'apartment';
  available_from: string;
  available_until: string | null;
  amenities: string[];
  house_rules: string | null;
  preferred_gender: 'any' | 'male' | 'female' | null;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  listing_id: string | null;
  last_message_at: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'shared', label: 'Shared Room' },
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Entire Apartment' },
] as const;

export const AMENITIES = [
  'WiFi',
  'Laundry',
  'Parking',
  'Kitchen',
  'Air Conditioning',
  'Heating',
  'Furnished',
  'Utilities Included',
  'TV',
  'Gym Access',
  'Pool',
  'Garden',
  'Balcony',
  'Study Room',
] as const;
