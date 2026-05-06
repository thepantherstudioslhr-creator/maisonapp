import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rhnimhnafkhbdqqknrxl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mZ-Q4Itsh9ZQSVFVxmDMOA_5PUJvBmu';

// Debug log to verify credentials are loaded
console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? '✅ Loaded' : '❌ Missing',
  key: supabaseAnonKey ? '✅ Loaded' : '❌ Missing',
  urlSource: import.meta.env.VITE_SUPABASE_URL ? 'env' : 'fallback',
  keySource: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'env' : 'fallback'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
  throw new Error('Supabase configuration is incomplete. Please check .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});