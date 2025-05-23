
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get the URL and anon key from environment variables
const supabaseUrl = 'https://ohfgqqnxffoqukpmwqln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZmdxcW54ZmZvcXVrcG13cWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzEzNDEsImV4cCI6MjA2MjcwNzM0MX0.eiv6AB-5lPbFHLwEfTS6au9-HhjxeYcx-lH_mEGK9ZI';

// Create and export the Supabase client with proper auth configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper function to get the current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user || null;
};
