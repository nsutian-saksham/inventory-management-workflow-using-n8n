'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { Product } from '@/lib/supabase';

interface CheckoutModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (name: string, email: string, quantity: number) => Promise<boolean>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmOrder,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (quantity > product.current_stock_level) {
      setError(`Quantity exceeds available stock. Only ${product.current_stock_level} available.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onConfirmOrder(name, email, quantity);
      if (success) {
        // Reset form
        setName('');
        setEmail('');
        setQuantity(1);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col"
          >
            {/* Ambient background colors inside modal */}
            <div className="absolute -left-20 -top-20 -z-10 h-40 w-40 rounded-full bg-fuchsia-600/20 blur-3xl" />
            <div className="absolute -right-20 -bottom-20 -z-10 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-fuchsia-400" />
                <h3 className="text-xl font-bold text-white">Secure Checkout</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/5 bg-white/5 p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="mt-6 flex items-center space-x-4 rounded-2xl border border-white/5 bg-white/5 p-3">
              <div className="h-16 w-16 overflow-hidden rounded-xl bg-white/5 border border-white/5">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base leading-tight">{product.name}</h4>
                <p className="text-xs text-neutral-400 mt-0.5">{product.category}</p>
                <div className="flex items-center space-x-3 mt-1.5">
                  <span className="text-sm font-bold text-fuchsia-400">${product.price.toFixed(2)}</span>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">
                    Stock: <span className="text-neutral-200">{product.current_stock_level}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="checkout-name" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Full Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="checkout-email" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email Address
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="checkout-quantity" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="checkout-quantity"
                    type="number"
                    min="1"
                    max={product.current_stock_level}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    disabled={isSubmitting}
                    className="w-32 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  />
                  <div className="text-xs text-neutral-400">
                    Total: <span className="text-base font-bold text-white ml-1">${(product.price * quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-semibold text-red-400"
                  >
                    <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Order</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
