# Supply Chain Orchestrator

**Supply Chain Orchestrator** is an enterprise-grade web application prototype designed to simulate an intelligent, multi-agent platform for supply chain management. It leverages GenAI concepts to orchestrate tasks across various domains such as Planning, Procurement, Manufacturing, Logistics, Compliance, and Returns.

This platform demonstrates how role-based access control (RBAC), intelligent orchestration, and multi-domain data visualization can come together to create a unified Supply Chain command center.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Domain Modules (Dashboards)](#domain-modules-dashboards)
- [Multi-Agent System](#multi-agent-system)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)

## Project Overview

The objective of the Supply Chain Orchestrator is to provide a unified interface for various personas (e.g., Executives, Planners, Procurement Managers) to monitor, analyze, and execute actions across the end-to-end supply chain.

By utilizing simulated AI agents, the platform offers conversational interfaces, proactive anomaly detection, and data-driven insights tailored to the user's role and permissions.

## Key Features

- **Role-Based Access Control (RBAC):** Users can switch between different personas (e.g., COO, Demand Planner, Sourcing Manager), which dynamically updates navigation, permissions, and context.
- **Intelligent Orchestrator Chat:** A centralized conversational UI that routes queries to specific domain agents (Planning, Logistics, Procurement, etc.), generates reasoning chains, and returns contextual data widgets.
- **Proactive Notifications:** A real-time notification system alerting users to critical supply chain events (e.g., port strikes, ISO audit schedules).
- **Domain-Specific Dashboards:** Dedicated views for each SCOR phase (Plan, Source, Make, Deliver, Return) featuring interactive charts, KPIs, and maps.
- **Global Search:** Typeahead search functionality to quickly jump to specific entities (SKUs, shipments, vendors) or actions.

## Architecture & Tech Stack

This project is built as a Single Page Application (SPA) using modern web technologies:

- **Frontend Framework:** React 19
- **Routing:** React Router DOM (HashRouter)
- **Styling:** Tailwind CSS (utility-first CSS framework)
- **Icons:** Lucide React
- **Data Visualization:** Recharts (for charts/graphs) and Leaflet (for interactive maps in Logistics)
- **State Management:** React Context API (`AuthContext`, `NotificationContext`, `AgentContext`)
- **Build Tool:** Vite
- **Language:** TypeScript

## Domain Modules (Dashboards)

The application is structured around the SCOR (Supply Chain Operations Reference) model phases, represented as distinct pages/dashboards:

1. **App Store (`/`)**: A marketplace view of available data products and AI modules.
2. **SC Assistant (`/chat`)**: The central Orchestrator chat interface.
3. **Agent Studio (`/agent-studio`)**: A builder interface to configure custom AI agents.
4. **Planning (`/lpo`)**: Local Planning Optimization dashboard focusing on inventory levels, stockouts, and forecasting.
5. **Procurement (`/procurement`)**: Spend analysis, vendor risk assessment, and category management.
6. **Manufacturing (`/manufacturing`)**: Factory floor insights, machine health (OEE, temp, vibration), and predictive maintenance.
7. **Logistics (`/logistics`)**: Interactive map view of active shipments, delayed routes, and global risk zones.
8. **Returns (`/returns`)**: Reverse logistics tracking, RMA management, and disposition analysis.
9. **Compliance (`/compliance`)**: ESG metrics, ISO standard audit tracking, and carbon footprint monitoring.
10. **Documents (`/documents`)**: Document intelligence for analyzing contracts, compliance reports, etc.

## Multi-Agent System

The Orchestrator Chat (`pages/OrchestratorChat.tsx`) acts as the central router for a simulated Multi-Agent System. It analyzes user intent and delegates queries to specific agents:

- **Orchestrator Agent:** Handles general routing, conversational responses, and system-wide anomaly scans.
- **LPO (Planning) Agent:** Specialized in querying SKUs, forecasting, and inventory health.
- **Procurement Agent:** Analyzes vendor data and spend categories.
- **Logistics Agent:** Tracks shipments, ETAs, and routing risks.
- **Manufacturing Agent:** Monitors machine telemetry and plant efficiency.
- **Return Agent:** Manages RMA status and reverse logistics metrics.
- **Compliance Agent:** Reports on ISO audits, ESG goals, and carbon emissions.
- **Document Agent:** Handles document retrieval and analysis.

The chat interface visually represents the AI's "thought process" (reasoning chain) before generating a response with relevant data widgets and actionable links.

## Real AI Integration

This platform integrates with the actual **Gemini API** to provide true conversational understanding and dynamic responses:

- **AI Intent Classification:** When an API key is provided, the Orchestrator uses the Gemini LLM to interpret user queries and dynamically route them to the appropriate domain agents (e.g., Planning, Logistics).
- **Dynamic Response Generation:** Rather than relying entirely on hardcoded responses, the Orchestrator generates context-aware, flowing answers utilizing the Google Generative AI streaming SDK.
- **Static Mock Data fallback:** While the AI dynamically shapes the conversation, the foundational underlying business data (e.g., SKU metrics, shipment tracking) is still sourced from static datasets located in `mockData.ts` to mimic a pseudo-database without requiring a complex backend.
- **Graceful Fallback:** If the `VITE_GEMINI_API_KEY` is not provided in `.env.local`, the platform will seamlessly degrade to using front-end Regex logic and simulated typing delays so the interface remains functional.

## Project Structure

```
├── components/           # Reusable UI components
│   ├── DynamicWidget.tsx # Renders charts based on config
│   ├── KPICard.tsx       # Standardized metric card
│   ├── Layout.tsx        # Main app shell (Sidebar, Header)
│   ├── OLAPExplorer.tsx  # Interactive data grid/pivot
│   └── ProtectedRoute.tsx# RBAC route wrapper
├── contexts/             # React Context providers
│   ├── AgentContext.tsx  # Manages custom agent state
│   ├── AuthContext.tsx   # Manages user persona & permissions
│   └── NotificationContext.tsx # Manages system alerts
├── pages/                # Route-level components (Dashboards)
│   ├── AppStore.tsx
│   ├── OrchestratorChat.tsx
│   ├── LPODashboard.tsx
│   ├── ProcurementDashboard.tsx
│   └── ...
├── App.tsx               # Main application routing
├── mockData.ts           # Extensive dataset for simulations
├── types.ts              # TypeScript interfaces and enums
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## Running Locally

**Prerequisites:** Node.js (v18+ recommended)

1. **Clone the repository** (if applicable).
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set Environment Variables:**
   Create a `.env.local` file in the root directory and add your Gemini API key (if specific features require it, though the current mock system runs without it):
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open in Browser:** Navigate to `http://localhost:5173` (or the port provided by Vite).

### Building for Production

To create a production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```
