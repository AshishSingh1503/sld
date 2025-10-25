-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  class integer check (class >= 1 and class <= 5),
  updated_at timestamp with time zone,
  
  constraint email_check check (email ~* '^.+@.+\..+$')
);

-- Create policies to ensure users can only view and edit their own profiles
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Enable RLS
alter table public.profiles enable row level security;

-- Create indices
create index profiles_email_idx on public.profiles(email);

-- Set up Realtime
alter publication supabase_realtime add table profiles;
