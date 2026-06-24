-- Enum de rôle admin / customer utilisée par les comptes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'app_role'
          AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
    END IF;
END
$$;

-- Prérequis: profil utilisateur
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    phone text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles
FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Prérequis: rôles utilisateur
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Table de gestion des comptes clients / admin
CREATE TABLE IF NOT EXISTS public.accounts (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    phone text,
    role public.app_role NOT NULL DEFAULT 'customer',
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended')),
    last_sign_in_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accounts_role_idx
    ON public.accounts (role);

CREATE INDEX IF NOT EXISTS accounts_status_idx
    ON public.accounts (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own account" ON public.accounts;
CREATE POLICY "Users can read their own account" ON public.accounts
FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all accounts" ON public.accounts;
CREATE POLICY "Admins can read all accounts" ON public.accounts
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = 'admin'::public.app_role
    )
);

DROP POLICY IF EXISTS "Admins can manage all accounts" ON public.accounts;
CREATE POLICY "Admins can manage all accounts" ON public.accounts
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = 'admin'::public.app_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = 'admin'::public.app_role
    )
);

CREATE OR REPLACE FUNCTION public.sync_account_from_accounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET
        email = NEW.email,
        full_name = NEW.full_name,
        phone = NEW.phone,
        updated_at = now()
    WHERE id = NEW.id;

    DELETE FROM public.user_roles WHERE user_id = NEW.id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, NEW.role);

    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_accounts_updated_at ON public.accounts;
CREATE TRIGGER sync_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_account_from_accounts();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role public.app_role;
BEGIN
    IF NEW.email = 'rustiksbaz@gmail.com' THEN
        user_role := 'admin';
    ELSE
        user_role := 'customer';
    END IF;

    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.accounts (id, email, role, status)
    VALUES (NEW.id, NEW.email, user_role, 'active')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = now();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
