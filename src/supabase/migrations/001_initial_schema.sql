-- ============================================================
-- Studio Booking SaaS – Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TENANTS (Studios)
-- ============================================================
CREATE TABLE tenants (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  custom_domain    TEXT UNIQUE,
  logo_url         TEXT,
  primary_color    TEXT NOT NULL DEFAULT '#f96604',
  secondary_color  TEXT NOT NULL DEFAULT '#1a1a1a',
  settings         JSONB NOT NULL DEFAULT '{
    "cancellation_hours": 24,
    "booking_closes_minutes": 60,
    "min_participants_class": 4,
    "min_participants_workshop": 5,
    "waitlist_accept_hours": 2,
    "late_cancel_fee_enabled": true,
    "timezone": "Europe/Helsinki"
  }',
  paytrail_merchant_id  TEXT,
  paytrail_secret       TEXT,
  resend_api_key        TEXT,
  active           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  phone          TEXT,
  date_of_birth  DATE,
  base_role      TEXT NOT NULL DEFAULT 'customer'
                 CHECK (base_role IN ('super_admin', 'studio_admin', 'instructor', 'customer')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- USER PERMISSIONS
-- ============================================================
CREATE TABLE user_permissions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  permission   TEXT NOT NULL,
  granted_by   UUID NOT NULL REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tenant_id, permission)
);

CREATE INDEX idx_user_permissions_user ON user_permissions(user_id, tenant_id);

-- ============================================================
-- INSTRUCTORS
-- ============================================================
CREATE TABLE instructors (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  bio          TEXT,
  photo_url    TEXT,
  specialties  TEXT[] NOT NULL DEFAULT '{}',
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instructors_tenant ON instructors(tenant_id);

-- ============================================================
-- CLASS TYPES
-- ============================================================
CREATE TABLE class_types (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  category         TEXT,
  color            TEXT NOT NULL DEFAULT '#6366f1',
  min_participants INT NOT NULL DEFAULT 1,
  active           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_class_types_tenant ON class_types(tenant_id);

-- ============================================================
-- CLASS SESSIONS
-- ============================================================
CREATE TABLE class_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  class_type_id  UUID NOT NULL REFERENCES class_types(id) ON DELETE RESTRICT,
  instructor_id  UUID REFERENCES instructors(id) ON DELETE SET NULL,
  starts_at      TIMESTAMPTZ NOT NULL,
  ends_at        TIMESTAMPTZ NOT NULL,
  capacity       INT NOT NULL DEFAULT 10,
  status         TEXT NOT NULL DEFAULT 'scheduled'
                 CHECK (status IN ('scheduled', 'cancelled', 'completed', 'studio_reserved')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_class_sessions_tenant ON class_sessions(tenant_id);
CREATE INDEX idx_class_sessions_starts ON class_sessions(starts_at);
CREATE INDEX idx_class_sessions_status ON class_sessions(status);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  session_id           UUID NOT NULL REFERENCES class_sessions(id) ON DELETE RESTRICT,
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status               TEXT NOT NULL DEFAULT 'confirmed'
                       CHECK (status IN ('confirmed', 'cancelled', 'late_cancelled', 'no_show', 'attended')),
  credit_id            UUID,
  booked_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at         TIMESTAMPTZ,
  cancellation_reason  TEXT,
  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_bookings_session ON bookings(session_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);

-- ============================================================
-- WAITLIST
-- ============================================================
CREATE TABLE waitlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  session_id  UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position    INT NOT NULL,
  notified_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_waitlist_session ON waitlist(session_id, position);

-- ============================================================
-- PRODUCTS (class cards, season passes, etc.)
-- ============================================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL
                CHECK (type IN ('single', 'series', 'season', 'drop_in', 'private', 'rental')),
  price_cents   INT NOT NULL,
  credits       INT NOT NULL DEFAULT 1,
  validity_days INT NOT NULL DEFAULT 90,
  target_group  TEXT NOT NULL DEFAULT 'all'
                CHECK (target_group IN ('adult', 'child', 'all')),
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_tenant ON products(tenant_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  paytrail_transaction_id   TEXT UNIQUE,
  amount_cents              INT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'ok', 'fail', 'refunded')),
  items                     JSONB NOT NULL DEFAULT '[]',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at              TIMESTAMPTZ
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- PURCHASES
-- ============================================================
CREATE TABLE purchases (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  payment_id     UUID REFERENCES payments(id),
  credits_total  INT NOT NULL,
  credits_used   INT NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'expired', 'exhausted')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_status ON purchases(status);

-- ============================================================
-- CREDITS
-- ============================================================
CREATE TABLE credits (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_id  UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  used_at      TIMESTAMPTZ,
  booking_id   UUID REFERENCES bookings(id) ON DELETE SET NULL
);

CREATE INDEX idx_credits_user ON credits(user_id);
CREATE INDEX idx_credits_purchase ON credits(purchase_id);

-- Add FK from bookings to credits (after credits table exists)
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_credit
  FOREIGN KEY (credit_id) REFERENCES credits(id) ON DELETE SET NULL;

-- ============================================================
-- DISCOUNT CODES
-- ============================================================
CREATE TABLE discount_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value       INT NOT NULL,
  max_uses    INT,
  used_count  INT NOT NULL DEFAULT 0,
  valid_from  TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  applies_to  JSONB NOT NULL DEFAULT '"all"',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

-- ============================================================
-- STUDIO PAGES (rules, booking info, FAQ etc.)
-- ============================================================
CREATE TABLE studio_pages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  published   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_pages ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's tenant_id
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT base_role FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if current user has permission
CREATE OR REPLACE FUNCTION has_permission(perm TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.base_role IN ('super_admin', 'studio_admin')
      OR EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = auth.uid()
        AND up.permission = perm
      )
    )
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- TENANTS: users can read their own tenant
CREATE POLICY "Users can read own tenant"
  ON tenants FOR SELECT
  USING (id = get_my_tenant_id());

CREATE POLICY "Super admins can manage tenants"
  ON tenants FOR ALL
  USING (get_my_role() = 'super_admin');

-- USERS: users can read users in same tenant
CREATE POLICY "Users can read same-tenant users"
  ON users FOR SELECT
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (
    tenant_id = get_my_tenant_id()
    AND get_my_role() IN ('super_admin', 'studio_admin')
  );

-- CLASS SESSIONS: public read within tenant
CREATE POLICY "Anyone in tenant can view sessions"
  ON class_sessions FOR SELECT
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Admins and permitted users can manage sessions"
  ON class_sessions FOR ALL
  USING (
    tenant_id = get_my_tenant_id()
    AND has_permission('manage_calendar')
  );

-- BOOKINGS: users see own bookings, admins see all
CREATE POLICY "Users see own bookings"
  ON bookings FOR SELECT
  USING (user_id = auth.uid() OR (tenant_id = get_my_tenant_id() AND has_permission('manage_bookings')));

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id = get_my_tenant_id());

CREATE POLICY "Users can cancel own bookings"
  ON bookings FOR UPDATE
  USING (user_id = auth.uid() OR has_permission('manage_bookings'));

-- PRODUCTS: public read within tenant
CREATE POLICY "Anyone in tenant can view products"
  ON products FOR SELECT
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (tenant_id = get_my_tenant_id() AND has_permission('manage_products'));

-- PURCHASES: users see own purchases
CREATE POLICY "Users see own purchases"
  ON purchases FOR SELECT
  USING (user_id = auth.uid() OR (tenant_id = get_my_tenant_id() AND has_permission('manage_customers')));

-- STUDIO PAGES: public read if published
CREATE POLICY "Anyone can read published pages"
  ON studio_pages FOR SELECT
  USING (tenant_id = get_my_tenant_id() AND published = true);

CREATE POLICY "Admins can manage pages"
  ON studio_pages FOR ALL
  USING (tenant_id = get_my_tenant_id() AND has_permission('manage_settings'));

-- INSTRUCTORS: public read within tenant
CREATE POLICY "Anyone in tenant can view instructors"
  ON instructors FOR SELECT
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Admins can manage instructors"
  ON instructors FOR ALL
  USING (tenant_id = get_my_tenant_id() AND has_permission('manage_instructors'));

-- ============================================================
-- SEED: Studio Piagrina (first tenant)
-- ============================================================
INSERT INTO tenants (slug, name, primary_color, secondary_color, settings) VALUES (
  'piagrina',
  'Studio Piagrina',
  '#f96604',
  '#1a1a1a',
  '{
    "cancellation_hours": 24,
    "booking_closes_minutes": 60,
    "min_participants_class": 4,
    "min_participants_workshop": 5,
    "waitlist_accept_hours": 2,
    "late_cancel_fee_enabled": true,
    "timezone": "Europe/Helsinki"
  }'
);

-- Seed default studio pages for Piagrina
INSERT INTO studio_pages (tenant_id, slug, title, content, published)
SELECT id, 'rules', 'Ohjeet ja säännöt', '## Varaus\n\nVaraukset tulee tehdä järjestelmän kautta...', true
FROM tenants WHERE slug = 'piagrina';

INSERT INTO studio_pages (tenant_id, slug, title, content, published)
SELECT id, 'booking-info', 'Varausjärjestelmä', '## Miten varaaminen toimii\n\n...', true
FROM tenants WHERE slug = 'piagrina';
