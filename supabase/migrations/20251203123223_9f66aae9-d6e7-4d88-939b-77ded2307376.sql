-- Create a security definer function to check if a user can view a profile
CREATE OR REPLACE FUNCTION public.can_view_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User is viewing their own profile
    profile_id = auth.uid()
    -- User is viewing a profile of someone with an active listing
    OR EXISTS (
      SELECT 1 FROM public.listings 
      WHERE user_id = profile_id AND is_active = true
    )
    -- User is in a conversation with this profile owner
    OR EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE (participant_1 = auth.uid() AND participant_2 = profile_id)
         OR (participant_2 = auth.uid() AND participant_1 = profile_id)
    )
$$;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a new restrictive policy using the secure function
CREATE POLICY "Users can view profiles with legitimate access"
ON public.profiles
FOR SELECT
USING (public.can_view_profile(id));