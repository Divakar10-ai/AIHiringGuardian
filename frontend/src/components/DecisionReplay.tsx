import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Fingerprint, 
  BrainCircuit, UserCheck, CheckCircle2
} from 'lucide-react';
import { getEvaluations, type Evaluation } from '../api/evaluations';

export const DecisionReplay = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvalId, setSelectedEvalId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const evals = await getEvaluations();
        setEvaluations(evals.filter(e => e.status !== 'PENDING_REVIEW')); // Only show completed decisions
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedEval = evaluations.find(e => e.id === selectedEvalId);

  return (
    <div className="bg-transparent min-h-full pb-20 relative px-8 py-8">
      <div className="max-w-[1600px] mx-auto">
      
        {/* Sleek Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">Decision Record</h1>
            <p className="text-sm text-slate-100 font-medium max-w-2xl drop-shadow-md">
              Trace the complete, immutable timeline of a hiring decision from AI evaluation through human oversight.
            </p>
          </div>
        </div>

      <div className="relative z-20 flex flex-col lg:flex-row gap-8 min-h-[70vh]">
        
        {/* Left Sidebar: Candidates */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200/40 bg-white/50 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-800">Completed Decisions</h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="p-8 text-center text-slate-600">Loading...</div>
              ) : evaluations.length === 0 ? (
                <div className="p-8 text-center text-slate-600">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                  <p className="text-sm">No completed decisions.</p>
                </div>
              ) : (
                evaluations.map(e => (
                  <button 
                    key={e.id}
                    onClick={() => setSelectedEvalId(e.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${selectedEvalId === e.id ? 'bg-blue-50 ring-1 ring-blue-500 shadow-md shadow-slate-200/50' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <p className="font-bold text-slate-900">{e.candidate_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-600 font-medium bg-white/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-200/60">
                        {e.human_review?.decision || e.recommendation}
                      </span>
                      <span className="text-xs text-slate-600">{new Date(e.timestamp).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Content: Timeline */}
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
                    <p className="text-sm text-slate-600 font-medium">Final Decision: {selectedEval.human_review?.decision}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      VERIFIED RECORD
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 relative">
                  <div className="max-w-2xl mx-auto space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    
                    {/* Stage 1: AI Evaluation */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-blue-200 bg-white/80 backdrop-blur-md shadow-md shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900 text-sm">AI Evaluation</h4>
                          <span className="text-[10px] font-bold text-slate-600 bg-white/60 px-2 py-0.5 rounded">{new Date(selectedEval.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">
                          Evaluated by {selectedEval.ai_tool_name} (v{selectedEval.model_version}).
                        </p>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs font-mono text-blue-800">
                          Recommendation: {selectedEval.recommendation} (Score: {Math.round(selectedEval.score * 100)})
                        </div>
                      </div>
                    </div>

                    {/* Stage 2: Human Review */}
                    {selectedEval.human_review && (
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${selectedEval.human_review.override ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border shadow-md shadow-slate-200/50 bg-white/80 backdrop-blur-md ${selectedEval.human_review.override ? 'border-amber-200' : 'border-emerald-200'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-900 text-sm">Human Review</h4>
                            <span className="text-[10px] font-bold text-slate-600 bg-white/60 px-2 py-0.5 rounded">{new Date(selectedEval.human_review.reviewed_at).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm text-slate-700 mb-2">
                            Reviewed by {selectedEval.human_review.reviewed_by}.
                          </p>
                          <div className={`p-3 rounded-lg border text-xs font-mono ${selectedEval.human_review.override ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                            {selectedEval.human_review.override ? (
                              <>
                                <span className="font-bold">OVERRIDE</span>: {selectedEval.human_review.decision}<br/>
                                Reason: {selectedEval.human_review.notes}
                              </>
                            ) : (
                              <>
                                <span className="font-bold">AGREED</span>: {selectedEval.human_review.decision}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 flex flex-col items-center justify-center text-slate-600 shadow-md shadow-slate-200/50 min-h-[400px]">
              <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4 border border-slate-200/40">
                <Fingerprint className="w-8 h-8 text-slate-700" />
              </div>
              <p className="font-semibold text-slate-700">Select a decision to view its record</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
