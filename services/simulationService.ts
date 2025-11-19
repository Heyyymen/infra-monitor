import { Agent, AgentStatus, MetricPoint, Alert, AlertConfig } from "../types";

// Helper to generate random UUID
const uuid = () => Math.random().toString(36).substr(2, 9);

// Initial Mock Agents
const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    name: 'prod-db-primary',
    ip: '10.0.1.45',
    status: AgentStatus.ONLINE,
    history: [],
    lastSeen: Date.now(),
    tags: ['database', 'production', 'postgres']
  },
  {
    id: 'agent-002',
    name: 'prod-api-worker-01',
    ip: '10.0.2.12',
    status: AgentStatus.ONLINE,
    history: [],
    lastSeen: Date.now(),
    tags: ['api', 'production', 'worker']
  },
  {
    id: 'agent-003',
    name: 'staging-redis',
    ip: '10.1.0.5',
    status: AgentStatus.ONLINE,
    history: [],
    lastSeen: Date.now(),
    tags: ['cache', 'staging']
  },
  {
    id: 'agent-004',
    name: 'legacy-billing',
    ip: '192.168.1.100',
    status: AgentStatus.WARNING,
    history: [],
    lastSeen: Date.now(),
    tags: ['legacy', 'finance']
  }
];

// Generate a slightly random next point based on previous to simulate realistic drift
const generateNextPoint = (prev: MetricPoint | null): MetricPoint => {
  const now = Date.now();
  
  if (!prev) {
    return {
      timestamp: now,
      cpu: 20 + Math.random() * 10,
      ram: 40 + Math.random() * 5,
      disk: 60,
      networkIn: Math.random() * 5,
      networkOut: Math.random() * 5
    };
  }

  // Random walk
  let nextCpu = prev.cpu + (Math.random() - 0.5) * 10;
  let nextRam = prev.ram + (Math.random() - 0.5) * 2;
  let nextDisk = prev.disk + (Math.random() - 0.4) * 0.1; // Disk grows slowly

  // Clamp values
  nextCpu = Math.max(0, Math.min(100, nextCpu));
  nextRam = Math.max(0, Math.min(100, nextRam));
  nextDisk = Math.max(0, Math.min(100, nextDisk));

  // Simulate occasional spikes
  if (Math.random() > 0.95) nextCpu += 30;

  return {
    timestamp: now,
    cpu: nextCpu,
    ram: nextRam,
    disk: nextDisk,
    networkIn: Math.max(0, prev.networkIn + (Math.random() - 0.5) * 2),
    networkOut: Math.max(0, prev.networkOut + (Math.random() - 0.5) * 2)
  };
};

export class SimulationService {
  private agents: Agent[] = [...INITIAL_AGENTS];
  private alerts: Alert[] = [];
  private config: AlertConfig = {
    cpuThreshold: 80,
    ramThreshold: 90,
    diskThreshold: 85
  };
  private listeners: (() => void)[] = [];

  constructor() {
    // Pre-fill history
    this.agents.forEach(agent => {
      let lastPoint: MetricPoint | null = null;
      // Generate 50 past points
      for (let i = 50; i > 0; i--) {
        const point = generateNextPoint(lastPoint);
        point.timestamp = Date.now() - i * 2000;
        agent.history.push(point);
        lastPoint = point;
      }
    });
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public tick() {
    // Simulate receiving data from agents
    this.agents.forEach(agent => {
      const lastPoint = agent.history[agent.history.length - 1];
      const newPoint = generateNextPoint(lastPoint);
      
      // Keep history length managed (simulating DB query limits)
      if (agent.history.length > 100) agent.history.shift();
      agent.history.push(newPoint);
      agent.lastSeen = Date.now();

      // Threshold Logic (NestJS Backend Logic)
      this.checkThresholds(agent, newPoint);
    });

    this.notify();
  }

  private checkThresholds(agent: Agent, metric: MetricPoint) {
    const check = (type: 'CPU' | 'RAM' | 'DISK', val: number, threshold: number) => {
      if (val > threshold) {
        // Check if alert already exists recently to avoid spam
        const recentAlert = this.alerts.find(a => 
          a.agentId === agent.id && 
          a.type === type && 
          Date.now() - a.timestamp < 10000 // 10s cooldown
        );

        if (!recentAlert) {
          const alert: Alert = {
            id: uuid(),
            agentId: agent.id,
            agentName: agent.name,
            type,
            message: `${type} usage high: ${val.toFixed(1)}% (Threshold: ${threshold}%)`,
            severity: val > 95 ? 'critical' : 'warning',
            timestamp: Date.now()
          };
          this.alerts.unshift(alert);
          if (this.alerts.length > 50) this.alerts.pop(); // Keep list clean
          
          // Update agent status based on alert
          agent.status = alert.severity === 'critical' ? AgentStatus.CRITICAL : AgentStatus.WARNING;
        }
      } else {
        // Recovery logic (simplified)
        if (agent.status !== AgentStatus.ONLINE && 
            metric.cpu < this.config.cpuThreshold && 
            metric.ram < this.config.ramThreshold) {
             agent.status = AgentStatus.ONLINE;
        }
      }
    };

    check('CPU', metric.cpu, this.config.cpuThreshold);
    check('RAM', metric.ram, this.config.ramThreshold);
    check('DISK', metric.disk, this.config.diskThreshold);
  }

  public getAgents() { return this.agents; }
  public getAlerts() { return this.alerts; }
  public updateConfig(newConfig: AlertConfig) { this.config = newConfig; }
  public getConfig() { return this.config; }
}

export const simulation = new SimulationService();
