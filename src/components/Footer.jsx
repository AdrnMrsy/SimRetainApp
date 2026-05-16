import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ExternalLink, Database, Shield } from 'lucide-react';
import DisclaimerModal from './DisclaimerModal';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  
  return (
    <>
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-auto pt-16 pb-8 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-border-subtle">
            {/* Brand section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg shadow-lg">
                  <Activity size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold text-text-primary tracking-tight">SimRetain</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                Advanced agent-based modeling for proactive employee retention strategy and attrition risk mitigation.
              </p>
            </div>

            {/* Links Section */}
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest">Resources</h4>
                <nav className="flex flex-col gap-2">
                  <a 
                    href="https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-text-muted hover:text-brand-primary transition-colors flex items-center gap-2"
                  >
                    <Database size={14} />
                    IBM Dataset
                  </a>
                  <button 
                    onClick={() => setIsDisclaimerOpen(true)} 
                    className="text-sm text-text-muted hover:text-brand-primary transition-colors flex items-center gap-2 text-left"
                  >
                    <Shield size={14} />
                    Data & Privacy
                  </button>
                </nav>
              </div>
            </div>

            {/* Social/Team Section */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest">The Project</h4>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-text-muted">Developed by Adrian, Kim, and John.</p>
                <div className="flex gap-4 mt-2">
                  <a href="https://github.com/AdrnMrsy/SimRetainApp.git" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-card border border-border-subtle rounded-lg text-text-muted hover:text-brand-primary transition-all">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
            <p className="text-xs text-text-faint font-medium tracking-wide">
              © {currentYear} SimRetain Simulation Engine. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] uppercase font-bold text-text-faint tracking-[0.2em] px-2 py-1 bg-surface-card border border-border-subtle rounded-md">
                v1.0.4 - Production
              </span>
            </div>
          </div>
        </div>
      </motion.footer>

      <DisclaimerModal 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
      />
    </>
  );
};

export default Footer;
