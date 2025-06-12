-- Add diverse pharmacy locations for testing
-- These are sample locations in Cairo, Egypt with different distances

-- Update existing pharmacies with different locations
UPDATE Pharmacies SET 
    Latitude = 30.0444, 
    Longitude = 31.2357,
    Address = 'Downtown Cairo, Tahrir Square'
WHERE Id = 1;

UPDATE Pharmacies SET 
    Latitude = 30.0626, 
    Longitude = 31.2497,
    Address = 'Zamalek, Gezira Island'
WHERE Id = 2;

UPDATE Pharmacies SET 
    Latitude = 30.0131, 
    Longitude = 31.2089,
    Address = 'Maadi, Ring Road'
WHERE Id = 3;

UPDATE Pharmacies SET 
    Latitude = 30.0876, 
    Longitude = 31.3248,
    Address = 'Nasr City, Abbas El Akkad'
WHERE Id = 4;

UPDATE Pharmacies SET 
    Latitude = 29.9668, 
    Longitude = 31.2599,
    Address = 'Giza, Dokki Area'
WHERE Id = 5;

-- Insert additional test pharmacies with varied locations if they don't exist
INSERT IGNORE INTO Pharmacies (
    Name, OwnerName, Email, PhoneNumber, Address, City, 
    Latitude, Longitude, Status, Verified, UserId
) VALUES 
('Al Nour Pharmacy', 'Ahmed Hassan', 'alnour@pharmacy.com', '+201234567801', 'Heliopolis, Baron Palace', 'Cairo', 30.1219, 31.3409, 'active', 1, 1),
('City Pharmacy', 'Mona Salem', 'city@pharmacy.com', '+201234567802', 'New Cairo, AUC Campus', 'Cairo', 30.0175, 31.4992, 'active', 1, 1),
('Green Cross Pharmacy', 'Omar Khaled', 'greencross@pharmacy.com', '+201234567803', 'Sheikh Zayed, Beverly Hills', 'Giza', 30.0216, 31.0059, 'active', 1, 1),
('Life Care Pharmacy', 'Fatma Ali', 'lifecare@pharmacy.com', '+201234567804', 'Madinaty, Central Park', 'Cairo', 30.0943, 31.6398, 'active', 1, 1),
('Health Plus Pharmacy', 'Youssef Ahmed', 'healthplus@pharmacy.com', '+201234567805', 'Rehab City, Gate 4', 'Cairo', 30.0367, 31.4992, 'active', 1, 1);

-- Add some products to these pharmacies for testing
INSERT IGNORE INTO Products (
    Name, Category, Description, Price, Stock, SellerType, SellerName, PharmacyId, Status
) VALUES 
('Panadol Extra', 'Pain Relief', 'Pain and fever relief tablets', 25.50, 100, 'pharmacy', 'Al Nour Pharmacy', 6, 'active'),
('Brufen 600mg', 'Pain Relief', 'Anti-inflammatory tablets', 45.00, 50, 'pharmacy', 'City Pharmacy', 7, 'active'),
('Aspirin 100mg', 'Cardiovascular', 'Blood thinner tablets', 15.75, 200, 'pharmacy', 'Green Cross Pharmacy', 8, 'active'),
('Vitamin D3', 'Vitamins', 'Vitamin D supplements', 85.00, 75, 'pharmacy', 'Life Care Pharmacy', 9, 'active'),
('Omega 3', 'Supplements', 'Fish oil capsules', 120.00, 60, 'pharmacy', 'Health Plus Pharmacy', 10, 'active');

-- Verify the updates
SELECT 
    Id, Name, Address, Latitude, Longitude,
    CASE 
        WHEN Latitude IS NOT NULL AND Longitude IS NOT NULL THEN 'Location Set'
        ELSE 'No Location'
    END as Status
FROM Pharmacies
ORDER BY Id; 