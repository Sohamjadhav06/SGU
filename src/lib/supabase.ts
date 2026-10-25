import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase environment variables from Vite
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  ''
).trim();

// Format URL safely (supports full URL or raw project reference ID)
const supabaseUrl = rawUrl
  ? (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
    ? rawUrl
    : `https://${rawUrl}.supabase.co`
  : '';

// Safe configuration detection
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// Reusable Supabase client instance (null-safe fallback)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

/**
 * VyaparMitra Supabase Connection Test
 * Checks connection against the live "products" table.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  if (!isSupabaseConfigured || !supabase) {
    const msg = 'Supabase connection skipped: VITE_SUPABASE_URL and key not configured.';
    return { success: false, message: msg };
  }

  try {
    const { data, error } = await supabase.from('products').select('id, name, sku').limit(5);

    if (error) {
      console.warn('⚠️ Supabase Connection Result:', error.message);
      return { success: false, message: error.message };
    }

    console.log('✅ VyaparMitra Supabase Connection SUCCESSFUL! Found products:', data?.length || 0);
    return { success: true, message: 'Connected to Supabase PostgreSQL', data };
  } catch (err: any) {
    console.error('❌ Supabase Connection Exception:', err?.message || String(err));
    return { success: false, message: err?.message || String(err) };
  }
}

// Automatically test connection if configured
if (isSupabaseConfigured) {
  testSupabaseConnection();
}
