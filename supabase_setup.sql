-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  current_stock_level INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert 25 dummy products with glassmorphic/premium vibes
INSERT INTO products (name, category, price, current_stock_level, image_url) VALUES
  ('Aura Wireless Headphones', 'Electronics', 249.99, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'),
  ('Lumina Smart Watch', 'Wearables', 199.99, 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'),
  ('Zenith Mechanical Keyboard', 'Accessories', 129.50, 20, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'),
  ('Nova Studio Microphone', 'Audio', 179.00, 15, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80'),
  ('Quantum External SSD 1TB', 'Storage', 149.99, 100, 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80'),
  ('Prism 4K Monitor', 'Displays', 399.99, 12, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'),
  ('Aether VR Headset', 'Gaming', 299.99, 8, 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80'),
  ('Vertex Ergonomic Mouse', 'Accessories', 79.99, 45, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'),
  ('Helix Bluetooth Speaker', 'Audio', 89.50, 60, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'),
  ('Echo Smart Display', 'Smart Home', 129.99, 25, 'https://images.unsplash.com/photo-1585223011384-5690b206775f?w=800&q=80'),
  ('Solstice Desk Lamp', 'Home', 49.99, 80, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80'),
  ('Nebula Smartphone Gimbal', 'Photography', 119.00, 18, 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=800&q=80'),
  ('Apex Fitness Tracker', 'Wearables', 59.99, 120, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80'),
  ('Polaris Mirrorless Camera', 'Photography', 899.99, 5, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'),
  ('Horizon E-Reader', 'Electronics', 139.99, 40, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'),
  ('Oasis Noise-Cancelling Earbuds', 'Audio', 159.00, 55, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'),
  ('Ignite Power Bank 20000mAh', 'Accessories', 39.99, 200, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'),
  ('Cascade Smart Thermostat', 'Smart Home', 199.50, 15, 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80'),
  ('Vanguard Laptop Backpack', 'Accessories', 89.99, 35, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'),
  ('Radiant Ring Light', 'Photography', 45.00, 65, 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=800&q=80'),
  ('Cygnus Gaming Console', 'Gaming', 499.99, 10, 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&q=80'),
  ('Orion Smart Glasses', 'Wearables', 299.00, 22, 'https://images.unsplash.com/photo-1572635196237-14b3f281501f?w=800&q=80'),
  ('Titanium Water Bottle (Smart)', 'Home', 55.00, 90, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'),
  ('Flux Ergonomic Chair', 'Home', 259.99, 7, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80'),
  ('Ether Web Camera 1080p', 'Accessories', 69.99, 50, 'https://images.unsplash.com/photo-1599690926051-b2b918663806?w=800&q=80');

-- Disable Row Level Security (RLS) so the anon key can query & checkout without strict policy setups
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
