import { apiClient } from './client';

export interface AIToolBase {
  id: number;
  name: string;
  vendor: string;
  purpose: string;
  version: string;
  approval_status: string;
}

export interface Policy {
  id: number;
  name: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  ai_tools: AIToolBase[];
}

export interface PolicyCreate {
  name: string;
  description?: string;
  category: string;
  status: string;
}

export async function getPolicies(): Promise<Policy[]> {
  return await apiClient<Policy[]>('/api/v1/policies');
}

export async function createPolicy(policy: PolicyCreate): Promise<Policy> {
  return await apiClient<Policy>('/api/v1/policies', {
    method: 'POST',
    body: JSON.stringify(policy),
  });
}

export async function mapPolicyToTool(policyId: number, toolId: number): Promise<Policy> {
  return await apiClient<Policy>(`/api/v1/policies/${policyId}/map-tool/${toolId}`, {
    method: 'POST',
  });
}

export async function unmapPolicyFromTool(policyId: number, toolId: number): Promise<Policy> {
  return await apiClient<Policy>(`/api/v1/policies/${policyId}/map-tool/${toolId}`, {
    method: 'DELETE',
  });
}
