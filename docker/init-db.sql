-- Criacao do schema e tabelas
CREATE SCHEMA IF NOT EXISTS climate;

-- Dimensao de Data
CREATE TABLE IF NOT EXISTS climate.dim_date (
    date_id         SERIAL PRIMARY KEY,
    full_date       DATE NOT NULL UNIQUE,
    year            INTEGER NOT NULL,
    month           INTEGER NOT NULL,
    month_name      VARCHAR(20) NOT NULL,
    quarter         INTEGER NOT NULL,
    decade          INTEGER NOT NULL,
    century         INTEGER NOT NULL,
    is_modern_era   BOOLEAN NOT NULL
);

-- Dimensao de Localizacao
CREATE TABLE IF NOT EXISTS climate.dim_location (
    location_id     SERIAL PRIMARY KEY,
    granularity     VARCHAR(20) NOT NULL,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    latitude_raw    VARCHAR(20),
    longitude_raw   VARCHAR(20),
    hemisphere_ns   CHAR(1),
    hemisphere_ew   CHAR(1),
    UNIQUE(granularity, city, state, country)
);

-- Tabela Fato de Temperatura
CREATE TABLE IF NOT EXISTS climate.fact_temperature (
    temperature_id              SERIAL PRIMARY KEY,
    date_id                     INTEGER REFERENCES climate.dim_date(date_id),
    location_id                 INTEGER REFERENCES climate.dim_location(location_id),
    avg_temperature             DECIMAL(10,4),
    avg_temperature_uncertainty DECIMAL(10,4),
    land_max_temperature        DECIMAL(10,4),
    land_max_temp_uncertainty   DECIMAL(10,4),
    land_min_temperature        DECIMAL(10,4),
    land_min_temp_uncertainty   DECIMAL(10,4),
    land_ocean_avg_temperature  DECIMAL(10,4),
    land_ocean_avg_temp_uncertainty DECIMAL(10,4),
    source_file                 VARCHAR(100) NOT NULL,
    loaded_at                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date_id, location_id, source_file)
);

-- Indices para performance
CREATE INDEX idx_fact_date ON climate.fact_temperature(date_id);
CREATE INDEX idx_fact_location ON climate.fact_temperature(location_id);
CREATE INDEX idx_dim_date_decade ON climate.dim_date(decade);
CREATE INDEX idx_dim_location_country ON climate.dim_location(country);

-- Permissoes
GRANT ALL ON SCHEMA climate TO climate;
GRANT ALL ON ALL TABLES IN SCHEMA climate TO climate;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA climate TO climate;