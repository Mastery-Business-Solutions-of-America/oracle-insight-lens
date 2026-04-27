# pg2ora compatibility report

Source: `examples/ghost/postgres.sql`
Generated: 2026-04-27T06:47:38.469Z

## Summary

- **High severity:** 89 (these will likely break on Oracle)
- **Warnings:** 2 (lossy or behavior change)
- **Info:** 0

## High severity

- **[type mapping]** _(table posts, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[default expression dropped]** _(table posts, column uuid)_ DEFAULT `gen_random_uuid()` has no Oracle equivalent before 21c. Default removed from output — application must supply UUIDs on insert, or add a BEFORE INSERT trigger using SYS_GUID().
- **[type mapping]** _(table posts, column title)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column slug)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column comment_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column feature_image)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column type)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column status)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column locale)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column visibility)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column author_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column custom_excerpt)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column custom_template)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column published_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column created_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts, column updated_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column name)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column slug)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column feature_image)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column parent_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column visibility)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column og_image)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column og_title)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column og_description)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column twitter_image)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column twitter_title)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column twitter_description)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column meta_title)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column meta_description)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column canonical_url)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column accent_color)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column created_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table tags, column updated_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts_tags, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts_tags, column post_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table posts_tags, column tag_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table roles, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table roles, column name)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table roles, column description)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table roles, column created_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table roles, column updated_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table permissions, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table permissions, column name)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table permissions, column object_type)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table permissions, column action_type)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table permissions, column object_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table permissions, column created_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table permissions, column updated_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table settings, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table settings, column group)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table settings, column key)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table settings, column type)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table settings, column flags)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table settings, column created_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table settings, column updated_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table sessions, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table sessions, column session_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table sessions, column user_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table sessions, column session_data)_ jsonb → CLOB with IS JSON check. jsonb's binary storage and indexing semantics do NOT translate; queries using jsonb operators (@>, ->) must be rewritten.
- **[type mapping]** _(table invites, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table invites, column role_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table invites, column email)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table invites, column status)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table invites, column created_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table invites, column updated_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column event)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column target_url)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column name)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column secret)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column api_version)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column integration_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column status)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column last_triggered_status)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column last_triggered_error)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column created_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table webhooks, column updated_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table actions, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table actions, column resource_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table actions, column resource_type)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table actions, column actor_id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table actions, column actor_type)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table actions, column event)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table labels, column id)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table labels, column name)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table labels, column slug)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table labels, column created_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.
- **[type mapping]** _(table labels, column updated_by)_ varchar without length: defaulted to VARCHAR2(4000). Oracle stores VARCHAR2 by BYTE or CHAR depending on NLS_LENGTH_SEMANTICS — verify on target.

## Warnings

- **[type mapping]** _(table posts, column uuid)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table posts, column featured)_ boolean → NUMBER(1): true/false rewritten as 1/0. CHECK constraints not auto-added.

---
pg2ora translates types; it never renames your objects.
