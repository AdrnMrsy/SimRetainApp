import attritionDataRaw from '../data/WA_Fn-UseC_-HR-Employee-Attrition.csv?raw';

// Professional CSV parsing function
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    
    // Handle comma delimited values, ignoring complexity of commas inside quotes for this clean dataset
    const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    data.push(obj);
  }
  return data;
}

// Compute market salary average per JobRole for competitiveness benchmarking
function computeMarketSalaries(data) {
  const roleSalaries = {};
  data.forEach(row => {
    const role = row.JobRole;
    const salary = parseInt(row.MonthlyIncome, 10);
    if (!roleSalaries[role]) {
      roleSalaries[role] = { total: 0, count: 0 };
    }
    roleSalaries[role].total += salary;
    roleSalaries[role].count += 1;
  });
  
  const averages = {};
  for (const role in roleSalaries) {
    averages[role] = roleSalaries[role].total / roleSalaries[role].count;
  }
  return averages;
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

export function generateAgents() {
  // 1. Parse raw data
  let rawData = parseCSV(attritionDataRaw);
  
  // Clean Data: filter out any invalid rows (e.g., missing EmployeeNumber or MonthlyIncome)
  rawData = rawData.filter(row => row.EmployeeNumber && row.MonthlyIncome && row.Age);
  
  // 2. Data Cleaning & Feature Engineering
  const roleAverages = computeMarketSalaries(rawData);
  
  let agents = rawData.map(row => {
    const monthlyIncome = parseInt(row.MonthlyIncome, 10) || 0;
    const roleAverage = roleAverages[row.JobRole] || monthlyIncome;
    
    // Normalize ratio to avoid extreme outliers impacting the sim heavily (range 0.6 to 1.4)
    let compRatio = monthlyIncome / (roleAverage || 1);
    compRatio = Math.max(0.6, Math.min(1.4, compRatio));
    
    // PerformanceRating in dataset is 3 or 4 mostly
    const perfRating = parseInt(row.PerformanceRating, 10) || 3; 
    
    // JobSatisfaction 1-4 mapped to 0.1-1.0
    const jobSatRaw = parseInt(row.JobSatisfaction, 10) || 3;
    const jobSatisfaction = Math.max(0.1, jobSatRaw / 4);
    
    // WorkLifeBalance 1-4 mapped to burnout (1 is bad -> high burnout, 4 is best -> low burnout)
    const wlb = parseInt(row.WorkLifeBalance, 10) || 3;
    const burnoutLevel = Math.max(0, (4 - wlb) / 4);
    
    // OverTime 'Yes' implies regular overtime hours, 'No' implies very few
    const baseOvertimeHours = row.OverTime === 'Yes' ? 20 : Math.max(0, Math.floor(Math.random() * 5));
    
    const commutingDistance = parseInt(row.DistanceFromHome, 10) || 5;

    return {
      id: parseInt(row.EmployeeNumber, 10),
      department: row.Department,
      jobRole: row.JobRole,
      age: parseInt(row.Age, 10),
      annualSalary: monthlyIncome * 12, // Annualized
      tenure: (parseInt(row.YearsAtCompany, 10) || 0) * 12, // converted to months for the engine
      baseSalaryCompetitiveness: compRatio,
      commutingDistance: commutingDistance,
      baseOvertimeHours: baseOvertimeHours,
      performanceRating: perfRating,
      jobSatisfaction: jobSatisfaction,
      burnoutLevel: burnoutLevel,
      status: 'Active',
      attritionReason: null,
      flightRisk: 'Low', // Placeholder, calculated properly below
      effectiveCommute: commutingDistance // Initial value
    };
  });
  
  // Re-calculate derived stats expected by simulation
  return agents.map(agent => ({
    ...agent,
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
      if (effectiveOvertime > 20) stressDelta += 0.025;
      if (effectiveCommute > 30) stressDelta += 0.01;
      if (rules.wellnessProgram) stressDelta -= 0.02;
      
      agent.burnoutLevel = Math.max(0, Math.min(1, agent.burnoutLevel + stressDelta));
      
      // Calculate satisfaction drops
      if (effectiveSalaryComp < 0.9) agent.jobSatisfaction -= 0.01;
      if (rules.mandatedOvertime > 10) agent.jobSatisfaction -= 0.015;
      
      // Update visible flight risk
      agent.flightRisk = computeFlightRisk(agent, effectiveSalaryComp);
      
      // Base resignation probability (stochastic element — configurable via rules)
      let resignProbability = rules.naturalAttrition ?? 0.005; 
      
      if (agent.burnoutLevel > 0.8 && effectiveSalaryComp < 0.95) resignProbability += 0.08;
      if (agent.tenure > 36 && agent.jobSatisfaction > 0.7) resignProbability *= 0.5;
      else if (agent.jobSatisfaction < 0.4) resignProbability += 0.05;
      
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
