-- Drop the view and function - will handle contact info visibility in application code
DROP VIEW IF EXISTS public.profiles_public;
DROP FUNCTION IF EXISTS public.can_view_contact_info(uuid);