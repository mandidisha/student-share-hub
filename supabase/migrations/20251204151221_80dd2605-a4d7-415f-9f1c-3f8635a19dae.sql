-- Create a function to check if user can see contact details
-- Only allows viewing contact info for:
-- 1. Your own profile
-- 2. Users you're in a conversation with
CREATE OR REPLACE FUNCTION public.can_view_contact_info(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User is viewing their own profile
    profile_id = auth.uid()
    -- User is in a conversation with this profile owner
    OR EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE (participant_1 = auth.uid() AND participant_2 = profile_id)
         OR (participant_2 = auth.uid() AND participant_1 = profile_id)
    )
$$;

-- Create a secure view for profiles that hides contact info from non-authorized viewers
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  created_at,
  updated_at,
  -- Only show contact info if user has permission
  CASE WHEN public.can_view_contact_info(id) THEN phone ELSE NULL END as phone,
  CASE WHEN public.can_view_contact_info(id) THEN whatsapp ELSE NULL END as whatsapp,
  CASE WHEN public.can_view_contact_info(id) THEN email_public ELSE NULL END as email_public
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO anon, authenticated;