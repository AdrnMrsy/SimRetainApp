import React from 'react';
import { motion } from 'framer-motion';
import { Target, Layers, Zap, CheckCircle, Database, GitMerge, UserCheck, Activity } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import AdrianImg from '../assets/AdrianImage.png';
import KimImg from '../assets/KimImage.jpg';
import JohnImg from '../assets/JohnImage.png';


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const AboutPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Hero Section */}
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="text-center py-12"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 1 }}
          className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 mb-6"
        >
          <Activity size={48} className="text-brand-primary" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-4">
          SimRetain
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          An advanced agent-based employee retention and attrition simulation engine.
        </p>
      </motion.div>

      {/* Team Section */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex items-center gap-2 mb-4 px-2">
          <UserCheck className="text-brand-primary" size={24} />
          <h2 className="text-2xl font-bold text-text-primary">The Team</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { name: 'ADRIAN MORRISSEY BELO', role: 'Lead Developer', image: AdrianImg },
            { name: 'KIM RYAN NABO', role: 'Project Manager', image: KimImg },
            { name: 'JOHN ADRIAN LLANITA', role: 'Lead Researcher', image: JohnImg }
          ].map((member, idx) => (
            <GlassCard key={idx} delay={idx * 0.1} className="flex flex-col items-center text-center p-8 hover:-translate-y-2 transition-all duration-500 group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-brand-secondary/10 rounded-full blur-2xl group-hover:bg-brand-secondary/30 transition-colors duration-500" />
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-surface-elevated group-hover:border-brand-secondary/50 shadow-2xl transition-all duration-500 z-10 bg-white dark:bg-surface-base">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
              <h3 className="font-black text-brand-secondary text-sm md:text-base tracking-[0.1em] mb-1">{member.name}</h3>
              <p className="text-xs font-bold text-text-faint uppercase tracking-widest">{member.role}</p>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Purpose & Problem */}
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex items-center gap-2 mb-4 px-2 mt-8">
          <Target className="text-brand-secondary" size={24} />
          <h2 className="text-2xl font-bold text-text-primary">Purpose & The Problem</h2>
        </div>
        <GlassCard className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-brand-primary mb-3">The Problem</h3>
              <p className="text-text-secondary leading-relaxed">
                Employee turnover is a massive expense for organizations. Traditional HR analytics rely on static, historical data to see <em>who</em> left, but they struggle to dynamically predict <em>when</em> and <em>why</em> current employees might leave under changing conditions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-secondary mb-3">The Solution</h3>
              <p className="text-text-secondary leading-relaxed">
                SimRetain provides a predictive simulation environment that models workforce dynamics. By adjusting key variables like workload, salary, and satisfaction, HR can visualize potential outcomes and intervene before critical employees burn out.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Modeling & Simulation Process */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex items-center gap-2 mb-4 px-2 mt-8">
          <Layers className="text-brand-primary" size={24} />
          <h2 className="text-2xl font-bold text-text-primary">Modeling Process</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard delay={0.1}>
            <div className="p-3 bg-surface-elevated rounded-lg w-fit mb-4">
              <Database className="text-brand-primary" size={20} />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">1. Real-World Dataset</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Integrated with IBM's HR Attrition dataset. Agents' base attributes (salary ratio, job role, baseline satisfaction) are mapped directly from real data, ensuring statistically valid starting correlations.
            </p>
          </GlassCard>

          <GlassCard delay={0.2}>
            <div className="p-3 bg-surface-elevated rounded-lg w-fit mb-4">
              <Zap className="text-brand-secondary" size={20} />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">2. Time-Step Tick Engine</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Simulation operates on monthly "ticks". Each tick dynamically processes variables: burnout compounds under stress, satisfaction decreases proportionally, and modifiers are applied.
            </p>
          </GlassCard>

          <GlassCard delay={0.3}>
            <div className="p-3 bg-surface-elevated rounded-lg w-fit mb-4">
              <GitMerge className="text-brand-primary" size={20} />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">3. Stochastic Elements</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              To mimic unpredictable human behavior, we apply controlled randomness (stochastic noise) to morale changes each tick. Running the exact same scenario yields similar, but not identical, results.
            </p>
          </GlassCard>
        </div>
      </motion.div>

      {/* System Outputs & Conclusion */}
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex items-center gap-2 mb-4 px-2 mt-8">
          <CheckCircle className="text-brand-secondary" size={24} />
          <h2 className="text-2xl font-bold text-text-primary">Outputs & Conclusion</h2>
        </div>
        <GlassCard className="p-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Time-Series Projections</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Generates data streams visualized into area charts showing retained headcount over multiple Monte Carlo iterations.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-brand-secondary"></div>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Actionable Intelligence</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Categorizes employees by flight risk and calculates estimated turnover costs, allowing HR teams to transition from reactive management to proactive strategy.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Conclusion</h3>
              <p className="text-text-secondary leading-relaxed">
                SimRetain successfully bridges the gap between historical HR data and predictive analytics. By building a robust mathematical model wrapped in an accessible, highly visual web application, we demonstrate how modeling and simulation can solve tangible business problems.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

    </div>
  );
};

export default AboutPage;
