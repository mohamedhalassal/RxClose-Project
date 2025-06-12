-- Check pharmacy locations and their coordinates
SELECT 
    Id,
    Name,
    Address,
    City,
    Latitude,
    Longitude,
    CASE 
        WHEN Latitude IS NULL OR Longitude IS NULL THEN 'No Location Set'
        ELSE CONCAT('Located at: ', Latitude, ', ', Longitude)
    END as LocationStatus
FROM Pharmacies
ORDER BY Id;

-- Check if all pharmacies have the same coordinates (which would cause the 3.04 km issue)
SELECT 
    Latitude,
    Longitude,
    COUNT(*) as PharmacyCount
FROM Pharmacies 
WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL
GROUP BY Latitude, Longitude
ORDER BY PharmacyCount DESC;

-- Check products from pharmacies with their location data
SELECT 
    p.Id as ProductId,
    p.Name as ProductName,
    ph.Id as PharmacyId,
    ph.Name as PharmacyName,
    ph.Latitude,
    ph.Longitude,
    CASE 
        WHEN ph.Latitude IS NULL OR ph.Longitude IS NULL THEN 'Pharmacy has no location'
        ELSE 'Pharmacy has location'
    END as LocationStatus
FROM Products p
JOIN Pharmacies ph ON p.PharmacyId = ph.Id
WHERE p.SellerType = 'pharmacy'
ORDER BY ph.Id, p.Id; 