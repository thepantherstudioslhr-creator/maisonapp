import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rhnimhnafkhbdqqknrxl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mZ-Q4Itsh9ZQSVFVxmDMOA_5PUJvBmu';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  users: {
    id: string;
    email: string;
    role: 'admin' | 'staff';
    created_at: string;
  };
  apartments: {
    id: string;
    name: string;
    status: 'available' | 'booked' | 'checkout_today' | 'maintenance';
    price_per_night: number;
    created_at: string;
  };
  bookings: {
    id: string;
    apartment_id: string;
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
    status: 'active' | 'upcoming' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
  };
};
