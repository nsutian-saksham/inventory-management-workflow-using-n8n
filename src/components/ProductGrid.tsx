'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Filter, Package } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '@/lib/supabase';

interface ProductGridProps {
  products: Product[];
  onBuyNow: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onBuyNow }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories dynamically
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Motion Container Config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-md">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 mr-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Category:</span>
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/10'
                  : 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Status / Info */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div>
          Showing <span className="font-semibold text-white">{filteredProducts.length}</span> products
        </div>
        {selectedCategory !== 'All' && (
          <div className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-fuchsia-400" />
            <span>Filtered by Category: <span className="font-bold text-white">{selectedCategory}</span></span>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuyNow={onBuyNow}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/5 text-neutral-400 mb-4">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-sm text-neutral-400 mt-1 max-w-xs">
              Try adjusting your search criteria or category filters.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
