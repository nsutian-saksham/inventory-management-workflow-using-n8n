'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col space-y-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-start justify-between p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
        isSuccess
          ? 'border-emerald-500/20 bg-emerald-950/40 text-emerald-300'
          : 'border-red-500/20 bg-red-950/40 text-red-300'
      }`}
    >
      <div className="flex space-x-3">
        <div className="mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white leading-tight">{toast.title}</h4>
          <p className="text-xs mt-1 text-neutral-300/90 leading-normal">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-neutral-400 hover:text-white transition-colors ml-4"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
