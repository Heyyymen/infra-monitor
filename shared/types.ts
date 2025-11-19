export interface MetricPoint {
  timestamp: number;
  cpu: number; // 0-100
  ram: number; // 0-100
  disk: number; // 0-100
  networkIn: number; // MB/s
  networkOut: number; // MB/s
}

export enum AgentStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface Agent {
  id: string;
  name: string;
  ip: string;
  status: AgentStatus;
  history: MetricPoint[];
  lastSeen: number;
  tags: string[];
}

export interface AlertConfig {
  cpuThreshold: number;
  ramThreshold: number;
  diskThreshold: number;
}

export interface Alert {
  id: string;
  agentId: string;
  agentName: string;
  type: 'CPU' | 'RAM' | 'DISK' | 'STATUS';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: number;
}

export type ViewState = 'DASHBOARD' | 'AGENT_DETAIL';