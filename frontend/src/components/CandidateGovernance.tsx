import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore, type CandidateData } from '../context/DemoContext';
import { getCandidates } from '../api/candidates';
import { 
  Clock, Search, Briefcase, Filter, X, Play, CheckCircle2, UserCircle2, Activity, ShieldAlert, Plus, ArrowUpDown, ChevronRight, Users
} from 'lucide-react';
import { AddCandidate } from './AddCandidate';

export const CandidateGovernance = ({ onAction }: { onAction?: (a: string) => void }) => {

  const { updateCandidate, runDemoScenario } = useDemoStore();
  
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('Overview');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState<'Shortlist'|'Reject'|'Hold'|'Accept AI'|''>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [listTab, setListTab] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [realAuditEvents, setRealAuditEvents] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [decisionReplayEvents, setDecisionReplayEvents] = useState<any[]>([]);
  const [isLoadingReplay, setIsLoadingReplay] = useState(false);

  const fetchCandidates = async () => {
    setIsLoadingCandidates(true);
    setCandidatesError(null);
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (e: any) {
      setCandidatesError(e.message || 'Failed to fetch candidates');
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (activeDetailTab === 'Audit' && selectedCandidate) {
      const fetchAudit = async () => {
        setIsLoadingAudit(true);
        try {
          const { getCandidateAuditTrail } = await import('../api/audit');
          const data = await getCandidateAuditTrail(selectedCandidate.id);
          setRealAuditEvents(data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingAudit(false);
        }
      };
      fetchAudit();
    }
  }, [activeDetailTab, selectedCandidate?.id]);

  useEffect(() => {
    if (activeDetailTab === 'Decision Replay' && selectedCandidate) {
      const fetchReplay = async () => {
        setIsLoadingReplay(true);
        try {
          const { getDecisionReplay } = await import('../api/decisionReplay');
          const data = await getDecisionReplay(selectedCandidate.id);
          setDecisionReplayEvents(data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingReplay(false);
        }
      };
      fetchReplay();
    }
  }, [activeDetailTab, selectedCandidate?.id]);
  useEffect(() => {
    if (selectedCandidate) {
      const updated = candidates.find(c => c.id === selectedCandidate.id);
      if (updated) setSelectedCandidate(updated);
    }
  }, [candidates]);

  const handleSelectCandidate = async (candidate: CandidateData) => {
    setSelectedCandidate(candidate); // Show optimistically
    try {
      setIsLoadingDetails(true);
      const { getCandidate } = await import('../api/candidates');
      const fullDetails = await getCandidate(candidate.id);
      // Merge with evaluation data from context
      setSelectedCandidate({
        ...fullDetails,
        evaluation: candidate.evaluation,
        recommendation: candidate.recommendation,
        humanReview: candidate.humanReview
      });
    } catch (err) {
      console.error('Failed to load full details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleConfirmOverride = async () => {
    if (!selectedCandidate || !overrideDecision) return;
    if (!selectedCandidate.evaluation?.id) {
      if (onAction) onAction('toast:Missing_evaluation_ID.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { submitHumanReview } = await import('../api/evaluations');
      const aiDecision = selectedCandidate.recommendation?.status || '';
      
      let isOverride = false;
      if (overrideDecision === 'Accept AI' || overrideDecision.toUpperCase() === aiDecision.toUpperCase()) {
        isOverride = false;
      } else {
        isOverride = true;
      }

      const payloadDecision = overrideDecision === 'Accept AI' ? aiDecision : overrideDecision;

      await submitHumanReview(selectedCandidate.evaluation.id, {
        decision: payloadDecision,
        override: isOverride,
        override_reason: overrideReason || undefined
      });

      await fetchCandidates();
      
      setShowOverrideModal(false);
      setOverrideDecision('');
      setOverrideReason('');
      if (onAction) onAction('toast:Human_review_submitted_successfully');
    } catch (err: any) {
      console.error(err);
      if (onAction) onAction(`toast:Error_submitting_review_-_${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSaveCandidate = async () => {
    await fetchCandidates();
    setShowAddModal(false);
    if (onAction) onAction('toast:Candidate_created_successfully');
  };

  const runEvaluation = async () => {
    if (!selectedCandidate) return;
    setIsEvaluating(true);
    
    try {
      const { getAITools } = await import('../api/aiTools');
      const { createEvaluation } = await import('../api/evaluations');

      const tools = await getAITools();
      const approvedTool = tools.find(t => t.approval_status === 'Approved');
      
      if (!approvedTool) {
        if (onAction) onAction('toast:No_approved_AI_tools_available._Evaluation_cannot_proceed.');
        setIsEvaluating(false);
        return;
      }

      const result = await createEvaluation({
        candidate_id: selectedCandidate.id,
        ai_tool_id: parseInt(approvedTool.id, 10),
        workflow_stage: 'Screening'
      });

      // Map backend response to UI state
      const mappedEvaluation = {
        id: result.id,
        status: 'Complete' as const,
        score: Math.round(result.score * 100),
        explanation: {
          skillsMatch: 0, experienceMatch: 0, projectRelevance: 0, education: 0, certifications: 0,
          matchedSkills: result.explanation.factors_considered,
          gapSkills: []
        }
      };

      const mappedRecommendation = {
        status: result.recommendation as any,
        confidence: Math.round(result.explanation.confidence_score * 100),
        keyFactors: result.explanation.factors_considered
      };

      updateCandidate(selectedCandidate.id, {
        evaluation: mappedEvaluation,
        recommendation: mappedRecommendation
      });

      setSelectedCandidate(prev => prev ? {
        ...prev,
        evaluation: mappedEvaluation,
        recommendation: mappedRecommendation
      } : null);

      if (onAction) onAction('toast:AI_Evaluation_Completed');
    } catch (err: any) {
      console.error(err);
      if (onAction) onAction(`toast:Error_running_evaluation_${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || c.targetRole.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (listTab === 'ALL') return true;
    if (listTab === 'ACTIVE') return !c.finalDecision;
    if (listTab === 'IN REVIEW') return c.recommendation && !c.finalDecision;
    if (listTab === 'SHORTLISTED') return c.finalDecision === 'Shortlist' || c.recommendation?.status === 'SHORTLIST' || c.recommendation?.status === 'STRONG MATCH';
    if (listTab === 'ON HOLD') return c.finalDecision === 'Hold' || c.recommendation?.status === 'NOT RECOMMENDED' || c.recommendation?.status === 'REVIEW REQUIRED';
    if (listTab === 'DECIDED') return !!c.finalDecision;
    return true;
  });

  const getStage = (c: CandidateData) => {
    if (c.humanReview?.status === 'Complete') return 'Decision Made';
    if (c.recommendation) return 'Human Review';
    if (c.evaluation) return 'Recommendation';
    return 'Screening';
  };

  const getGovStatus = (c: CandidateData) => {
    if (c.humanReview?.status === 'Complete') return { label: 'Clear', color: 'text-emerald-600 bg-accent-emerald/10 border-accent-emerald/20' };
    if (c.humanReview?.status === 'Required' || c.recommendation) return { label: 'Review Required', color: 'text-amber-600 bg-accent-amber/10 border-accent-amber/20' };
    return { label: 'Pending', color: 'text-slate-600 bg-white/60 border-slate-200/60' };
  };

  const detailTabs = ['Overview', 'Profile', 'Experience', 'Skills', 'AI Evaluation', 'Recommendation', 'Human Review', 'Audit', 'Decision Replay'];
  const listTabs = ['ALL', 'ACTIVE', 'IN REVIEW', 'SHORTLISTED', 'ON HOLD', 'DECIDED'];

  return (
    <div className="bg-transparent min-h-screen flex flex-col h-full relative overflow-hidden">
      
      {showAddModal && <AddCandidate onClose={() => setShowAddModal(false)} onSave={handleSaveCandidate} />}

      {/* Override Modal */}
      <AnimatePresence>
        {showOverrideModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center pt-[5vh]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/60 backdrop-blur-sm" onClick={() => setShowOverrideModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200/40 flex justify-between items-center bg-white/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Human Accountability</h3>
                  <p className="text-sm text-slate-600">Override or accept AI recommendation</p>
                </div>
                <button onClick={() => setShowOverrideModal(false)} className="text-slate-600 hover:text-slate-900"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-3">Final Decision</p>
                  <div className="flex gap-3">
                    {['Shortlist', 'Reject', 'Hold'].map(d => (
                      <button key={d} onClick={() => setOverrideDecision(d as any)} className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${overrideDecision === d ? 'border-accent-blue bg-blue-100 text-blue-800 shadow-inner' : 'border-slate-200/60 text-slate-700 hover:bg-slate-50'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-3">Mandatory Reason for Override</p>
                  <select 
                    value={overrideReason} 
                    onChange={e => setOverrideReason(e.target.value)}
                    className="w-full mb-3 p-3 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md"
                  >
                    <option value="">Select reason...</option>
                    <option value="Insufficient evidence">Insufficient evidence</option>
                    <option value="Additional interview required">Additional interview required</option>
                    <option value="Candidate information changed">Candidate information changed</option>
                    <option value="Policy consideration">Policy consideration</option>
                    <option value="Other">Other</option>
                  </select>
                  {overrideReason === 'Other' && (
                    <textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)} className="w-full h-24 p-3 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 resize-none" placeholder="Provide detailed rationale..."></textarea>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-slate-200/40 bg-white/50 flex justify-end gap-3">
                <button onClick={() => setShowOverrideModal(false)} className="px-6 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleConfirmOverride} disabled={!overrideDecision || !overrideReason || isSubmittingReview} className="px-6 py-2.5 rounded-xl font-semibold text-slate-900 bg-white hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isSubmittingReview && <Activity className="w-4 h-4 animate-spin" />}
                  {isSubmittingReview ? 'Recording...' : 'Record Decision'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="bg-white text-slate-900 pt-10 pb-12 px-10 relative overflow-hidden shrink-0 h-48 border-b border-slate-200">
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/candidate-workplace.jpg" 
            alt="Candidate Workspace" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-blue-900/10 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-end h-full max-w-[1440px] mx-auto text-white">
          <h1 className="text-4xl font-semibold tracking-tight mb-2 drop-shadow-md">Candidates</h1>
          <p className="text-slate-200 drop-shadow-md">Manage candidates and govern AI recommendations.</p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-md border-t border-slate-200/60 relative">
        {/* Toolbar */}
        <div className="px-10 py-4 border-b border-slate-200/60 flex justify-between items-center bg-white/50 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">CANDIDATES</h2>
            <span className="text-xs text-slate-600 font-medium">{candidates.length} total candidates</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 border border-slate-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200/60 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white/60 transition-colors bg-white/80 backdrop-blur-md">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200/60 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white/60 transition-colors bg-white/80 backdrop-blur-md">
              <ArrowUpDown className="w-4 h-4" /> Sort
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-brand-deep text-slate-900 rounded-lg text-sm font-bold transition-colors shadow-md shadow-slate-200/50 ml-2">
              <Plus className="w-4 h-4" /> Add Candidate
            </button>
          </div>
        </div>

        {/* List Tabs */}
        <div className="px-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-md shrink-0 flex">
          {listTabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setListTab(tab)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider relative transition-colors ${listTab === tab ? 'text-accent-blue' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {tab}
              {listTab === tab && <motion.div layoutId="list-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {isLoadingCandidates ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <Activity className="w-10 h-10 text-slate-700 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading candidates...</p>
            </div>
          ) : candidatesError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <ShieldAlert className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Candidates</h3>
              <p className="text-slate-600 mb-6">{candidatesError}</p>
              <button onClick={() => fetchCandidates()} className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold hover:bg-brand-deep transition-colors">
                Retry
              </button>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-6 border border-slate-200/60">
                <Users className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No candidate cases yet.</h3>
              <p className="text-slate-600 max-w-md mb-8">Create your first candidate to start an AI-assisted governance workflow.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-lg hover:bg-brand-deep transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add Candidate
                </button>
                <button onClick={() => runDemoScenario()} className="px-6 py-3 bg-white/80 backdrop-blur-md border border-slate-200/60 text-slate-800 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  Load Demo Scenario
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto overflow-y-auto w-full">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-white/50 sticky top-0 z-10 border-b border-slate-200/60 shadow-md shadow-slate-200/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Role & Exp</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Skills</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">AI Match</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Recommendation</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Human Review</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map(c => {
                    const gov = getGovStatus(c);
                    return (
                      <tr key={c.id} onClick={() => handleSelectCandidate(c)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                              {c.avatar}
                            </div>
                            <div className="font-semibold text-slate-900 text-sm">{c.fullName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{c.targetRole}</div>
                          <div className="text-xs text-slate-600">{c.yearsOfExperience} yrs exp</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-700 truncate max-w-[200px]">
                            {c.skills.slice(0,3).join(' • ')}{c.skills.length > 3 ? '...' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {c.evaluation ? (
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-slate-900">{c.evaluation.score}%</div>
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-accent-blue" style={{width: `${c.evaluation.score}%`}}></div></div>
                            </div>
                          ) : <span className="text-xs text-slate-600">Pending</span>}
                        </td>
                        <td className="px-6 py-4">
                          {c.recommendation ? <span className="text-xs font-bold text-slate-900 uppercase">{c.recommendation.status}</span> : <span className="text-xs text-slate-600">--</span>}
                        </td>
                        <td className="px-6 py-4">
                          {c.humanReview ? <span className="text-xs font-medium text-slate-800">{c.humanReview.status}</span> : <span className="text-xs text-slate-600">Pending</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${gov.color}`}>{gov.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCandidates.length === 0 && (
                <div className="p-12 text-center text-slate-600">No candidates match your filters.</div>
              )}
            </div>
          )}

          {/* Right Drawer Workspace */}
          <AnimatePresence>
            {selectedCandidate && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-20" onClick={() => setSelectedCandidate(null)} />
                <motion.div 
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute right-0 top-0 bottom-0 w-[600px] bg-white/80 backdrop-blur-md shadow-2xl border-l border-slate-200/60 z-30 flex flex-col"
                >
                  {/* Drawer Header */}
                  <div className="p-6 border-b border-slate-200/40 bg-white/50 relative shrink-0">
                    <button onClick={() => setSelectedCandidate(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4 pr-12">
                      <div className="w-14 h-14 rounded-xl bg-white text-slate-900 flex items-center justify-center text-xl font-bold shadow-md">
                        {selectedCandidate.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900">{selectedCandidate.fullName}</h2>
                          {isLoadingDetails && <Activity className="w-4 h-4 text-slate-600 animate-spin" />}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-700 mt-1 font-medium">
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5"/> {selectedCandidate.targetRole}</span>
                          <span>•</span>
                          <span>Stage: <span className="text-slate-900">{getStage(selectedCandidate)}</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      {!selectedCandidate.evaluation && (
                        <button onClick={runEvaluation} disabled={isEvaluating} className="flex-1 py-2 bg-accent-blue text-slate-900 rounded-lg text-sm font-bold shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                          {isEvaluating ? <Activity className="w-4 h-4 animate-spin"/> : <Activity className="w-4 h-4"/>} 
                          {isEvaluating ? 'Evaluating...' : 'Run Prototype AI Evaluation'}
                        </button>
                      )}
                      {selectedCandidate.evaluation && (!selectedCandidate.humanReview || selectedCandidate.humanReview.status !== 'Complete') && (
                        <button onClick={() => { setActiveDetailTab('Human Review'); }} className="flex-1 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold shadow-md hover:bg-brand-deep transition-colors flex items-center justify-center gap-2">
                          Start Human Review <ChevronRight className="w-4 h-4"/>
                        </button>
                      )}
                      <button onClick={() => onAction && onAction('Replay')} className="px-4 py-2 border border-slate-200/60 bg-white/80 backdrop-blur-md text-slate-800 rounded-lg text-sm font-bold shadow-md shadow-slate-200/50 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Play className="w-4 h-4"/> Replay
                      </button>
                    </div>
                  </div>

                  {/* Drawer Tabs */}
                  <div className="flex border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-2 shrink-0 overflow-x-auto custom-scrollbar">
                    {detailTabs.map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveDetailTab(tab)}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${activeDetailTab === tab ? 'text-accent-blue' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        {tab}
                        {activeDetailTab === tab && <motion.div layoutId="drawer-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />}
                      </button>
                    ))}
                  </div>

                  {/* Drawer Content */}
                  <div className="p-6 flex-1 overflow-y-auto bg-white/80 backdrop-blur-md custom-scrollbar">
                    <AnimatePresence mode="wait">
                      
                      {activeDetailTab === 'Overview' && (
                        <motion.div key="overview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                          <div className="p-5 border border-slate-200/60 rounded-xl bg-white/50">
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Candidate Summary</h4>
                            <div className="space-y-3 text-sm text-slate-800">
                              <p className="flex justify-between border-b border-slate-200/40 pb-2"><span className="text-slate-600">Experience</span> <strong className="text-slate-900">{selectedCandidate.yearsOfExperience} years</strong></p>
                              <p className="flex justify-between border-b border-slate-200/40 pb-2"><span className="text-slate-600">Location</span> <strong className="text-slate-900">{selectedCandidate.location}</strong></p>
                              <p className="flex justify-between border-b border-slate-200/40 pb-2"><span className="text-slate-600">Contact</span> <strong className="text-slate-900">{selectedCandidate.email}</strong></p>
                              <p className="flex justify-between"><span className="text-slate-600">AI Match</span> <strong className="text-accent-blue">{selectedCandidate.evaluation?.score ? `${selectedCandidate.evaluation.score}%` : 'Pending'}</strong></p>
                            </div>
                          </div>
                          <div className="p-5 border border-slate-200/60 rounded-xl bg-white/50">
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Governance Status</h4>
                            <div className="space-y-4 text-sm text-slate-800">
                              <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/> <div><p className="font-semibold text-slate-900">Consent Recorded</p><p className="text-xs text-slate-600">{new Date(selectedCandidate.consent.timestamp || '').toLocaleDateString()}</p></div></div>
                              <div className="flex items-center gap-3">
                                {selectedCandidate.evaluation ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/> : <Clock className="w-5 h-5 text-amber-600 shrink-0"/>} 
                                <div><p className="font-semibold text-slate-900">AI Evaluation</p><p className="text-xs text-slate-600">{selectedCandidate.evaluation ? 'Completed' : 'Pending'}</p></div>
                              </div>
                              <div className="flex items-center gap-3">
                                {selectedCandidate.humanReview?.status === 'Complete' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/> : <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0"/>}
                                <div><p className="font-semibold text-slate-900">Human Review</p><p className="text-xs text-slate-600">{selectedCandidate.humanReview?.status === 'Complete' ? 'Completed' : 'Pending'}</p></div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeDetailTab === 'Profile' && (
                        <motion.div key="profile" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                          <div>
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Education</h4>
                            {selectedCandidate.education.map((edu, i) => (
                              <div key={i} className="mb-4 p-4 bg-white/50 rounded-xl border border-slate-200/40">
                                <p className="font-semibold text-slate-900">{edu.degree}</p>
                                <p className="text-sm text-slate-700">{edu.university} • {edu.graduationYear}</p>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Consent Status</h4>
                            <div className="p-4 bg-accent-emerald/5 border border-accent-emerald/20 rounded-xl text-sm text-emerald-600 font-medium flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <div>
                                <p className="font-bold text-slate-900 mb-1">Opt-in Confirmed</p>
                                <p className="text-slate-700 text-xs">Candidate has explicitly consented to AI-assisted processing.</p>
                                <p className="text-xs text-slate-600 mt-2">Recorded: {new Date(selectedCandidate.consent.timestamp || '').toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeDetailTab === 'Experience' && (
                        <motion.div key="exp" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                          {selectedCandidate.experience.map((exp, i) => (
                            <div key={i} className="p-5 border border-slate-200/60 rounded-xl bg-white/80 backdrop-blur-md shadow-md shadow-slate-200/50">
                              <h4 className="font-bold text-slate-900 text-base">{exp.jobTitle}</h4>
                              <p className="text-sm text-accent-blue font-semibold mb-3">{exp.company} • {exp.years} years</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{exp.description}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {activeDetailTab === 'Skills' && (
                        <motion.div key="skills" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                          <div>
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Identified Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedCandidate.skills.map(s => (
                                <span key={s} className="px-3 py-1.5 bg-white/50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-200/60">{s}</span>
                              ))}
                            </div>
                          </div>
                          {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Project Evidence</h4>
                              {selectedCandidate.projects.map((p: any, i: number) => (
                                <div key={i} className="p-4 border border-slate-200/60 rounded-xl bg-white/50 mb-3">
                                  <h5 className="font-bold text-slate-900 text-sm mb-1">{p.name}</h5>
                                  <p className="text-xs text-slate-700 mb-2">{p.description}</p>
                                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Tech: <span className="text-slate-700">{p.technologies}</span></p>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeDetailTab === 'AI Evaluation' && (
                        <motion.div key="aieval" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                          {selectedCandidate.evaluation ? (
                            <>
                              <div className="flex items-center justify-between p-6 bg-white/50 border border-slate-200/60 rounded-xl">
                                <div>
                                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">AI Match Score</p>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-slate-900">{selectedCandidate.evaluation.score}</span>
                                    <span className="text-sm font-bold text-slate-600">/ 100</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Confidence</p>
                                  <span className="text-2xl font-bold text-accent-blue">86%</span>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex justify-between">
                                  Explainable Factors
                                  <button className="text-xs text-accent-blue font-bold hover:underline">Why this score?</button>
                                </h4>
                                <div className="grid gap-3">
                                  {selectedCandidate.evaluation.explanation.matchedSkills?.map((factor, i) => (
                                    <div key={i} className="p-4 border border-slate-200/60 rounded-xl flex justify-between items-center bg-white/80 backdrop-blur-md shadow-md shadow-slate-200/50">
                                      <div>
                                        <p className="font-bold text-slate-900 text-sm">Factor {i + 1} <span className="text-emerald-600 ml-2 bg-accent-emerald/10 px-2 py-0.5 rounded text-xs">✓</span></p>
                                        <p className="text-xs text-slate-600 mt-1">{factor}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {(!selectedCandidate.evaluation.explanation.matchedSkills || selectedCandidate.evaluation.explanation.matchedSkills.length === 0) && (
                                    <div className="p-4 border border-slate-200/60 rounded-xl text-center bg-white/80 backdrop-blur-md shadow-md shadow-slate-200/50">
                                      <p className="text-xs text-slate-600">No factors provided.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-16 text-slate-600 bg-white/50 rounded-xl border border-slate-200/60 border-dashed">
                              <Activity className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                              <p className="font-medium">AI Evaluation pending.</p>
                              <button onClick={runEvaluation} disabled={isEvaluating} className="mt-4 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-800 rounded-lg text-sm font-bold shadow-md shadow-slate-200/50 hover:bg-slate-50 transition-colors">
                                {isEvaluating ? 'Running...' : 'Run Evaluation Now'}
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeDetailTab === 'Recommendation' && (
                        <motion.div key="rec" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                          {selectedCandidate.recommendation ? (
                            <div className="text-center py-8 bg-white/50 rounded-xl border border-slate-200/60">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">AI Recommendation — Not Final Decision</p>
                              <div className="inline-block px-8 py-4 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-md shadow-slate-200/50 mb-6">
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-wider">
                                  {selectedCandidate.recommendation.status}
                                </h3>
                              </div>
                              <p className="text-sm font-bold text-accent-blue mb-6">Confidence: {selectedCandidate.recommendation.confidence || 86}%</p>
                              
                              <div className="text-left max-w-sm mx-auto">
                                <h4 className="text-xs font-bold text-slate-600 uppercase mb-3">Why:</h4>
                                <ul className="space-y-2 text-sm font-medium text-slate-800">
                                  {selectedCandidate.recommendation.keyFactors?.map((f: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>{f}</li>
                                  ))}
                                  {(!selectedCandidate.recommendation.keyFactors || selectedCandidate.recommendation.keyFactors.length === 0) && (
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>Strong technical alignment</li>
                                  )}
                                </ul>
                              </div>
                              
                              <div className="mt-8 pt-6 border-t border-slate-200/60 px-6">
                                <button onClick={() => setActiveDetailTab('Human Review')} className="w-full py-3 bg-white text-slate-900 rounded-xl text-sm font-bold shadow-md hover:bg-brand-deep transition-colors">
                                  Review Decision
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-16 text-slate-600 bg-white/50 rounded-xl border border-slate-200/60 border-dashed">
                              <p>Evaluation must be run first.</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeDetailTab === 'Human Review' && (
                        <motion.div key="hr" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                          <div className="p-6 bg-white/50 border border-slate-200/60 rounded-xl text-center">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">AI Recommendation</p>
                            <p className="text-xl font-black text-slate-900 uppercase mb-6">{selectedCandidate.recommendation?.status || 'Pending'}</p>
                            
                            <div className="w-full h-px bg-slate-200 my-6 relative">
                              <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white/50 px-4 text-xs font-black text-slate-600 uppercase">Human Decision</div>
                            </div>

                            {selectedCandidate.humanReview?.status === 'Complete' ? (
                              <div className="text-left bg-white/80 backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-md shadow-slate-200/50 mt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Final Decision</p>
                                    <p className="text-xl font-black text-slate-900 uppercase">{selectedCandidate.humanReview.decision}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Reviewer</p>
                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 justify-end"><UserCircle2 className="w-4 h-4 text-slate-600"/> {selectedCandidate.humanReview.reviewer}</p>
                                    <p className="text-[10px] text-slate-600 mt-1">{new Date().toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="pt-4 border-t border-slate-200/40">
                                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Override Reason</p>
                                  <p className="text-sm font-medium text-slate-800 bg-white/50 p-3 rounded-lg border border-slate-200/40">"{selectedCandidate.humanReview.reason}"</p>
                                </div>
                              </div>
                            ) : selectedCandidate.recommendation ? (
                              <div className="mt-8 flex flex-col gap-3">
                                <button onClick={() => { setOverrideDecision('Accept AI'); setShowOverrideModal(true); }} className="w-full py-3 bg-white hover:bg-brand-deep text-slate-900 rounded-xl font-bold transition-colors shadow-md">
                                  Accept AI Recommendation
                                </button>
                                <button onClick={() => setShowOverrideModal(true)} className="w-full py-3 bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-slate-50 text-slate-800 rounded-xl font-bold transition-colors">
                                  Override Decision
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-600 mt-4">Awaiting AI Evaluation before review.</p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {activeDetailTab === 'Audit' && (
                        <motion.div key="audit" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Candidate Events</h3>
                          </div>
                          {isLoadingAudit ? (
                            <div className="flex items-center gap-2 text-slate-600 justify-center py-8">
                              <Activity className="w-4 h-4 animate-spin" />
                              <span className="text-sm font-semibold">Loading Audit Trail...</span>
                            </div>
                          ) : (
                            <div className="relative pl-4 border-l-2 border-slate-200/60 space-y-6">
                              {realAuditEvents.map((ev, i) => (
                                <div key={i} className="relative">
                                  <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-white ${ev.event_type.includes('HUMAN') ? 'bg-accent-blue' : 'bg-white'}`}></div>
                                  <div className="bg-white/50 border border-slate-200/60 rounded-xl p-4 shadow-md shadow-slate-200/50">
                                    <div className="flex justify-between items-start mb-1">
                                      <p className="font-bold text-slate-900 text-sm">{ev.event_type.replace(/_/g, ' ')}</p>
                                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mb-2">{ev.description}</p>
                                    <p className="text-xs font-medium text-slate-600">Actor: <span className="text-slate-800">{ev.actor_name || `ID: ${ev.actor_id}`}</span></p>
                                  </div>
                                </div>
                              ))}
                              {realAuditEvents.length === 0 && (
                                <p className="text-sm text-slate-600">No events found.</p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeDetailTab === 'Decision Replay' && (
                        <motion.div key="replay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Decision Replay</h3>
                          </div>
                          {isLoadingReplay ? (
                            <div className="flex items-center gap-2 text-slate-600 justify-center py-8">
                              <Activity className="w-4 h-4 animate-spin" />
                              <span className="text-sm font-semibold">Loading decision history...</span>
                            </div>
                          ) : (
                            <div className="relative pl-4 border-l-2 border-slate-200/60 space-y-6">
                              {decisionReplayEvents.map((ev, i) => {
                                const p = ev.payload;
                                return (
                                  <div key={i} className="relative">
                                    <div className="absolute -left-[21px] w-3 h-3 rounded-full border-2 border-white bg-white"></div>
                                    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl p-5 shadow-md shadow-slate-200/50">
                                      <div className="flex justify-between items-start mb-3">
                                        <p className="font-bold text-slate-900 text-sm">{ev.event_type.replace(/_/g, ' ')}</p>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                                      </div>
                                      
                                      {ev.event_type === 'CANDIDATE_CREATED' && (
                                        <div className="text-sm text-slate-700">
                                          <p>Name: <span className="font-semibold text-slate-900">{p.name || 'Not available'}</span></p>
                                          <p>Role: <span className="font-semibold text-slate-900">{p.target_role || 'Not available'}</span></p>
                                        </div>
                                      )}

                                      {ev.event_type === 'CONSENT_RECORDED' && (
                                        <div className="text-sm text-slate-700">
                                          <p>AI Screening Consent: <span className="font-semibold text-slate-900">{p.ai_screening_consent ? 'Opted In' : 'Opted Out'}</span></p>
                                        </div>
                                      )}

                                      {ev.event_type === 'EVALUATION_COMPLETED' && (
                                        <div className="text-sm bg-white/50 p-3 rounded-lg border border-slate-200/40 mt-2">
                                          <p className="mb-1 text-slate-600 font-semibold uppercase text-xs tracking-wider">AI Analysis</p>
                                          <p>Score: <span className="font-bold text-slate-900">{p.score !== undefined ? Math.round(p.score * 100) : 'Not available'}</span></p>
                                          <p>Recommendation: <span className="font-bold text-accent-blue">{p.recommendation || 'Not available'}</span></p>
                                          {p.ai_tool_id && <p className="text-xs text-slate-600 mt-1">Tool ID: {p.ai_tool_id}</p>}
                                        </div>
                                      )}

                                      {(ev.event_type === 'HUMAN_REVIEW_COMPLETED' || ev.event_type === 'HUMAN_OVERRIDE') && (
                                        <div className="text-sm bg-accent-blue/5 p-3 rounded-lg border border-accent-blue/10 mt-2">
                                          <p className="mb-1 text-accent-blue font-semibold uppercase text-xs tracking-wider">Human Decision</p>
                                          <p>Decision: <span className="font-bold text-slate-900">{p.decision || 'Not available'}</span></p>
                                          <p>Override: <span className="font-bold text-slate-900">{p.override ? 'YES' : 'NO'}</span></p>
                                          {p.override && p.reason && (
                                            <div className="mt-2 pt-2 border-t border-accent-blue/10">
                                              <p className="text-xs font-semibold text-slate-600 mb-1">Reason for Override:</p>
                                              <p className="italic text-slate-800">"{p.reason}"</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      <p className="text-xs font-medium text-slate-600 mt-3 pt-3 border-t border-slate-200/40">
                                        Actor ID: <span className="text-slate-700">{ev.actor_id || 'System'}</span>
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              {decisionReplayEvents.length === 0 && (
                                <p className="text-sm text-slate-600">No decision history is available for this candidate yet.</p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
