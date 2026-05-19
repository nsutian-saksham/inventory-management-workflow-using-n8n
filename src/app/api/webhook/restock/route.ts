import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support either productId or product_sku_id from the incoming webhook payload
    const productId = body.productId || body.product_sku_id;
    // Support boughtStock or quantity
    const boughtStock = body.boughtStock ?? body.quantity;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId or product_sku_id in payload' }, { status: 400 });
    }

    if (typeof boughtStock !== 'number' || boughtStock <= 0) {
      return NextResponse.json({ error: 'boughtStock must be a positive number' }, { status: 400 });
    }

    // Fetch the current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('current_stock_level, name')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      console.error('Error fetching product:', fetchError);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate new stock
    const newStock = product.current_stock_level + boughtStock;

    // Update the stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock_level: newStock })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating stock:', updateError);
      return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Stock for ${product.name} updated successfully`, 
      previousStock: product.current_stock_level,
      addedStock: boughtStock,
      newStock: newStock
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
