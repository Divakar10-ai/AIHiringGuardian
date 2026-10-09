import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCandidates } from '../api/candidates';
import { useAuth } from './AuthContext';

export interface Education {
  degree: string;
  university: string;
  graduationYear: string;
  fieldOfStudy: string;
}

export interface Experience {
  company: string;
  jobTitle: string;
  years: string;
  description: string;
}

export interface Project {
  projectName: string;
  description: string;
  technologies: string;
  role: string;
}

export interface EvaluationData {
  id: number;
  status: 'Pending' | 'Complete';
  score: number;
  explanation: {
    skillsMatch: number;
    experienceMatch: number;
    projectRelevance: number;
    education: number;
    certifications: number;
    matchedSkills: string[];
    gapSkills: string[];
  };
}

export interface RecommendationData {
  status: 'STRONG MATCH' | 'SHORTLIST' | 'REVIEW REQUIRED' | 'NOT RECOMMENDED';
  confidence: number;
  keyFactors: string[];
}

export interface HumanReviewData {
  status: 'Pending' | 'Complete' | 'Required';
  decision: 'Shortlist' | 'Reject' | 'Hold' | 'Accept AI' | '';
  reason: string;
  reviewer: string;
}

export interface CandidateData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  targetRole: string;
  yearsOfExperience: string;
  location: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  consent: {
    informed: boolean;
    recorded: boolean;
    noticeReceived: boolean;
    optedIn: boolean;
    timestamp: string | null;
  };
  evaluation?: EvaluationData;
  recommendation?: RecommendationData;
  humanReview?: HumanReviewData;
  finalDecision?: string;
  avatar: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  candidateId: string;
  candidateName: string;
  actor: string;
  action: string;
  aiModel?: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

interface DemoContextType {
  candidates: CandidateData[];
  auditEvents: AuditEvent[];
  isLoadingCandidates: boolean;
  candidatesError: string | null;
  addCandidate: (candidate: CandidateData) => void;
  updateCandidate: (id: string, updates: Partial<CandidateData>) => void;
  addAuditEvent: (event: Omit<AuditEvent, 'id'>) => void;
  resetDemoData: () => void;
  runDemoScenario: () => void;
  refreshCandidates: () => Promise<void>;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const ROLE_REQUIREMENTS: Record<string, { requiredSkills: string[], preferredSkills: string[], minExperience: number, educationPreference: string }> = {
  'Software Engineer': { requiredSkills: ['Java', 'Spring Boot', 'SQL'], preferredSkills: ['AWS', 'Docker'], minExperience: 3, educationPreference: 'Computer Science' },
  'Backend Developer': { requiredSkills: ['Node.js', 'Python', 'SQL', 'REST APIs'], preferredSkills: ['AWS', 'Kubernetes'], minExperience: 4, educationPreference: 'Computer Science' },
  'Frontend Developer': { requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML'], preferredSkills: ['Next.js', 'Framer Motion'], minExperience: 2, educationPreference: 'Computer Science or Design' },
  'Data Scientist': { requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Pandas'], preferredSkills: ['TensorFlow', 'PyTorch'], minExperience: 3, educationPreference: 'Statistics or Computer Science' },
  'ML Engineer': { requiredSkills: ['Python', 'PyTorch', 'AWS', 'Docker'], preferredSkills: ['Kubernetes', 'MLflow'], minExperience: 4, educationPreference: 'Computer Science' },
  'DevOps Engineer': { requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], preferredSkills: ['Terraform', 'Ansible'], minExperience: 4, educationPreference: 'Computer Science' }
};

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  const refreshCandidates = async () => {
    if (!isAuthenticated) return;
    setIsLoadingCandidates(true);
    setCandidatesError(null);
    try {
      const { getEvaluations } = await import('../api/evaluations');
      const [data, evaluationsData] = await Promise.all([
        getCandidates(),
        getEvaluations().catch(() => []) // Fallback in case of error
      ]);

      setCandidates(prev => {
        return data.map(newCand => {
          const existing = prev.find(p => p.id === newCand.id);
          
          // Find the latest evaluation for this candidate from the backend
          const candidateEvals = evaluationsData.filter(e => e.candidate_id === newCand.id);
          const latestEval = candidateEvals.length > 0 ? candidateEvals[candidateEvals.length - 1] : null;

          let mappedEvaluation = existing?.evaluation;
          let mappedRecommendation = existing?.recommendation;

          let mappedHumanReview = existing?.humanReview;
          let mappedFinalDecision = existing?.finalDecision;

          if (latestEval) {
            mappedEvaluation = {
              id: latestEval.id,
              status: 'Complete',
              score: Math.round(latestEval.score * 100),
              explanation: {
                skillsMatch: 0, experienceMatch: 0, projectRelevance: 0, education: 0, certifications: 0,
                matchedSkills: latestEval.explanation.factors_considered,
                gapSkills: []
              }
            };

            mappedRecommendation = {
              status: latestEval.recommendation as any,
              confidence: Math.round(latestEval.explanation.confidence_score * 100),
              keyFactors: latestEval.explanation.factors_considered
            };

            if (latestEval.human_review) {
              mappedHumanReview = {
                status: 'Complete',
                decision: latestEval.human_review.final_decision as any,
                reason: latestEval.human_review.override_reason || latestEval.human_review.notes || '',
                reviewer: latestEval.human_review.reviewed_by || 'Unknown Reviewer',
              };
              mappedFinalDecision = latestEval.human_review.final_decision;
            }
          }

          return {
            ...newCand,
            evaluation: mappedEvaluation,
            recommendation: mappedRecommendation,
            humanReview: mappedHumanReview,
            finalDecision: mappedFinalDecision
          };
        });
      });
    } catch (err: any) {
      setCandidatesError(err.message || 'Failed to fetch candidates');
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => {
    refreshCandidates();
  }, [isAuthenticated]);

  const addCandidate = (candidate: CandidateData) => {
    setCandidates(prev => [...prev, candidate]);
  };

  const updateCandidate = (id: string, updates: Partial<CandidateData>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addAuditEvent = (event: Omit<AuditEvent, 'id'>) => {
    const newEvent: AuditEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    setAuditEvents(prev => [newEvent, ...prev]);
  };

  const resetDemoData = () => {
    setCandidates([]);
    setAuditEvents([]);
    refreshCandidates();
  };

  const runDemoScenario = () => {
    setAuditEvents([
      { id: 'a1', timestamp: new Date().toISOString(), candidateId: 'demo-1', candidateName: 'Priya Sharma', actor: 'System', action: 'Candidate Created', severity: 'Info' },
      { id: 'a2', timestamp: new Date().toISOString(), candidateId: 'demo-1', candidateName: 'Priya Sharma', actor: 'System', action: 'Consent Recorded', severity: 'Info' },
      { id: 'a3', timestamp: new Date().toISOString(), candidateId: 'demo-1', candidateName: 'Priya Sharma', actor: 'ResumeAI v2.1', action: 'AI Evaluation Completed', aiModel: 'ResumeAI v2.1', severity: 'Info' }
    ]);
  };

  return (
    <DemoContext.Provider value={{ 
      candidates, 
      auditEvents, 
      isLoadingCandidates, 
      candidatesError, 
      addCandidate, 
      updateCandidate, 
      addAuditEvent, 
      resetDemoData, 
      runDemoScenario,
      refreshCandidates
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoStore = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoStore must be used within a DemoProvider');
  }
  return context;
};
