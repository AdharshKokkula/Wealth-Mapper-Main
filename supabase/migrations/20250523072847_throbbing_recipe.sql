/*
  # Add user_id to properties table

  1. Changes
    - Add user_id column to properties table
    - Add foreign key constraint to users table
    - Add not null constraint to ensure every property has an owner
  
  2. Security
    - RLS policies already enabled in previous migration
*/

-- Add user_id column
ALTER TABLE properties 
ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX idx_properties_user_id ON properties(user_id);