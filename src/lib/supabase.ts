import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  current_stock_level: number;
  image_url: string;
  created_at: string;
  seller_id?: string;
  seller_name?: string;
  seller_email?: string;
  lead_time?: number;
  restock_threshold?: number;
};

export type Order = {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  quantity: number;
  created_at: string;
};
