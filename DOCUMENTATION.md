# Supply Chain Orchestrator - Comprehensive Documentation

## 1. Problem Statement

Modern supply chains are fraught with challenges due to their inherent complexity, globalization, and reliance on disparate, siloed systems. Different departments—such as Planning, Procurement, Manufacturing, Logistics, Compliance, and Returns—often operate with their own fragmented data sets and tools. This fragmentation leads to several critical issues:

*   **Lack of Real-time Visibility:** Executives and operational leaders struggle to get a unified, real-time view of the end-to-end supply chain. Data is often outdated or hidden within departmental silos.
*   **Slow Response to Disruptions:** When anomalies or disruptions occur (e.g., port strikes, supplier failures, machine breakdowns), the lack of cross-domain orchestration means that identifying the root cause and implementing a coordinated response is slow and manual.
*   **Persona-Specific Bottlenecks:** Different roles (e.g., COO, Demand Planner, Sourcing Manager) require different levels of detail and specific tools to make decisions. Generic interfaces fail to provide the context needed for efficient action.
*   **Data Overload and Inaction:** The sheer volume of data generated across the supply chain can be overwhelming. Without intelligent systems to synthesize this data into actionable insights, teams are left reacting to crises rather than proactively managing risks.

## 2. Implemented Solution

The **Supply Chain Orchestrator** is an enterprise-grade web application prototype designed to solve these challenges by providing a unified, intelligent, and role-based command center. It leverages Generative AI and a multi-agent architecture to orchestrate tasks, analyze data, and proactively manage risks across all supply chain domains.

Key components of the solution include:

*   **Unified Interface & Role-Based Access Control (RBAC):** The platform provides a single portal where users can log in under specific personas (e.g., COO, Planner, Buyer). The interface, navigation, and permissions dynamically adapt to present only the most relevant tools and data for that role.
*   **Intelligent Orchestrator Chat (Multi-Agent System):** A centralized conversational interface acts as the primary point of interaction. Users can ask complex, cross-domain questions (e.g., "How does the delay at the Port of LA impact our Q3 production goals?"). The Orchestrator routes the query to specialized AI agents (Logistics, Planning, Manufacturing) which collaborate to provide a comprehensive answer, complete with their reasoning processes and relevant data widgets.
*   **Domain-Specific Dashboards:** Dedicated modules for each SCOR phase (Plan, Source, Make, Deliver, Return, Compliance) provide interactive visualizations, KPIs, and specialized tools. For example, Logistics features a live interactive map of shipments, while Manufacturing displays real-time machine telemetry.
*   **Proactive Notifications & Alerts:** The system continuously monitors data streams and alerts users to critical events, enabling proactive intervention rather than reactive firefighting.
*   **Simulated Backend with Dynamic Data:** The frontend is powered by a robust Node.js/Express backend that serves dynamic data from an internal JSON database, replacing static mock simulations with realistic API interactions.

## 3. Architecture & Tech Stack

The application follows a modern, decoupled architecture, utilizing a robust stack for both the frontend and backend.

### Frontend
*   **Framework:** React 19 (Single Page Application)
*   **Build Tool:** Vite (for fast, optimized development and production builds)
*   **Routing:** React Router DOM (HashRouter) for managing navigation between dashboards.
*   **Styling:** Tailwind CSS for a utility-first, responsive, and highly customizable UI design.
*   **Icons:** Lucide React for consistent, high-quality iconography.
*   **Data Visualization:** Recharts (for complex charts, graphs, and KPIs) and Leaflet (for interactive, geographical mapping in the Logistics module).
*   **State Management:** React Context API is used extensively for global state management, including `AuthContext` (RBAC), `NotificationContext` (system alerts), and `AgentContext` (custom agent state).

### Backend
*   **Runtime:** Node.js (v18+ recommended)
*   **Framework:** Express.js for building robust RESTful APIs and handling Server-Sent Events (SSE).
*   **Architecture Pattern:** Clean Architecture principles (Controllers -> Services -> Agents -> LLM -> Data).
*   **AI Integration:** The platform supports multiple LLM providers. By configuring `LLM_PROVIDER` in `.env.local`, you can seamlessly switch between the OpenAI API (`OPENAI_API_KEY`) or the Google Gemini API (`GEMINI_API_KEY`) to power the intelligent agents and reasoning chains.
*   **Data Storage:** An internal JSON database (`backend/data/internal-db.json`) is used to serve dynamic data via `/api/data/:type` endpoints, allowing for realistic data manipulation and retrieval.
*   **Communication:** Server-Sent Events (SSE) are utilized to stream real-time chat responses from the multi-agent system to the frontend, providing immediate feedback and visualizing the AI's "thought process."

## 4. Multi-Agent System Deep Dive

At the core of the Orchestrator's intelligence is a simulated Multi-Agent System. This architecture allows for specialized processing of complex queries by routing them to the most capable domain expert.

### The Orchestrator (`services/orchestrator.ts`)
The central router. It receives user input, analyzes the intent (Conversation, Query, Action), extracts relevant entities (e.g., SKUs, locations), and delegates the task to the appropriate specialized agent. It manages the flow of information and aggregates the final response.

### Domain-Specific Agents (`agents/`)
Each agent is designed to handle queries and tasks specific to its domain:

*   **Planning Agent (`PlanningAgent.ts`):** Specializes in local planning optimization (LPO), analyzing inventory levels, forecasting demand, and identifying potential stockouts.
*   **Procurement Agent (`ProcurementAgent.ts`):** Focuses on vendor risk assessment, spend analysis, category management, and supplier performance.
*   **Manufacturing Agent (`ManufacturingAgent.ts`):** Monitors factory floor operations, machine health (OEE, temperature, vibration), and predicts maintenance needs.
*   **Logistics Agent (`LogisticsAgent.ts`):** Tracks global shipments, calculates ETAs, identifies routing risks, and visualizes data geographically.
*   **Compliance Agent (`ComplianceAgent.ts`):** Manages ESG (Environmental, Social, and Governance) metrics, tracks ISO standard audits, and monitors carbon footprints.
*   **Return Agent (`ReturnAgent.ts`):** Handles reverse logistics, tracking RMA (Return Merchandise Authorization) status, and analyzing disposition outcomes.
*   **Document Agent (`DocumentAgent.ts`):** Specialized in retrieving, analyzing, and extracting intelligence from contracts, compliance reports, and other unstructured documents.

### Interaction Flow
1.  User submits a query via the `/chat` interface.
2.  The Orchestrator receives the query and determines the `intent` and required `agent`.
3.  The request is routed to the designated agent (e.g., `LogisticsAgent`).
4.  The agent interacts with the LLM (via `llm/wrapper.ts`) and retrieves necessary data from the internal database.
5.  The agent generates a response, including its "reasoning chain" (how it arrived at the answer) and any relevant data to be visualized.
6.  The Orchestrator streams this response back to the frontend using Server-Sent Events (SSE).

## 5. Domain Modules (Dashboards)

The application provides specialized dashboards corresponding to the SCOR model phases, ensuring that users have the right tools for their specific responsibilities.

*   **App Store (`/`):** The landing page acts as a marketplace for available data products, AI modules, and specialized dashboards.
*   **SC Assistant (`/chat`):** The primary interface for interacting with the multi-agent system.
*   **Planning (`/lpo`):** Focuses on Local Planning Optimization. Key features include inventory health tracking, demand forecasting charts, and stockout alerts.
*   **Procurement (`/procurement`):** Provides insights into category spend, vendor risk profiles, and supplier performance metrics.
*   **Manufacturing (`/manufacturing`):** Visualizes factory floor efficiency, real-time machine telemetry (temperature, vibration), and predictive maintenance alerts.
*   **Logistics (`/logistics`):** A map-centric view of global shipments, highlighting active routes, delays, and geographical risk zones.
*   **Compliance (`/compliance`):** Tracks sustainability goals, ESG metrics, carbon emissions, and upcoming ISO audits.
*   **Returns (`/returns`):** Monitors reverse logistics processes, RMA volumes, and item disposition (e.g., restock, refurbish, recycle).
*   **Documents (`/documents`):** An interface for document intelligence, allowing users to query contracts and reports.
*   **Agent Studio (`/agent-studio`):** A builder interface for configuring and deploying custom AI agents tailored to specific organizational needs.

## 6. Core Concepts

*   **Role-Based Access Control (RBAC):** Implemented via `AuthContext.tsx` and `ProtectedRoute.tsx`. The application dynamically adjusts its UI and capabilities based on the active user persona. This ensures data security and a streamlined user experience.
*   **Real-time Capabilities:** The use of SSE for chat streaming and continuous polling/updates for dashboard data simulates a live, responsive supply chain environment.
*   **Actionable Insights:** The platform doesn't just display data; it uses AI to interpret it. The reasoning chains provided by the agents explain *why* a conclusion was reached, building trust and enabling users to take confident action directly from the interface.
