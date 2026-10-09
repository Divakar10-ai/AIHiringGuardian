import { apiClient } from './client';

export interface DecisionEvent {
  id: number;
  candidate_id: string;
  event_type: string;
  sequence_number: number;
  actor_id: number | null;
  timestamp: string;
  payload: any;
}

export async function getDecisionReplay(candidateId: string): Promise<DecisionEvent[]> {
  return await apiClient<DecisionEvent[]>(`/api/v1/candidates/${candidateId}/decision-replay`);
}
