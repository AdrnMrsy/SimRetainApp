import React from 'react';
import { motion } from 'framer-motion';

const ToggleSwitch = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      {description && <span className="text-xs text-text-faint">{description}</span>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'bg-surface-input'}`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${checked ? 'left-[26px] bg-white' : 'left-0.5 bg-text-muted'}`}
      />
    </button>
  </div>
);

export default ToggleSwitch;
