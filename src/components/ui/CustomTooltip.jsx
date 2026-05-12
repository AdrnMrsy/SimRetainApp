import React from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--tooltip-bg)] backdrop-blur-xl border border-[var(--tooltip-border)] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default CustomTooltip;
