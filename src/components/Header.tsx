'use client';

import React from 'react';
import { ShoppingBag, Shield } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({ cartCount }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/20">
            <ShoppingBag className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Vortex<span className="text-fuchsia-400 font-semibold font-mono text-sm ml-1 uppercase tracking-widest">Store</span>
            </h1>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Next-Gen Aesthetics</p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-neutral-300">
            <a href="#" className="hover:text-white transition-colors duration-200">Catalog</a>
            <a href="#" className="hover:text-white transition-colors duration-200">New Arrivals</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Specials</a>
          </nav>
          
          <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

          {/* User & Info */}
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-neutral-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
              <Shield className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>Admin Mode</span>
            </Link>
            
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-fuchsia-600 to-violet-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
