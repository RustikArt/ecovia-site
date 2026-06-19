
-- 1. Replace handle_new_user without hardcoded admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer');

    RETURN NEW;
END;
$function$;

-- 2. Ensure existing admin user keeps admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'rustiksbaz@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Lock down direct EXECUTE on internal functions (triggers run as owner regardless)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role is required by RLS policies, keep it executable by authenticated only
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
