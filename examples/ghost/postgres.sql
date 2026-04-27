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
    id varchar(24) NOT NULL,
    uuid uuid NOT NULL DEFAULT gen_random_uuid(),
    title varchar(2000) NOT NULL,
    slug varchar(191) NOT NULL,
    mobiledoc text,
    html text,
    comment_id varchar(50),
    plaintext text,
    feature_image varchar(2000),
    featured boolean NOT NULL DEFAULT false,
    type varchar(50) NOT NULL DEFAULT 'post',
    status varchar(50) NOT NULL DEFAULT 'draft',
    locale varchar(6),
    visibility varchar(50) NOT NULL DEFAULT 'public',
    author_id varchar(24) NOT NULL,
    custom_excerpt varchar(2000),
    codeinjection_head text,
    codeinjection_foot text,
    custom_template varchar(100),
    canonical_url text,
    published_at timestamp,
    published_by varchar(24),
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

CREATE TABLE tags (
    id varchar(24) NOT NULL,
    name varchar(191) NOT NULL,
    slug varchar(191) NOT NULL,
    description text,
    feature_image varchar(2000),
    parent_id varchar(24),
    visibility varchar(50) NOT NULL DEFAULT 'public',
    og_image varchar(2000),
    og_title varchar(300),
    og_description varchar(500),
    twitter_image varchar(2000),
    twitter_title varchar(300),
    twitter_description varchar(500),
    meta_title varchar(2000),
    meta_description varchar(2000),
    codeinjection_head text,
    codeinjection_foot text,
    canonical_url varchar(2000),
    accent_color varchar(50),
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

CREATE TABLE posts_tags (
    id varchar(24) NOT NULL,
    post_id varchar(24) NOT NULL,
    tag_id varchar(24) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE roles (
    id varchar(24) NOT NULL,
    name varchar(50) NOT NULL,
    description varchar(2000),
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

CREATE TABLE permissions (
    id varchar(24) NOT NULL,
    name varchar(50) NOT NULL,
    object_type varchar(50) NOT NULL,
    action_type varchar(50) NOT NULL,
    object_id varchar(24),
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

CREATE TABLE settings (
    id varchar(24) NOT NULL,
    "group" varchar(50) NOT NULL DEFAULT 'core',
    key varchar(50) NOT NULL,
    value text,
    type varchar(50) NOT NULL,
    flags varchar(50),
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

CREATE TABLE sessions (
    id varchar(24) NOT NULL,
    session_id varchar(32) NOT NULL,
    user_id varchar(24) NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp
);

CREATE TABLE invites (
    id varchar(24) NOT NULL,
    role_id varchar(24) NOT NULL,
    token text NOT NULL,
    email varchar(191) NOT NULL,
    expires bigint NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'pending',
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

CREATE TABLE webhooks (
    id varchar(24) NOT NULL,
    event varchar(50) NOT NULL,
    target_url varchar(2000) NOT NULL,
    name varchar(191),
    secret varchar(191),
    api_version varchar(50) NOT NULL DEFAULT 'v2',
    integration_id varchar(24) NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'available',
    last_triggered_at timestamp,
    last_triggered_status varchar(50),
    last_triggered_error varchar(50),
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

CREATE TABLE actions (
    id varchar(24) NOT NULL,
    resource_id varchar(24),
    resource_type varchar(50) NOT NULL,
    actor_id varchar(24) NOT NULL,
    actor_type varchar(50) NOT NULL,
    event varchar(50) NOT NULL,
    context text,
    created_at timestamp NOT NULL
);

CREATE TABLE labels (
    id varchar(24) NOT NULL,
    name varchar(191) NOT NULL,
    slug varchar(191) NOT NULL,
    created_at timestamp NOT NULL,
    created_by varchar(24) NOT NULL,
    updated_at timestamp,
    updated_by varchar(24)
);

COMMENT ON TABLE users IS 'Ghost user accounts (authors, editors, admins)';
COMMENT ON TABLE posts IS 'Blog posts and pages';
COMMENT ON COLUMN posts.uuid IS 'Public-facing identifier';
