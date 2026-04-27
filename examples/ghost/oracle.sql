-- Ghost CMS — minimal Postgres schema (subset for pg2ora demo)
-- Source-inspired by github.com/TryGhost/Ghost knex migrations.
-- Trimmed to ~12 representative tables to keep the README screenshot readable.

CREATE TABLE users (
    id varchar(24) NOT NULL,
    name varchar(191) NOT NULL,
    slug varchar(191) NOT NULL,
    password varchar(60) NOT NULL,
    email varchar(191) NOT NULL,
    profile_image varchar(2000),
    cover_image varchar(2000),
    bio text,
    website varchar(2000),
    location text,
    accessibility text,
    status varchar(50) NOT NULL DEFAULT 'active',
    locale varchar(6),
    visibility varchar(50) NOT NULL DEFAULT 'public',
    meta_title varchar(2000),
    meta_description varchar(2000),
    tour text,
    last_seen timestamp,
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

CREATE TABLE posts (
  id VARCHAR2(24) NOT NULL,
  uuid RAW(16) NOT NULL,
  title VARCHAR2(2000) NOT NULL,
  slug VARCHAR2(191) NOT NULL,
  mobiledoc CLOB,
  html CLOB,
  comment_id VARCHAR2(50),
  plaintext CLOB,
  feature_image VARCHAR2(2000),
  featured NUMBER(1) NOT NULL DEFAULT 0,
  type VARCHAR2(50) NOT NULL DEFAULT 'post',
  status VARCHAR2(50) NOT NULL DEFAULT 'draft',
  locale VARCHAR2(6),
  visibility VARCHAR2(50) NOT NULL DEFAULT 'public',
  author_id VARCHAR2(24) NOT NULL,
  custom_excerpt VARCHAR2(2000),
  codeinjection_head CLOB,
  codeinjection_foot CLOB,
  custom_template VARCHAR2(100),
  canonical_url CLOB,
  published_at TIMESTAMP,
  published_by VARCHAR2(24),
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR2(24) NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR2(24)
);

CREATE TABLE tags (
  id VARCHAR2(24) NOT NULL,
  name VARCHAR2(191) NOT NULL,
  slug VARCHAR2(191) NOT NULL,
  description CLOB,
  feature_image VARCHAR2(2000),
  parent_id VARCHAR2(24),
  visibility VARCHAR2(50) NOT NULL DEFAULT 'public',
  og_image VARCHAR2(2000),
  og_title VARCHAR2(300),
  og_description VARCHAR2(500),
  twitter_image VARCHAR2(2000),
  twitter_title VARCHAR2(300),
  twitter_description VARCHAR2(500),
  meta_title VARCHAR2(2000),
  meta_description VARCHAR2(2000),
  codeinjection_head CLOB,
  codeinjection_foot CLOB,
  canonical_url VARCHAR2(2000),
  accent_color VARCHAR2(50),
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR2(24) NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR2(24)
);

CREATE TABLE posts_tags (
  id VARCHAR2(24) NOT NULL,
  post_id VARCHAR2(24) NOT NULL,
  tag_id VARCHAR2(24) NOT NULL,
  sort_order NUMBER(10) NOT NULL DEFAULT 0
);

CREATE TABLE roles (
  id VARCHAR2(24) NOT NULL,
  name VARCHAR2(50) NOT NULL,
  description VARCHAR2(2000),
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR2(24) NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR2(24)
);

CREATE TABLE permissions (
  id VARCHAR2(24) NOT NULL,
  name VARCHAR2(50) NOT NULL,
  object_type VARCHAR2(50) NOT NULL,
  action_type VARCHAR2(50) NOT NULL,
  object_id VARCHAR2(24),
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR2(24) NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR2(24)
);

CREATE TABLE settings (
  id VARCHAR2(24) NOT NULL,
  "group" VARCHAR2(50) NOT NULL DEFAULT 'core',
  key VARCHAR2(50) NOT NULL,
  value CLOB,
  type VARCHAR2(50) NOT NULL,
  flags VARCHAR2(50),
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR2(24) NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR2(24)
);

CREATE TABLE sessions (
  id VARCHAR2(24) NOT NULL,
  session_id VARCHAR2(32) NOT NULL,
  user_id VARCHAR2(24) NOT NULL,
  session_data CLOB CHECK ("session_data" IS JSON) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

CREATE TABLE invites (
  id VARCHAR2(24) NOT NULL,
  role_id VARCHAR2(24) NOT NULL,
  token CLOB NOT NULL,
  email VARCHAR2(191) NOT NULL,
  expires NUMBER(19) NOT NULL,
  status VARCHAR2(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR2(24) NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR2(24)
);

CREATE TABLE webhooks (
  id VARCHAR2(24) NOT NULL,
  event VARCHAR2(50) NOT NULL,
  target_url VARCHAR2(2000) NOT NULL,
  name VARCHAR2(191),
  secret VARCHAR2(191),
  api_version VARCHAR2(50) NOT NULL DEFAULT 'v2',
  integration_id VARCHAR2(24) NOT NULL,
  status VARCHAR2(50) NOT NULL DEFAULT 'available',
  last_triggered_at TIMESTAMP,
  last_triggered_status VARCHAR2(50),
  last_triggered_error VARCHAR2(50),
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR2(24) NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR2(24)
);

CREATE TABLE actions (
  id VARCHAR2(24) NOT NULL,
  resource_id VARCHAR2(24),
  resource_type VARCHAR2(50) NOT NULL,
  actor_id VARCHAR2(24) NOT NULL,
  actor_type VARCHAR2(50) NOT NULL,
  event VARCHAR2(50) NOT NULL,
  context CLOB,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE labels (
  id VARCHAR2(24) NOT NULL,
  name VARCHAR2(191) NOT NULL,
  slug VARCHAR2(191) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR2(24) NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR2(24)
);

COMMENT ON TABLE users IS 'Ghost user accounts (authors, editors, admins)';
COMMENT ON TABLE posts IS 'Blog posts and pages';
COMMENT ON COLUMN posts.uuid IS 'Public-facing identifier';