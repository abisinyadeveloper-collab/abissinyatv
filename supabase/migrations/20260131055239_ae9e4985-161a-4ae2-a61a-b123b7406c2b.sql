-- Create atomic increment function for video views
CREATE OR REPLACE FUNCTION public.increment_video_views(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE videos SET views = COALESCE(views, 0) + 1 WHERE id = video_id;
END;
$$;

-- Create atomic increment function for video likes
CREATE OR REPLACE FUNCTION public.increment_video_likes(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE videos SET likes = COALESCE(likes, 0) + 1 WHERE id = video_id;
END;
$$;

-- Create atomic decrement function for video likes
CREATE OR REPLACE FUNCTION public.decrement_video_likes(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE videos SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = video_id;
END;
$$;