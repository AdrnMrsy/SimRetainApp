import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const DisclaimerModal = ({ isOpen, onClose }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg relative"
            >
              <GlassCard className="p-8 shadow-2xl border-brand-primary/30">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary bg-surface-base/50 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-brand-primary/20 text-brand-primary rounded-xl">
                    <ShieldAlert size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-text-primary">Data & Privacy Disclaimer</h2>
                </div>

                <div className="space-y-5 text-sm text-text-secondary leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">1. Local Processing Only</h3>
                    <p>SimRetain operates entirely within your browser. We do not collect, transmit, or store any personal information, usage analytics, or simulation parameters on external servers.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">2. Synthetic Dataset</h3>
                    <p>The employee profiles and attrition metrics used in this simulation are derived from the publicly available <strong>IBM HR Analytics Dataset</strong>. No real or proprietary employee data is utilized or exposed by this application.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">3. Academic Purpose</h3>
                    <p>This software is developed by Adrian, Kim, and John as an academic proof-of-concept. It is designed to demonstrate agent-based modeling techniques and should not be used as the sole basis for real-world HR or financial decisions.</p>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-border-subtle flex justify-end">
                  <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-text-primary text-surface-base font-semibold rounded-lg hover:bg-text-secondary transition-colors"
                  >
                    Understood
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DisclaimerModal;
