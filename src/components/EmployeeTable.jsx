import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Cpu, AlertTriangle, Shield, ShieldAlert } from 'lucide-react';

const riskConfig = {
  High: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: ShieldAlert },
  Medium: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
  Low: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Shield },
};

const deptConfig = {
  IT: { color: 'border-sky-500/30 text-sky-400 bg-sky-500/10', icon: HardDrive },
  Engineering: { color: 'border-violet-500/30 text-violet-400 bg-violet-500/10', icon: Cpu },
};

export default function EmployeeTable({ agents, isDark }) {
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Active' ? -1 : 1;
    const riskOrder = { High: 3, Medium: 2, Low: 1 };
    return riskOrder[b.flightRisk] - riskOrder[a.flightRisk];
  });

  const activeCount = sortedAgents.filter(a => a.status === 'Active').length;
  const resignedCount = sortedAgents.filter(a => a.status === 'Resigned').length;
  const highRiskCount = sortedAgents.filter(a => a.status === 'Active' && a.flightRisk === 'High').length;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Employee Roster</h2>
          <p className="text-xs text-text-faint mt-0.5">Sorted by flight risk · {sortedAgents.length} total employees</p>
        </div>
        <div className="flex gap-3">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            {activeCount} Active
          </span>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
            {resignedCount} Resigned
          </span>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            {highRiskCount} High Risk
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] text-text-muted uppercase tracking-wider bg-surface-elevated sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Salary</th>
              <th className="px-4 py-3 font-medium">Tenure</th>
              <th className="px-4 py-3 font-medium">Burnout</th>
              <th className="px-4 py-3 font-medium">Satisfaction</th>
              <th className="px-4 py-3 font-medium">Flight Risk</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-muted">
            {sortedAgents.map((agent, i) => {
              const dept = deptConfig[agent.department];
              const risk = riskConfig[agent.flightRisk];
              const DeptIcon = dept.icon;
              const RiskIcon = risk.icon;
              const isResigned = agent.status === 'Resigned';

              const satisfactionColor = agent.jobSatisfaction > 0.7
                ? 'text-emerald-400'
                : agent.jobSatisfaction > 0.4
                ? 'text-amber-400'
                : 'text-red-400';

              const burnoutPercent = Math.round(agent.burnoutLevel * 100);
              const burnoutColor = burnoutPercent > 70 ? 'bg-red-500' : burnoutPercent > 40 ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <motion.tr
                  key={agent.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.003, duration: 0.3 }}
                  className={`transition-colors ${isResigned ? 'opacity-40' : ''} ${i % 2 === 0 ? 'bg-transparent' : 'bg-[var(--row-alt)]'}`}
                  style={{ '--tw-bg-opacity': 1 }}
                  onMouseEnter={e => { if (!isResigned) e.currentTarget.style.backgroundColor = `var(--row-hover)`; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = i % 2 !== 0 ? `var(--row-alt)` : 'transparent'; }}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-text-primary">#{String(agent.id).padStart(3, '0')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${dept.color}`}>
                      <DeptIcon size={12} />
                      {agent.department}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary tabular-nums font-medium">${agent.annualSalary.toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-muted tabular-nums">
                    {agent.tenure >= 12 ? `${Math.floor(agent.tenure / 12)}y ${agent.tenure % 12}m` : `${agent.tenure}m`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 rounded-full h-1.5 bg-[var(--bar-burnout-bg)]">
                        <div className={`${burnoutColor} h-1.5 rounded-full transition-all`} style={{ width: `${burnoutPercent}%` }} />
                      </div>
                      <span className="text-[11px] text-text-faint tabular-nums w-8">{burnoutPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold tabular-nums ${satisfactionColor}`}>
                      {Math.round(agent.jobSatisfaction * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${risk.color}`}>
                      <RiskIcon size={12} />
                      {agent.flightRisk}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isResigned ? (
                      <span className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                        {agent.attritionReason || 'Resigned'}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-500 font-medium">Active</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
