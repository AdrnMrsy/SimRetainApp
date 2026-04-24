import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Activity, Users, LayoutDashboard, TrendingDown, DollarSign, Heart, Zap, Sun, Moon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateAgents, runMonteCarloSimulation } from './simulation/engine';
import EmployeeTable from './components/EmployeeTable';

/* ── Theme Hook ── */
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('simretain-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('simretain-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(p => !p) };
}

/* ── Animated Glass Card ── */
const GlassCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={`bg-surface-card backdrop-blur-xl border border-border-subtle rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] hover:bg-surface-card-hover ${className}`}
  >
    {children}
  </motion.div>
);

/* ── Custom Toggle Switch ── */
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

/* ── Custom Tooltip for Charts ── */
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

/* ── KPI Metric Card ── */
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

/* ── Page Transition Variants ── */
const pageVariants = {
  initial: { opacity: 0, x: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -20, filter: 'blur(4px)', transition: { duration: 0.25 } },
};

function App() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [baseSalaryModifier, setBaseSalaryModifier] = useState(1.0);
  const [wfhEnabled, setWfhEnabled] = useState(false);
  const [mandatedOvertime, setMandatedOvertime] = useState(0);
  const [wellnessProgram, setWellnessProgram] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [agents, setAgents] = useState([]);
  const [results, setResults] = useState({ history: [], reasons: [], avgCostOfTurnover: 0 });

  // New simulation config controls
  const [headcount, setHeadcount] = useState(500);
  const [naturalAttrition, setNaturalAttrition] = useState(0.5); // displayed as %
  const [simMonths, setSimMonths] = useState(12);
  const [iterations, setIterations] = useState(10);

  useEffect(() => { setAgents(generateAgents(headcount)); }, [headcount]);

  const activeCount = useMemo(() => agents.filter(a => a.status === 'Active').length, [agents]);
  const avgSatisfaction = useMemo(() => {
    if (activeCount === 0) return 0;
    const total = agents.reduce((sum, a) => sum + (a.status === 'Active' ? a.jobSatisfaction : 0), 0);
    return Math.round((total / activeCount) * 100);
  }, [agents, activeCount]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const rules = { baseSalaryModifier, wfhEnabled, mandatedOvertime, wellnessProgram, naturalAttrition: naturalAttrition / 100 };
      const simResults = runMonteCarloSimulation(agents, simMonths, rules, iterations);
      setResults(simResults);
      if (simResults.sampleAgents) setAgents(simResults.sampleAgents);
      setIsSimulating(false);
    }, 800);
  };

  const handleReset = () => {
    setAgents(generateAgents(headcount));
    setResults({ history: [], reasons: [], avgCostOfTurnover: 0 });
  };

  const currentAttritionRate = results.history.length > 0
    ? ((headcount - results.history[results.history.length - 1].activeHeadcount) / headcount * 100).toFixed(1)
    : '0.0';

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Chart color references (CSS vars don't work in SVG attrs, so we resolve them)
  const chartGrid = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const chartAxis = isDark ? '#475569' : '#94a3b8';
  const barLabelColor = isDark ? '#94a3b8' : '#334155';

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 min-h-screen flex flex-col">

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">SimRetain</h1>
            <p className="text-xs text-text-faint tracking-wide">Agent-Based Attrition Modeling Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-muted hover:text-text-primary transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun size={18} />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-surface-card p-1 rounded-xl border border-border-subtle">
            {[
              { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
              { id: 'roster', label: 'Employee Roster', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'text-white' : 'text-text-muted hover:text-text-secondary'}`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon size={16} />
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* ── Main Grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

        {/* ── Controls Panel ── */}
        <GlassCard delay={0.1} className="self-start lg:sticky lg:top-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-brand-primary" />
            <h2 className="text-base font-semibold text-text-primary">Strategy Variables</h2>
          </div>

          {/* Salary Slider */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-text-secondary">Base Salary Modifier</span>
              <span className="text-sm font-bold text-brand-primary tabular-nums">{(baseSalaryModifier * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[11px] text-text-faint mb-2">Scales employee pay relative to market averages.</p>
            <input type="range" min="0.8" max="1.3" step="0.05" value={baseSalaryModifier} onChange={(e) => setBaseSalaryModifier(parseFloat(e.target.value))} />
          </div>

          {/* Overtime Slider */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-text-secondary">Mandated Overtime</span>
              <span className="text-sm font-bold text-brand-primary tabular-nums">+{mandatedOvertime} hrs/mo</span>
            </div>
            <p className="text-[11px] text-text-faint mb-2">Extra monthly hours forced on all departments.</p>
            <input type="range" min="0" max="40" step="5" value={mandatedOvertime} onChange={(e) => setMandatedOvertime(parseInt(e.target.value))} />
          </div>

          <div className="border-t border-border-subtle my-4" />

          {/* ── Simulation Config Section ── */}
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-brand-secondary" />
            <h2 className="text-base font-semibold text-text-primary">Simulation Config</h2>
          </div>

          {/* Headcount */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-text-secondary">Headcount</span>
              <span className="text-sm font-bold text-brand-primary tabular-nums">{headcount}</span>
            </div>
            <p className="text-[11px] text-text-faint mb-2">Total starting number of agents.</p>
            <input type="range" min="50" max="2000" step="50" value={headcount} onChange={(e) => setHeadcount(parseInt(e.target.value))} />
          </div>

          {/* Natural Attrition */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-text-secondary">Natural Attrition</span>
              <span className="text-sm font-bold text-brand-primary tabular-nums">{naturalAttrition.toFixed(1)}%</span>
            </div>
            <p className="text-[11px] text-text-faint mb-2">Baseline monthly resignation noise. Set to 0 for a &ldquo;perfect world&rdquo; scenario.</p>
            <input type="range" min="0" max="5" step="0.1" value={naturalAttrition} onChange={(e) => setNaturalAttrition(parseFloat(e.target.value))} />
          </div>

          {/* Simulation Duration */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-text-secondary">Duration</span>
              <span className="text-sm font-bold text-brand-primary tabular-nums">{simMonths} months</span>
            </div>
            <p className="text-[11px] text-text-faint mb-2">How many months to project forward.</p>
            <input type="range" min="3" max="36" step="3" value={simMonths} onChange={(e) => setSimMonths(parseInt(e.target.value))} />
          </div>

          {/* Monte Carlo Iterations */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-text-secondary">Monte Carlo Iterations</span>
              <span className="text-sm font-bold text-brand-primary tabular-nums">{iterations}</span>
            </div>
            <p className="text-[11px] text-text-faint mb-2">Higher = more statistically stable, but slower.</p>
            <input type="range" min="5" max="50" step="5" value={iterations} onChange={(e) => setIterations(parseInt(e.target.value))} />
          </div>

          <div className="border-t border-border-subtle my-4" />

          <ToggleSwitch checked={wfhEnabled} onChange={setWfhEnabled} label="Work From Home" description="Reduces commute-related stress by 80%." />
          <ToggleSwitch checked={wellnessProgram} onChange={setWellnessProgram} label="Wellness Program" description="Lowers monthly burnout accumulation." />

          <div className="border-t border-border-subtle my-4" />

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(139,92,246,0.35)] disabled:opacity-60 disabled:cursor-wait"
              onClick={handleRunSimulation}
              disabled={isSimulating}
            >
              <Play size={16} />
              {isSimulating ? 'Running...' : `Simulate ${simMonths} Months`}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-muted hover:text-text-primary transition-colors"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
            </motion.button>
          </div>

          <AnimatePresence>
            {results.avgCostOfTurnover > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-5 pt-5 border-t border-border-subtle text-center">
                  <p className="text-[10px] text-text-faint uppercase tracking-[0.2em] mb-1">Estimated Cost of Turnover</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(results.avgCostOfTurnover)}</p>
                  <p className="text-[10px] text-text-faint mt-1">Based on 50% of departing employee salaries</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* ── Dynamic Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6 overflow-hidden">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard icon={Users} label="Initial Headcount" value={headcount.toLocaleString()} subtitle="Starting workforce baseline" delay={0.1} />
                <MetricCard icon={TrendingDown} label="Predicted Attrition" value={`${currentAttritionRate}%`} subtitle="Projected over 12 months" color="danger" delay={0.2} />
                <MetricCard icon={Heart} label="Avg Satisfaction" value={`${avgSatisfaction}%`} subtitle="Current employee sentiment" color="success" delay={0.3} />
              </div>

              <GlassCard delay={0.35}>
                <h2 className="text-base font-semibold text-text-primary mb-1">Retained Headcount Projection</h2>
                <p className="text-xs text-text-faint mb-4">Monthly active employee count across 10 Monte Carlo iterations (averaged).</p>
                <div className="h-[280px] w-full">
                  {results.history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.history} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="headcountGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
                        <XAxis dataKey="month" stroke={chartAxis} tick={{ fontSize: 12 }} />
                        <YAxis stroke={chartAxis} tick={{ fontSize: 12 }} domain={['dataMin - 20', 500]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="activeHeadcount" name="Active Agents" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#headcountGradient)" dot={{ r: 3, fill: '#a78bfa', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#c4b5fd', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-faint gap-2">
                      <Activity size={32} className="opacity-30" />
                      <p className="text-sm">Run simulation to generate projections</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard delay={0.45}>
                <h2 className="text-base font-semibold text-text-primary mb-1">Attrition Root Cause Analysis</h2>
                <p className="text-xs text-text-faint mb-4">Primary reasons for employee departures, averaged across iterations.</p>
                <div className="h-[240px] w-full">
                  {results.reasons.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.reasons} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#f97316" stopOpacity={0.9} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={chartGrid} horizontal vertical={false} />
                        <XAxis type="number" stroke={chartAxis} tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" stroke={barLabelColor} width={130} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Departures" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-faint gap-2">
                      <TrendingDown size={32} className="opacity-30" />
                      <p className="text-sm">Awaiting simulation data</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div key="roster" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <GlassCard className="flex flex-col h-[calc(100vh-12rem)]" delay={0.1}>
                <EmployeeTable agents={agents} isDark={isDark} />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
