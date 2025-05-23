
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Initialize Supabase client
const supabaseUrl = "https://ohfgqqnxffoqukpmwqln.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZmdxcW54ZmZvcXVrcG13cWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzEzNDEsImV4cCI6MjA2MjcwNzM0MX0.eiv6AB-5lPbFHLwEfTS6au9-HhjxeYcx-lH_mEGK9ZI";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Auth helper functions
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signUp = async (email: string, password: string, userData?: any) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData || {},
    },
  });
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session?.user || null;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Database helper functions

// Companies
export const getCompanyById = async (id: string) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

export const updateCompany = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Users
export const getUsersByCompany = async (companyId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', companyId);
    
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

// Properties
export const getProperties = async (filters?: any) => {
  let query = supabase.from('properties').select(`
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
      // Fix the way we filter by owner net worth
      const minNetWorth = filters.ownerNetWorth[0];
      const maxNetWorth = filters.ownerNetWorth[1];
      
      const { data: ownerIds } = await supabase
        .from('owners')
        .select('id')
        .gte('net_worth', minNetWorth)
        .lte('net_worth', maxNetWorth);
        
      if (ownerIds && ownerIds.length > 0) {
        const ids = ownerIds.map(owner => owner.id);
        query = query.in('owner_id', ids);
      }
    }
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

// Saved Views
export const getSavedViews = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_views')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

export const createSavedView = async (userId: string, viewData: any) => {
  const { data, error } = await supabase
    .from('saved_views')
    .insert({ user_id: userId, view_data: viewData })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Saved Filters
export const getSavedFilters = async (userId: string) => {
  const { data, error } = await supabase
    .from('filters')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

export const createSavedFilter = async (userId: string, filterData: any) => {
  const { data, error } = await supabase
    .from('filters')
    .insert({ user_id: userId, filter_data: filterData })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Reports
export const getReports = async (userId: string) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const createReport = async (userId: string, reportData: any) => {
  const { data, error } = await supabase
    .from('reports')
    .insert({ user_id: userId, report_data: reportData, created_at: new Date().toISOString() })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Logs
export const getLogs = async (companyId: string) => {
  const { data, error } = await supabase
    .from('logs')
    .select('*, users!inner(*)')
    .eq('users.company_id', companyId)
    .order('timestamp', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const createLog = async (userId: string, action: string) => {
  const { data, error } = await supabase
    .from('logs')
    .insert({ user_id: userId, action, timestamp: new Date().toISOString() })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
