// Helper functions for random distributions
function randomNormal(mean, stdDev) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randomNormal(mean, stdDev); // resample between 0 and 1
  return (num - 0.5) * 10 * stdDev + mean;
}

function computeFlightRisk(agent, effectiveSalaryComp) {
  let riskScore = 0;
  if (agent.burnoutLevel > 0.7) riskScore += 0.4;
  if (effectiveSalaryComp < 0.9) riskScore += 0.3;
  if (agent.jobSatisfaction < 0.5) riskScore += 0.3;
  if (agent.tenure < 12) riskScore += 0.1;
  else if (agent.tenure > 36 && agent.jobSatisfaction > 0.7) riskScore -= 0.3; // Loyalty buffer
  
  if (riskScore >= 0.7) return 'High';
  if (riskScore >= 0.4) return 'Medium';
  return 'Low';
}

export function generateAgents(count = 500) {
  return Array.from({ length: count }, (_, i) => {
    const isIT = Math.random() > 0.5;
    const baseMarketSalary = isIT ? 95000 : 105000;
    const compRatio = Math.max(0.6, Math.min(1.4, randomNormal(0.95, 0.15)));
    
    return {
      id: i + 1,
      department: isIT ? 'IT' : 'Engineering',
      annualSalary: Math.round(baseMarketSalary * compRatio),
      tenure: Math.max(0, Math.floor(randomNormal(36, 24))), // months
      baseSalaryCompetitiveness: compRatio, // ratio to market
      commutingDistance: Math.max(1, randomNormal(20, 15)), // km
      baseOvertimeHours: Math.max(0, randomNormal(10, 10)), // hours per month
      performanceRating: Math.round(Math.max(1, Math.min(5, randomNormal(3.2, 1)))), // 1 to 5
      jobSatisfaction: Math.max(0.1, Math.min(1, randomNormal(0.7, 0.2))), // 0 to 1
      burnoutLevel: Math.max(0, Math.min(1, randomNormal(0.3, 0.2))), // 0 to 1
      status: 'Active',
      attritionReason: null,
      flightRisk: 'Low', // Will be calculated dynamically
      effectiveCommute: Math.max(1, randomNormal(20, 15)) // Initial value same as commutingDistance
    };
  }).map(agent => ({
    ...agent,
    commutingDistance: agent.effectiveCommute, // Keep base distance
    flightRisk: computeFlightRisk(agent, agent.baseSalaryCompetitiveness)
  }));
}

// Single monte-carlo run simulation
function simulateSingleRun(initialAgents, months, rules) {
  let currentAgents = initialAgents.map(a => ({ ...a }));
  let monthlyHistory = [];
  let totalCostOfTurnover = 0;

  for (let month = 1; month <= months; month++) {
    currentAgents.forEach(agent => {
      if (agent.status !== 'Active') return;
      
      // Apply Strategy Rules (Environment)
      let effectiveOvertime = agent.baseOvertimeHours + rules.mandatedOvertime;
      let effectiveSalaryComp = agent.baseSalaryCompetitiveness * rules.baseSalaryModifier;
      let effectiveCommute = rules.wfhEnabled ? agent.commutingDistance * 0.2 : agent.commutingDistance;
      agent.effectiveCommute = effectiveCommute; // Store for UI
      
      // Update variables over time
      agent.tenure += 1;
      
      // Calculate dynamic stress
      let stressDelta = 0;
      if (effectiveOvertime > 20) stressDelta += 0.05;
      if (effectiveCommute > 30) stressDelta += 0.02;
      if (rules.wellnessProgram) stressDelta -= 0.04;
      
      agent.burnoutLevel = Math.max(0, Math.min(1, agent.burnoutLevel + stressDelta));
      
      // Calculate satisfaction drops
      if (effectiveSalaryComp < 0.9) agent.jobSatisfaction -= 0.02;
      if (rules.mandatedOvertime > 10) agent.jobSatisfaction -= 0.03;
      
      // Update visible flight risk
      agent.flightRisk = computeFlightRisk(agent, effectiveSalaryComp);
      
      // Base resignation probability (stochastic element — configurable via rules)
      let resignProbability = rules.naturalAttrition ?? 0.005; 
      
      if (agent.burnoutLevel > 0.8 && effectiveSalaryComp < 0.95) resignProbability += 0.25;
      if (agent.tenure > 36 && agent.jobSatisfaction > 0.7) resignProbability *= 0.3;
      else if (agent.jobSatisfaction < 0.4) resignProbability += 0.15;
      
      // Stochastic roll
      if (Math.random() < resignProbability) {
        agent.status = 'Resigned';
        // Replacement cost estimated at 50% of annual salary (Recruitment + Productivity loss)
        totalCostOfTurnover += (agent.annualSalary * 0.5); 
        
        // Determine primary reason
        if (agent.burnoutLevel > 0.8) agent.attritionReason = 'Burnout';
        else if (effectiveSalaryComp < 0.9) agent.attritionReason = 'Compensation';
        else if (agent.jobSatisfaction < 0.5) agent.attritionReason = 'Job Dissatisfaction';
        else agent.attritionReason = 'Other Opportunities';
      }
    });
    
    monthlyHistory.push({
      month,
      activeHeadcount: currentAgents.filter(a => a.status === 'Active').length
    });
  }
  
  return {
    finalAgents: currentAgents,
    monthlyHistory,
    totalCostOfTurnover
  };
}

export function runMonteCarloSimulation(agents, months, rules, numRuns = 10) {
  let allRunsHistories = [];
  let totalResignationReasons = {
    'Burnout': 0, 'Compensation': 0, 'Job Dissatisfaction': 0, 'Other Opportunities': 0
  };
  let sumCost = 0;
  let sampleAgents = [];
  
  for(let i=0; i<numRuns; i++) {
    const runResult = simulateSingleRun(agents, months, rules);
    allRunsHistories.push(runResult.monthlyHistory);
    sumCost += runResult.totalCostOfTurnover;
    sampleAgents = runResult.finalAgents; // Keep last run's final state
    
    // Accumulate reasons
    runResult.finalAgents.forEach(a => {
      if (a.status === 'Resigned' && a.attritionReason) totalResignationReasons[a.attritionReason]++;
    });
  }
  
  // Average the histories
  let avgHistory = [];
  for (let m = 0; m < months; m++) {
    let sumHeadcount = 0;
    for (let r = 0; r < numRuns; r++) {
      sumHeadcount += allRunsHistories[r][m].activeHeadcount;
    }
    avgHistory.push({
      month: `M${m+1}`,
      activeHeadcount: Math.round(sumHeadcount / numRuns)
    });
  }
  
  // Average the reasons
  let avgReasons = [];
  for (const [key, value] of Object.entries(totalResignationReasons)) {
    avgReasons.push({ name: key, value: Math.round(value / numRuns) });
  }
  
  return {
    history: avgHistory,
    reasons: avgReasons,
    avgCostOfTurnover: sumCost / numRuns,
    sampleAgents
  };
}
