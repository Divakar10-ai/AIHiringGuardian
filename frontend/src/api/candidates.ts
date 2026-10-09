import { apiClient } from './client';
import type { CandidateData, Education, Experience, Project } from '../context/DemoContext';

export interface BackendConsent {
  id: number;
  candidate_id: string;
  consent_given: boolean;
  screening_notice_acknowledged: boolean;
  communication_preferences: string;
  timestamp: string;
}

export interface BackendCandidate {
  id: string;
  candidate_code: string;
  name: string;
  email: string;
  phone: string | null;
  target_role: string;
  education: string | null;
  experience: string | null;
  skills: string | null;
  projects: string | null;
  created_at: string;
  updated_at: string;
  consent_status: BackendConsent | null;
}

// Helper to safely parse JSON strings to typed arrays
function safeParse<T>(jsonStr: string | null, defaultValue: T): T {
  if (!jsonStr) return defaultValue;
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? (parsed as unknown as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Convert BackendCandidate to Frontend CandidateData
export function normalizeCandidate(backend: BackendCandidate): CandidateData {
  return {
    id: backend.id,
    fullName: backend.name,
    email: backend.email,
    phone: backend.phone || '',
    targetRole: backend.target_role,
    yearsOfExperience: '0', // Not stored in this backend version
    location: 'Unknown', // Not stored in this backend version
    avatar: backend.name.substring(0, 2).toUpperCase(),
    education: safeParse<Education[]>(backend.education, []),
    experience: safeParse<Experience[]>(backend.experience, []),
    skills: safeParse<string[]>(backend.skills, []),
    projects: safeParse<Project[]>(backend.projects, []),
    consent: {
      informed: backend.consent_status?.consent_given || false,
      recorded: backend.consent_status?.screening_notice_acknowledged || false,
      noticeReceived: backend.consent_status?.screening_notice_acknowledged || false,
      optedIn: backend.consent_status?.consent_given || false,
      timestamp: backend.consent_status?.timestamp || null,
    },
    // We leave evaluation/recommendation/humanReview empty as they will be fetched in future phases,
    // or updated separately in the context.
  };
}

export async function getCandidates(): Promise<CandidateData[]> {
  const data = await apiClient<BackendCandidate[]>('/api/v1/candidates');
  return data.map(normalizeCandidate);
}

export async function getCandidate(candidateId: string): Promise<CandidateData> {
  const data = await apiClient<BackendCandidate>(`/api/v1/candidates/${candidateId}`);
  return normalizeCandidate(data);
}

export async function createCandidate(data: any): Promise<CandidateData> {
  // Translate frontend object to backend request schema
  const payload = {
    name: data.fullName,
    email: data.email,
    phone: data.phone,
    target_role: data.targetRole,
    education: JSON.stringify(data.education || []),
    experience: JSON.stringify(data.experience || []),
    skills: JSON.stringify(data.skills || []),
    projects: JSON.stringify(data.projects || [])
  };
  
  const result = await apiClient<BackendCandidate>('/api/v1/candidates', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  return normalizeCandidate(result);
}

export async function updateCandidate(candidateId: string, data: any): Promise<CandidateData> {
  const payload = {
    name: data.fullName,
    email: data.email,
    phone: data.phone,
    target_role: data.targetRole,
    education: JSON.stringify(data.education || []),
    experience: JSON.stringify(data.experience || []),
    skills: JSON.stringify(data.skills || []),
    projects: JSON.stringify(data.projects || [])
  };

  const result = await apiClient<BackendCandidate>(`/api/v1/candidates/${candidateId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  
  return normalizeCandidate(result);
}

export async function recordConsent(candidateId: string, consentData: any): Promise<void> {
  const payload = {
    ai_screening_consent: consentData.informed,
    automated_interview_consent: consentData.recorded,
    data_retention_consent: true,
    communication_preferences: "Email"
  };

  await apiClient(`/api/v1/candidates/${candidateId}/consent`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
