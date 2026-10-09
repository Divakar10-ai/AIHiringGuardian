import { apiClient } from './client';

export interface ComplianceMetrics {
  total_candidates: number;
  candidates_with_consent: number;
  candidates_evaluated: number;
  total_evaluations: number;
  total_reviews: number;
  overrides: number;
  accepted: number;
  pending_reviews: number;
  override_rate: number;
  decisions: {
    shortlist: number;
    hold: number;
    reject: number;
  };
}

export interface AIGovernanceTool {
  id: number;
  name: string;
  vendor: string;
  version: string;
  approval_status: string;
  risk_level: string;
  evaluations: number;
}

export interface DecisionRecord {
  candidate_id: string;
  ai_recommendation: string;
  human_decision: string;
  override: boolean;
  override_reason: string | null;
  date: string;
}

export interface AuditActivity {
  id: number;
  timestamp: string;
  event_type: string;
  description: string;
  actor: number;
  candidate_id: string | null;
}

export interface ComplianceSummary {
  metrics: ComplianceMetrics;
  ai_tools: AIGovernanceTool[];
  decisions: DecisionRecord[];
  audit_activity: AuditActivity[];
}

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  return await apiClient<ComplianceSummary>('/api/v1/compliance/summary');
}
