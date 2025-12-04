-- Drop the security definer view and recreate as security invoker
DROP VIEW IF EXISTS public.profiles_public;

-- Create a secure view with SECURITY INVOKER (uses caller's permissions)
CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  created_at,
  updated_at,
  -- Only show contact info if user has permission (checked via function)
  CASE WHEN public.can_view_contact_info(id) THEN phone ELSE NULL END as phone,
  CASE WHEN public.can_view_contact_info(id) THEN whatsapp ELSE NULL END as whatsapp,
  CASE WHEN public.can_view_contact_info(id) THEN email_public ELSE NULL END as email_public
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO anon, authenticated;