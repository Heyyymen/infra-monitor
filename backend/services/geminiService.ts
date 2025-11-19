import { GoogleGenAI } from "@google/genai";
import { Agent, MetricPoint } from "../../shared/types";

// Helper to format metrics for the prompt
const formatMetricsForPrompt = (agent: Agent): string => {
  // Take last 20 points to avoid token overflow
  const recentHistory = agent.history.slice(-20);
  
  const dataStr = recentHistory.map(m => 
    `[${new Date(m.timestamp).toISOString().split('T')[1]}] CPU:${m.cpu.toFixed(1)}% RAM:${m.ram.toFixed(1)}% Disk:${m.disk.toFixed(1)}%`
  ).join('\n');

  return `
Agent Name: ${agent.name}
IP: ${agent.ip}
Status: ${agent.status}

Recent Metrics (Last 20 intervals):
${dataStr}
  `;
};

export const analyzeAgentMetrics = async (agent: Agent): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure the backend/environment.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are a Senior DevOps Site Reliability Engineer. 
      Analyze the following server metrics log. 
      Identify any trends, potential memory leaks, CPU spikes, or irregularities.
      Be concise and professional.
      If everything looks normal, say so.
      
      ${formatMetricsForPrompt(agent)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful DevOps assistant. Output plain text, max 2 paragraphs.",
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to analyze metrics. Please try again later.";
  }
};