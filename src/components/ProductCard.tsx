'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, AlertCircle } from 'lucide-react';
import { Product } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow }) => {
  const isOutOfStock = product.current_stock_level <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 flex flex-col justify-between"
    >
      {/* Background glow effects */}
      <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl transition-all group-hover:bg-violet-600/20" />
      <div className="absolute -left-20 -bottom-20 -z-10 h-40 w-40 rounded-full bg-fuchsia-600/10 blur-3xl transition-all group-hover:bg-fuchsia-600/20" />

      <div>
        {/* Product Image Section */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white/5 border border-white/5">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-300 backdrop-blur-sm">
            {product.category}
          </div>
          
          {isOutOfStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="flex items-center space-x-1.5 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>Out of Stock</span>
              </span>
            </div>
          ) : (
            product.current_stock_level <= 5 && (
              <div className="absolute bottom-3 right-3 rounded-lg border border-amber-500/20 bg-amber-950/50 px-2.5 py-1 text-[10px] font-semibold text-amber-400 backdrop-blur-sm">
                Only {product.current_stock_level} left!
              </div>
            )
          )}
        </div>

        {/* Product Info */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-xl font-extrabold text-white">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-400">
              Stock: <span className="font-semibold text-neutral-200">{product.current_stock_level}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Button Section */}
      <div className="mt-5 flex space-x-2">
        <button
          onClick={() => !isOutOfStock && onBuyNow(product)}
          disabled={isOutOfStock}
          className={`flex-1 flex items-center justify-center space-x-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 ${
            isOutOfStock
              ? 'bg-white/5 border border-white/5 text-neutral-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-400 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <ShoppingCart className="h-4.5 w-4.5" />
          <span>Buy Now</span>
        </button>
      </div>
    </motion.div>
  );
};
