import { apiClient } from './client';

export interface Explanation {
  factors_considered: string[];
  confidence_score: number;
}

export interface BackendHumanReview {
  id: number;
  evaluation_id: number;
  reviewer_id: number;
  original_recommendation: string;
  final_decision: string;
  reviewed_at: string;
  reviewed_by: string | null;
  decision: string;
  notes: string | null;
  override: boolean;
  override_reason: string | null;
}

export interface Evaluation {
  id: number;
  candidate_id: string;
  ai_tool_id: number;
  workflow_stage: string | null;
  candidate_name: string | null;
  ai_tool_name: string | null;
  model_version: string | null;
  recommendation: string;
  score: number;
  explanation: Explanation;
  status: string;
  timestamp: string;
  human_review: BackendHumanReview | null;
}

export interface EvaluationCreateRequest {
  candidate_id: string;
  ai_tool_id: number;
  workflow_stage?: string;
}

export async function createEvaluation(data: EvaluationCreateRequest): Promise<Evaluation> {
  return await apiClient<Evaluation>('/api/v1/evaluations/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEvaluations(): Promise<Evaluation[]> {
  return await apiClient<Evaluation[]>('/api/v1/evaluations/');
}

export async function getEvaluation(evaluationId: number): Promise<Evaluation> {
  return await apiClient<Evaluation>(`/api/v1/evaluations/${evaluationId}`);
}

export interface HumanReviewSubmitRequest {
  decision: string;
  override: boolean;
  override_reason?: string;
}

export async function submitHumanReview(evaluationId: number, data: HumanReviewSubmitRequest): Promise<Evaluation> {
  return await apiClient<Evaluation>(`/api/v1/evaluations/${evaluationId}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
