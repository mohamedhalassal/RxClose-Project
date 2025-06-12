-- Add Latitude and Longitude columns to Pharmacy table if they don't exist
-- MySQL version - safe to run multiple times

-- Check if Latitude column exists, if not add it
SET @sql = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'Pharmacy' 
     AND COLUMN_NAME = 'Latitude') = 0,
    'ALTER TABLE Pharmacy ADD COLUMN Latitude DOUBLE NULL',
    'SELECT "Latitude column already exists in Pharmacy table" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if Longitude column exists, if not add it
SET @sql = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'Pharmacy' 
     AND COLUMN_NAME = 'Longitude') = 0,
    'ALTER TABLE Pharmacy ADD COLUMN Longitude DOUBLE NULL',
    'SELECT "Longitude column already exists in Pharmacy table" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the changes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'Pharmacy' 
AND COLUMN_NAME IN ('Latitude', 'Longitude')
ORDER BY COLUMN_NAME; 