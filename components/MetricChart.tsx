import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricPoint } from '../types';

interface MetricChartProps {
  data: MetricPoint[];
  dataKey: keyof MetricPoint;
  color: string;
  title: string;
  unit?: string;
}

export const MetricChart: React.FC<MetricChartProps> = ({ data, dataKey, color, title, unit = '%' }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
              stroke="#9CA3AF"
              fontSize={12}
              minTickGap={30}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(val) => `${val.toFixed(0)}${unit}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F3F4F6' }}
              itemStyle={{ color: color }}
              labelFormatter={(ts) => new Date(ts).toLocaleString()}
              formatter={(value: number) => [`${value.toFixed(2)}${unit}`, title]}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
