import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Query products where current_stock_level < restock_threshold
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter products whose current_stock_level falls BELOW restock_threshold
    // (If restock_threshold is null, default to 10)
    const lowStockProducts = (products || []).filter((product) => {
      const threshold = product.restock_threshold ?? 10;
      return product.current_stock_level < threshold;
    });

    // Map and transform database rows to match the exact schema requested by the user
    const payload = lowStockProducts.map((product) => {
      // Calculate units to order: standard 50 units (can be dynamic or constant)
      const unitsToOrder = 50;

      return {
        product_id: product.id,
        product_name: product.name,
        current_stock: product.current_stock_level,
        restock_threshold: product.restock_threshold ?? 10,
        units_to_order: unitsToOrder,
        seller: {
          seller_id: product.seller_id || 'seller-generic',
          name: product.seller_name || 'Global Tech Distributors',
          email: product.seller_email || 'fulfillment@globaltechdist.com'
        }
      };
    });

    // Return structured, minified JSON array
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
