-- ============================================================
-- Migration 003: Auto-create user profile on signup
-- ============================================================

-- Function: when a new auth.user is created, insert into public.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get the default tenant (piagrina) — in multi-tenant setup this
  -- would be determined from the signup context (e.g. custom claim)
  SELECT id INTO v_tenant_id
  FROM public.tenants
  WHERE slug = COALESCE(NEW.raw_user_meta_data->>'tenant_slug', 'piagrina')
  LIMIT 1;

  INSERT INTO public.users (
    id,
    tenant_id,
    email,
    full_name,
    phone,
    base_role,
    notification_preference
  ) VALUES (
    NEW.id,
    v_tenant_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'customer',
    'email'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires after each new auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
