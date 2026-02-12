-- ==============================================
-- Climate Web - Supabase Schema
-- Execute este script no SQL Editor do Supabase
-- ==============================================

-- Dimensao de Data
CREATE TABLE IF NOT EXISTS dim_date (
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
CREATE TABLE IF NOT EXISTS dim_location (
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
CREATE TABLE IF NOT EXISTS fact_temperature (
    temperature_id              SERIAL PRIMARY KEY,
    date_id                     INTEGER REFERENCES dim_date(date_id),
    location_id                 INTEGER REFERENCES dim_location(location_id),
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
CREATE INDEX IF NOT EXISTS idx_fact_date ON fact_temperature(date_id);
CREATE INDEX IF NOT EXISTS idx_fact_location ON fact_temperature(location_id);
CREATE INDEX IF NOT EXISTS idx_dim_date_year ON dim_date(year);
CREATE INDEX IF NOT EXISTS idx_dim_date_decade ON dim_date(decade);
CREATE INDEX IF NOT EXISTS idx_dim_location_country ON dim_location(country);
CREATE INDEX IF NOT EXISTS idx_dim_location_city ON dim_location(city);
CREATE INDEX IF NOT EXISTS idx_dim_location_granularity ON dim_location(granularity);

-- Habilitar Row Level Security (RLS)
ALTER TABLE dim_date ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_temperature ENABLE ROW LEVEL SECURITY;

-- Politicas para leitura publica (dados climaticos sao publicos)
CREATE POLICY "Allow public read access on dim_date" ON dim_date
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on dim_location" ON dim_location
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on fact_temperature" ON fact_temperature
    FOR SELECT USING (true);

-- ==============================================
-- Dados de Exemplo (para teste inicial)
-- ==============================================

-- Inserir algumas datas
INSERT INTO dim_date (full_date, year, month, month_name, quarter, decade, century, is_modern_era)
VALUES
    ('2010-01-15', 2010, 1, 'January', 1, 2010, 21, true),
    ('2010-07-15', 2010, 7, 'July', 3, 2010, 21, true),
    ('2000-01-15', 2000, 1, 'January', 1, 2000, 20, true),
    ('1990-01-15', 1990, 1, 'January', 1, 1990, 20, true),
    ('1950-01-15', 1950, 1, 'January', 1, 1950, 20, true),
    ('1900-01-15', 1900, 1, 'January', 1, 1900, 19, false),
    ('1850-01-15', 1850, 1, 'January', 1, 1850, 19, false),
    ('1800-01-15', 1800, 1, 'January', 1, 1800, 18, false),
    ('1750-01-15', 1750, 1, 'January', 1, 1750, 18, false)
ON CONFLICT (full_date) DO NOTHING;

-- Inserir algumas localizacoes
INSERT INTO dim_location (granularity, city, state, country, latitude, longitude)
VALUES
    ('global', NULL, NULL, 'Global', 0, 0),
    ('country', NULL, NULL, 'Brazil', -14.235, -51.9253),
    ('country', NULL, NULL, 'United States', 37.0902, -95.7129),
    ('country', NULL, NULL, 'United Kingdom', 55.3781, -3.4360),
    ('country', NULL, NULL, 'Japan', 36.2048, 138.2529),
    ('country', NULL, NULL, 'Australia', -25.2744, 133.7751),
    ('city', 'Sao Paulo', 'SP', 'Brazil', -23.5505, -46.6333),
    ('city', 'Rio de Janeiro', 'RJ', 'Brazil', -22.9068, -43.1729),
    ('city', 'New York', 'NY', 'United States', 40.7128, -74.0060),
    ('city', 'Los Angeles', 'CA', 'United States', 34.0522, -118.2437),
    ('city', 'London', NULL, 'United Kingdom', 51.5074, -0.1278),
    ('city', 'Tokyo', NULL, 'Japan', 35.6762, 139.6503),
    ('city', 'Sydney', 'NSW', 'Australia', -33.8688, 151.2093),
    ('city', 'Paris', NULL, 'France', 48.8566, 2.3522),
    ('city', 'Moscow', NULL, 'Russia', 55.7558, 37.6173)
ON CONFLICT (granularity, city, state, country) DO NOTHING;

-- Inserir dados de temperatura de exemplo
INSERT INTO fact_temperature (date_id, location_id, avg_temperature, avg_temperature_uncertainty, source_file)
SELECT
    d.date_id,
    l.location_id,
    CASE
        WHEN l.city = 'Sao Paulo' THEN 22.5 + (RANDOM() * 5)
        WHEN l.city = 'Rio de Janeiro' THEN 25.0 + (RANDOM() * 5)
        WHEN l.city = 'New York' THEN 12.0 + (RANDOM() * 10)
        WHEN l.city = 'Los Angeles' THEN 18.0 + (RANDOM() * 5)
        WHEN l.city = 'London' THEN 10.0 + (RANDOM() * 5)
        WHEN l.city = 'Tokyo' THEN 15.0 + (RANDOM() * 8)
        WHEN l.city = 'Sydney' THEN 20.0 + (RANDOM() * 5)
        WHEN l.city = 'Paris' THEN 11.0 + (RANDOM() * 6)
        WHEN l.city = 'Moscow' THEN 5.0 + (RANDOM() * 10)
        WHEN l.granularity = 'global' THEN 14.0 + (d.decade - 1900) * 0.01
        ELSE 15.0 + (RANDOM() * 10)
    END as avg_temperature,
    0.5 + (RANDOM() * 0.5) as uncertainty,
    'sample_data'
FROM dim_date d
CROSS JOIN dim_location l
WHERE l.granularity IN ('city', 'global')
ON CONFLICT (date_id, location_id, source_file) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT 'dim_date: ' || COUNT(*) || ' registros' as info FROM dim_date;
SELECT 'dim_location: ' || COUNT(*) || ' registros' as info FROM dim_location;
SELECT 'fact_temperature: ' || COUNT(*) || ' registros' as info FROM fact_temperature;
