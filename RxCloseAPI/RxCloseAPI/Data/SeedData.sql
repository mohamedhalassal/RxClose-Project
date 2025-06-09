-- إضافة مستخدمين تجريبيين
-- كلمة المرور لجميع المستخدمين: 123456
INSERT INTO Users (PhoneNumber, Name, UserName, Password, Email, Location, Role, CreatedAt, Status) VALUES
('01234567890', 'أحمد محمد', 'ahmed_admin', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'ahmed@rxclose.com', 'القاهرة', 'superadmin', NOW(), 'active'),
('01234567891', 'فاطمة علي', 'fatma_pharmacy', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'fatma@pharmacy1.com', 'الجيزة', 'admin', NOW(), 'active'),
('01234567892', 'محمد حسن', 'mohamed_pharmacy', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'mohamed@pharmacy2.com', 'الإسكندرية', 'admin', NOW(), 'active'),
('01234567893', 'سارة أحمد', 'sara_user', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'sara@user.com', 'القاهرة', 'user', NOW(), 'active'),
('01234567894', 'علي محمود', 'ali_user', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'ali@user.com', 'الجيزة', 'user', NOW(), 'active'),
('01234567895', 'نور الدين', 'nour_pharmacy', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'nour@pharmacy3.com', 'المنصورة', 'admin', NOW(), 'active'),
('01234567896', 'ليلى حسام', 'layla_user', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'layla@user.com', 'طنطا', 'user', NOW(), 'inactive'),
('01234567897', 'خالد عبدالله', 'khaled_pharmacy', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'khaled@pharmacy4.com', 'أسوان', 'admin', NOW(), 'active'),
('01234567898', 'مريم سعد', 'mariam_user', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'mariam@user.com', 'الأقصر', 'user', NOW(), 'banned'),
('01234567899', 'يوسف إبراهيم', 'youssef_user', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'youssef@user.com', 'الإسماعيلية', 'user', NOW(), 'active');

-- إضافة صيدليات تجريبية
INSERT INTO Pharmacies (Name, OwnerName, Email, PhoneNumber, Address, City, Status, RegisteredAt, TotalProducts, TotalOrders, Revenue, Rating, Verified, Latitude, Longitude, UserId) VALUES
('صيدلية النور', 'فاطمة علي', 'fatma@pharmacy1.com', '01234567891', 'شارع التحرير، وسط البلد', 'القاهرة', 'active', NOW(), 45, 120, 15000.00, 4.5, true, 30.0444, 31.2357, 2),
('صيدلية الشفاء', 'محمد حسن', 'mohamed@pharmacy2.com', '01234567892', 'كورنيش الإسكندرية', 'الإسكندرية', 'active', NOW(), 38, 95, 12500.00, 4.2, true, 31.2001, 29.9187, 3),
('صيدلية الأمل', 'نور الدين', 'nour@pharmacy3.com', '01234567895', 'شارع الجمهورية', 'المنصورة', 'pending', NOW(), 25, 45, 8000.00, 4.0, false, 31.0409, 31.3785, 6),
('صيدلية الحياة', 'خالد عبدالله', 'khaled@pharmacy4.com', '01234567897', 'شارع السوق', 'أسوان', 'active', NOW(), 30, 60, 9500.00, 4.3, true, 24.0889, 32.8998, 8),
('صيدلية المستقبل', 'أمينة محمد', 'amina@pharmacy5.com', '01234567800', 'شارع الهرم', 'الجيزة', 'suspended', NOW(), 20, 30, 5000.00, 3.8, false, 29.9792, 31.1342, 1);

-- إضافة منتجات تجريبية
INSERT INTO Products (Name, Category, Description, Price, Stock, Status, ImageUrl, CreatedAt, Prescription, Manufacturer, ActiveIngredient, Dosage, ExpiryDate, PharmacyId) VALUES
-- منتجات صيدلية النور
('بانادول إكسترا', 'مسكنات', 'مسكن للألم وخافض للحرارة', 25.50, 100, 'active', 'https://example.com/panadol.jpg', NOW(), false, 'GSK', 'Paracetamol + Caffeine', '500mg + 65mg', '2025-12-31', 1),
('فيتامين د3', 'فيتامينات', 'مكمل غذائي لتقوية العظام', 45.00, 50, 'active', 'https://example.com/vitamin-d.jpg', NOW(), false, 'Pharco', 'Cholecalciferol', '1000 IU', '2026-06-30', 1),
('أوجمنتين', 'مضادات حيوية', 'مضاد حيوي واسع المجال', 85.00, 30, 'active', 'https://example.com/augmentin.jpg', NOW(), true, 'GSK', 'Amoxicillin + Clavulanic acid', '625mg', '2025-08-15', 1),
('كونكور', 'أدوية القلب', 'لعلاج ضغط الدم المرتفع', 120.00, 25, 'active', 'https://example.com/concor.jpg', NOW(), true, 'Merck', 'Bisoprolol', '5mg', '2025-10-20', 1),

-- منتجات صيدلية الشفاء
('أسبرين', 'مسكنات', 'مسكن ومضاد للالتهاب', 15.00, 80, 'active', 'https://example.com/aspirin.jpg', NOW(), false, 'Bayer', 'Acetylsalicylic acid', '100mg', '2025-11-30', 2),
('زيثروماكس', 'مضادات حيوية', 'مضاد حيوي للعدوى البكتيرية', 95.00, 20, 'active', 'https://example.com/zithromax.jpg', NOW(), true, 'Pfizer', 'Azithromycin', '250mg', '2025-09-15', 2),
('أوميجا 3', 'مكملات غذائية', 'مكمل غذائي لصحة القلب', 65.00, 40, 'active', 'https://example.com/omega3.jpg', NOW(), false, 'Nature Made', 'Fish Oil', '1000mg', '2026-03-20', 2),

-- منتجات صيدلية الأمل
('فولتارين', 'مسكنات', 'مسكن قوي للألم والالتهاب', 35.00, 60, 'active', 'https://example.com/voltaren.jpg', NOW(), false, 'Novartis', 'Diclofenac', '50mg', '2025-07-10', 3),
('سيتال', 'مسكنات', 'مسكن وخافض للحرارة للأطفال', 18.00, 70, 'active', 'https://example.com/cetal.jpg', NOW(), false, 'ADWIA', 'Paracetamol', '120mg/5ml', '2025-12-25', 3),

-- منتجات صيدلية الحياة
('نوفالدول', 'مسكنات', 'مسكن وخافض للحرارة', 22.00, 90, 'active', 'https://example.com/novaldol.jpg', NOW(), false, 'Sanofi', 'Paracetamol', '500mg', '2025-11-15', 4),
('كالسيوم د3', 'فيتامينات', 'مكمل الكالسيوم وفيتامين د', 55.00, 35, 'active', 'https://example.com/calcium-d3.jpg', NOW(), false, 'Eva Pharma', 'Calcium + Vitamin D3', '600mg + 400 IU', '2026-01-30', 4),

-- منتجات منخفضة المخزون
('إنسولين', 'أدوية السكري', 'لعلاج مرض السكري', 180.00, 5, 'active', 'https://example.com/insulin.jpg', NOW(), true, 'Novo Nordisk', 'Human Insulin', '100 IU/ml', '2025-06-30', 1),
('فنتولين', 'أدوية الجهاز التنفسي', 'موسع للشعب الهوائية', 45.00, 8, 'active', 'https://example.com/ventolin.jpg', NOW(), true, 'GSK', 'Salbutamol', '100mcg', '2025-08-20', 2);

-- إضافة طلبات تجريبية
INSERT INTO Orders (OrderNumber, OrderDate, Status, TotalAmount, ShippingCost, TaxAmount, DiscountAmount, PaymentMethod, PaymentStatus, DeliveryAddress, DeliveryNotes, UserId, PharmacyId) VALUES
('ORD-2024-001', NOW(), 'delivered', 125.50, 15.00, 12.55, 0.00, 'cash', 'completed', 'شارع النيل، المعادي، القاهرة', 'اتصل قبل التسليم', 4, 1),
('ORD-2024-002', NOW(), 'processing', 85.00, 10.00, 8.50, 5.00, 'card', 'completed', 'شارع الجامعة، الجيزة', '', 5, 2),
('ORD-2024-003', NOW(), 'pending', 65.00, 12.00, 6.50, 0.00, 'cash', 'pending', 'كورنيش النيل، الإسكندرية', 'تسليم مساءً', 10, 2),
('ORD-2024-004', NOW(), 'shipped', 180.00, 20.00, 18.00, 10.00, 'card', 'completed', 'شارع السلام، المنصورة', '', 4, 3),
('ORD-2024-005', NOW(), 'cancelled', 45.00, 8.00, 4.50, 0.00, 'cash', 'refunded', 'شارع المحطة، أسوان', 'ألغي الطلب', 5, 4);

-- إضافة عناصر الطلبات
INSERT INTO OrderItems (Quantity, UnitPrice, TotalPrice, Notes, OrderId, ProductId) VALUES
-- طلب 1
(2, 25.50, 51.00, '', 1, 1),
(1, 45.00, 45.00, '', 1, 2),
(1, 85.00, 85.00, 'يحتاج روشتة', 1, 3),

-- طلب 2
(1, 85.00, 85.00, '', 2, 3),

-- طلب 3
(1, 65.00, 65.00, '', 3, 7),

-- طلب 4
(1, 180.00, 180.00, 'حساس للبرد', 4, 13),

-- طلب 5
(1, 45.00, 45.00, '', 5, 14); 