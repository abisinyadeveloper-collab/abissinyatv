-- Fix: Add authentication requirement to like/unlike functions
-- Views can remain anonymous (common analytics practice)

-- Update increment_video_likes to require authentication
CREATE OR REPLACE FUNCTION public.increment_video_likes(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Require authentication for likes
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to like videos';
  END IF;
  UPDATE videos SET likes = COALESCE(likes, 0) + 1 WHERE id = video_id;
END;
$$;

-- Update decrement_video_likes to require authentication
CREATE OR REPLACE FUNCTION public.decrement_video_likes(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Require authentication for unlikes
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to unlike videos';
  END IF;
  UPDATE videos SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = video_id;
END;
$$;

-- Note: increment_video_views intentionally remains without auth check
-- as anonymous view tracking is standard analytics practice