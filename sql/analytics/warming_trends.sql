-- Temperatura media por decada (Global)
SELECT
    d.decade,
    ROUND(AVG(f.avg_temperature)::numeric, 2) as avg_temp,
    ROUND(AVG(f.avg_temperature_uncertainty)::numeric, 3) as avg_uncertainty,
    COUNT(*) as measurements
FROM climate.fact_temperature f
JOIN climate.dim_date d ON f.date_id = d.date_id
JOIN climate.dim_location l ON f.location_id = l.location_id
WHERE l.granularity = 'global'
  AND f.avg_temperature IS NOT NULL
GROUP BY d.decade
ORDER BY d.decade;

-- Top 10 anos mais quentes
SELECT
    d.year,
    ROUND(AVG(f.avg_temperature)::numeric, 2) as avg_temp
FROM climate.fact_temperature f
JOIN climate.dim_date d ON f.date_id = d.date_id
JOIN climate.dim_location l ON f.location_id = l.location_id
WHERE l.granularity = 'global'
  AND f.avg_temperature IS NOT NULL
GROUP BY d.year
ORDER BY avg_temp DESC
LIMIT 10;