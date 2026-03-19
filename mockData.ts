import { InventoryData, ProductionData, ForecastingData, FactorData, CustomerOTIFData, DataProduct, CarbonData, AuditLog, ComplianceMetric, Shipment, MachineStatus, UserProfile, AppNotification, RiskZone, DispositionData, ReturnReasonData, ReturnRequest, HistoricalRecord, VendorProfile, SCORPhase } from './types';

// --- RBAC PERSONAS ---
export const personas: UserProfile[] = [
  {
    id: 'u1',
    name: 'Sarah Jenkins',
    role: 'EXECUTIVE',
    title: 'Chief Operating Officer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    allowedRoutes: ['/', '/chat', '/lpo', '/procurement', '/manufacturing', '/logistics', '/compliance', '/documents', '/returns', '/agent-studio']
  },
  {
    id: 'u2',
    name: 'David Chen',
    role: 'PLANNER',
    title: 'Senior Demand Planner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    allowedRoutes: ['/', '/chat', '/lpo']
  },
  {
    id: 'u3',
    name: 'Maria Rodriguez',
    role: 'PROCUREMENT',
    title: 'Global Sourcing Manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    allowedRoutes: ['/', '/chat', '/procurement', '/documents']
  },
  {
    id: 'u4',
    name: 'James Foster',
    role: 'LOGISTICS',
    title: 'Logistics Lead',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    allowedRoutes: ['/', '/chat', '/logistics', '/documents', '/returns']
  },
  {
    id: 'u5',
    name: 'Robert Kim',
    role: 'MANUFACTURING',
    title: 'Factory Operations Mgr',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    allowedRoutes: ['/', '/chat', '/manufacturing']
  },
  {
    id: 'u6',
    name: 'Elena Vasquez',
    role: 'COMPLIANCE',
    title: 'ESG & Quality Auditor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    allowedRoutes: ['/', '/chat', '/compliance', '/documents']
  }
];

export const initialNotifications: AppNotification[] = [
    {
        id: 'n1',
        title: 'War Risk Detected',
        message: 'Red Sea corridor escalation affecting shipment SHP-999.',
        time: '5 mins ago',
        type: 'critical',
        link: '/logistics',
        read: false
    },
    {
        id: 'n2',
        title: 'Port Strike Warning',
        message: 'Union negotiations stalled at Port of LA. Delays expected.',
        time: '25 mins ago',
        type: 'warning',
        link: '/logistics',
        read: false
    },
    {
        id: 'n3',
        title: 'ISO Audit Scheduled',
        message: 'External audit for ISO 14001 confirmed for next Monday.',
        time: '2 hours ago',
        type: 'info',
        link: '/compliance',
        read: true
    }
];

// --- SEARCH TYPEAHEAD DATA ---
export const globalSearchSuggestions = [
  { label: "Check Inventory Levels for SKU-001", type: "PLAN" },
  { label: "Track Shipment SHP-1092", type: "LOGISTICS" },
  { label: "Analyze Procurement Spend for Q3", type: "SOURCE" },
  { label: "Show ISO 14001 Compliance Status", type: "COMPLIANCE" },
  { label: "Predictive Maintenance for Robot Arm Delta", type: "MAKE" },
  { label: "Returns Disposition for RMA-2024-001", type: "RETURN" },
  { label: "Vendor Risk Assessment: Acme Corp", type: "SOURCE" },
  { label: "Global Demand Forecast vs Actual", type: "PLAN" },
  { label: "Red Sea Route Impact Analysis", type: "LOGISTICS" },
  { label: "Carbon Footprint Report Scope 3", type: "COMPLIANCE" },
  { label: "Search Contract: Supplier Agreement v4", type: "DOCUMENT" },
  { label: "Identify Top Delay Root Causes", type: "LOGISTICS" },
  { label: "Cost Saving Opportunities in Logistics", type: "SOURCE" },
  { label: "Production Line OEE Real-time", type: "MAKE" },
  { label: "Draft Email to Supplier regarding Delay", type: "ORCHESTRATOR" },
  { label: "Stockout Risk Simulation for SKU-004", type: "PLAN" },
  { label: "Audit Findings for ISO 28000", type: "COMPLIANCE" },
  { label: "High Risk Vendors in APAC", type: "SOURCE" }
];

export const dataProducts: DataProduct[] = [
  { id: '1', title: 'Bulk Assessment', description: 'Manages the procurement and usage of bulk raw materials.', icon: 'box', category: 'Procurement' },
  { id: '2', title: 'Carbon Footprint Analyser', description: 'Tracks and quantifies emissions across the supply chain.', icon: 'leaf', category: 'ESG' },
  { id: '3', title: 'Category Assistant', description: 'Supports buyers with analytics and insights for sourcing.', icon: 'globe', category: 'Procurement' },
  { id: '4', title: 'Category Management Cockpit', description: 'Centralized view of category strategies and performance.', icon: 'grid', category: 'Procurement' },
  { id: '5', title: 'Delivery Assurance', description: 'Ensures timely and accurate delivery of goods.', icon: 'truck', category: 'Logistics' },
  { id: '6', title: 'Demand Forecast', description: 'Predicts future customer demand using data analysis.', icon: 'bar-chart', category: 'Planning' },
  { id: '7', title: 'Inventory Optimizer', description: 'Optimizes inventory levels to reduce carrying costs.', icon: 'layers', category: 'Planning' },
  { id: '8', title: 'Engineering Change Mgmt', description: 'Tracks and manages engineering changes.', icon: 'settings', category: 'Manufacturing' },
  { id: '9', title: 'ISO Compliance Guard', description: 'Automated auditing for ISO 9001, 14001, and 28000.', icon: 'shield', category: 'PLM & ESG' },
  { id: '10', title: 'Digital Twin Sim', description: 'Real-time virtual replica of production lines.', icon: 'cpu', category: 'Manufacturing' },
  { id: '11', title: 'Dynamic Route Opt', description: 'AI-driven logistics routing to minimize miles.', icon: 'map', category: 'Logistics' },
  { id: '12', title: 'Reverse Logistics', description: 'Optimize returns, refurbishment, and disposition.', icon: 'rotate-ccw', category: 'E2E Supply Chain' }
];

// Planning / LPO Data
export const inventoryData: InventoryData[] = [
  { sku: 'SKU-001', stockoutInstances: 20, stockoutQuantity: 4000, isAnomaly: false },
  { sku: 'SKU-002', stockoutInstances: 18, stockoutQuantity: 3500, isAnomaly: false },
  { sku: 'SKU-003', stockoutInstances: 15, stockoutQuantity: 3200, isAnomaly: false },
  { sku: 'SKU-004', stockoutInstances: 12, stockoutQuantity: 2800, isAnomaly: false },
  { sku: 'SKU-005', stockoutInstances: 22, stockoutQuantity: 4200, isAnomaly: false },
  { sku: 'SKU-006', stockoutInstances: 8, stockoutQuantity: 1500, isAnomaly: false },
  { sku: 'SKU-007', stockoutInstances: 19, stockoutQuantity: 3900, isAnomaly: false },
  { sku: 'SKU-008', stockoutInstances: 14, stockoutQuantity: 3100, isAnomaly: false },
];

// DATASET FOR ANOMALY SCENARIO
export const anomalousInventoryData: InventoryData[] = [
  { sku: 'SKU-001', stockoutInstances: 20, stockoutQuantity: 4000, isAnomaly: false, zScore: 0.5 },
  { sku: 'SKU-002', stockoutInstances: 18, stockoutQuantity: 3500, isAnomaly: false, zScore: 0.4 },
  { sku: 'SKU-003', stockoutInstances: 15, stockoutQuantity: 3200, isAnomaly: false, zScore: 0.3 },
  // ANOMALY: Huge spike, high Z-score
  { sku: 'SKU-004', stockoutInstances: 65, stockoutQuantity: 12800, isAnomaly: true, zScore: 3.8 },
  { sku: 'SKU-005', stockoutInstances: 22, stockoutQuantity: 4200, isAnomaly: false, zScore: 0.6 },
  { sku: 'SKU-006', stockoutInstances: 8, stockoutQuantity: 1500, isAnomaly: false, zScore: 0.1 },
  { sku: 'SKU-007', stockoutInstances: 19, stockoutQuantity: 3900, isAnomaly: false, zScore: 0.5 },
  { sku: 'SKU-008', stockoutInstances: 14, stockoutQuantity: 3100, isAnomaly: false, zScore: 0.2 },
];

export const productionData: ProductionData[] = [
  { month: 'Jan-23', planned: 7.5, actual: 7.2 },
  { month: 'Feb-23', planned: 7.8, actual: 7.6 },
  { month: 'Mar-23', planned: 8.0, actual: 7.8 },
  { month: 'Apr-23', planned: 8.2, actual: 8.1 },
  { month: 'May-23', planned: 8.5, actual: 8.3 },
  { month: 'Jun-23', planned: 8.3, actual: 8.4 },
  { month: 'Jul-23', planned: 8.7, actual: 8.5 },
  { month: 'Aug-23', planned: 8.5, actual: 8.2 },
  { month: 'Sep-23', planned: 7.8, actual: 7.5 },
  { month: 'Oct-23', planned: 7.2, actual: 7.0 },
  { month: 'Nov-23', planned: 6.5, actual: 6.2 },
];

export const forecastingData: ForecastingData[] = [
  { sku: 'S001', error: 71 },
  { sku: 'S002', error: 67 },
  { sku: 'S003', error: 67 },
  { sku: 'S004', error: 66 },
  { sku: 'S005', error: 65 },
  { sku: 'S006', error: 52 },
  { sku: 'S007', error: 51 },
  { sku: 'S008', error: 47 },
  { sku: 'S009', error: 46 },
];

export const factorsData: FactorData[] = [
  { x: 20, y: 45, z: 30, name: 'Warehouse Efficiency', category: 'Logistics', isOutlier: false },
  { x: 50, y: 60, z: 20, name: 'Carrier Non-Performance', category: 'Logistics', isOutlier: false },
  { x: 30, y: 20, z: 40, name: 'Production Shortfall', category: 'Production', isOutlier: false },
  { x: 80, y: 10, z: 25, name: 'Forecast Error', category: 'Planning', isOutlier: false },
  // Anomaly for Procurement
  { x: 95, y: 85, z: 60, name: 'Maverick Spend Variance', category: 'Procurement', isOutlier: true },
  { x: 60, y: 80, z: 15, name: 'Supplier Delay', category: 'Procurement', isOutlier: false },
];

// Procurement Data
export const spendCategories = [
  { name: 'Crispies Clan', value: 77, margin: 18, color: '#d946ef' },
  { name: 'Multigrain', value: 75, margin: 19, color: '#8b5cf6' },
  { name: 'Wholesome', value: 79, margin: 17.5, color: '#0ea5e9' },
  { name: 'Tasty Tidbits', value: 76, margin: 18.5, color: '#22c55e' },
  { name: 'Others', value: 73, margin: 17, color: '#eab308' },
];

export const customerOtifData: CustomerOTIFData[] = [
  { customer: 'C-17', revenueDelayed: 1200, otif: 81 },
  { customer: 'C-18', revenueDelayed: 1000, otif: 82 },
  { customer: 'C-2', revenueDelayed: 950, otif: 80 },
  { customer: 'C-3', revenueDelayed: 940, otif: 81 },
  { customer: 'C-5', revenueDelayed: 800, otif: 82 },
  { customer: 'C-19', revenueDelayed: 780, otif: 81 },
  { customer: 'C-1', revenueDelayed: 760, otif: 81 },
  { customer: 'C-7', revenueDelayed: 750, otif: 82 },
  { customer: 'C-4', revenueDelayed: 740, otif: 80 },
  { customer: 'C-14', revenueDelayed: 720, otif: 81 },
  { customer: 'C-15', revenueDelayed: 700, otif: 83 },
  { customer: 'C-6', revenueDelayed: 500, otif: 81 },
];

export const mockCitations = [
  {
    id: '1',
    filename: 'Supplier_Agreement_v4.pdf',
    page: 12,
    text: 'Force majeure clauses shall cover pandemics and global supply chain disruptions specifically...',
    similarity: 0.89
  },
  {
    id: '2',
    filename: 'Q3_Logistics_Report.docx',
    page: 4,
    text: 'Tariff impacts from region APAC have increased landed costs by 12% year-over-year...',
    similarity: 0.82
  }
];

// --- ISO COMPLIANCE MOCK DATA ---

export const complianceMetrics: ComplianceMetric[] = [
  { standard: 'ISO 9001 (Quality)', score: 92, status: 'Compliant', lastAudit: '2023-10-15' },
  { standard: 'ISO 14001 (Environmental)', score: 78, status: 'At Risk', lastAudit: '2023-11-20' },
  { standard: 'ISO 28000 (Security)', score: 88, status: 'Compliant', lastAudit: '2023-09-01' },
  { standard: 'ISO 45001 (Safety)', score: 96, status: 'Compliant', lastAudit: '2024-01-10' },
];

export const carbonData: CarbonData[] = [
  { month: 'Aug', scope1: 120, scope2: 200, scope3: 310, target: 700 },
  { month: 'Sep', scope1: 115, scope2: 190, scope3: 305, target: 700 },
  { month: 'Oct', scope1: 125, scope2: 195, scope3: 320, target: 700 },
  { month: 'Nov', scope1: 130, scope2: 210, scope3: 450, target: 700 }, // ANOMALY: Spike in Scope 3
  { month: 'Dec', scope1: 128, scope2: 205, scope3: 340, target: 700 },
  { month: 'Jan', scope1: 122, scope2: 200, scope3: 330, target: 700 },
];

export const auditLogs: AuditLog[] = [
  { id: '1', standard: 'ISO 14001', finding: 'Logistics provider X exceeding emissions cap in APAC region.', severity: 'Major', date: '2023-11-22', status: 'Open' },
  { id: '2', standard: 'ISO 9001', finding: 'Calibration records missing for Line 4 sensors.', severity: 'Minor', date: '2023-12-05', status: 'Closed' },
  { id: '3', standard: 'ISO 28000', finding: 'Unauthorized personnel access detected in warehouse Zone B.', severity: 'Major', date: '2024-01-15', status: 'Open' },
];

export const complianceRadarData = [
  { subject: 'Documentation', A: 120, B: 110, fullMark: 150 },
  { subject: 'Process Control', A: 98, B: 130, fullMark: 150 },
  { subject: 'Risk Mgmt', A: 86, B: 130, fullMark: 150 },
  { subject: 'Sustainability', A: 65, B: 100, fullMark: 150 }, // Low score anomaly
  { subject: 'Vendor Audit', A: 85, B: 90, fullMark: 150 },
  { subject: 'Training', A: 100, B: 85, fullMark: 150 },
];

// --- LOGISTICS MOCK DATA ---

export const riskZones: RiskZone[] = [
  {
    id: 'RZ-1',
    type: 'WAR',
    name: 'Red Sea Conflict Zone',
    // Polygon covering Red Sea area roughly
    coordinates: [
       [29.5, 32.5], [29.5, 35.0], [12.5, 43.5], [12.5, 42.0], [29.5, 32.5]
    ],
    center: [20.0, 39.0],
    severity: 'Critical',
    impactDescription: 'High missile threat. Insurance suspended.'
  },
  {
    id: 'RZ-2',
    type: 'STRIKE',
    name: 'Port of Los Angeles Strike',
    coordinates: [], // Point based, handled by center
    center: [33.7288, -118.2620],
    severity: 'High',
    impactDescription: 'Union labor strike. 14-day backlog expected.'
  }
];

// Updated Shipments with ISO 8601 ETAs and Timezones
export const shipments: Shipment[] = [
  {
    id: 'SHP-1092',
    origin: 'Shanghai, CN',
    destination: 'Los Angeles, US',
    status: 'In Transit',
    eta: '2023-12-10T14:00:00Z',
    timezone: 'America/Los_Angeles',
    carrier: 'Maersk',
    optimizationSavings: '12% miles',
    originCoordinates: [31.2304, 121.4737],
    destinationCoordinates: [34.0522, -118.2437],
    progress: 85,
    deliveryWindow: '14:00 - 16:00',
    lastMileRisk: 'High',
    activeRisks: ['RZ-2'],
    alternateRoutes: [
        {
            id: 'RT-SEA',
            name: 'Divert to Seattle',
            eta: '2023-12-14',
            distance: '+450 nm',
            cost: '+$12,500',
            riskLevel: 'Low',
            coordinates: [
                [31.2304, 121.4737],
                [42.0, 160.0],
                [48.0, -135.0],
                [47.6062, -122.3321]
            ],
            tags: ['Avoid Strike', 'Higher Rail Cost']
        }
    ]
  },
  {
    id: 'SHP-999',
    origin: 'Singapore, SG',
    destination: 'Rotterdam, NL',
    status: 'In Transit',
    eta: '2023-12-25T10:00:00Z',
    timezone: 'Europe/Amsterdam',
    carrier: 'Hapag-Lloyd',
    originCoordinates: [1.3521, 103.8198],
    destinationCoordinates: [51.9225, 4.47917],
    progress: 30,
    deliveryWindow: 'Pending',
    lastMileRisk: 'Medium',
    activeRisks: ['RZ-1'],
    alternateRoutes: [
        {
            id: 'RT-CAPE',
            name: 'Via Cape of Good Hope',
            eta: '2024-01-05',
            distance: '+3500 nm',
            cost: '+$45,000',
            riskLevel: 'Low',
            coordinates: [
                [1.3521, 103.8198],
                [-10.0, 70.0],
                [-34.0, 20.0],
                [-10.0, -10.0],
                [51.9225, 4.47917]
            ],
            tags: ['Safe Route', 'High Fuel Cost']
        }
    ]
  },
  {
    id: 'SHP-1093',
    origin: 'Rotterdam, NL',
    destination: 'New York, US',
    status: 'In Transit',
    eta: '2023-12-08T09:00:00Z',
    timezone: 'America/New_York',
    carrier: 'MSC',
    originCoordinates: [51.9225, 4.47917],
    destinationCoordinates: [40.7128, -74.0060],
    progress: 70,
    deliveryWindow: '09:00 - 11:00',
    lastMileRisk: 'Low'
  },
  {
    id: 'SHP-1094',
    origin: 'Mumbai, IN',
    destination: 'Dubai, UAE',
    status: 'Delivered',
    eta: '2023-11-30T16:00:00Z',
    timezone: 'Asia/Dubai',
    carrier: 'Hapag-Lloyd',
    originCoordinates: [19.0760, 72.8777],
    destinationCoordinates: [25.2048, 55.2708],
    progress: 100,
    deliveryWindow: 'Delivered',
    lastMileRisk: 'Low'
  },
  {
    id: 'SHP-1095',
    origin: 'Hamburg, DE',
    destination: 'Chicago, US',
    status: 'Delayed',
    eta: '2023-12-15T13:00:00Z',
    timezone: 'America/Chicago',
    carrier: 'DHL',
    optimizationSavings: '8% CO2',
    originCoordinates: [53.5511, 9.9937],
    destinationCoordinates: [41.8781, -87.6298],
    progress: 25,
    deliveryWindow: 'Pending',
    lastMileRisk: 'High'
  },
  {
    id: 'SHP-1096',
    origin: 'Tokyo, JP',
    destination: 'Seattle, US',
    status: 'In Transit',
    eta: '2023-12-05T11:00:00Z',
    timezone: 'America/Los_Angeles',
    carrier: 'ONE',
    originCoordinates: [35.6762, 139.6503],
    destinationCoordinates: [47.6062, -122.3321],
    progress: 60,
    deliveryWindow: '10:30 - 12:30',
    lastMileRisk: 'Medium'
  }
];

// --- MANUFACTURING MOCK DATA ---
export const machineStatus: MachineStatus[] = [
  { id: 'M-01', name: 'CNC Milling A', status: 'Running', oee: 88, temperature: 65, vibration: 2.1, health: 95 },
  { id: 'M-02', name: 'Injection Mold B', status: 'Running', oee: 92, temperature: 145, vibration: 1.8, health: 98 },
  { id: 'M-03', name: 'Conveyor System', status: 'Maintenance', oee: 0, temperature: 22, vibration: 0.5, health: 45 },
  { id: 'M-04', name: 'Robot Arm Delta', status: 'Running', oee: 85, temperature: 55, vibration: 4.2, health: 72 }, // Anomaly Candidate
];

// --- RETURNS / REVERSE LOGISTICS MOCK DATA (New for SCOR) ---
export const dispositionData: DispositionData[] = [
  { name: 'Restock / Resell', value: 45, color: '#22c55e' }, // Profitable
  { name: 'Refurbish / Repair', value: 30, color: '#eab308' }, // Recovery cost
  { name: 'Recycle', value: 15, color: '#3b82f6' }, // Sustainability
  { name: 'Scrap / Disposal', value: 5, color: '#ef4444' }, // Loss
  { name: 'Return to Vendor', value: 5, color: '#a855f7' }, // Warranty
];

export const returnReasons: ReturnReasonData[] = [
  { reason: 'Customer Changed Mind', count: 1200 },
  { reason: 'Defective / Damaged', count: 850 },
  { reason: 'Wrong Item Shipped', count: 420 },
  { reason: 'Late Delivery', count: 210 },
  { reason: 'Size / Fit Issue', count: 180 },
];

export const recentReturns: ReturnRequest[] = [
  {
    id: 'RMA-2024-001',
    sku: 'SKU-004',
    productName: 'Precision Motor V2',
    returnLocation: 'Chicago, US',
    customer: 'TechFlow Inc',
    reason: 'Defective / Not Working',
    condition: 'Critical Damage',
    rcaNotes: 'Internal coil fused due to overheat. Root cause: Batch 3992 heat treatment failure.',
    disposition: 'Scrap',
    eligibility: 'Safety Hazard (Electrical)',
    financialImpact: -1250.00,
    currency: 'USD',
    responsibleDept: 'Quality Assurance',
    responsiblePersona: 'Elena Vasquez',
    status: 'Pending',
    date: '2023-12-01T09:30:00Z',
    timezone: 'America/Chicago'
  },
  {
    id: 'RMA-2024-002',
    sku: 'SKU-102',
    productName: 'Control Panel X1',
    returnLocation: 'Berlin, DE',
    customer: 'AutoWorks GmbH',
    reason: 'Wrong Item Shipped',
    condition: 'New / Unopened',
    rcaNotes: 'Seal intact. Visual inspection passed.',
    disposition: 'Restock',
    eligibility: 'Grade A Condition',
    financialImpact: -45.00,
    currency: 'EUR',
    responsibleDept: 'Logistics',
    responsiblePersona: 'James Foster',
    status: 'Approved',
    date: '2023-12-02T14:15:00Z',
    timezone: 'Europe/Berlin'
  },
  {
    id: 'RMA-2024-003',
    sku: 'SKU-009',
    productName: 'Hydraulic Pump',
    returnLocation: 'Tokyo, JP',
    customer: 'HeavyInd Corp',
    reason: 'Performance Issue',
    condition: 'Used / Worn',
    rcaNotes: 'O-ring seal failure detected. Replaceable component.',
    disposition: 'Refurbish',
    eligibility: 'Repair cost < 50% of value',
    financialImpact: -350.00,
    currency: 'JPY',
    responsibleDept: 'Manufacturing',
    responsiblePersona: 'Robert Kim',
    status: 'Inspecting',
    date: '2023-12-03T10:00:00Z',
    timezone: 'Asia/Tokyo'
  },
  {
      id: 'RMA-2024-004',
      sku: 'SKU-004',
      productName: 'Precision Motor V2',
      returnLocation: 'London, UK',
      customer: 'GlobalDynamics',
      reason: 'Defective / Noise',
      condition: 'Functional / Noisy',
      rcaNotes: 'Bearing misalignment. Recoverable via remanufacturing.',
      disposition: 'Refurbish',
      eligibility: 'Core material intact',
      financialImpact: -120.00,
      currency: 'GBP',
      responsibleDept: 'Quality Assurance',
      responsiblePersona: 'Elena Vasquez',
      status: 'Pending',
      date: '2023-12-03T16:45:00Z',
      timezone: 'Europe/London'
  }
];

// --- OLAP MOCK DATA ---

// Vendor Registry
export const vendorRegistry: Record<string, VendorProfile> = {
  'Acme Corp': { name: 'Acme Corp', legalName: 'Acme International Ltd.', incorporationDate: '1992-05-12', taxId: 'US-99230122', country: 'USA', address: '1200 Industrial Blvd, Ohio', riskScore: 12, certifications: ['ISO 9001', 'ISO 14001'] },
  'Globex Inc': { name: 'Globex Inc', legalName: 'Globex Manufacturing Solutions GmbH', incorporationDate: '2005-11-20', taxId: 'DE-88219901', country: 'Germany', address: 'Hafenstrasse 42, Hamburg', riskScore: 4, certifications: ['ISO 9001', 'IATF 16949'] },
  'Soylent Corp': { name: 'Soylent Corp', legalName: 'Soylent Biochemicals Inc.', incorporationDate: '2015-02-14', taxId: 'US-11293301', country: 'USA', address: '442 Green Way, California', riskScore: 25, certifications: ['FDA Approved'] },
  'Massive Dynamic': { name: 'Massive Dynamic', legalName: 'Massive Dynamic Global', incorporationDate: '2008-08-08', taxId: 'CN-88882211', country: 'China', address: '88 Tech Road, Shenzhen', riskScore: 45, certifications: ['ISO 27001'] },
  'Cyberdyne': { name: 'Cyberdyne', legalName: 'Cyberdyne Systems Corp', incorporationDate: '1997-08-29', taxId: 'JP-99123001', country: 'Japan', address: '1-1 AI District, Tokyo', riskScore: 8, certifications: ['ISO 45001'] },
};

// Timezone Mapper for Mock Data
const countryTimezones: Record<string, string> = {
  'USA': 'America/New_York',
  'China': 'Asia/Shanghai',
  'Germany': 'Europe/Berlin',
  'Japan': 'Asia/Tokyo',
  'India': 'Asia/Kolkata',
  'UK': 'Europe/London',
  'Netherlands': 'Europe/Amsterdam'
};

// Generate Mock OLAP Records
const generateOLAPData = (): HistoricalRecord[] => {
  const records: HistoricalRecord[] = [];
  const phases: SCORPhase[] = ['PLAN', 'SOURCE', 'MAKE', 'DELIVER', 'RETURN', 'ENABLE'];
  const vendors = Object.keys(vendorRegistry);
  const statuses = ['Completed', 'Pending', 'Delayed', 'On Hold'];
  const owners = ['Sarah Jenkins', 'David Chen', 'Maria Rodriguez', 'James Foster'];
  const countries = ['USA', 'China', 'Germany', 'Japan', 'India', 'UK', 'Netherlands'];

  for (let i = 0; i < 200; i++) {
    const phase = phases[Math.floor(Math.random() * phases.length)];
    // Random Date in 2022-2024
    const year = [2022, 2023, 2024][Math.floor(Math.random() * 3)];
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);

    const dateObj = new Date(year, month, day, hour, minute);
    const date = dateObj.toISOString(); // Store as ISO UTC

    let primary = '';
    let secondary = '';
    let metric = '';
    let value = 0;
    let country = '';
    let category = '';

    switch(phase) {
      case 'PLAN':
        primary = `SKU-${Math.floor(Math.random() * 50) + 100}`;
        secondary = ['North America', 'EMEA', 'APAC'][Math.floor(Math.random() * 3)];
        metric = 'Forecast Error %';
        value = Math.floor(Math.random() * 50);
        category = ['Electronics', 'Mechanical', 'Chemical'][Math.floor(Math.random() * 3)];
        country = countries[Math.floor(Math.random() * countries.length)];
        break;
      case 'SOURCE':
        primary = vendors[Math.floor(Math.random() * vendors.length)];
        secondary = ['Electronics', 'Raw Materials', 'Services', 'Packaging'][Math.floor(Math.random() * 4)];
        metric = 'Spend (USD)';
        value = Math.floor(Math.random() * 50000) + 1000;
        category = secondary; // Category is explicit here
        country = vendorRegistry[primary] ? vendorRegistry[primary].country : countries[Math.floor(Math.random() * countries.length)];
        break;
      case 'MAKE':
        primary = `Plant-${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`;
        secondary = `Line-${Math.floor(Math.random() * 5) + 1}`;
        metric = 'OEE %';
        value = Math.floor(Math.random() * 30) + 70;
        category = 'Assembly';
        country = countries[Math.floor(Math.random() * 3)]; // Limited locations for plants
        break;
      case 'DELIVER':
        primary = ['Maersk', 'DHL', 'FedEx', 'MSC'][Math.floor(Math.random() * 4)];
        secondary = ['Sea', 'Air', 'Road'][Math.floor(Math.random() * 3)];
        metric = 'Transit Time (Days)';
        value = Math.floor(Math.random() * 40) + 2;
        category = secondary;
        country = countries[Math.floor(Math.random() * countries.length)]; // Destination
        break;
      case 'RETURN':
        primary = `RMA-${Math.floor(Math.random() * 1000)}`;
        secondary = ['Defective', 'Wrong Item', 'Customer Remorse'][Math.floor(Math.random() * 3)];
        metric = 'Recovery Value ($)';
        value = Math.floor(Math.random() * 500);
        category = 'Electronics';
        country = countries[Math.floor(Math.random() * countries.length)];
        break;
      case 'ENABLE':
        primary = 'ISO 9001';
        secondary = 'Audit Finding';
        metric = 'Compliance Score';
        value = Math.floor(Math.random() * 20) + 80;
        category = 'Quality';
        country = countries[Math.floor(Math.random() * countries.length)];
        break;
    }

    // Determine Timezone based on Country
    const timezone = countryTimezones[country] || 'UTC';

    records.push({
      id: `HIST-${1000 + i}`,
      date,
      phase,
      primaryDimension: primary,
      secondaryDimension: secondary,
      metricName: metric,
      value,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      owner: owners[Math.floor(Math.random() * owners.length)],
      country,
      category,
      timezone
    });
  }

  // Sort by date descending
  return records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const olapData = generateOLAPData();