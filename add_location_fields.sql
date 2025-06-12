-- Add location fields to Users table
ALTER TABLE Users 
ADD COLUMN Latitude DOUBLE NULL,
ADD COLUMN Longitude DOUBLE NULL;

-- Update existing Pharmacy records to ensure they have proper location fields (already exist)
-- The Pharmacy table already has Latitude and Longitude fields from previous migrations

-- Add some sample location data for existing pharmacies (optional)
UPDATE Pharmacies SET 
    Latitude = 30.0626, 
    Longitude = 31.2497 
WHERE Id = 1 AND Latitude IS NULL;

UPDATE Pharmacies SET 
    Latitude = 30.0444, 
    Longitude = 31.2357 
WHERE Id = 2 AND Latitude IS NULL;

UPDATE Pharmacies SET 
    Latitude = 30.0875, 
    Longitude = 31.3242 
WHERE Id = 3 AND Latitude IS NULL;

UPDATE Pharmacies SET 
    Latitude = 30.0131, 
    Longitude = 31.2089 
WHERE Id = 4 AND Latitude IS NULL; 