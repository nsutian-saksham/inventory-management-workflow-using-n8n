-- 1. Add Seller & Restock Threshold columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_email TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lead_time INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS restock_threshold INTEGER DEFAULT 10;

-- 2. Populate Seller details, thresholds, and adjust some stock levels to create "Low Stock" scenarios
-- Let's assign distinct suppliers for each category

-- Electronics (Seller ID: seller-01)
UPDATE products 
SET 
  seller_id = 'seller-01',
  seller_name = 'Apex Electronics Ltd',
  seller_email = 'orders@apexelectronics.com',
  lead_time = 3,
  restock_threshold = 10,
  current_stock_level = 8 -- Low Stock (8 < 15)
WHERE category = 'Electronics' AND name = 'Aura Wireless Headphones';

UPDATE products 
SET 
  seller_id = 'seller-01',
  seller_name = 'Apex Electronics Ltd',
  seller_email = 'orders@apexelectronics.com',
  lead_time = 4,
  restock_threshold = 10,
  current_stock_level = 25 -- Normal Stock
WHERE category = 'Electronics' AND name = 'Horizon E-Reader';

-- Audio (Seller ID: seller-02)
UPDATE products 
SET 
  seller_id = 'seller-02',
  seller_name = 'Sonic Wave Sound Co',
  seller_email = 'distribution@sonicwavesound.com',
  lead_time = 5,
  restock_threshold = 10,
  current_stock_level = 4 -- Low Stock (4 < 10)
WHERE category = 'Audio' AND name = 'Nova Studio Microphone';

UPDATE products 
SET 
  seller_id = 'seller-02',
  seller_name = 'Sonic Wave Sound Co',
  seller_email = 'distribution@sonicwavesound.com',
  lead_time = 3,
  restock_threshold = 10,
  current_stock_level = 60 -- Normal Stock
WHERE category = 'Audio' AND name = 'Helix Bluetooth Speaker';

UPDATE products 
SET 
  seller_id = 'seller-02',
  seller_name = 'Sonic Wave Sound Co',
  seller_email = 'distribution@sonicwavesound.com',
  lead_time = 5,
  restock_threshold = 10,
  current_stock_level = 5 -- Low Stock (5 < 12)
WHERE category = 'Audio' AND name = 'Oasis Noise-Cancelling Earbuds';

-- Wearables (Seller ID: seller-03)
UPDATE products 
SET 
  seller_id = 'seller-03',
  seller_name = 'FutureWear Technologies',
  seller_email = 'fulfillment@futurewear.tech',
  lead_time = 7,
  restock_threshold = 10,
  current_stock_level = 30 -- Normal Stock
WHERE category = 'Wearables' AND name = 'Lumina Smart Watch';

UPDATE products 
SET 
  seller_id = 'seller-03',
  seller_name = 'FutureWear Technologies',
  seller_email = 'fulfillment@futurewear.tech',
  lead_time = 6,
  restock_threshold = 10,
  current_stock_level = 120 -- Normal Stock
WHERE category = 'Wearables' AND name = 'Apex Fitness Tracker';

UPDATE products 
SET 
  seller_id = 'seller-03',
  seller_name = 'FutureWear Technologies',
  seller_email = 'fulfillment@futurewear.tech',
  lead_time = 8,
  restock_threshold = 10,
  current_stock_level = 2 -- Low Stock (2 < 15)
WHERE category = 'Wearables' AND name = 'Orion Smart Glasses';

-- Accessories (Seller ID: seller-04)
UPDATE products 
SET 
  seller_id = 'seller-04',
  seller_name = 'Vertex Supply Systems',
  seller_email = 'sales@vertexsupplies.net',
  lead_time = 2,
  restock_threshold = 10,
  current_stock_level = 3 -- Low Stock (3 < 15)
WHERE category = 'Accessories' AND name = 'Zenith Mechanical Keyboard';

UPDATE products 
SET 
  seller_id = 'seller-04',
  seller_name = 'Vertex Supply Systems',
  seller_email = 'sales@vertexsupplies.net',
  lead_time = 3,
  restock_threshold = 10,
  current_stock_level = 45 -- Normal Stock
WHERE category = 'Accessories' AND name = 'Vertex Ergonomic Mouse';

UPDATE products 
SET 
  seller_id = 'seller-04',
  seller_name = 'Vertex Supply Systems',
  seller_email = 'sales@vertexsupplies.net',
  lead_time = 4,
  restock_threshold = 10,
  current_stock_level = 200 -- Normal Stock
WHERE category = 'Accessories' AND name = 'Ignite Power Bank 20000mAh';

UPDATE products 
SET 
  seller_id = 'seller-04',
  seller_name = 'Vertex Supply Systems',
  seller_email = 'sales@vertexsupplies.net',
  lead_time = 3,
  restock_threshold = 10,
  current_stock_level = 35 -- Normal Stock
WHERE category = 'Accessories' AND name = 'Vanguard Laptop Backpack';

UPDATE products 
SET 
  seller_id = 'seller-04',
  seller_name = 'Vertex Supply Systems',
  seller_email = 'sales@vertexsupplies.net',
  lead_time = 3,
  restock_threshold = 10,
  current_stock_level = 50 -- Normal Stock
WHERE category = 'Accessories' AND name = 'Ether Web Camera 1080p';

-- Storage (Seller ID: seller-05)
UPDATE products 
SET 
  seller_id = 'seller-05',
  seller_name = 'Quantum Storage Corp',
  seller_email = 'b2b@quantumstorage.com',
  lead_time = 4,
  restock_threshold = 10,
  current_stock_level = 100 -- Normal Stock
WHERE category = 'Storage' AND name = 'Quantum External SSD 1TB';

-- Displays (Seller ID: seller-06)
UPDATE products 
SET 
  seller_id = 'seller-06',
  seller_name = 'Prism Displays Group',
  seller_email = 'support@prismdisplays.com',
  lead_time = 6,
  restock_threshold = 10,
  current_stock_level = 12 -- Normal Stock
WHERE category = 'Displays' AND name = 'Prism 4K Monitor';

-- Gaming (Seller ID: seller-07)
UPDATE products 
SET 
  seller_id = 'seller-07',
  seller_name = 'Nexus Gaming Products',
  seller_email = 'channels@nexusgaming.io',
  lead_time = 8,
  restock_threshold = 10,
  current_stock_level = 8 -- Normal Stock
WHERE category = 'Gaming' AND name = 'Aether VR Headset';

UPDATE products 
SET 
  seller_id = 'seller-07',
  seller_name = 'Nexus Gaming Products',
  seller_email = 'channels@nexusgaming.io',
  lead_time = 10,
  restock_threshold = 10,
  current_stock_level = 1 -- Low Stock (1 < 10)
WHERE category = 'Gaming' AND name = 'Cygnus Gaming Console';

-- Smart Home (Seller ID: seller-08)
UPDATE products 
SET 
  seller_id = 'seller-08',
  seller_name = 'OmniHome Systems',
  seller_email = 'orders@omnihome.net',
  lead_time = 5,
  restock_threshold = 10,
  current_stock_level = 25 -- Normal Stock
WHERE category = 'Smart Home' AND name = 'Echo Smart Display';

UPDATE products 
SET 
  seller_id = 'seller-08',
  seller_name = 'OmniHome Systems',
  seller_email = 'orders@omnihome.net',
  lead_time = 4,
  restock_threshold = 10,
  current_stock_level = 0 -- Out of Stock / Low Stock
WHERE category = 'Smart Home' AND name = 'Cascade Smart Thermostat';

-- Home (Seller ID: seller-09)
UPDATE products 
SET 
  seller_id = 'seller-09',
  seller_name = 'Lumina Home Decor',
  seller_email = 'wholesale@luminahomedecor.com',
  lead_time = 3,
  restock_threshold = 10,
  current_stock_level = 80 -- Normal Stock
WHERE category = 'Home' AND name = 'Solstice Desk Lamp';

UPDATE products 
SET 
  seller_id = 'seller-09',
  seller_name = 'Lumina Home Decor',
  seller_email = 'wholesale@luminahomedecor.com',
  lead_time = 5,
  restock_threshold = 10,
  current_stock_level = 90 -- Normal Stock
WHERE category = 'Home' AND name = 'Titanium Water Bottle (Smart)';

UPDATE products 
SET 
  seller_id = 'seller-09',
  seller_name = 'Lumina Home Decor',
  seller_email = 'wholesale@luminahomedecor.com',
  lead_time = 10,
  restock_threshold = 10,
  current_stock_level = 2 -- Low Stock (2 < 5)
WHERE category = 'Home' AND name = 'Flux Ergonomic Chair';

-- Photography (Seller ID: seller-10)
UPDATE products 
SET 
  seller_id = 'seller-10',
  seller_name = 'Focus Photo Supplies',
  seller_email = 'wholesale@focusphotosupplies.com',
  lead_time = 5,
  restock_threshold = 10,
  current_stock_level = 18 -- Normal Stock
WHERE category = 'Photography' AND name = 'Nebula Smartphone Gimbal';

UPDATE products 
SET 
  seller_id = 'seller-10',
  seller_name = 'Focus Photo Supplies',
  seller_email = 'wholesale@focusphotosupplies.com',
  lead_time = 6,
  restock_threshold = 10,
  current_stock_level = 0 -- Out of Stock / Low Stock
WHERE category = 'Photography' AND name = 'Polaris Mirrorless Camera';

UPDATE products 
SET 
  seller_id = 'seller-10',
  seller_name = 'Focus Photo Supplies',
  seller_email = 'wholesale@focusphotosupplies.com',
  lead_time = 4,
  restock_threshold = 10,
  current_stock_level = 65 -- Normal Stock
WHERE category = 'Photography' AND name = 'Radiant Ring Light';

-- 3. Double-check that generic fallback sellers are in place for safety
UPDATE products 
SET 
  seller_id = 'seller-generic',
  seller_name = 'Global Tech Distributors',
  seller_email = 'fulfillment@globaltechdist.com',
  lead_time = 5,
  restock_threshold = 10
WHERE seller_id IS NULL;
