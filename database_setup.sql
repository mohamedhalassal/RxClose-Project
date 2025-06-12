-- =================================
-- RxClose Location-Based Search Setup
-- =================================

-- 1. Check current pharmacy data
SELECT '=== CURRENT PHARMACY DATA ===' as Info;
SELECT 
    Id, Name, Address, City,
    Latitude, Longitude,
    CASE 
        WHEN Latitude IS NULL OR Longitude IS NULL THEN 'NO LOCATION'
        ELSE CONCAT(Latitude, ', ', Longitude)
    END as LocationStatus
FROM Pharmacies 
ORDER BY Id;

-- 2. Check if all pharmacies have same coordinates (causing the 3.04km issue)
SELECT '=== DUPLICATE COORDINATES CHECK ===' as Info;
SELECT 
    Latitude, Longitude, COUNT(*) as Count,
    GROUP_CONCAT(Name SEPARATOR ', ') as Pharmacies
FROM Pharmacies 
WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL
GROUP BY Latitude, Longitude
HAVING COUNT(*) > 1;

-- 3. Clear and set diverse test locations
UPDATE Pharmacies SET 
    Latitude = 30.0444, 
    Longitude = 31.2357,
    Address = 'Downtown Cairo, Tahrir Square',
    City = 'Cairo'
WHERE Id = 1;

UPDATE Pharmacies SET 
    Latitude = 30.0626, 
    Longitude = 31.2497,
    Address = 'Zamalek, Gezira Island',
    City = 'Cairo'
WHERE Id = 2;

UPDATE Pharmacies SET 
    Latitude = 30.0131, 
    Longitude = 31.2089,
    Address = 'Maadi, Ring Road',
    City = 'Cairo'
WHERE Id = 3;

UPDATE Pharmacies SET 
    Latitude = 30.0876, 
    Longitude = 31.3248,
    Address = 'Nasr City, Abbas El Akkad',
    City = 'Cairo'
WHERE Id = 4;

UPDATE Pharmacies SET 
    Latitude = 29.9668, 
    Longitude = 31.2599,
    Address = 'Giza, Dokki Area',
    City = 'Giza'
WHERE Id = 5;

-- 4. Insert additional test pharmacies if needed
INSERT IGNORE INTO Pharmacies (
    Name, OwnerName, Email, PhoneNumber, Address, City, 
    Latitude, Longitude, Status, Verified, UserId
) VALUES 
('Al Nour Pharmacy', 'Ahmed Hassan', 'alnour@test.com', '+201234567801', 'Heliopolis, Baron Palace', 'Cairo', 30.1219, 31.3409, 'active', 1, 1),
('City Pharmacy', 'Mona Salem', 'city@test.com', '+201234567802', 'New Cairo, AUC Campus', 'Cairo', 30.0175, 31.4992, 'active', 1, 1),
('Green Cross Pharmacy', 'Omar Khaled', 'greencross@test.com', '+201234567803', 'Sheikh Zayed, Beverly Hills', 'Giza', 30.0216, 31.0059, 'active', 1, 1),
('Life Care Pharmacy', 'Fatma Ali', 'lifecare@test.com', '+201234567804', 'Madinaty, Central Park', 'Cairo', 30.0943, 31.6398, 'active', 1, 1),
('Health Plus Pharmacy', 'Youssef Ahmed', 'healthplus@test.com', '+201234567805', 'Rehab City, Gate 4', 'Cairo', 30.0367, 31.4992, 'active', 1, 1);

-- 5. Add test products to these pharmacies
INSERT IGNORE INTO Products (
    Name, Category, Description, Price, Stock, SellerType, SellerName, PharmacyId, Status
) VALUES 
-- Products for existing pharmacies
('Panadol Extra', 'Pain Relief', 'Pain and fever relief tablets', 25.50, 100, 'pharmacy', (SELECT Name FROM Pharmacies WHERE Id = 1), 1, 'active'),
('Brufen 600mg', 'Pain Relief', 'Anti-inflammatory tablets', 45.00, 50, 'pharmacy', (SELECT Name FROM Pharmacies WHERE Id = 2), 2, 'active'),
('Aspirin 100mg', 'Cardiovascular', 'Blood thinner tablets', 15.75, 200, 'pharmacy', (SELECT Name FROM Pharmacies WHERE Id = 3), 3, 'active'),
('Vitamin D3', 'Vitamins', 'Vitamin D supplements', 85.00, 75, 'pharmacy', (SELECT Name FROM Pharmacies WHERE Id = 4), 4, 'active'),
('Omega 3', 'Supplements', 'Fish oil capsules', 120.00, 60, 'pharmacy', (SELECT Name FROM Pharmacies WHERE Id = 5), 5, 'active'),

-- Additional Panadol products for distance testing
('Panadol Regular', 'Pain Relief', 'Regular paracetamol tablets', 20.00, 150, 'pharmacy', (SELECT Name FROM Pharmacies WHERE Id = 2), 2, 'active'),
('Panadol Night', 'Pain Relief', 'Night time pain relief', 30.00, 80, 'pharmacy', (SELECT Name FROM Pharmacies WHERE Id = 3), 3, 'active'),
('Panadol Advance', 'Pain Relief', 'Fast acting paracetamol', 35.00, 90, 'pharmacy', (SELECT Name FROM Pharmacies WHERE Id = 4), 4, 'active'),

-- Products for new pharmacies (if they exist)
('Panadol Migraine', 'Pain Relief', 'Migraine relief tablets', 40.00, 70, 'pharmacy', 'Al Nour Pharmacy', 6, 'active'),
('Panadol Cold', 'Cold & Flu', 'Cold and flu relief', 28.00, 120, 'pharmacy', 'City Pharmacy', 7, 'active');

-- 6. Verify the setup
SELECT '=== UPDATED PHARMACY LOCATIONS ===' as Info;
SELECT 
    Id, Name, Address, 
    CONCAT(ROUND(Latitude, 4), ', ', ROUND(Longitude, 4)) as Coordinates,
    -- Calculate distance from Downtown Cairo (30.0444, 31.2357)
    ROUND((6371 * 2 * ASIN(
        SQRT(
            POWER(SIN((RADIANS(Latitude) - RADIANS(30.0444)) / 2), 2) +
            COS(RADIANS(30.0444)) * COS(RADIANS(Latitude)) *
            POWER(SIN((RADIANS(Longitude) - RADIANS(31.2357)) / 2), 2)
        )
    )), 2) AS DistanceFromDowntown_KM
FROM Pharmacies 
WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL
ORDER BY DistanceFromDowntown_KM;

-- 7. Check products with their pharmacy locations
SELECT '=== PRODUCTS WITH PHARMACY LOCATIONS ===' as Info;
SELECT 
    p.Id, p.Name as ProductName, 
    ph.Name as PharmacyName, ph.Address,
    CONCAT(ROUND(ph.Latitude, 4), ', ', ROUND(ph.Longitude, 4)) as PharmacyCoords
FROM Products p
JOIN Pharmacies ph ON p.PharmacyId = ph.Id
WHERE p.SellerType = 'pharmacy' AND p.Name LIKE '%panadol%'
ORDER BY p.Name;

-- 8. Test distance calculations
SELECT '=== DISTANCE CALCULATION TEST ===' as Info;
SELECT 
    'Same Location Test' as Test,
    ROUND((6371 * 2 * ASIN(
        SQRT(
            POWER(SIN((RADIANS(30.0444) - RADIANS(30.0444)) / 2), 2) +
            COS(RADIANS(30.0444)) * COS(RADIANS(30.0444)) *
            POWER(SIN((RADIANS(31.2357) - RADIANS(31.2357)) / 2), 2)
        )
    )), 2) AS Distance_KM,
    'Should be 0' as Expected

UNION ALL

SELECT 
    'Downtown to Zamalek' as Test,
    ROUND((6371 * 2 * ASIN(
        SQRT(
            POWER(SIN((RADIANS(30.0626) - RADIANS(30.0444)) / 2), 2) +
            COS(RADIANS(30.0444)) * COS(RADIANS(30.0626)) *
            POWER(SIN((RADIANS(31.2497) - RADIANS(31.2357)) / 2), 2)
        )
    )), 2) AS Distance_KM,
    'Should be ~3km' as Expected

UNION ALL

SELECT 
    'Downtown to Maadi' as Test,
    ROUND((6371 * 2 * ASIN(
        SQRT(
            POWER(SIN((RADIANS(30.0131) - RADIANS(30.0444)) / 2), 2) +
            COS(RADIANS(30.0444)) * COS(RADIANS(30.0131)) *
            POWER(SIN((RADIANS(31.2089) - RADIANS(31.2357)) / 2), 2)
        )
    )), 2) AS Distance_KM,
    'Should be ~5km' as Expected; 