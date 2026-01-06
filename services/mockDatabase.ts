import { Equipment, Inspection, SearchResult } from '../types';

// --- Configuration Arrays ---

const LOCATIONS = [
  'Unit 1 - Crude Distillation',
  'Unit 2 - Vacuum Distillation',
  'Unit 3 - Catalytic Cracker',
  'Unit 4 - Water Treatment',
  'Tank Farm A - Crude Storage',
  'Tank Farm B - Product Storage',
  'Interconnecting Pipeway',
  'Flare System',
  'Cooling Water Tower',
  'Boiler House'
];

const INSPECTORS = ['J. Smith', 'A. Doe', 'R. Roe', 'S. Connor', 'B. Wayne', 'C. Kent', 'D. Prince', 'L. Lane', 'P. Parker', 'T. Stark'];

// Specific definitions for the requested equipment types
// Counts increased to 50 as requested, and Heat Exchangers added.
const CATEGORY_CONFIGS = [
  { type: 'Pipeline', code: 'PL', count: 50, prefix: 'Pipeline' },
  { type: 'PSV', code: 'PSV', count: 50, prefix: 'PSV' },
  { type: 'Pressure Vessel', code: 'PV', count: 50, prefix: 'Vessel' },
  { type: 'Drum', code: 'DR', count: 50, prefix: 'Drum' },
  { type: 'Heat Exchanger', code: 'HE', count: 50, prefix: 'Exchanger' }
];

// Scenarios mapping to the requested 3 types of equipment states
// expanded with more specific findings for PSVs, Piping, and Heat Exchangers
const SCENARIOS = [
  {
    label: 'Accepted', // Status: Accepted/Good
    statusPool: ['Closed'],
    severityPool: ['Low'],
    findingsPool: [
      "Vibration levels within ISO acceptable limits.",
      "No visible leaks observed during hydro test.",
      "External coating intact. No corrosion observed.",
      "Ultrasonic thickness readings above minimal nominal.",
      "Visual inspection passed. Housekeeping good.",
      "Pipe supports are in good condition and fully engaged.",
      "PSV pop test passed at set pressure.",
      "No signs of external blistering or lamination.",
      "Flange connections tight, no evidence of leakage.",
      "Insulation cladding is intact and weather-proof.",
      "Tube bundle inspection clean, no significant fouling.",
      "Pass partition plates intact and secure.",
      "Channel head internal lining in good condition.",
      "Sacrificial anodes show normal consumption rate."
    ],
    recPool: [
      "Continue routine monitoring schedule.",
      "No maintenance action required.",
      "Next inspection due in 12 months.",
      "Maintain current operating parameters.",
      "Record thickness readings in IDMS.",
      "Schedule next cleaning cycle."
    ]
  },
  {
    label: 'Repaired', // Status: Repaired/Fixed
    statusPool: ['Closed'],
    severityPool: ['Medium', 'High'],
    findingsPool: [
      "Seal leak previously detected has been repaired.",
      "Patch plate welded over corroded shell area. NDT passed.",
      "Replaced damaged pressure gauge.",
      "Tightened loose coupling bolts. Alignment verified.",
      "Replaced corroded valve stem.",
      "PSV spring washer replaced and re-certified.",
      "Pipe section replaced due to localized erosion.",
      "Repainted areas with coating failure.",
      "Replaced missing bolts on flange connection.",
      "Welded support bracket that was detached.",
      "Plugged 5 leaking tubes in the bundle.",
      "Replaced channel head gasket.",
      "Chemical cleaning performed to remove scale.",
      "Re-rolled tube-to-tubesheet joints.",
      "Installed impingement plate on inlet nozzle."
    ],
    recPool: [
      "Monitor repair for 48 hours.",
      "Repair completed successfully. Return to service.",
      "Log repair in maintenance history.",
      "Verify integrity during next shutdown.",
      "Perform IR scan within 24 hours of startup."
    ]
  },
  {
    label: 'Pending for Repair', // Status: Pending/Open Issues
    statusPool: ['Open', 'In Progress'],
    severityPool: ['Medium', 'High', 'Critical'],
    findingsPool: [
      "Active product leak observed.",
      "High vibration (>0.5 in/s) detected during operation.",
      "Wall thickness below retirement limit (Tmin).",
      "Safety relief valve (PSV) failed pop test (lifted early).",
      "Severe pitting on shell (>40% wall loss).",
      "Structural cracks observed in support legs.",
      "Insulation damaged, causing significant heat loss.",
      "Severe external corrosion under insulation (CUI).",
      "Flange face damage requiring machining.",
      "Bellows expansion joint showing signs of fatigue cracking.",
      "Tube leak detected during pressure test.",
      "Severe fouling on shell side reducing heat transfer efficiency.",
      "Channel head showing signs of erosion-corrosion.",
      "Floating head backing ring cracked.",
      "Tubesheet ligament cracking observed."
    ],
    recPool: [
      "Plan for immediate replacement.",
      "Schedule outage for repair.",
      "Isolate equipment and perform detailed NDT.",
      "Reduce operating pressure by 20% until repair.",
      "Emergency work order created.",
      "Barricade area to prevent access.",
      "Order replacement tube bundle.",
      "Blind off nozzle until repair can be effected."
    ]
  }
];

// --- Generator Logic ---

const generateMockData = (): Equipment[] => {
  const data: Equipment[] = [];
  
  CATEGORY_CONFIGS.forEach(config => {
    for (let i = 1; i <= config.count; i++) {
      // 1. Determine Scenario (Accepted, Repaired, Pending)
      // We rotate through them to ensure an even distribution as requested
      const scenarioIndex = (i - 1) % 3; 
      const scenario = SCENARIOS[scenarioIndex];

      // 2. Generate Basic Info
      // Pad number with leading zeros, e.g., 001, 002... 050
      const numStr = i.toString().padStart(3, '0'); 
      const equipmentId = `EQ-${config.code}-${numStr}`;
      const equipmentName = `${config.prefix}-${numStr}`;
      
      // 3. Generate Inspection History (3 to 15 reports)
      const numInspections = Math.floor(Math.random() * 13) + 3; // Random between 3 and 15
      const inspections: Inspection[] = [];

      for (let j = 0; j < numInspections; j++) {
        const isLatest = j === 0;
        
        // Latest inspection matches the Equipment's current "State"
        // Older inspections are random, mostly closed/accepted/repaired
        const currentScenario = isLatest ? scenario : SCENARIOS[Math.floor(Math.random() * 2)]; 
        
        const status = isLatest 
          ? currentScenario.statusPool[Math.floor(Math.random() * currentScenario.statusPool.length)]
          : 'Closed';

        // Dates: spread out over years
        const date = new Date();
        date.setMonth(date.getMonth() - (j * 4)); // Every 4 months roughly
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        const finding = currentScenario.findingsPool[Math.floor(Math.random() * currentScenario.findingsPool.length)];
        const recommendation = currentScenario.recPool[Math.floor(Math.random() * currentScenario.recPool.length)];
        const severity = currentScenario.severityPool[Math.floor(Math.random() * currentScenario.severityPool.length)];
        const inspector = INSPECTORS[Math.floor(Math.random() * INSPECTORS.length)];

        inspections.push({
          id: `INS-${equipmentId}-${date.getFullYear()}${date.getMonth()}${date.getDate()}`,
          date: date.toISOString().split('T')[0],
          inspector: inspector,
          findings: finding,
          recommendations: recommendation,
          severity: severity as any,
          reportUrl: `https://drive.google.com/open?id=report-${equipmentId}-${j}`,
          status: status as any
        });
      }

      data.push({
        id: equipmentId,
        name: equipmentName,
        type: config.type,
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        inspections: inspections
      });
    }
  });
  
  return data;
};

// Generate records (50 Pipelines + 50 PSVs + 50 PVs + 50 Drums + 50 Exchangers = 250 items)
const INSPECTION_DB: Equipment[] = generateMockData();

// --- Database Access Functions ---

export const getAllEquipment = (): {id: string, name: string, type: string, location: string}[] => {
  return INSPECTION_DB.map(eq => ({ id: eq.id, name: eq.name, type: eq.type, location: eq.location }));
};

export const getEquipmentHistory = (equipmentId: string): Equipment | null => {
  return INSPECTION_DB.find(eq => eq.id === equipmentId) || null;
};

export const searchInspections = (query: string): SearchResult[] => {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  INSPECTION_DB.forEach(eq => {
    eq.inspections.forEach(ins => {
      if (
        ins.findings.toLowerCase().includes(lowerQuery) ||
        ins.recommendations.toLowerCase().includes(lowerQuery) ||
        ins.severity.toLowerCase().includes(lowerQuery) ||
        eq.name.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          equipmentName: eq.name,
          date: ins.date,
          finding: ins.findings,
          severity: ins.severity,
          reportUrl: ins.reportUrl
        });
      }
    });
  });
  return results;
};

// --- PostgreSQL Export Function ---

export const generateSQLDump = (): string => {
  const escapeSql = (str: string) => str.replace(/'/g, "''");
  
  let sql = `-- InspectorAI PostgreSQL Database Export
-- Generated: ${new Date().toISOString()}

BEGIN;

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS equipment;

-- Create Equipment Table
CREATE TABLE equipment (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(100)
);

-- Create Inspections Table
CREATE TABLE inspections (
    id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    inspector VARCHAR(100),
    findings TEXT,
    recommendations TEXT,
    severity VARCHAR(20),
    report_url VARCHAR(255),
    status VARCHAR(20),
    CONSTRAINT fk_equipment
        FOREIGN KEY (equipment_id) 
        REFERENCES equipment(id)
        ON DELETE CASCADE
);

-- Create indexes for common search columns
CREATE INDEX idx_inspections_equipment_id ON inspections(equipment_id);
CREATE INDEX idx_equipment_name ON equipment(name);

-- Begin Equipment Inserts
`;

  INSPECTION_DB.forEach(eq => {
    sql += `INSERT INTO equipment (id, name, type, location) VALUES ('${escapeSql(eq.id)}', '${escapeSql(eq.name)}', '${escapeSql(eq.type)}', '${escapeSql(eq.location)}');\n`;
  });

  sql += `\n-- Begin Inspection Inserts\n`;

  INSPECTION_DB.forEach(eq => {
    eq.inspections.forEach(ins => {
      sql += `INSERT INTO inspections (id, equipment_id, date, inspector, findings, recommendations, severity, report_url, status) VALUES ('${escapeSql(ins.id)}', '${escapeSql(eq.id)}', '${ins.date}', '${escapeSql(ins.inspector)}', '${escapeSql(ins.findings)}', '${escapeSql(ins.recommendations)}', '${ins.severity}', '${escapeSql(ins.reportUrl)}', '${ins.status}');\n`;
    });
  });

  sql += `\nCOMMIT;\n`;

  return sql;
};