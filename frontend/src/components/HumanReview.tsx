import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, AlertTriangle, ShieldCheck, 
  Cpu, ArrowRight, UserCircle2, CheckCircle2
} from 'lucide-react';
import { getEvaluations, submitHumanReview, type Evaluation } from '../api/evaluations';

export const HumanReview = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedEvalId, setSelectedEvalId] = useState<number | null>(null);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState<'Shortlist' | 'Reject' | 'Hold' | ''>('');
  const [overrideReasonCategory, setOverrideReasonCategory] = useState('');
  const [overrideReasonText, setOverrideReasonText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const evals = await getEvaluations();
        setEvaluations(evals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingEvals = evaluations.filter(e => e.status === 'PENDING_REVIEW');
  const completedEvals = evaluations.filter(e => e.status !== 'PENDING_REVIEW');
  
  const selectedEval = evaluations.find(e => e.id === selectedEvalId);

  const handleSubmitDecision = async (type: 'Accept AI' | 'Override') => {
    if (!selectedEval) return;
    setSubmitting(true);

    const isOverride = type === 'Override';
    const finalDecision = isOverride ? overrideDecision : selectedEval.recommendation;
    const finalReason = isOverride 
      ? (overrideReasonCategory === 'Other' ? overrideReasonText : overrideReasonCategory)
      : 'Agreed with AI recommendation';

    try {
      const updatedEval = await submitHumanReview(selectedEval.id, {
        decision: finalDecision,
        override: isOverride,
        override_reason: finalReason
      });
      
      // Update local state
      setEvaluations(evaluations.map(e => e.id === updatedEval.id ? updatedEval : e));
      setSelectedEvalId(null);
      setIsOverriding(false);
      setOverrideDecision('');
      setOverrideReasonCategory('');
      setOverrideReasonText('');
      
    } catch (err) {
      console.error(err);
      alert('Failed to submit review. You must have REVIEWER or ADMIN privileges.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-transparent min-h-full pb-20 relative px-8 py-8">
      <div className="max-w-[1600px] mx-auto">
      
        {/* Sleek Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">Human Review</h1>
            <p className="text-sm text-slate-100 font-medium max-w-2xl drop-shadow-md">
              Provide authorized oversight for AI screening decisions. Override model recommendations when necessary to ensure fairness and compliance.
            </p>
          </div>
        </div>

      <div className="relative z-20 flex flex-col lg:flex-row gap-8 min-h-[70vh]">
        
        {/* Left Sidebar: Queue */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200/40 bg-white/50 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-800">Pending Review ({pendingEvals.length})</h3>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="p-8 text-center text-slate-600">Loading...</div>
              ) : pendingEvals.length === 0 ? (
                <div className="p-8 text-center text-slate-600">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                  <p className="text-sm">Queue is empty</p>
                </div>
              ) : (
                pendingEvals.map(e => (
                  <button 
                    key={e.id}
                    onClick={() => { setSelectedEvalId(e.id); setIsOverriding(false); }}
                    className={`w-full text-left p-4 rounded-lg transition-all ${selectedEvalId === e.id ? 'bg-blue-50 ring-1 ring-blue-500 shadow-md shadow-slate-200/50' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <p className="font-bold text-slate-900">{e.candidate_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${e.recommendation === 'Proceed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {e.recommendation}
                      </span>
                      <span className="text-xs text-slate-600">Score: {Math.round(e.score * 100)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex-1 flex flex-col opacity-75">
            <div className="p-4 border-b border-slate-200/40 bg-white/50 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-700">Completed ({completedEvals.length})</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {completedEvals.slice(0, 5).map(e => (
                <div key={e.id} className="p-3 rounded-lg border border-slate-200/40 bg-white/50">
                  <p className="font-semibold text-sm text-slate-800">{e.candidate_name}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-slate-600">AI: {e.recommendation}</span>
                    <ArrowRight className="w-3 h-3 text-slate-700" />
                    <span className="font-bold text-slate-800">{e.human_review?.decision}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Review Workspace */}
        <div className="w-full lg:w-2/3">
          {selectedEval ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedEval.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-slate-200/60 overflow-hidden h-full flex flex-col"
              >
                <div className="bg-white/50 p-6 border-b border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedEval.candidate_name}</h2>
                    <p className="text-sm text-slate-600 font-medium">Eval ID: #{selectedEval.id}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto p-8 relative">
                  <div className="max-w-3xl mx-auto w-full space-y-8">
                    
                    {/* AI Recommendation Box */}
                    <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-md shadow-slate-200/50">
                      <div className="bg-white/50 p-4 border-b border-slate-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                          <Cpu className="w-4 h-4" /> AI RECOMMENDATION
                        </div>
                        <span className="text-xs font-semibold text-slate-600">Score: {Math.round(selectedEval.score * 100)}/100</span>
                      </div>
                      <div className="p-8 text-center bg-white/80 backdrop-blur-md">
                        <h3 className={`text-5xl font-bold tracking-tight ${selectedEval.recommendation === 'Proceed' ? 'text-accent-blue' : 'text-red-500'}`}>
                          {selectedEval.recommendation}
                        </h3>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ArrowRight className="w-6 h-6 text-slate-700 rotate-90" />
                    </div>

                    {/* Human Decision Box */}
                    <div className="border-2 border-brand-midnight rounded-2xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-md">
                      <div className="bg-white p-4 flex items-center justify-between text-slate-900">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                          <UserCircle2 className="w-4 h-4" /> HUMAN DECISION
                        </div>
                      </div>
                      <div className="p-8">
                        {!isOverriding ? (
                          <div className="flex flex-col gap-4">
                            <button 
                              disabled={submitting}
                              onClick={() => handleSubmitDecision('Accept AI')}
                              className="w-full py-4 bg-white/80 backdrop-blur-md border-2 border-slate-200/60 hover:border-accent-blue text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-5 h-5" /> Accept Recommendation
                            </button>
                            <div className="relative py-4">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/60"></div></div>
                              <div className="relative flex justify-center text-xs uppercase font-bold text-slate-600"><span className="bg-white/80 backdrop-blur-md px-4">OR</span></div>
                            </div>
                            <button 
                              onClick={() => setIsOverriding(true)}
                              className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-brand-deep transition-all shadow-md"
                            >
                              Override Recommendation
                            </button>
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Final Human Decision *</label>
                              <div className="flex gap-3">
                                {['Shortlist', 'Hold', 'Reject'].map(d => (
                                  <button key={d} onClick={() => setOverrideDecision(d as any)} className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${overrideDecision === d ? 'bg-white border-brand-midnight text-slate-900' : 'bg-white/80 backdrop-blur-md border-slate-200/80 text-slate-800 hover:bg-slate-50'}`}>
                                    {d}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Mandatory Reason *</label>
                              <select 
                                value={overrideReasonCategory} 
                                onChange={e => setOverrideReasonCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200/80 text-sm font-medium focus:ring-2 focus:ring-accent-blue outline-none bg-white/80 backdrop-blur-md mb-3"
                              >
                                <option value="">Select reason...</option>
                                <option value="Insufficient evidence">Insufficient evidence</option>
                                <option value="Additional interview required">Additional interview required</option>
                                <option value="Candidate information changed">Candidate information changed</option>
                                <option value="Policy consideration">Policy consideration</option>
                                <option value="Other">Other</option>
                              </select>
                              {overrideReasonCategory === 'Other' && (
                                <textarea 
                                  value={overrideReasonText} 
                                  onChange={e => setOverrideReasonText(e.target.value)}
                                  placeholder="Provide detailed explanation..."
                                  className="w-full px-4 py-3 rounded-lg border border-slate-200/80 text-sm focus:ring-2 focus:ring-accent-blue outline-none h-24 resize-none"
                                ></textarea>
                              )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/40">
                              <button onClick={() => setIsOverriding(false)} className="px-6 py-3 rounded-lg font-bold text-slate-700 hover:bg-white/60 transition-colors text-sm">Cancel</button>
                              <button 
                                onClick={() => handleSubmitDecision('Override')}
                                disabled={submitting || !overrideDecision || !overrideReasonCategory || (overrideReasonCategory === 'Other' && !overrideReasonText.trim())}
                                className="px-8 py-3 rounded-lg font-bold text-slate-900 bg-accent-blue hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {submitting ? 'Recording...' : 'Record Decision'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 flex flex-col items-center justify-center text-slate-600 shadow-md shadow-slate-200/50 min-h-[400px]">
              <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4 border border-slate-200/40">
                <UserCheck className="w-8 h-8 text-slate-700" />
              </div>
              <p className="font-semibold text-slate-700">Select an evaluation to review</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
