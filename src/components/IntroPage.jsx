import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, BrainCircuit, ShieldAlert, TrendingUp } from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex gap-4 p-5 rounded-2xl bg-surface-card/60 backdrop-blur-md border border-border-subtle hover:bg-surface-card transition-colors duration-300"
  >
    <div className="flex-shrink-0 mt-1">
      <div className="p-3 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 text-brand-primary rounded-xl border border-brand-primary/10">
        <Icon size={22} />
      </div>
    </div>
    <div>
      <h3 className="text-base font-bold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const IntroPage = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-[0_0_50px_rgba(139,92,246,0.4)] mb-8 relative"
          >
            <div className="absolute inset-0 rounded-3xl animate-ping opacity-20 bg-brand-primary" />
            <Activity size={48} className="text-white relative z-10" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-text-primary to-text-muted tracking-tight mb-6"
          >
            SimRetain
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            An advanced agent-based Monte Carlo simulation engine designed to model, predict, and mitigate employee attrition before it happens.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-16">
          <FeatureItem
            icon={BrainCircuit}
            title="Agent-Based Modeling"
            description="Simulate individual employee behaviors, satisfaction levels, and burnout trajectories based on comprehensive HR datasets."
            delay={0.4}
          />
          <FeatureItem
            icon={TrendingUp}
            title="Monte Carlo Projections"
            description="Run thousands of iterative simulations to confidently forecast retention rates and identify statistically significant trends."
            delay={0.5}
          />
          <FeatureItem
            icon={ShieldAlert}
            title="Policy Impact Testing"
            description="Adjust systemic variables like compensation, WFH policies, and wellness programs to visualize their exact effect on turnover."
            delay={0.6}
          />
          <FeatureItem
            icon={Activity}
            title="Financial Risk Analysis"
            description="Quantify the hidden financial costs associated with talent loss and calculate the concrete ROI for your retention initiatives."
            delay={0.7}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <button
            onClick={onStart}
            className="group relative px-10 py-5 rounded-full bg-text-primary text-surface-base font-bold text-lg flex items-center gap-3 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 transition-colors group-hover:text-white">Enter Simulation</span>
            <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1 group-hover:text-white transition-all" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IntroPage;
