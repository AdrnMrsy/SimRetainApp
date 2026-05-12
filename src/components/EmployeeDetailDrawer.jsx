import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, DollarSign, MapPin, Calendar, Activity, AlertTriangle, ShieldAlert, Shield } from 'lucide-react';

const riskConfig = {
  High: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: ShieldAlert },
  Medium: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
  Low: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Shield },
};

const MetricRow = ({ icon: Icon, label, value, valueClass = "text-text-primary" }) => (
  <div className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
    <div className="flex items-center gap-2 text-text-muted">
      <Icon size={16} />
      <span className="text-sm">{label}</span>
    </div>
    <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
  </div>
);

const EmployeeDetailDrawer = ({ agent, onClose }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {agent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-surface-base border-l border-border-subtle shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-subtle bg-surface-elevated flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-1">
                  Employee #{String(agent.id).padStart(3, '0')}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-primary font-medium">{agent.department}</span>
                  <span className="text-text-muted text-xs">•</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${agent.status === 'Resigned' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Resignation Reason Alert */}
              {agent.status === 'Resigned' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
                  <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-1">Departure Reason</h4>
                    <p className="text-xs text-red-400/80 leading-relaxed">{agent.attritionReason}</p>
                  </div>
                </div>
              )}

              {/* Flight Risk */}
              <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-text-secondary">Current Flight Risk</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${riskConfig[agent.flightRisk]?.color || riskConfig.Low.color}`}>
                    {agent.flightRisk === 'High' ? <ShieldAlert size={12} /> : agent.flightRisk === 'Medium' ? <AlertTriangle size={12} /> : <Shield size={12} />}
                    {agent.flightRisk}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-muted">Burnout Level</span>
                      <span className={Math.round(agent.burnoutLevel * 100) > 70 ? 'text-red-400' : 'text-text-primary'}>{Math.round(agent.burnoutLevel * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-input overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${Math.round(agent.burnoutLevel * 100) > 70 ? 'bg-red-500' : Math.round(agent.burnoutLevel * 100) > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.round(agent.burnoutLevel * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-muted">Job Satisfaction</span>
                      <span className={Math.round(agent.jobSatisfaction * 100) < 40 ? 'text-red-400' : 'text-text-primary'}>{Math.round(agent.jobSatisfaction * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-input overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${Math.round(agent.jobSatisfaction * 100) < 40 ? 'bg-red-500' : Math.round(agent.jobSatisfaction * 100) < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.round(agent.jobSatisfaction * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographics & Work Context */}
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Employment Details</h3>
                <div className="bg-surface-card border border-border-subtle rounded-xl px-4 py-1">
                  <MetricRow 
                    icon={Briefcase} 
                    label="Role Level" 
                    value={`Level ${agent.jobLevel || 1}`} 
                  />
                  <MetricRow 
                    icon={DollarSign} 
                    label="Annual Salary" 
                    value={`$${agent.annualSalary?.toLocaleString()}`}
                    valueClass="tabular-nums font-semibold text-brand-primary"
                  />
                  <MetricRow 
                    icon={Calendar} 
                    label="Tenure" 
                    value={agent.tenure >= 12 ? `${Math.floor(agent.tenure / 12)}y ${agent.tenure % 12}m` : `${agent.tenure}m`} 
                  />
                  <MetricRow 
                    icon={MapPin} 
                    label="Effective Commute" 
                    value={`${Math.round(agent.effectiveCommute)} km`} 
                    valueClass={agent.effectiveCommute > 30 ? 'text-amber-400' : 'text-text-primary'}
                  />
                </div>
              </div>

              {/* Monthly History (if available) */}
              {agent.history && agent.history.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Simulation History</h3>
                  <div className="space-y-3">
                    {agent.history.slice(-5).reverse().map((record, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-surface-card border border-border-subtle text-sm">
                        <span className="text-text-muted">Month {record.month}</span>
                        <div className="flex gap-4">
                          <span className="text-xs text-text-secondary"><span className="text-text-faint">Sat:</span> {Math.round(record.satisfaction * 100)}%</span>
                          <span className="text-xs text-text-secondary"><span className="text-text-faint">Brn:</span> {Math.round(record.burnout * 100)}%</span>
                        </div>
                      </div>
                    ))}
                    {agent.history.length > 5 && (
                      <p className="text-xs text-center text-text-faint">Showing last 5 months...</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EmployeeDetailDrawer;
