# SimRetain — Agent-Based Employee Attrition Simulator

**SimRetain** is an enterprise-grade HR simulation tool that uses **agent-based modeling** and **Monte Carlo methods** to project employee attrition under configurable organizational strategies. It enables HR decision-makers to answer "what if" questions—quantifying the headcount and financial impact of policy changes *before* they are implemented.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [Tech Stack](#tech-stack)
- [Simulation Engine](#simulation-engine)
  - [Agent Generation](#agent-generation)
  - [Flight Risk Scoring](#flight-risk-scoring)
  - [Monthly Simulation Loop](#monthly-simulation-loop)
  - [Monte Carlo Aggregation](#monte-carlo-aggregation)
- [Strategy Variables](#strategy-variables)
- [Simulation Configuration](#simulation-configuration)
- [UI Components](#ui-components)
- [Design System](#design-system)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)

---

## Overview

SimRetain generates a synthetic workforce of configurable size, each agent having attributes like salary, tenure, burnout, and satisfaction. Users adjust **strategy variables** (salary modifiers, overtime policies, WFH, wellness programs) and run a Monte Carlo simulation to project:

- **Retained headcount** over time (area chart)
- **Root cause analysis** of departures (bar chart)
- **Estimated cost of turnover** (calculated at 50% of departing employees' annual salary)
- **Individual employee states** in a detailed roster view

---

## Architecture

### Project Structure

```
SimRetainApp/
├── index.html                 # Entry point, loads Inter font
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite + React plugin config
├── eslint.config.js           # ESLint configuration
├── public/                    # Static assets
│   └── favicon.svg
└── src/
    ├── main.jsx               # React DOM root mount
    ├── index.css              # Design system (Tailwind v4 + CSS vars)
    ├── App.jsx                # Main application (controls, charts, layout)
    ├── components/
    │   └── EmployeeTable.jsx  # Sortable employee roster table
    └── simulation/
        └── engine.js          # Core simulation logic (agent-based + Monte Carlo)
```

### Tech Stack

| Layer          | Technology                      | Purpose                                     |
| -------------- | ------------------------------- | ------------------------------------------- |
| **Framework**  | React 19 + Vite 8              | Component rendering & HMR dev server        |
| **Styling**    | Tailwind CSS v4 + CSS Variables | Semantic theming (light/dark)                |
| **Charts**     | Recharts 3                     | Area chart (headcount) + Bar chart (reasons) |
| **Animations** | Framer Motion 12               | Page transitions, micro-interactions         |
| **Icons**      | Lucide React                   | Consistent icon set                          |
| **Typography** | Inter (Google Fonts)            | UI typeface                                  |

---

## Simulation Engine

> **Source:** [`src/simulation/engine.js`](src/simulation/engine.js)

The engine runs entirely client-side in the browser. There is no backend.

### Agent Generation

**Function:** `generateAgents(count)`

Each agent is initialized with normally-distributed attributes using the **Box-Muller transform** (`randomNormal` helper):

| Attribute                    | Distribution             | Range / Notes                           |
| ---------------------------- | ------------------------ | --------------------------------------- |
| `department`                 | 50/50 coin flip          | `"IT"` or `"Engineering"`               |
| `annualSalary`               | Derived from `compRatio` | IT base: $95k, Eng base: $105k          |
| `baseSalaryCompetitiveness`  | Normal(0.95, 0.15)       | Clamped [0.6, 1.4] — ratio to market    |
| `tenure`                     | Normal(36, 24)           | Months, floored at 0                    |
| `commutingDistance`          | Normal(20, 15)           | Kilometers, min 1                       |
| `baseOvertimeHours`          | Normal(10, 10)           | Hours/month, min 0                      |
| `performanceRating`          | Normal(3.2, 1)           | Integer [1–5]                           |
| `jobSatisfaction`            | Normal(0.7, 0.2)         | Clamped [0.1, 1.0]                      |
| `burnoutLevel`               | Normal(0.3, 0.2)         | Clamped [0.0, 1.0]                      |

After generation, each agent's `flightRisk` is computed via `computeFlightRisk()`.

### Flight Risk Scoring

**Function:** `computeFlightRisk(agent, effectiveSalaryComp)` → `"High"` | `"Medium"` | `"Low"`

A composite risk score is built additively:

| Condition                                     | Score Δ |
| --------------------------------------------- | ------- |
| Burnout > 0.7                                 | +0.4    |
| Effective salary competitiveness < 0.9        | +0.3    |
| Job satisfaction < 0.5                         | +0.3    |
| Tenure < 12 months                            | +0.1    |
| Tenure > 36 months AND satisfaction > 0.7     | −0.3    |

**Thresholds:** ≥ 0.7 → High, ≥ 0.4 → Medium, otherwise → Low.

### Monthly Simulation Loop

**Function:** `simulateSingleRun(initialAgents, months, rules)`

For each month, every active agent undergoes:

1. **Environment Application**
   - Effective overtime = base overtime + `rules.mandatedOvertime`
   - Effective salary comp = base comp × `rules.baseSalaryModifier`
   - Effective commute = WFH reduces commute by 80%

2. **Time Progression**
   - Tenure increments by 1 month

3. **Burnout Dynamics** (monthly delta, clamped 0–1)
   | Condition                 | Delta   |
   | ------------------------- | ------- |
   | Effective overtime > 20h  | +0.05   |
   | Effective commute > 30km  | +0.02   |
   | Wellness program enabled  | −0.04   |

4. **Satisfaction Erosion**
   | Condition                      | Delta   |
   | ------------------------------ | ------- |
   | Effective salary comp < 0.9    | −0.02   |
   | Mandated overtime > 10h        | −0.03   |

5. **Resignation Probability Calculation**
   - Starts at `rules.naturalAttrition` (configurable, default `0.005` = 0.5%/month)
   - +0.25 if burnout > 0.8 AND salary comp < 0.95
   - ×0.3 if tenure > 36 months AND satisfaction > 0.7 (loyalty buffer)
   - +0.15 if satisfaction < 0.4

6. **Stochastic Roll** — `Math.random() < resignProbability` triggers resignation
   - Turnover cost = 50% of annual salary
   - Primary attrition reason assigned by priority: Burnout → Compensation → Job Dissatisfaction → Other Opportunities

### Monte Carlo Aggregation

**Function:** `runMonteCarloSimulation(agents, months, rules, numRuns)`

Runs `numRuns` independent simulations and returns:

| Output               | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `history`            | Averaged monthly headcount across all runs (labeled M1, M2, ...) |
| `reasons`            | Averaged resignation reason breakdown                            |
| `avgCostOfTurnover`  | Mean total turnover cost across runs                             |
| `sampleAgents`       | Final agent states from the last run (for the roster view)       |

---

## Strategy Variables

These represent **organizational policy levers** the user can adjust before running a simulation:

| Variable               | Control Type | Range             | Default | Effect on Agents                                          |
| ---------------------- | ------------ | ----------------- | ------- | --------------------------------------------------------- |
| **Base Salary Modifier** | Slider       | 80% – 130%       | 100%    | Multiplies each agent's salary competitiveness ratio      |
| **Mandated Overtime**    | Slider       | 0 – 40 hrs/mo    | 0       | Added to each agent's base overtime hours                 |
| **Work From Home**       | Toggle       | On/Off            | Off     | Reduces commuting distance stress by 80%                  |
| **Wellness Program**     | Toggle       | On/Off            | Off     | Reduces monthly burnout accumulation by −0.04             |

---

## Simulation Configuration

These control **simulation fidelity and scope**:

| Variable                  | Control Type | Range          | Default | Purpose                                                               |
| ------------------------- | ------------ | -------------- | ------- | --------------------------------------------------------------------- |
| **Headcount**             | Slider       | 50 – 2,000     | 500     | Number of agents generated (regenerates workforce on change)          |
| **Natural Attrition**     | Slider       | 0% – 5%        | 0.5%    | Baseline monthly resignation probability ("noise"). Set to 0 for a perfect-world scenario |
| **Duration**              | Slider       | 3 – 36 months  | 12      | Number of months to project forward                                   |
| **Monte Carlo Iterations**| Slider       | 5 – 50         | 10      | Number of independent simulation runs averaged together. Higher = more stable but slower |

---

## UI Components

### App (`App.jsx`)

The main application shell featuring:

- **Header** — SimRetain branding, light/dark theme toggle, tab navigation (Analytics / Employee Roster)
- **Controls Panel** (left sidebar, sticky) — Strategy Variables + Simulation Config + Run/Reset buttons + Turnover cost display
- **Dashboard Tab** — Three KPI metric cards + Headcount projection area chart + Attrition root cause bar chart
- **Roster Tab** — Full employee data table

### EmployeeTable (`components/EmployeeTable.jsx`)

A scrollable, sortable table showing all agents:
- Sorted by: Active first, then by descending flight risk
- Columns: Employee ID, Department (with icon badge), Salary, Tenure, Burnout (progress bar), Satisfaction (%), Flight Risk (color-coded pill), Status
- Summary badges in header: Active count, Resigned count, High Risk count
- Resigned rows are visually dimmed (40% opacity)

### Reusable Sub-Components (defined in `App.jsx`)

| Component       | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| `GlassCard`     | Animated glassmorphism container with hover effects        |
| `ToggleSwitch`  | Animated boolean toggle with label/description             |
| `CustomTooltip` | Themed chart tooltip for Recharts                          |
| `MetricCard`    | KPI display card with icon, value, and subtitle            |

---

## Design System

> **Source:** [`src/index.css`](src/index.css)

The design system is built on **Tailwind CSS v4** with custom CSS property tokens for full light/dark theme support.

### Theme Tokens

| Token Category    | Examples                                           |
| ----------------- | -------------------------------------------------- |
| **Surfaces**      | `--surface-base`, `--surface-card`, `--surface-elevated` |
| **Text**          | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-faint` |
| **Borders**       | `--border-subtle`, `--border-muted`                |
| **Interactive**   | `--slider-track`, `--slider-glow`, `--scrollbar-thumb` |
| **Charts**        | `--chart-grid`, `--chart-axis`, `--tooltip-bg`     |
| **Brand Colors**  | `--color-brand-primary` (#8b5cf6), `--color-brand-secondary` (#3b82f6) |

### Theme Switching

- Persisted to `localStorage` under key `simretain-theme`
- Falls back to `prefers-color-scheme` media query on first visit
- Toggled via the sun/moon icon button in the header

### Custom Styling

- **Range sliders** — Gradient thumbs with glow shadows, smooth hover scaling
- **Scrollbars** — Thin 6px track with themed thumbs
- **Background** — Multi-layer radial gradients for depth

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone <repo-url> SimRetainApp
cd SimRetainApp

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` with hot module replacement.

### Production Build

```bash
npm run build
npm run preview
```

---

## Usage Guide

1. **Adjust Strategy Variables** — Use the sliders and toggles in the left panel to model different organizational policies
2. **Configure the Simulation** — Set headcount, natural attrition baseline, projection duration, and iteration count
3. **Run Simulation** — Click the "Simulate X Months" button. Results appear after ~800ms
4. **Analyze Results** — Review the headcount projection chart, attrition root cause breakdown, KPI cards, and turnover cost estimate
5. **Inspect Individual Agents** — Switch to the "Employee Roster" tab to see per-employee burnout, satisfaction, flight risk, and resignation reasons
6. **Reset** — Click the reset button (↩) to regenerate a fresh workforce and clear results
7. **Compare Scenarios** — Adjust variables and re-run to compare outcomes (e.g., "What if we enable WFH?" vs. "What if we increase salary by 20%?")

### Example Scenarios

| Scenario                        | Settings                                                                    | Expected Outcome                     |
| ------------------------------- | --------------------------------------------------------------------------- | ------------------------------------ |
| **Perfect World**               | Salary 130%, WFH ✓, Wellness ✓, Overtime 0, Natural Attrition 0%           | ~0% attrition                        |
| **Cost-Cutting Crisis**         | Salary 80%, Overtime 30h, WFH ✗, Wellness ✗                                | Very high attrition, ~30-50%+        |
| **Balanced Retention**          | Salary 110%, WFH ✓, Wellness ✓, Overtime 5h                                | Low attrition, ~3-8%                 |
| **Long-Term Projection**        | Duration 36 months, 50 iterations                                           | Smoother trend lines, visible drift  |
