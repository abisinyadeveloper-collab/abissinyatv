-- Fix 1: Update handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_username text;
  safe_avatar_url text;
BEGIN
  -- Extract and sanitize username
  safe_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Limit username length to 50 characters
  safe_username := substring(safe_username from 1 for 50);
  
  -- Remove potentially dangerous characters, allow only alphanumeric, underscore, hyphen, space
  safe_username := regexp_replace(safe_username, '[^a-zA-Z0-9_\- ]', '', 'g');
  
  -- Ensure username is not empty after sanitization
  IF safe_username = '' OR safe_username IS NULL THEN
    safe_username := 'user_' || substring(NEW.id::text from 1 for 8);
  END IF;
  
  -- For avatar URL, only use the trusted dicebear service with the user's ID
  -- Ignore any user-provided avatar_url to prevent malicious URLs
  safe_avatar_url := 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id;
  
  INSERT INTO public.profiles (user_id, username, avatar_url)
  VALUES (
    NEW.id,
    safe_username,
    safe_avatar_url
  );
  RETURN NEW;
END;
$$;

-- Fix 2: Update profiles table RLS to require authentication for viewing
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policy: only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow users to view their own profile even during auth flow
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 3: Add column constraints to profiles table for additional safety
ALTER TABLE public.profiles
ALTER COLUMN username SET NOT NULL,
ADD CONSTRAINT profiles_username_length CHECK (char_length(username) <= 50 AND char_length(username) >= 1);

-- Add constraint to ensure avatar_url is from trusted domain or null
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_avatar_url_trusted CHECK (
  avatar_url IS NULL OR 
  avatar_url LIKE 'https://api.dicebear.com/%' OR
  avatar_url LIKE 'https://lh3.googleusercontent.com/%'
);