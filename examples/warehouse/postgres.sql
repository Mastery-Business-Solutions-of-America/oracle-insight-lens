-- Analytics warehouse — representative Postgres schema.
-- Pattern: classic Kimball star schema with a partitioned fact table
-- and conformed dimensions. This is the shape that maps directly onto
-- Oracle Exadata / Autonomous Data Warehouse conversations.
--
-- Run:
--   pg2oracle examples/warehouse/postgres.sql -o examples/warehouse/oracle.sql --report examples/warehouse/compat.md

CREATE TABLE dim_customer (
    customer_key bigint PRIMARY KEY,
    customer_id varchar(64) NOT NULL UNIQUE,
    name varchar(200) NOT NULL,
    segment varchar(64),
    country_code char(2),
    region varchar(64),
    industry varchar(120),
    annual_revenue_band varchar(32),
    effective_from date NOT NULL,
    effective_to date,
    is_current boolean NOT NULL DEFAULT true
);

CREATE TABLE dim_product (
    product_key bigint PRIMARY KEY,
    sku varchar(64) NOT NULL UNIQUE,
    name varchar(200) NOT NULL,
    category varchar(120),
    subcategory varchar(120),
    brand varchar(120),
    list_price numeric(12,2),
    cost numeric(12,2),
    is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE dim_date (
    date_key integer PRIMARY KEY,
    full_date date NOT NULL UNIQUE,
    day_of_month smallint NOT NULL,
    day_of_week smallint NOT NULL,
    week_of_year smallint NOT NULL,
    month smallint NOT NULL,
    month_name varchar(20) NOT NULL,
    quarter smallint NOT NULL,
    year smallint NOT NULL,
    is_weekend boolean NOT NULL,
    is_holiday boolean NOT NULL DEFAULT false
);

CREATE TABLE dim_store (
    store_key bigint PRIMARY KEY,
    store_id varchar(32) NOT NULL UNIQUE,
    name varchar(200) NOT NULL,
    channel varchar(32) NOT NULL,
    country_code char(2),
    region varchar(64),
    opened_date date
);

-- Fact table — partitioned by month. Order-of-magnitude this is the
-- table that drives Exadata / ADW sizing in M&A diligence.
CREATE TABLE fact_sales (
    sale_id bigserial,
    date_key integer NOT NULL REFERENCES dim_date(date_key),
    customer_key bigint NOT NULL REFERENCES dim_customer(customer_key),
    product_key bigint NOT NULL REFERENCES dim_product(product_key),
    store_key bigint NOT NULL REFERENCES dim_store(store_key),
    order_id varchar(64) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) NOT NULL DEFAULT 0,
    tax_amount numeric(12,2) NOT NULL DEFAULT 0,
    net_amount numeric(14,2) NOT NULL,
    currency_code char(3) NOT NULL DEFAULT 'USD',
    sale_ts timestamptz NOT NULL,
    raw_payload jsonb,
    PRIMARY KEY (sale_id, sale_ts)
) PARTITION BY RANGE (sale_ts);

CREATE TABLE fact_sales_2025_q1 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE fact_sales_2025_q2 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');

CREATE INDEX idx_fact_sales_customer ON fact_sales (customer_key);
CREATE INDEX idx_fact_sales_product ON fact_sales (product_key);
CREATE INDEX idx_fact_sales_date ON fact_sales (date_key);

-- Aggregate materialized view for dashboard queries.
CREATE MATERIALIZED VIEW mv_daily_sales_by_region AS
SELECT
    d.full_date,
    c.region,
    p.category,
    SUM(f.net_amount) AS total_revenue,
    SUM(f.quantity) AS total_units,
    COUNT(DISTINCT f.customer_key) AS unique_customers
FROM fact_sales f
JOIN dim_date d ON d.date_key = f.date_key
JOIN dim_customer c ON c.customer_key = f.customer_key
JOIN dim_product p ON p.product_key = f.product_key
GROUP BY d.full_date, c.region, p.category;
