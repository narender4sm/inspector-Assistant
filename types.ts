export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface Inspection {
  id: string;
  date: string;
  inspector: string;
  findings: string;
  recommendations: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportUrl: string;
  status: 'Open' | 'Closed' | 'In Progress';
  failureType?: 'Critical' | 'Normal';
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  inspections: Inspection[];
  specs?: Record<string, string | number>;
}

export interface SearchResult {
  equipmentName: string;
  date: string;
  finding: string;
  severity: string;
  reportUrl: string;
}