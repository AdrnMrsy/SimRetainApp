import { runMonteCarloSimulation } from './engine';

self.onmessage = (e) => {
  const { agents, simMonths, rules, iterations } = e.data;
  
  // Run the heavy Monte Carlo simulation in this background thread
  const simResults = runMonteCarloSimulation(agents, simMonths, rules, iterations);
  
  // Send the results back to the main thread
  self.postMessage(simResults);
};
