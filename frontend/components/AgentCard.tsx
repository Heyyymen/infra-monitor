import React from 'react';
import { Server, Activity, Cpu, HardDrive } from 'lucide-react';
import { Agent, AgentStatus } from '../../shared/types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  const current = agent.history[agent.history.length - 1] || { cpu: 0, ram: 0, disk: 0 };
  
  const statusColor = {
    [AgentStatus.ONLINE]: 'bg-emerald-500',
    [AgentStatus.WARNING]: 'bg-amber-500',
    [AgentStatus.CRITICAL]: 'bg-rose-500',
    [AgentStatus.OFFLINE]: 'bg-gray-500',
  }[agent.status];

  const statusBorder = {
    [AgentStatus.ONLINE]: 'border-emerald-500/20 hover:border-emerald-500/50',
    [AgentStatus.WARNING]: 'border-amber-500/20 hover:border-amber-500/50',
    [AgentStatus.CRITICAL]: 'border-rose-500/20 hover:border-rose-500/50',
    [AgentStatus.OFFLINE]: 'border-gray-500/20 hover:border-gray-500/50',
  }[agent.status];

  return (
    <div 
      onClick={onClick}
      className={`bg-gray-900 border ${statusBorder} rounded-xl p-6 cursor-pointer transition-all duration-200 hover:bg-gray-800 group relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors`}>
            <Server className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <h3 className="font-bold text-gray-100 group-hover:text-white">{agent.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{agent.ip}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="uppercase">{agent.tags[0]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_8px_rgba(0,0,0,0.5)] animate-pulse`}></span>
          <span className="text-xs font-mono text-gray-400">{agent.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <MetricItem icon={<Cpu size={14} />} label="CPU" value={current.cpu} color="#6366f1" />
        <MetricItem icon={<Activity size={14} />} label="RAM" value={current.ram} color="#8b5cf6" />
        <MetricItem icon={<HardDrive size={14} />} label="DISK" value={current.disk} color="#10b981" />
      </div>

      {/* Mini Sparkline */}
      <div className="h-12 w-full opacity-50 group-hover:opacity-100 transition-opacity">
         <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={agent.history.slice(-20)}>
            <Area type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2} fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MetricItem = ({ icon, label, value, color }: any) => (
  <div className="flex flex-col">
    <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-lg font-mono font-semibold text-gray-200" style={{ color }}>
      {value.toFixed(0)}%
    </span>
  </div>
);