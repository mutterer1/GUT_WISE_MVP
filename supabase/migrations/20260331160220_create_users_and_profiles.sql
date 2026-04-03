/*
  # Create Users and Profiles Tables

  ## Overview
  This migration establishes the foundational user authentication and profile management system.
  Leverages Supabase's built-in auth.users table and creates an extended profiles table for additional user data.

  ## Tables Created

  ### 1. profiles
  Extended user profile information linked to Supabase auth.users
  
  **Columns:**
  - `id` (uuid, primary key) - References auth.users(id), ensures 1:1 relationship
  - `email` (text, unique, not null) - User's email address
  - `full_name` (text) - User's display name
  - `date_of_birth` (date) - For age-based insights
  - `gender` (text) - Optional demographic data
  - `height_cm` (numeric) - Height in centimeters for BMI calculations
  - `weight_kg` (numeric) - Current weight in kilograms
  - `timezone` (text) - User's timezone for accurate time-based tracking
  - `notification_preferences` (jsonb) - Flexible notification settings storage
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ## Security Implementation

  ### Row Level Security (RLS)
  - **Enabled** on profiles table
  - Users can only view their own profile data
  - Users can only update their own profile data
  - New profiles can be created during signup flow

  ### Data Isolation
  - All policies strictly check auth.uid() = id
  - No cross-user data access possible
  - Prevents unauthorized profile viewing or modification

  ## Notes
  - Uses Supabase's built-in auth.users table (no custom user table needed)
  - Profiles table extends auth.users with application-specific data
  - JSONB field allows flexible future additions without schema changes
  - Cascading delete ensures profile cleanup when user account is deleted
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm numeric(5, 2) CHECK (height_cm > 0 AND height_cm < 300),
  weight_kg numeric(5, 2) CHECK (weight_kg > 0 AND weight_kg < 500),
  timezone text DEFAULT 'UTC',
  notification_preferences jsonb DEFAULT '{"email": true, "push": false}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);