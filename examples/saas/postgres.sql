-- Multi-tenant SaaS — representative Postgres schema.
-- Pattern: shared-schema row-level tenancy with tenant_id discriminator
-- plus row-level security policies. This is the dominant model for modern
-- B2B SaaS targets seen in M&A diligence (vs schema-per-tenant or
-- database-per-tenant).
--
-- Run:
--   pg2oracle examples/saas/postgres.sql -o examples/saas/oracle.sql --report examples/saas/compat.md

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug varchar(64) NOT NULL UNIQUE,
    name varchar(200) NOT NULL,
    plan varchar(32) NOT NULL DEFAULT 'starter',
    created_at timestamptz NOT NULL DEFAULT now(),
    settings jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email varchar(254) NOT NULL,
    password_hash varchar(255) NOT NULL,
    full_name varchar(200),
    is_active boolean NOT NULL DEFAULT true,
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, email)
);

CREATE TABLE workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name varchar(200) NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name varchar(200) NOT NULL,
    description text,
    status varchar(32) NOT NULL DEFAULT 'active',
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label varchar(120) NOT NULL,
    token_hash varchar(255) NOT NULL,
    last_used_at timestamptz,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
    id bigserial PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action varchar(64) NOT NULL,
    target_type varchar(64),
    target_id uuid,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tenant ON users (tenant_id);
CREATE INDEX idx_projects_tenant_workspace ON projects (tenant_id, workspace_id);
CREATE INDEX idx_audit_events_tenant_created ON audit_events (tenant_id, created_at DESC);

-- Tenant isolation via row-level security. Application sets
--   SET app.current_tenant = '<uuid>';
-- before each statement.
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON projects
    USING (tenant_id::text = current_setting('app.current_tenant', true));

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON workspaces
    USING (tenant_id::text = current_setting('app.current_tenant', true));

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_events
    USING (tenant_id::text = current_setting('app.current_tenant', true));
