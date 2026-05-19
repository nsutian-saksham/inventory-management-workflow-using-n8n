'use client';

import React, { useEffect, useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  Mail, 
  User, 
  Clock, 
  TrendingUp, 
  ArrowLeft,
  Loader2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { supabase, Product, Order } from '@/lib/supabase';
import { ToastContainer, ToastMessage } from '@/components/Toast';

// Original default inventory quantities for manual resetting
const defaultStocks = [
  { name: 'Aura Wireless Headphones', stock: 50 },
  { name: 'Lumina Smart Watch', stock: 30 },
  { name: 'Zenith Mechanical Keyboard', stock: 20 },
  { name: 'Nova Studio Microphone', stock: 15 },
  { name: 'Quantum External SSD 1TB', stock: 100 },
  { name: 'Prism 4K Monitor', stock: 12 },
  { name: 'Aether VR Headset', stock: 8 },
  { name: 'Vertex Ergonomic Mouse', stock: 45 },
  { name: 'Helix Bluetooth Speaker', stock: 60 },
  { name: 'Echo Smart Display', stock: 25 },
  { name: 'Solstice Desk Lamp', stock: 80 },
  { name: 'Nebula Smartphone Gimbal', stock: 18 },
  { name: 'Apex Fitness Tracker', stock: 120 },
  { name: 'Polaris Mirrorless Camera', stock: 5 },
  { name: 'Horizon E-Reader', stock: 40 },
  { name: 'Oasis Noise-Cancelling Earbuds', stock: 55 },
  { name: 'Ignite Power Bank 20000mAh', stock: 200 },
  { name: 'Cascade Smart Thermostat', stock: 15 },
  { name: 'Vanguard Laptop Backpack', stock: 35 },
  { name: 'Radiant Ring Light', stock: 65 },
  { name: 'Cygnus Gaming Console', stock: 10 },
  { name: 'Orion Smart Glasses', stock: 22 },
  { name: 'Titanium Water Bottle (Smart)', stock: 90 },
  { name: 'Flux Ergonomic Chair', stock: 7 },
  { name: 'Ether Web Camera 1080p', stock: 50 }
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [editingStockVal, setEditingStockVal] = useState<string>('');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const [restockSimQty, setRestockSimQty] = useState('50');
  const [isSimulatingRestock, setIsSimulatingRestock] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('low_stock_webhook_url') || '';
      setWebhookUrl(saved);
    }
  }, []);

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setEditingStockVal(product.current_stock_level.toString());
    } else {
      setEditingStockVal('');
    }
  };

  const handleSaveWebhook = (url: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('low_stock_webhook_url', url);
      setWebhookUrl(url);
      addToast('success', 'Webhook URL Saved', 'Your n8n workflow test URL has been successfully saved in localStorage.');
    }
  };

  const handleTestWebhook = async () => {
    let activeWebhookUrl = webhookUrl;
    if (!activeWebhookUrl && typeof window !== 'undefined') {
      activeWebhookUrl = window.localStorage.getItem('low_stock_webhook_url') || '';
    }
    if (!activeWebhookUrl) {
      activeWebhookUrl = process.env.NEXT_PUBLIC_LOW_STOCK_WEBHOOK_URL || '';
    }

    if (!activeWebhookUrl) {
      addToast('error', 'No Webhook URL', 'Please enter a webhook URL first.');
      return;
    }

    setIsTestingWebhook(true);
    try {
      const samplePayload = {
        product_name: selectedProduct?.name || 'Aura Wireless Headphones',
        product_sku_id: selectedProduct?.id || 'd3b07384-d113-4ec5-a5e4-18bc9e96e680',
        product_category: selectedProduct?.category || 'Electronics',
        current_stock: selectedProduct ? Math.min(5, selectedProduct.current_stock_level) : 5,
        supplier_name: selectedProduct?.seller_name || 'Apex Electronics Ltd',
        supplier_email_address: selectedProduct?.seller_email || 'orders@apexelectronics.com'
      };

      const res = await fetch(activeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(samplePayload),
      });

      if (res.ok) {
        addToast('success', 'Webhook Test Sent', 'Successfully dispatched sample low-stock payload to n8n!');
      } else {
        addToast('error', 'Webhook Test Failed', `n8n workflow responded with status ${res.status}`);
      }
    } catch (err: any) {
      console.error('Webhook test error:', err);
      addToast('error', 'Webhook Test Error', err?.message || 'Network error sending webhook payload.');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    const newStock = parseInt(editingStockVal, 10);
    if (isNaN(newStock) || newStock < 0) {
      addToast('error', 'Invalid Stock Level', 'Please enter a valid non-negative integer.');
      return;
    }

    setIsUpdatingStock(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ current_stock_level: newStock })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      addToast('success', 'Stock Level Updated', `Stock level for ${selectedProduct.name} updated to ${newStock}.`);

      // Trigger webhook if new stock level is below 10
      if (newStock < 10) {
        let activeWebhookUrl = webhookUrl;
        if (!activeWebhookUrl && typeof window !== 'undefined') {
          activeWebhookUrl = window.localStorage.getItem('low_stock_webhook_url') || '';
        }
        if (!activeWebhookUrl) {
          activeWebhookUrl = process.env.NEXT_PUBLIC_LOW_STOCK_WEBHOOK_URL || '';
        }

        if (activeWebhookUrl) {
          try {
            const payload = {
              product_name: selectedProduct.name,
              product_sku_id: selectedProduct.id,
              product_category: selectedProduct.category,
              current_stock: newStock,
              supplier_name: selectedProduct.seller_name || 'Global Tech Distributors',
              supplier_email_address: selectedProduct.seller_email || 'fulfillment@globaltechdist.com'
            };

            const res = await fetch(activeWebhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              addToast('success', 'Webhook Triggered', `Low stock detected (${newStock} < 10). Payload sent to n8n workflow.`);
            } else {
              addToast('error', 'Webhook Error', `Webhook returned status ${res.status}.`);
            }
          } catch (webhookErr: any) {
            console.error('Webhook execution failed:', webhookErr);
            addToast('error', 'Webhook Failed', webhookErr?.message || 'Failed to dispatch webhook.');
          }
        } else {
          addToast('error', 'Webhook Warning', 'Low stock detected but no webhook URL configured. Stock was updated in DB.');
        }
      }

      // Refresh products from database to sync current stock levels
      await fetchData();
      
      // Update selected product's stock level locally
      setSelectedProduct(prev => prev ? { ...prev, current_stock_level: newStock } : null);

    } catch (err: any) {
      console.error('Stock update error:', err);
      addToast('error', 'Update Failed', err?.message || 'Failed to update stock level.');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleSimulateRestockWebhook = async () => {
    if (!selectedProduct) {
      addToast('error', 'No Product Selected', 'Select a product to simulate restocking.');
      return;
    }

    const qty = parseInt(restockSimQty, 10);
    if (isNaN(qty) || qty <= 0) {
      addToast('error', 'Invalid Quantity', 'Please enter a positive restock quantity.');
      return;
    }

    setIsSimulatingRestock(true);
    try {
      const res = await fetch('/api/inventory/restock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_sku_id: selectedProduct.id,
          bought_stock: qty,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast(
          'success',
          'Webhook Call Success',
          `Restocked ${selectedProduct.name} by +${qty}. Stock: ${data.previous_stock} -> ${data.new_stock}.`
        );
        // Refresh data
        await fetchData();
        // Update selected product display
        setSelectedProduct(prev => prev ? { ...prev, current_stock_level: data.new_stock } : null);
      } else {
        addToast('error', 'Sim Failure', data.error || 'Failed to trigger restock simulation.');
      }
    } catch (err: any) {
      console.error('Sim error:', err);
      addToast('error', 'Sim Network Error', err?.message || 'Failed to call restock endpoint.');
    } finally {
      setIsSimulatingRestock(false);
    }
  };

  // Helper to add toast
  const addToast = (type: 'success' | 'error', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch inventory data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch products
      const { data: fetchedProducts, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (prodError) throw prodError;
      setProducts(fetchedProducts || []);

      // 2. Fetch orders
      const { data: fetchedOrders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;
      setOrders(fetchedOrders || []);

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      addToast(
        'error',
        'Sync Failed',
        'Could not pull latest tracking data. Verify database configurations.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manual Reset Stock Simulation
  const handleResetStock = async () => {
    setIsResetting(true);
    try {
      // 1. Clear orders table
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything safely

      if (deleteError) throw new Error('Failed to flush orders stream.');

      // 2. Reset stocks for all 25 products
      for (const item of defaultStocks) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ current_stock_level: item.stock })
          .eq('name', item.name);

        if (updateError) throw new Error(`Failed to restore ${item.name} stock.`);
      }

      addToast(
        'success',
        'Simulation Reset Done',
        'Inventory stock restored to defaults and order streams cleared.'
      );
      
      // Update local states
      await fetchData();
      setSelectedProduct(null);

    } catch (err: any) {
      console.error('Reset error:', err);
      addToast('error', 'Reset Failed', err?.message || 'Failed to complete reset routine.');
    } finally {
      setIsResetting(false);
    }
  };

  // Helper to determine stock status
  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < threshold) return 'Low Stock';
    return 'In Stock';
  };

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const threshold = p.restock_threshold ?? 10;
    const status = getStockStatus(p.current_stock_level, threshold);
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Aggregation Metrics
  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => {
    const threshold = p.restock_threshold ?? 10;
    return p.current_stock_level > 0 && p.current_stock_level <= threshold;
  }).length;
  const outOfStockCount = products.filter((p) => p.current_stock_level === 0).length;
  const totalOrdersCount = orders.length;

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden">
      {/* Mesh Glow Background */}
      <div className="absolute inset-0 -z-10 bg-[#02000a]" />
      <div className="absolute inset-0 -z-10 bg-radial-gradient(at 0% 0%, rgba(76, 29, 149, 0.15) 0px, transparent 50%)" />
      <div className="absolute inset-0 -z-10 bg-radial-gradient(at 100% 0%, rgba(219, 39, 119, 0.1) 0px, transparent 50%)" />

      {/* Main Admin Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Store</span>
            </Link>
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-base font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent uppercase tracking-wider">
              Control Center
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="/api/inventory/low-stock" 
              target="_blank" 
              className="flex items-center space-x-1.5 rounded-lg border border-fuchsia-500/20 bg-fuchsia-950/20 px-3 py-1.5 text-xs font-semibold text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>n8n REST Endpoint</span>
            </a>
            <button 
              onClick={fetchData}
              disabled={isLoading}
              className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 hover:text-white transition-all text-neutral-400 disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 space-y-8">
        
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">System Stockroom Logs</h2>
            <p className="text-xs text-neutral-400 mt-1">Supervise and manage current vendor stock thresholds. Integrated with n8n hooks.</p>
          </div>
          
          {/* Manual Reset Controller */}
          <button
            onClick={handleResetStock}
            disabled={isResetting || isLoading}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-5 py-3 text-sm font-semibold text-white hover:from-red-500 hover:to-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-950/30 disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Restoring Defaults...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4.5 w-4.5" />
                <span>Reset Inventory Stocks</span>
              </>
            )}
          </button>
        </div>

        {/* Aggregation Metric Widgets */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-neutral-400">
              <Package className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-medium uppercase tracking-wider">Total SKUs</span>
            </div>
            <p className="text-3xl font-extrabold mt-2 text-white">{isLoading ? '...' : totalProductsCount}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-neutral-400">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium uppercase tracking-wider">Low Stock</span>
            </div>
            <p className="text-3xl font-extrabold mt-2 text-amber-400">{isLoading ? '...' : lowStockCount}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-neutral-400">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Out of Stock</span>
            </div>
            <p className="text-3xl font-extrabold mt-2 text-red-500">{isLoading ? '...' : outOfStockCount}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-neutral-400">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium uppercase tracking-wider">Total Sales</span>
            </div>
            <p className="text-3xl font-extrabold mt-2 text-emerald-400">{isLoading ? '...' : totalOrdersCount}</p>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Grid Inventory Area (Left/Center) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filter SKUs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      statusFilter === filter
                        ? 'bg-violet-600 text-white'
                        : 'border border-white/5 bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Table Container */}
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-neutral-400 font-semibold uppercase tracking-wider">
                      <th className="py-4 px-4 sm:px-6">Product Details</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4 text-right">Stock Level</th>
                      <th className="py-4 px-4 text-right">Threshold</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-neutral-400">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500 mb-2" />
                          <span>Loading Inventory Logs...</span>
                        </td>
                      </tr>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => {
                        const threshold = p.restock_threshold ?? 10;
                        const status = getStockStatus(p.current_stock_level, threshold);
                        const isSelected = selectedProduct?.id === p.id;
                        
                        return (
                          <tr 
                            key={p.id}
                            onClick={() => handleSelectProduct(isSelected ? null : p)}
                            className={`hover:bg-white/5 transition-colors cursor-pointer group ${
                              isSelected ? 'bg-violet-950/20' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center space-x-3">
                                <div className="h-9 w-9 overflow-hidden rounded-lg bg-white/5 border border-white/5 flex-shrink-0">
                                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="font-bold text-white group-hover:text-violet-400 transition-colors max-w-[160px] sm:max-w-[200px] truncate">
                                  {p.name}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-neutral-400 font-medium">
                              {p.category}
                            </td>
                            <td className={`py-3.5 px-4 text-right font-bold text-sm ${
                              status === 'Out of Stock' ? 'text-red-500' : 
                              status === 'Low Stock' ? 'text-amber-400' : 'text-neutral-200'
                            }`}>
                              {p.current_stock_level}
                            </td>
                            <td className="py-3.5 px-4 text-right text-neutral-400">
                              {threshold}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${
                                status === 'Out of Stock'
                                  ? 'border-red-500/20 bg-red-950/40 text-red-400'
                                  : status === 'Low Stock'
                                  ? 'border-amber-500/20 bg-amber-950/40 text-amber-400'
                                  : 'border-emerald-500/20 bg-emerald-950/40 text-emerald-400'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right pr-6">
                              <ChevronRight className={`h-4.5 w-4.5 text-neutral-500 transition-transform ${
                                isSelected ? 'rotate-90 text-violet-400' : ''
                              }`} />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-400">
                          No matching inventory rows found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel Workspace (Col Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* n8n Webhook Integration Card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                <FileText className="h-4.5 w-4.5 text-violet-400" />
                <span>n8n Webhook Workflow</span>
              </h3>
              
              <p className="text-xs text-neutral-400 leading-normal">
                Configure your n8n test/production webhook. Stock updates dropping <span className="text-amber-400 font-bold">below 10 units</span> will automatically feed JSON data to this URL.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Webhook URL</label>
                  <input
                    type="text"
                    placeholder="https://your-n8n-instance/webhook/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveWebhook(webhookUrl)}
                    className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500 active:scale-95 transition-all text-center"
                  >
                    Save URL
                  </button>
                  <button
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/10 hover:text-white disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center space-x-1"
                  >
                    {isTestingWebhook ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    <span>Test Webhook</span>
                  </button>
                </div>
              </div>
            </div>

            {/* n8n Restock Webhook Sim Card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                <RefreshCw className="h-4.5 w-4.5 text-emerald-400" />
                <span>n8n Restock Webhook Sim</span>
              </h3>
              
              <p className="text-xs text-neutral-400 leading-normal">
                Simulate an incoming restocking approval POST request to the local endpoint:
                <code className="block mt-1 bg-black/40 p-1.5 rounded text-[10px] text-violet-300 font-mono break-all">/api/inventory/restock</code>
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Target Product</span>
                  <span className="text-white font-bold block bg-black/20 p-2 rounded border border-white/5 truncate">
                    {selectedProduct ? selectedProduct.name : 'Select a product row first'}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Bought Stock (Quantity)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={restockSimQty}
                    onChange={(e) => setRestockSimQty(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <button
                  onClick={handleSimulateRestockWebhook}
                  disabled={!selectedProduct || isSimulatingRestock || !restockSimQty}
                  className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center space-x-1"
                >
                  {isSimulatingRestock ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : null}
                  <span>Simulate Webhook POST</span>
                </button>
              </div>
            </div>

            {/* Details Panel Widget */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                <User className="h-4.5 w-4.5 text-fuchsia-400" />
                <span>Supplier Inspection Panel</span>
              </h3>
              
              {selectedProduct ? (
                <div className="mt-5 space-y-5">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-base font-extrabold text-white leading-tight">{selectedProduct.name}</h4>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mt-1">
                      SKU ID: <span className="text-neutral-200 font-mono">{selectedProduct.id}</span>
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block font-medium uppercase tracking-wide text-[10px]">Supplier Name</span>
                      <span className="text-white text-sm font-bold mt-1 block">{selectedProduct.seller_name || 'Apex Electronics Ltd'}</span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block font-medium uppercase tracking-wide text-[10px]">Email Address</span>
                      <span className="text-violet-400 hover:underline flex items-center space-x-1 mt-1 block">
                        <Mail className="h-3.5 w-3.5 inline mr-1 text-fuchsia-400" />
                        <span>{selectedProduct.seller_email || 'orders@apexelectronics.com'}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-neutral-400 block font-medium uppercase tracking-wide text-[10px]">Transit Lead Time</span>
                        <span className="text-white font-bold text-sm mt-1 block flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-neutral-400" />
                          <span>{selectedProduct.lead_time ?? 4} Days</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block font-medium uppercase tracking-wide text-[10px]">Minimum Threshold</span>
                        <span className="text-white font-bold text-sm mt-1 block">{selectedProduct.restock_threshold ?? 10} Units</span>
                      </div>
                    </div>

                    {/* Stock level modification */}
                    <div className="border-t border-white/5 pt-4 mt-2 space-y-2">
                      <span className="text-neutral-400 block font-medium uppercase tracking-wide text-[10px]">Modify Inventory Stock</span>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Stock qty"
                          value={editingStockVal}
                          onChange={(e) => setEditingStockVal(e.target.value)}
                          className="w-24 rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <button
                          onClick={handleUpdateStock}
                          disabled={isUpdatingStock}
                          className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white active:scale-95 transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          {isUpdatingStock ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : null}
                          <span>Update & Sync</span>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/20 p-3 mt-4">
                      <span className="text-fuchsia-400 text-[10px] font-bold uppercase tracking-wider block">Estimated Restock Needs</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-white text-lg font-black">50 Units</span>
                        <span className="text-[10px] text-neutral-400">Order Code: restock-sku-50</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-neutral-400 text-xs">
                  <Package className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
                  <p>Select a product row to reveal structured supplier metrics.</p>
                </div>
              )}
            </div>

            {/* Live Checkout Logs Stream */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                <span>Recent Checkout Stream</span>
              </h3>
              
              <div className="mt-5 space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                {isLoading ? (
                  <div className="py-12 text-center text-neutral-400 text-xs">
                    <span>Syncing Order Stream...</span>
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((o) => {
                    const linkedProduct = products.find((p) => p.id === o.product_id);
                    
                    return (
                      <div key={o.id} className="rounded-lg border border-white/5 bg-white/5 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate max-w-[120px]">{o.customer_name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{o.customer_email}</p>
                        <div className="flex items-center justify-between border-t border-white/5 mt-2 pt-2 text-[10px]">
                          <span className="text-neutral-300 font-semibold">{linkedProduct?.name || 'Unknown SKU'}</span>
                          <span className="text-fuchsia-400 font-bold bg-fuchsia-950/30 px-1.5 py-0.5 rounded border border-fuchsia-500/10">
                            Qty: {o.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-neutral-400 text-xs">
                    <span>No checkouts captured in stream.</span>
                  </div>
                )}
              </div>
            </div>

          </div>


        </div>

      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
