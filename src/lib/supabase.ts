import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create and export the Supabase client
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

// Properties CRUD operations
export const getProperties = async (filters?: any) => {
  let query = supabase.from('properties')
    .select(`
      *,
      owner:owners(*)
    `);
  
  // Apply filters if provided
  if (filters) {
    if (filters.searchQuery) {
      query = query.ilike('address', `%${filters.searchQuery}%`);
    }
    
    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('type', filters.propertyType);
    }
    
    if (filters.propertyValue && filters.propertyValue.length === 2) {
      query = query
        .gte('value', filters.propertyValue[0])
        .lte('value', filters.propertyValue[1]);
    }
    
    if (filters.propertySize && filters.propertySize.length === 2) {
      query = query
        .gte('size', filters.propertySize[0])
        .lte('size', filters.propertySize[1]);
    }
    
    if (filters.ownerNetWorth && filters.ownerNetWorth.length === 2) {
      const [minNetWorth, maxNetWorth] = filters.ownerNetWorth;
      query = query.in('owner_id', 
        supabase
          .from('owners')
          .select('id')
          .gte('net_worth', minNetWorth)
          .lte('net_worth', maxNetWorth)
      );
    }
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const createProperty = async (propertyData: any) => {
  const { data, error } = await supabase
    .from('properties')
    .insert(propertyData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateProperty = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteProperty = async (id: string) => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};