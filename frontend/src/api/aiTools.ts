import { apiClient } from './client';

export interface FrontendAITool {
  id: string;
  name: string;
  vendor: string;
  version: string;
  hiring_stage: string;
  risk_level: 'High' | 'Medium' | 'Low';
  approval_status: 'Approved' | 'Pending' | 'Unapproved';
  governance_score: number;
  last_review: string;
  purpose: string;
  impact: number;
  likelihood: number;
  owner: string;
  known_concerns: string[];
  controls: string[];
  recent_events: string[];
}

export interface BackendAITool {
  id: number;
  name: string;
  vendor: string;
  purpose: string;
  version: string;
  approval_status: string;
  hiring_stage: string | null;
  risk_level: string | null;
  created_at: string;
  updated_at: string;
}

export function normalizeAITool(tool: BackendAITool): FrontendAITool {
  const riskMapping: Record<string, 'High' | 'Medium' | 'Low'> = {
    'High': 'High',
    'Medium': 'Medium',
    'Low': 'Low'
  };

  const statusMapping: Record<string, 'Approved' | 'Pending' | 'Unapproved'> = {
    'Approved': 'Approved',
    'Pending Review': 'Pending',
    'Rejected': 'Unapproved',
    'Pending': 'Pending',
    'Unapproved': 'Unapproved'
  };

  const risk = riskMapping[tool.risk_level || 'Medium'] || 'Medium';

  return {
    id: tool.id.toString(),
    name: tool.name || 'Unknown Tool',
    vendor: tool.vendor || 'Unknown Vendor',
    version: tool.version || 'v1.0',
    hiring_stage: tool.hiring_stage || 'General',
    risk_level: risk,
    approval_status: statusMapping[tool.approval_status] || 'Pending',
    purpose: tool.purpose || 'No purpose specified.',
    
    // Default values for fields not present in backend
    governance_score: tool.approval_status === 'Approved' ? 90 : 50,
    last_review: tool.updated_at ? new Date(tool.updated_at).toISOString().split('T')[0] : 'Unknown',
    impact: risk === 'High' ? 80 : risk === 'Medium' ? 50 : 20,
    likelihood: risk === 'High' ? 70 : risk === 'Medium' ? 40 : 15,
    owner: 'Unassigned',
    known_concerns: [],
    controls: ['Standard AI Compliance Review'],
    recent_events: ['Added to AI Registry']
  };
}

export async function getAITools(): Promise<FrontendAITool[]> {
  const tools = await apiClient<BackendAITool[]>('/api/v1/ai-tools');
  return tools.map(normalizeAITool);
}

export async function getAITool(toolId: number | string): Promise<FrontendAITool> {
  const tool = await apiClient<BackendAITool>(`/api/v1/ai-tools/${toolId}`);
  return normalizeAITool(tool);
}

export interface CreateAIToolPayload {
  name: string;
  vendor: string;
  purpose: string;
  version: string;
  approval_status: string;
  hiring_stage?: string;
  risk_level?: string;
}

export async function createAITool(payload: CreateAIToolPayload): Promise<FrontendAITool> {
  const tool = await apiClient<BackendAITool>('/api/v1/ai-tools', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return normalizeAITool(tool);
}
