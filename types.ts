export enum AgentType {
  ORCHESTRATOR = 'ORCHESTRATOR',
  LPO = 'LPO', // Matches "Planning" Dashboard
  PROCUREMENT = 'PROCUREMENT', // Matches "Procurement" Dashboard
  DOCUMENT = 'DOCUMENT',
  COMPLIANCE = 'COMPLIANCE', // New Agent for ISO Standards
  LOGISTICS = 'LOGISTICS', // New Agent for Transportation
  MANUFACTURING = 'MANUFACTURING', // New Agent for Smart Factory
  RETURN = 'RETURN', // New Agent for Reverse Logistics (SCOR)
  CUSTOM = 'CUSTOM', // User defined
}

// RBAC Types
export type UserRole = 'EXECUTIVE' | 'PLANNER' | 'PROCUREMENT' | 'LOGISTICS' | 'MANUFACTURING' | 'COMPLIANCE';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  avatar: string;
  allowedRoutes: string[]; // Explicit list of allowed routes for simplicity
}

export interface ChatMessage {
  confidence?: number;
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: AgentType;
  citations?: SourceCitation[];
  metrics?: any;
  status?: 'thinking' | 'routing' | 'executing' | 'completed';
  actionLink?: {
    label: string;
    url: string;
  };
  steps?: OrchestrationStep[];
  thoughtProcessExpanded?: boolean; // Controls UI visibility of the reasoning chain
  anomalies?: AnomalyReport[]; // New field for proactive alerts
  relatedQueries?: string[]; // Perplexity-like suggestions
  feedback?: 'like' | 'dislike' | null; // Feedback mechanism
}

export interface OrchestrationStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

export interface AnomalyReport {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  confidence: number; // 0-100%
  rootCause: string;
  metric: string;
  impact: string;
}

export interface SourceCitation {
  id: string;
  filename: string;
  page: number;
  text: string;
  similarity: number;
  url?: string;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

// Data Products (App Store)
export interface DataProduct {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

// Chart Data Types
export interface InventoryData {
  sku: string;
  stockoutInstances: number;
  stockoutQuantity: number;
  isAnomaly?: boolean; // Marker for visualization
  zScore?: number; // Statistical deviation
}

export interface ProductionData {
  month: string;
  planned: number;
  actual: number;
  variance?: number;
}

export interface ForecastingData {
  sku: string;
  error: number;
}

export interface FactorData {
  x: number;
  y: number;
  z: number; // size
  name: string;
  category: string;
  isOutlier?: boolean;
}

export interface CustomerOTIFData {
  customer: string;
  revenueDelayed: number;
  otif: number;
}

// New Types for Compliance
export interface ComplianceMetric {
  standard: string; // e.g., 'ISO 9001'
  score: number; // 0-100
  status: 'Compliant' | 'At Risk' | 'Non-Compliant';
  lastAudit: string;
}

export interface CarbonData {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
  target: number;
}

export interface AuditLog {
  id: string;
  standard: string;
  finding: string;
  severity: 'Major' | 'Minor' | 'Observation';
  date: string;
  status: 'Open' | 'Closed';
}

// Logistics Types

export interface RiskZone {
  id: string;
  type: 'WAR' | 'STRIKE' | 'WEATHER';
  name: string;
  coordinates: [number, number][]; // Polygon for regions
  center: [number, number]; // Icon placement
  radius?: number;
  severity: 'Critical' | 'High' | 'Medium';
  impactDescription: string;
}

export interface RouteOption {
  id: string;
  name: string;
  eta: string;
  distance: string;
  cost: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  coordinates: [number, number][]; // Waypoints for the line
  tags?: string[];
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: 'In Transit' | 'Delayed' | 'Delivered' | 'Pending';
  eta: string; // ISO 8601
  carrier: string;
  optimizationSavings?: string; // e.g. "12% miles saved"
  originCoordinates: [number, number]; // Lat, Lng
  destinationCoordinates: [number, number]; // Lat, Lng
  progress: number; // 0 to 100 representing percentage of route completed
  deliveryWindow?: string; // e.g., "14:00 - 16:00"
  lastMileRisk?: 'Low' | 'Medium' | 'High' | 'Critical';
  activeRisks?: string[]; // IDs of RiskZones affecting this shipment
  alternateRoutes?: RouteOption[]; // Proposed AI routes
  timezone: string; // Destination Timezone ID e.g. "America/Los_Angeles"
}

// Manufacturing Types
export interface MachineStatus {
  id: string;
  name: string;
  status: 'Running' | 'Idle' | 'Maintenance' | 'Down';
  oee: number;
  temperature: number;
  vibration: number;
  health: number; // 0-100
}

// Returns / Reverse Logistics Types (SCOR Update)
export interface DispositionData {
  name: string;
  value: number;
  color: string;
}

export interface ReturnReasonData {
  reason: string;
  count: number;
}

export interface ReturnRequest {
  id: string;
  sku: string;
  productName: string;
  returnLocation: string; // Country/Location
  customer: string;
  reason: string;
  condition: string;
  rcaNotes: string; // Inspection
  disposition: 'Restock' | 'Refurbish' | 'Scrap' | 'Recycle' | 'Return to Vendor';
  eligibility: string; // The criteria used
  financialImpact: number; // Loss or Recovery value
  currency: string;
  responsibleDept: string;
  responsiblePersona: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Inspecting';
  date: string; // ISO 8601
  timezone: string; // Location Timezone ID
}

// --- CUSTOM AGENT & DASHBOARD BUILDER TYPES ---

export type SCORPhase = 'PLAN' | 'SOURCE' | 'MAKE' | 'DELIVER' | 'RETURN' | 'ENABLE';

export interface WidgetDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  type: 'KPI_CARD' | 'BAR_CHART' | 'PIE_CHART' | 'ACTION_PANEL';
  targetDashboard: SCORPhase; // Where to display it
  data: WidgetDataPoint[]; // Mock data for prototype
  visibleTo: UserRole[]; // Permissions
  kpiUnit?: string;
  actionLabel?: string; // For action panels
}

export interface AgentKnowledge {
  id: string;
  name: string;
  type: 'PDF' | 'TEXT' | 'IMAGE';
  content: string; // URL or raw text
  dateUploaded: Date;
}

export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  phase: SCORPhase;
  knowledgeBase: AgentKnowledge[];
  widgets: DashboardWidgetConfig[];
  actions: string[]; // List of capability strings e.g. "Trigger Workflow"
  createdBy: string;
  status: 'Active' | 'Draft';
}

// Notification System Types
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  link?: string;
  read: boolean;
}

// --- OLAP / HISTORICAL ANALYSIS TYPES ---

export interface HistoricalRecord {
  id: string;
  date: string; // ISO 8601 DateTime String
  phase: SCORPhase;
  
  // Dimensions
  primaryDimension: string; // e.g., Vendor Name, SKU, Plant ID
  secondaryDimension: string; // e.g., Region, Line, Mode
  
  // Specific Filters
  category: string; // e.g. "Raw Materials", "Electronics", "Air Freight"
  country: string; // e.g. "USA", "China", "Germany"
  
  // Timezone Handling
  timezone: string; // IANA Timezone ID e.g. "America/New_York"

  // Measures
  value: number; // Generic value (Spend, Quantity, OEE %)
  metricName: string; // e.g. "Spend", "Stockout Qty", "OEE"
  
  status: string; // e.g. "Completed", "Pending", "Delivered"
  owner: string;
}

export interface VendorProfile {
  name: string;
  legalName: string;
  incorporationDate: string;
  taxId: string;
  country: string;
  address: string;
  riskScore: number;
  certifications: string[];
}