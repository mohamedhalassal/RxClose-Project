-- Add seller information columns to Products table
USE rxclose;

-- First, make PharmacyId nullable
ALTER TABLE Products MODIFY COLUMN PharmacyId INT NULL;

-- Add SellerType column with default value
ALTER TABLE Products ADD COLUMN SellerType VARCHAR(50) NOT NULL DEFAULT 'pharmacy';

-- Add SellerName column
ALTER TABLE Products ADD COLUMN SellerName VARCHAR(255) NULL;

-- Update existing products to set correct seller information
UPDATE Products 
SET SellerType = 'pharmacy',
    SellerName = (SELECT Name FROM Pharmacies WHERE Id = Products.PharmacyId)
WHERE PharmacyId IS NOT NULL;

-- Add index for better performance
CREATE INDEX idx_products_seller_type ON Products(SellerType);

-- Update the foreign key constraint to allow null PharmacyId
ALTER TABLE Products DROP FOREIGN KEY Products_ibfk_1;
ALTER TABLE Products ADD CONSTRAINT Products_ibfk_1 
    FOREIGN KEY (PharmacyId) REFERENCES Pharmacies(Id) ON DELETE SET NULL;

SELECT 'Products table updated successfully with seller information' AS Result; 