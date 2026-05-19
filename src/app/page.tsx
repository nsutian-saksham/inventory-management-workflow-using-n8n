'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { ProductGrid } from '@/components/ProductGrid';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ToastContainer, ToastMessage } from '@/components/Toast';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [cartCount, setCartCount] = useState(0);

  // Helper to add toast
  const addToast = (type: 'success' | 'error', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  // Helper to remove toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      addToast(
        'error',
        'Database Sync Failed',
        'Could not load product catalog. Make sure your Supabase environment variables are set up in .env.local!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchProducts();
  }, []);

  // Handle Buy Now click
  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle order submission
  const handleConfirmOrder = async (name: string, email: string, quantity: number): Promise<boolean> => {
    if (!selectedProduct) return false;

    try {
      // 1. Fetch latest details from Supabase to prevent over-purchasing and get supplier info
      const { data: latestProduct, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', selectedProduct.id)
        .single();

      if (fetchErr) throw new Error('Failed to verify stock level.');

      if (latestProduct.current_stock_level < quantity) {
        addToast(
          'error',
          'Order Rejected',
          `Not enough stock left. Only ${latestProduct.current_stock_level} available.`
        );
        // Refresh local cache to reflect current DB stock
        fetchProducts();
        return false;
      }

      // 2. Decrement stock
      const newStock = latestProduct.current_stock_level - quantity;
      const { error: updateErr } = await supabase
        .from('products')
        .update({ current_stock_level: newStock })
        .eq('id', selectedProduct.id);

      if (updateErr) throw new Error('Failed to update product stock.');

      // Trigger asynchronous alert webhook if new stock level falls below 10
      const newStockLevel = newStock;
      if (newStockLevel < 10) {
        let webhookUrl = '';
        if (typeof window !== 'undefined') {
          webhookUrl = window.localStorage.getItem('low_stock_webhook_url') || '';
        }
        if (!webhookUrl) {
          webhookUrl = process.env.NEXT_PUBLIC_LOW_STOCK_WEBHOOK_URL || '';
        }

        if (webhookUrl) {
          try {
            fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_name: latestProduct.name,
                product_sku_id: latestProduct.id,
                product_category: latestProduct.category,
                current_stock: newStockLevel,
                supplier_name: latestProduct.seller_name || 'Global Tech Distributors',
                supplier_email_address: latestProduct.seller_email || 'fulfillment@globaltechdist.com'
              }),
            })
            .then(res => {
              if (res.ok) {
                addToast('success', 'Webhook Triggered', `Low stock detected (${newStockLevel} < 10). n8n feed sent successfully!`);
              } else {
                console.error('Webhook responded with status:', res.status);
              }
            })
            .catch((err) => console.error('Asynchronous webhook failed:', err));
          } catch (webhookErr) {
            console.error('Webhook dispatch failed:', webhookErr);
          }
        }
      }

      // 3. Log order in orders table
      const { error: orderErr } = await supabase
        .from('orders')
        .insert({
          product_id: selectedProduct.id,
          customer_name: name,
          customer_email: email,
          quantity: quantity,
        });

      if (orderErr) throw new Error('Order placed but order logging failed.');

      // Successful order
      addToast(
        'success',
        'Order Confirmed!',
        `Thank you, ${name}! Your order for ${quantity}x ${selectedProduct.name} has been processed successfully.`
      );

      // Increment visual cart count for premium UX feedback
      setCartCount((prev) => prev + quantity);

      // Refresh product list from database to sync current stock levels
      fetchProducts();
      return true;
    } catch (err: any) {
      console.error('Order process error:', err);
      addToast('error', 'Checkout Error', err?.message || 'Transaction could not be completed.');
      return false;
    }
  };

  return (
    <main className="relative min-h-screen">
      {/* Background glow graphics */}
      <div className="glow-mesh" />
      <div className="glow-spot" />
      <div className="glow-spot-2" />

      {/* Navigation Header */}
      <Header cartCount={cartCount} />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        
        {/* Hero Section */}
        <div className="relative mb-16 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 backdrop-blur-md overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/20 px-3.5 py-1 text-xs font-semibold tracking-wide text-fuchsia-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>STUNNING AESTHETICS METABOLIZED</span>
            </div>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              High-End Products. <br />
              <span className="text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text">Glassmorphic Elegance.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
              Explore our highly premium, beautifully curated hardware & gear catalog. Fully connected to a secure, decentralized state that syncs instantly for all checkout requests.
            </p>
          </div>
        </div>

        {/* Catalog Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Our Premium Catalog</h3>
              <p className="text-sm text-neutral-400 mt-1">Real-time inventory connected to Supabase backend.</p>
            </div>
            <button
              onClick={fetchProducts}
              disabled={isLoading}
              className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Catalog</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-10 w-10 text-fuchsia-500 animate-spin" />
              <p className="text-sm font-semibold text-neutral-400">Syncing database products...</p>
            </div>
          ) : (
            <ProductGrid products={products} onBuyNow={handleBuyNow} />
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Dynamic Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
