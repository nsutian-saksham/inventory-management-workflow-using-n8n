import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Accept flexible field names for maximum compatibility with user's workflow
    const productId = body.product_id || body.product_sku_id || body.sku_id;
    const boughtStock = parseInt(body.bought_stock || body.quantity || body.restock_amount || body.units_to_order, 10);

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing product identifier. Please provide product_id, product_sku_id, or sku_id.' },
        { status: 400 }
      );
    }

    if (isNaN(boughtStock) || boughtStock <= 0) {
      return NextResponse.json(
        { error: 'Invalid restock quantity. Please provide a positive number for bought_stock, quantity, or restock_amount.' },
        { status: 400 }
      );
    }

    // 1. Fetch current stock of the product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return NextResponse.json(
        { error: `Product not found with ID ${productId}` },
        { status: 404 }
      );
    }

    const currentStock = product.current_stock_level || 0;
    const updatedStock = currentStock + boughtStock;

    // 2. Update stock level in database
    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock_level: updatedStock })
      .eq('id', productId);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update product stock: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 3. Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully restocked ${product.name}.`,
      product_id: product.id,
      product_name: product.name,
      previous_stock: currentStock,
      added_stock: boughtStock,
      new_stock: updatedStock
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
