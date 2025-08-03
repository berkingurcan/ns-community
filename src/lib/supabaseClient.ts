
import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('=== SUPABASE CLIENT DEBUG ===');
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('URL preview:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('URL:', supabaseUrl);
  console.error('Key exists:', !!supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'nsphere-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
