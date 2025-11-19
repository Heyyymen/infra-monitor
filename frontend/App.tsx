import React, { useEffect, useState } from 'react';
import { Activity, Bell, Settings, LayoutDashboard, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { simulation } from '../backend/services/simulationService';
import { analyzeAgentMetrics } from '../backend/services/geminiService';
import { Agent, Alert, ViewState } from '../shared/types';
import { AgentCard } from './components/AgentCard';
import { MetricChart } from './components/MetricChart';

export default function App() {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Simulation Tick
  useEffect(() => {
    const unsubscribe = simulation.subscribe(() => {
      setAgents([...simulation.getAgents()]);
      setAlerts([...simulation.getAlerts()]);
    });
    
    // Start loop
    const interval = setInterval(() => {
      simulation.tick();
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const handleAgentClick = (id: string) => {
    setSelectedAgentId(id);
    setView('AGENT_DETAIL');
    setAiAnalysis(null); // Reset analysis when switching
  };

  const handleAnalyze = async () => {
    if (!selectedAgent) return;
    setIsAnalyzing(true);
    const result = await analyzeAgentMetrics(selectedAgent);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-800">
          <Activity className="w-8 h-8 text-indigo-500" />
          <span className="ml-3 font-bold text-xl text-gray-100 hidden lg:block tracking-tight">SENTINEL</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${view === 'DASHBOARD' ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="ml-3 font-medium hidden lg:block">Dashboard</span>
          </button>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:block">Alerts</p>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-96 custom-scrollbar">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg text-sm border-l-2 ${alert.severity === 'critical' ? 'border-rose-500 bg-rose-500/5' : 'border-amber-500 bg-amber-500/5'}`}>
                <div className="font-semibold text-gray-300 truncate">{alert.agentName}</div>
                <div className="text-gray-500 text-xs truncate">{alert.message}</div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="px-3 text-sm text-gray-600 italic hidden lg:block">No active alerts</div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center p-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all"
          >
            <Settings className="w-6 h-6" />
            <span className="ml-3 font-medium hidden lg:block">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center md:hidden">
             <Activity className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="flex items-center space-x-4 ml-auto">
             <div className="relative">
                <Bell className="w-6 h-6 text-gray-400 hover:text-gray-200 cursor-pointer" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {alerts.length}
                  </span>
                )}
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          {/* Dashboard View */}
          {view === 'DASHBOARD' && (
            <div className="max-w-7xl mx-auto animate-fade-in">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Infrastructure Overview</h1>
                  <p className="text-gray-400">Real-time monitoring of registered nodes.</p>
                </div>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm border border-emerald-500/20">
                    {agents.filter(a => a.status === 'ONLINE').length} Online
                  </span>
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-sm border border-rose-500/20">
                    {agents.filter(a => a.status === 'CRITICAL').length} Critical
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {agents.map(agent => (
                  <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    onClick={() => handleAgentClick(agent.id)} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Detail View */}
          {view === 'AGENT_DETAIL' && selectedAgent && (
            <div className="max-w-7xl mx-auto animate-fade-in">
              <button 
                onClick={() => setView('DASHBOARD')}
                className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center">
                    {selectedAgent.name}
                    <span className={`ml-4 text-sm px-3 py-1 rounded-full border ${
                      selectedAgent.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      selectedAgent.status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {selectedAgent.status}
                    </span>
                  </h1>
                  <p className="text-gray-400 mt-1 font-mono text-sm">{selectedAgent.ip} • Last seen: just now</p>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
                </button>
              </div>

              {/* AI Insight Panel */}
              {aiAnalysis && (
                <div className="mb-8 p-6 bg-indigo-950/30 border border-indigo-500/30 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <h3 className="text-indigo-400 font-semibold mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" /> Gemini Insight
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                   <MetricChart 
                      data={selectedAgent.history} 
                      dataKey="cpu" 
                      color="#6366f1" 
                      title="CPU Usage History" 
                    />
                </div>
                <MetricChart 
                  data={selectedAgent.history} 
                  dataKey="ram" 
                  color="#8b5cf6" 
                  title="Memory Usage" 
                />
                <MetricChart 
                  data={selectedAgent.history} 
                  dataKey="disk" 
                  color="#10b981" 
                  title="Disk Usage" 
                />
                 <MetricChart 
                  data={selectedAgent.history} 
                  dataKey="networkIn" 
                  color="#0ea5e9" 
                  title="Network In" 
                  unit=" MB/s"
                />
                <MetricChart 
                  data={selectedAgent.history} 
                  dataKey="networkOut" 
                  color="#f43f5e" 
                  title="Network Out" 
                   unit=" MB/s"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal (Simplified) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Global Thresholds</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">CPU Alert Threshold (%)</label>
                <input type="range" min="0" max="100" defaultValue="80" className="w-full accent-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">RAM Alert Threshold (%)</label>
                <input type="range" min="0" max="100" defaultValue="90" className="w-full accent-purple-500" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}