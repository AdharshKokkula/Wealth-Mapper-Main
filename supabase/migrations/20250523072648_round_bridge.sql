/*
  # Add RLS policies for properties table

  1. Security
    - Enable RLS on properties table
    - Add policy for authenticated users to read their own properties
    - Add policy for authenticated users to insert their own properties
    - Add policy for authenticated users to update their own properties
    - Add policy for authenticated users to delete their own properties
*/

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);