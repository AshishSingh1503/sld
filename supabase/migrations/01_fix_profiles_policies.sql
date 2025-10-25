-- Add missing RLS policies for profiles table
-- This fixes the "Error updating profile table: {}" issue

-- Allow users to insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Allow users to delete their own profile
create policy "Users can delete own profile"
  on profiles for delete
  using ( auth.uid() = id );

-- Note: SELECT and UPDATE policies already exist from 00_create_profiles.sql 