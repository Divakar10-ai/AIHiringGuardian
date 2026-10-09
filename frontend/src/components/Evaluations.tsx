import { useState, useEffect } from 'react';
import { Cpu, CheckCircle, Play, FileText } from 'lucide-react';

import { getCandidates } from '../api/candidates';
import type { CandidateData } from '../context/DemoContext';
import { getAITools, type FrontendAITool } from '../api/aiTools';
import { getEvaluations, createEvaluation, type Evaluation } from '../api/evaluations';

export function Evaluations() {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [aiTools, setAiTools] = useState<FrontendAITool[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [evaluationType, setEvaluationType] = useState<string>('Screening');
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, t, e] = await Promise.all([getCandidates(), getAITools(), getEvaluations()]);
        setCandidates(c);
        setAiTools(t);
        setEvaluations(e);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRunEvaluation = async () => {
    if (!selectedCandidateId || !selectedToolId) return;
    setIsEvaluating(true);
    try {
      const newEval = await createEvaluation({
        candidate_id: selectedCandidateId,
        ai_tool_id: parseInt(selectedToolId),
        workflow_stage: evaluationType
      });
      setEvaluations([...evaluations, newEval]);
    } catch (err) {
      console.error(err);
      alert('Failed to run evaluation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const candidateEvals = evaluations.filter(e => {
    const candidateMatch = selectedCandidateId ? e.candidate_id === selectedCandidateId : false;
    const toolMatch = selectedToolId ? e.ai_tool_id === parseInt(selectedToolId) : true;
    return candidateMatch && toolMatch;
  });
  const recentEvaluation = candidateEvals.length > 0 ? candidateEvals[candidateEvals.length - 1] : null;

  return (
    <div className="bg-transparent min-h-full pb-20 relative px-8 py-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Sleek Header */}
        <div className="flex flex-col justify-end mb-8 relative">
          <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg max-w-3xl">
            <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">Candidate Evaluation Event</h1>
            <p className="text-sm text-slate-200 font-medium drop-shadow-md">
              Run AI evaluations on candidates and see exactly what the model considered, scored, and recommended.
            </p>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Create Evaluation Panel */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-6 flex flex-col min-h-[500px]">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Play className="w-4 h-4 text-blue-600"/> Run Evaluation
            </h3>
            {loading ? (
               <div className="animate-pulse flex-1 bg-slate-100 rounded-lg"></div>
            ) : (
              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Select Candidate</label>
                  <select value={selectedCandidateId} onChange={e => setSelectedCandidateId(e.target.value)} className="w-full rounded-md border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-white text-slate-900 hover:bg-slate-50 transition-colors">
                    <option value="">-- Choose Candidate --</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Select AI Tool</label>
                  <select value={selectedToolId} onChange={e => setSelectedToolId(e.target.value)} className="w-full rounded-md border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-white text-slate-900 hover:bg-slate-50 transition-colors">
                    <option value="">-- Choose AI Tool --</option>
                    {aiTools.map(t => <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Evaluation Type</label>
                  <select value={evaluationType} onChange={e => setEvaluationType(e.target.value)} className="w-full rounded-md border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-white text-slate-900 hover:bg-slate-50 transition-colors">
                    <option value="Screening">Screening</option>
                    <option value="Technical Assessment">Technical Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Final Review">Final Review</option>
                  </select>
                </div>
              </div>
            )}
            <div className="pt-6 mt-6 border-t border-slate-200/60">
              <button 
                disabled={!selectedCandidateId || !selectedToolId || isEvaluating}
                onClick={handleRunEvaluation}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
              >
                {isEvaluating ? 'Running...' : <><Play className="w-4 h-4" /> Execute AI Evaluation</>}
              </button>
            </div>
          </div>

          {/* Column 2: Latest Result */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-6 flex flex-col min-h-[500px]">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Latest Result</h3>
            {!recentEvaluation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                  <Cpu className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-semibold">No evaluations run yet.</p>
                <p className="text-sm mt-1 text-center px-4">Select a candidate and run an evaluation to see results.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-36 h-36 rounded-full border-[8px] border-blue-50 flex flex-col items-center justify-center mb-8 shadow-inner relative overflow-hidden bg-white">
                   <div className="absolute inset-0 border-4 border-blue-500 rounded-full opacity-30 m-1"></div>
                   <div className="relative z-10 flex flex-col items-center">
                     <span className="text-4xl font-black text-slate-900">{recentEvaluation.score != null ? Math.round(recentEvaluation.score * 100) : '-'}</span>
                     <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">/ 100</span>
                   </div>
                </div>
                <div className="w-full space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</span>
                     <span className="text-sm font-bold text-slate-900 text-right">{recentEvaluation.candidate_name}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Tool</span>
                     <span className="text-sm font-bold text-slate-900 text-right">{recentEvaluation.ai_tool_name}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Version</span>
                     <span className="text-sm font-bold text-slate-900 text-right">{recentEvaluation.model_version || '1.0'}</span>
                   </div>
                   <div className="flex justify-between items-center pb-3">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</span>
                     <span className="text-sm font-bold text-slate-900 text-right">{new Date(recentEvaluation.timestamp).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Factors Considered & Recommendation */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-6 flex flex-col min-h-[500px]">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
               <FileText className="w-4 h-4 text-blue-600"/> Factors & Recommendation
            </h3>
            {!recentEvaluation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <p className="font-semibold text-center">Results will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 max-h-[250px]">
                  {recentEvaluation.explanation?.factors_considered?.length > 0 ? recentEvaluation.explanation.factors_considered.map((factor, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200/60 shadow-sm">
                       <div className="flex items-start gap-2 flex-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm font-semibold text-slate-700 leading-snug">{factor}</span>
                       </div>
                       <div className="shrink-0 ml-3">
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm uppercase tracking-wider">Score N/A</span>
                       </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-lg border border-slate-100">No specific factors provided by this model.</p>
                  )}
                </div>
                
                <div className={`mt-auto p-5 rounded-xl border ${recentEvaluation.recommendation === 'Proceed' || recentEvaluation.recommendation === 'Shortlist' ? 'bg-emerald-50 border-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.1)]' : 'bg-amber-50 border-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.1)]'}`}>
                   <h4 className={`text-xs font-bold uppercase tracking-widest mb-1 ${recentEvaluation.recommendation === 'Proceed' || recentEvaluation.recommendation === 'Shortlist' ? 'text-emerald-600' : 'text-amber-600'}`}>AI Recommendation</h4>
                   <p className={`text-2xl font-black ${recentEvaluation.recommendation === 'Proceed' || recentEvaluation.recommendation === 'Shortlist' ? 'text-emerald-700' : 'text-amber-700'}`}>{recentEvaluation.recommendation}</p>
                   <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-3 border-t border-black/5">
                      <span>Eval ID: #{recentEvaluation.id}</span>
                      <span className="flex items-center gap-1 cursor-help" title="Confidence Score">Confidence: {recentEvaluation.explanation?.confidence_score != null ? `${Math.round(recentEvaluation.explanation.confidence_score * 100)}%` : 'N/A'}</span>
                   </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
