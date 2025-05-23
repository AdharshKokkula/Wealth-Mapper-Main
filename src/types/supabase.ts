
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          data_preferences: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          data_preferences?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          data_preferences?: Json | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'employee';
          company_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'admin' | 'employee';
          company_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'employee';
          company_id?: string;
          created_at?: string;
        };
      };
      owners: {
        Row: {
          id: string;
          name: string;
          net_worth: number | null;
          confidence: number | null;
          wealth_sources: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          net_worth?: number | null;
          confidence?: number | null;
          wealth_sources?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          net_worth?: number | null;
          confidence?: number | null;
          wealth_sources?: Json | null;
        };
      };
      properties: {
        Row: {
          id: string;
          address: string;
          latitude: number;
          longitude: number;
          value: number | null;
          size: number | null;
          type: string | null;
          owner_id: string;
          images: Json | null;
          transaction_history: Json | null;
        };
        Insert: {
          id?: string;
          address: string;
          latitude: number;
          longitude: number;
          value?: number | null;
          size?: number | null;
          type?: string | null;
          owner_id: string;
          images?: Json | null;
          transaction_history?: Json | null;
        };
        Update: {
          id?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          value?: number | null;
          size?: number | null;
          type?: string | null;
          owner_id?: string;
          images?: Json | null;
          transaction_history?: Json | null;
        };
      };
      saved_views: {
        Row: {
          id: string;
          user_id: string;
          view_data: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          view_data: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          view_data?: Json;
        };
      };
      filters: {
        Row: {
          id: string;
          user_id: string;
          filter_data: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          filter_data: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          filter_data?: Json;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          report_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          report_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          report_data?: Json;
          created_at?: string;
        };
      };
      logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          timestamp?: string;
        };
      };
    };
  };
}
