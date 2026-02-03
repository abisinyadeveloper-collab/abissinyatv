-- Drop the restrictive SELECT policy and replace with permissive one
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON public.videos;

CREATE POLICY "Videos are viewable by everyone" 
ON public.videos 
FOR SELECT 
TO public
USING (true);

-- Also fix the profiles policies for viewing
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
TO public
USING (true);