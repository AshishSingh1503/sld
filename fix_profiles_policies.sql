-- Fix for "Error updating profile table: {}" issue
-- Run this SQL in your Supabase dashboard SQL editor

-- Add missing RLS policies for profiles table
-- Allow users to insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Allow users to delete their own profile  
create policy "Users can delete own profile"
  on profiles for delete
  using ( auth.uid() = id );

-- Verify existing policies are working
-- Users can view own profile (should already exist)
-- Users can update own profile (should already exist)

-- Test the policies by checking if they exist
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies 
where tablename = 'profiles'; 