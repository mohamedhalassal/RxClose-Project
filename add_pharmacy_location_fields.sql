-- Add Latitude and Longitude columns to Pharmacy table if they don't exist
-- This script is safe to run multiple times

-- Check if Latitude column exists, if not add it
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Pharmacy' 
    AND COLUMN_NAME = 'Latitude'
)
BEGIN
    ALTER TABLE Pharmacy ADD Latitude DOUBLE NULL;
    PRINT 'Added Latitude column to Pharmacy table';
END
ELSE
BEGIN
    PRINT 'Latitude column already exists in Pharmacy table';
END

-- Check if Longitude column exists, if not add it
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Pharmacy' 
    AND COLUMN_NAME = 'Longitude'
)
BEGIN
    ALTER TABLE Pharmacy ADD Longitude DOUBLE NULL;
    PRINT 'Added Longitude column to Pharmacy table';
END
ELSE
BEGIN
    PRINT 'Longitude column already exists in Pharmacy table';
END

-- Verify the changes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Pharmacy' 
AND COLUMN_NAME IN ('Latitude', 'Longitude')
ORDER BY COLUMN_NAME; 