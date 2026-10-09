import { apiClient } from './client';

export interface AuditLog {
  id: number;
  timestamp: string;
  event_type: string;
  description: string;
  candidate_id: string | null;
  ai_tool_id: number | null;
  evaluation_id: number | null;
  actor_id: number;
  actor_name: string | null;
  metadata_json: any | null;
}

export async function getCandidateAuditTrail(candidateId: string): Promise<AuditLog[]> {
  return await apiClient<AuditLog[]>(`/api/v1/audit/?candidate_id=${candidateId}`);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return await apiClient<AuditLog[]>('/api/v1/audit/');
}
