import React from 'react';
import GlassCard from './GlassCard';

const MetricCard = ({ icon: Icon, label, value, subtitle, color = "brand-primary", delay = 0 }) => (
  <GlassCard className="flex flex-col gap-3 group" delay={delay}>
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-faint uppercase tracking-[0.15em] font-medium">{label}</span>
      <div className={`p-2 rounded-lg bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
        <Icon size={16} />
      </div>
    </div>
    <span className="text-3xl font-bold tracking-tight text-text-primary">{value}</span>
    <span className="text-xs text-text-faint">{subtitle}</span>
  </GlassCard>
);

export default MetricCard;
