export type UserRole = 'admin' | 'manager' | 'staff';

export type ThemePreference = 'light' | 'dark';

export interface User {
  id: string;
  auth_user_id?: string;
  name: string;
  email: string;
  role: UserRole;
  property_id?: string;
  theme_preference?: ThemePreference;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  property_name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  total_rooms: number;
  owner_id?: string;
  logo_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CleaningStatus = 'clean' | 'cleaning' | 'dirty';

export interface Room {
  id: string;
  property_id: string;
  room_name: string;
  room_number?: string;
  price: number;
  description?: string;
  max_occupancy?: number;
  amenities?: string[];
  is_active: boolean;
  cleaning_status: CleaningStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  cnic?: string;
  email?: string;
  address?: string;
  total_bookings: number;
  total_spent: number;
  last_visit_date?: string;
  notes?: string;
  is_vip: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  created_at: string;
}

export interface Permission {
  id: string;
  role: UserRole;
  permission: string;
  can_access: boolean;
}

export type ApartmentStatus = 'available' | 'booked' | 'checkout_today' | 'maintenance';

export interface Apartment {
  id: string;
  name: string;
  status: ApartmentStatus;
  price_per_night: number;
  current_booking?: Booking;
}

export type BookingStatus = 'active' | 'upcoming' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  apartment_id: string;
  apartment_name?: string;
  property_id?: string;
  room_id?: string;
  guest_id?: string;
  client_name: string;
  phone: string;
  cnic: string;
  guests: number;
  check_in: string;
  check_out: string;
  nights: number;
  price_per_night: number;
  discount: number;
  extra_charges: number;
  total_amount: number;
  advance_payment: number;
  balance: number;
  payment_method?: 'cash' | 'online';
  notes?: string;
  special_requests?: string;
  cleaning_status?: 'pending' | 'cleaning' | 'cleaned';
  created_by?: string;
  updated_by?: string;
  checked_out_by?: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export const APARTMENTS = [
  { id: 'apt-1', name: 'Maison Eiffel Royale 10', price: 15000 },
  { id: 'apt-2', name: 'Maison Eiffel View 11', price: 15000 },
  { id: 'apt-3', name: 'Maison 8 Ball Pool 12', price: 15000 },
  { id: 'apt-4', name: 'Maison Jade 401', price: 13000 },
  { id: 'apt-5', name: 'Maison Forest 402', price: 14000 },
  { id: 'apt-6', name: 'Maison Sunset 403', price: 14000 },
  { id: 'apt-7', name: 'Maison Rosso 404', price: 14000 },
  { id: 'apt-8', name: 'Maison Sage 405', price: 13000 },
];
