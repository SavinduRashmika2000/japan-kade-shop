USE autocare_db;

INSERT IGNORE INTO stock_items (name, part_number, quantity, unit_price, low_stock_threshold) VALUES
('Synthetic Motor Oil 5W-30 (1L)', 'OIL-5W30-1L', 45, 12.50, 20),
('Standard Oil Filter', 'FIL-OIL-STD', 18, 8.99, 25),
('Ceramic Brake Pads (Front)', 'BRK-PAD-FR-CER', 12, 45.00, 15),
('Cabin Air Filter', 'FIL-CAB-AIR', 5, 15.20, 10),
('Spark Plug (Iridium)', 'SPK-IR-001', 120, 9.50, 40),
('Windshield Wiper Blades 22"', 'WIP-22-BLK', 30, 14.00, 15),
('Transmission Fluid (1L)', 'FLUID-TRANS-1L', 8, 18.75, 10),