-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON public.videos;

-- Create new policy that allows any authenticated user to upload videos
CREATE POLICY "Any authenticated user can upload videos"
ON public.videos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);