-- Test distance calculations manually
-- Test coordinates: Downtown Cairo (30.0444, 31.2357)

-- Calculate distances from Downtown Cairo to various pharmacies
-- Expected distances (approximate):
-- Downtown to Zamalek: ~3 km
-- Downtown to Maadi: ~5 km  
-- Downtown to Nasr City: ~8 km
-- Downtown to Giza: ~6 km

SELECT 
    p.Id,
    p.Name,
    p.Address,
    p.Latitude,
    p.Longitude,
    -- Manual distance calculation using Haversine formula
    (6371 * 2 * ASIN(
        SQRT(
            POWER(SIN((RADIANS(p.Latitude) - RADIANS(30.0444)) / 2), 2) +
            COS(RADIANS(30.0444)) * COS(RADIANS(p.Latitude)) *
            POWER(SIN((RADIANS(p.Longitude) - RADIANS(31.2357)) / 2), 2)
        )
    )) AS CalculatedDistance_KM
FROM Pharmacies p
WHERE p.Latitude IS NOT NULL AND p.Longitude IS NOT NULL
ORDER BY CalculatedDistance_KM;

-- Test with specific coordinates that should give different distances
SELECT 
    'Same Location' as TestCase,
    (6371 * 2 * ASIN(
        SQRT(
            POWER(SIN((RADIANS(30.0444) - RADIANS(30.0444)) / 2), 2) +
            COS(RADIANS(30.0444)) * COS(RADIANS(30.0444)) *
            POWER(SIN((RADIANS(31.2357) - RADIANS(31.2357)) / 2), 2)
        )
    )) AS Distance_KM
UNION ALL
SELECT 
    'Different Location (Zamalek)' as TestCase,
    (6371 * 2 * ASIN(
        SQRT(
            POWER(SIN((RADIANS(30.0626) - RADIANS(30.0444)) / 2), 2) +
            COS(RADIANS(30.0444)) * COS(RADIANS(30.0626)) *
            POWER(SIN((RADIANS(31.2497) - RADIANS(31.2357)) / 2), 2)
        )
    )) AS Distance_KM
UNION ALL
SELECT 
    'Different Location (Maadi)' as TestCase,
    (6371 * 2 * ASIN(
        SQRT(
            POWER(SIN((RADIANS(30.0131) - RADIANS(30.0444)) / 2), 2) +
            COS(RADIANS(30.0444)) * COS(RADIANS(30.0131)) *
            POWER(SIN((RADIANS(31.2089) - RADIANS(31.2357)) / 2), 2)
        )
    )) AS Distance_KM; 