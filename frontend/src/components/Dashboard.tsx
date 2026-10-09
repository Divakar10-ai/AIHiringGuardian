import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, UsersRound, UserCheck, Activity, History, ArrowUpRight, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { getComplianceSummary, type ComplianceSummary } from '../api/compliance';

export const Dashboard = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getComplianceSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="min-h-full bg-transparent relative overflow-x-hidden text-slate-700">
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-8 py-10 pb-20">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent -mx-8 -my-6 rounded-2xl pointer-events-none z-0"></div>
          
          <div className="max-w-2xl relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/20 border border-white/30 backdrop-blur-md self-start shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase drop-shadow-md">System Operational</span>
             </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4 drop-shadow-lg">
              Enterprise Oversight for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 drop-shadow-sm">Algorithmic Hiring.</span>
            </h1>
            <p className="text-slate-200 text-lg leading-relaxed font-light drop-shadow-md">
              {(() => {
                const pendingCount = summary?.metrics.pending_reviews || 0;
                const modelCount = summary?.ai_tools.length || 0;
                return (
                  <>
                    You have <strong>{pendingCount} review{pendingCount !== 1 ? 's' : ''} pending</strong> and <strong>{modelCount} active model{modelCount !== 1 ? 's' : ''}</strong> operating within acceptable compliance thresholds. Maintain full transparency across all AI decisions.
                  </>
                );
              })()}
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4 relative z-10">
            <button onClick={() => onNavigate && onNavigate('Candidate Evaluation Event')} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 group">
              <Plus className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" /> New Evaluation
            </button>
            <button onClick={() => onNavigate && onNavigate('Audit Report')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 group border border-blue-500">
              <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" /> Generate Report
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Left Content */}
          <div className="w-full xl:w-2/3 flex flex-col gap-8">
            
            {/* Premium Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Models', value: summary?.ai_tools.length.toString() || '0', trend: '+1 this month', icon: Activity, color: 'text-blue-600', glow: 'group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]' },
                { label: 'Total Candidates', value: summary?.metrics.total_candidates.toString() || '0', trend: 'Updated today', icon: UsersRound, color: 'text-violet-400', glow: 'group-hover:shadow-[0_0_15px_rgba(167,139,250,0.2)]' },
                { label: 'Pending Reviews', value: summary?.metrics.pending_reviews.toString() || '0', trend: 'Action required', icon: UserCheck, color: 'text-amber-400', glow: 'group-hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]' },
                { label: 'Human Overrides', value: summary?.metrics.overrides.toString() || '0', trend: 'Last 30 days', icon: ShieldCheck, color: 'text-emerald-400', glow: 'group-hover:shadow-[0_0_15px_rgba(52,211,153,0.2)]' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/60 transition-all group flex flex-col justify-between ${stat.glow}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/50 group-hover:scale-110 transition-transform">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{loading ? '-' : stat.value}</p>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-[11px] font-medium text-slate-500">{stat.trend}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Workflow Visualization */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col min-h-[300px]">
              <div className="p-6 border-b border-slate-200/40 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Governance Workflow Status</h3>
                <button onClick={() => onNavigate && onNavigate('Monitoring')} className="text-xs font-bold text-blue-600 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  View Analytics <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 p-8 bg-transparent flex flex-col items-center justify-center relative group">
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
                <Activity className="w-10 h-10 text-slate-500 mb-4 relative z-10" />
                <p className="text-sm font-semibold text-slate-700 relative z-10">Monitoring metrics active and logging.</p>
                <p className="text-xs text-slate-500 mt-2 max-w-sm text-center relative z-10">
                  Select a workflow stage from the sidebar to view its detailed compliance data.
                </p>
              </div>
            </div>

          </div>

          {/* Right Sidebar: Timeline */}
          <div className="w-full xl:w-1/3 flex flex-col">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-200/40 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Audit Trail</h3>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 relative">
                {/* Timeline Line */}
                <div className="absolute left-[39px] top-6 bottom-6 w-px bg-white/60"></div>

                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-white/50 shrink-0"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-white/50 rounded w-3/4"></div>
                          <div className="h-3 bg-white/50 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !summary?.audit_activity?.length ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-slate-600 mb-3" />
                    <p className="text-sm font-medium">No recent activity.</p>
                  </div>
                ) : (
                  <div className="space-y-8 relative z-10">
                    {summary.audit_activity.slice(0, 8).map((event) => (
                      <div key={event.id} className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-transparent border-2 border-slate-200/60 flex items-center justify-center shrink-0 group-hover:border-blue-500 transition-colors shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors shadow-[0_0_10px_rgba(59,130,246,0)] group-hover:shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{event.event_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-600 leading-relaxed mb-2 font-medium">{event.description}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {new Date(event.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-slate-200/40 bg-transparent/50 text-center">
                <button onClick={() => onNavigate && onNavigate('Audit Report')} className="text-xs font-bold text-blue-600 hover:text-blue-300 uppercase tracking-widest transition-colors w-full text-center py-2 flex items-center justify-center gap-1 group">
                  View Full Audit Log <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
