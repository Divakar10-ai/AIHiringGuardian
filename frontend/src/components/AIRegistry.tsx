import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, X, Cpu, Search, 
  AlertTriangle, CheckCircle, Clock, Server, History, Plus, HelpCircle, Activity
} from 'lucide-react';
import { getAITools, type FrontendAITool } from '../api/aiTools';
import { AIToolRegistrationModal } from './AIToolRegistrationModal';

export const AIRegistry = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState<FrontendAITool | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  
  const [tools, setTools] = useState<FrontendAITool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTools = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAITools();
      setTools(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI Tools');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const filteredTools = tools.filter(tool => {
    if (filter === 'Risk Review' && tool.risk_level !== 'High' && tool.approval_status !== 'Pending') return false;
    else if (filter !== 'All' && filter !== 'Risk Review' && tool.approval_status !== filter) return false;
    
    if (search && !tool.name.toLowerCase().includes(search.toLowerCase()) && !tool.vendor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-transparent min-h-full pb-20 relative px-8 py-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Sleek Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">AI Tool Registration</h1>
            <p className="text-sm text-slate-100 font-medium max-w-2xl drop-shadow-md">
              Maintain a governed inventory of internal and third-party AI systems across the hiring lifecycle.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-slate-200/50 shadow-blue-500/20 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Register AI System
            </button>
          </div>
        </div>

      {/* Main Content Area */}
      <div className="relative z-20">
        
        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-slate-200/60 shadow-md shadow-slate-200/50 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <div className="flex bg-white/60 p-1 rounded-xl mr-4 border border-slate-200/60">
              <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${viewMode === 'table' ? 'bg-white/80 backdrop-blur-md shadow-md shadow-slate-200/50 text-slate-900' : 'text-slate-600 hover:text-slate-800'}`}>Table View</button>
              <button onClick={() => setViewMode('matrix')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${viewMode === 'matrix' ? 'bg-white/80 backdrop-blur-md shadow-md shadow-slate-200/50 text-slate-900' : 'text-slate-600 hover:text-slate-800'}`}>Risk Matrix</button>
            </div>
            {['All', 'Approved', 'Pending', 'Unapproved', 'Risk Review'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  filter === f 
                    ? 'bg-white text-slate-900 shadow-md' 
                    : 'bg-transparent text-slate-600 hover:bg-white/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-accent-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Search models, vendors..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all"
              />
            </div>
          </div>
        </div>

        {/* View Content */}
        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-md shadow-slate-200/50 overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
            <Activity className="w-10 h-10 text-slate-700 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading AI Systems...</p>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-md shadow-slate-200/50 overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="w-10 h-10 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Registry</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-md shadow-slate-200/50 overflow-hidden min-h-[500px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 border-b border-slate-200/40 text-xs text-slate-600 uppercase tracking-widest font-semibold">
                    <th className="px-6 py-4">AI System</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Purpose</th>
                    <th className="px-6 py-4">Lifecycle Stage</th>
                    <th className="px-6 py-4">Governance Status</th>
                    <th className="px-6 py-4">Risk</th>
                    <th className="px-6 py-4">Last Reviewed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredTools.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-600">No AI systems match your criteria.</td>
                      </tr>
                    ) : filteredTools.map((tool) => (
                      <motion.tr 
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedTool(tool)}
                        className="group hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                              <Cpu className="h-4 w-4 text-slate-900" />
                            </div>
                            <p className="font-semibold text-slate-900 group-hover:text-accent-blue transition-colors">
                              {tool.name} <span className="text-xs text-slate-600 font-normal ml-1">{tool.version}</span>
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{tool.vendor}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 truncate max-w-[200px]">{tool.purpose}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-800 bg-white/60 px-3 py-1 rounded-md">{tool.hiring_stage}</span>
                        </td>
                        <td className="px-6 py-4">
                          {tool.approval_status === 'Approved' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3" /> Approved</span>}
                          {tool.approval_status === 'Pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-900"><Clock className="h-3 w-3" /> Pending</span>}
                          {tool.approval_status === 'Unapproved' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3" /> Unapproved</span>}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center justify-center text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest ${
                             tool.risk_level === 'Low' ? 'text-emerald-600 bg-accent-emerald/5' :
                             tool.risk_level === 'Medium' ? 'text-amber-600 bg-accent-amber/5' :
                             'text-red-600 bg-accent-red/5'
                           }`}>
                            {tool.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {tool.last_review}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Risk Matrix View */
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-md shadow-slate-200/50 p-12 min-h-[600px] flex flex-col items-center justify-center relative">
            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center">AI Model Risk Matrix</h3>
            
            <div className="relative w-full max-w-3xl aspect-square bg-white/50 border-l-2 border-b-2 border-slate-200/80 rounded-tr-xl">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-600 uppercase tracking-widest">Impact</div>
              <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Likelihood</div>
              
              {/* Grid lines */}
              <div className="absolute top-0 bottom-0 left-1/3 w-px bg-slate-200" />
              <div className="absolute top-0 bottom-0 left-2/3 w-px bg-slate-200" />
              <div className="absolute left-0 right-0 top-1/3 h-px bg-slate-200" />
              <div className="absolute left-0 right-0 top-2/3 h-px bg-slate-200" />

              {/* Labels */}
              <div className="absolute bottom-2 left-2 text-[10px] font-bold text-slate-600 uppercase">Low</div>
              <div className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-600 uppercase">High</div>
              <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-600 uppercase">High</div>

              {/* Data Points */}
              {filteredTools.map(tool => (
                <motion.div
                  key={tool.id}
                  className="absolute group cursor-pointer"
                  style={{ left: `${tool.impact}%`, bottom: `${tool.likelihood}%`, x: '-50%', y: '50%' }}
                  onClick={() => setSelectedTool(tool)}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 ${
                    tool.risk_level === 'High' ? 'bg-accent-red text-slate-900 border-white' :
                    tool.risk_level === 'Medium' ? 'bg-accent-amber text-slate-900 border-white' :
                    'bg-accent-emerald text-slate-900 border-white'
                  }`}>
                    <Cpu className="w-3 h-3" />
                  </div>
                  
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white text-slate-900 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-20 flex flex-col items-center">
                    <span>{tool.name}</span>
                    <span className="text-[10px] text-slate-600 font-normal mt-1">Risk: {tool.risk_level}</span>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide-in Detail Drawer */}
      <AnimatePresence>
        {selectedTool && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTool(null)}
              className="fixed inset-0 bg-white/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-transparent shadow-2xl z-50 flex flex-col border-l border-slate-200/60"
            >
              <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/40 px-8 py-6 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-accent-blue"/> System Detail
                </h3>
                <button onClick={() => setSelectedTool(null)} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 bg-white/80 backdrop-blur-md">
                <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-200/40">
                  <div>
                    <h2 className="text-3xl font-semibold text-slate-900 leading-tight mb-2">{selectedTool.name}</h2>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-slate-800 bg-white/60 px-2 py-1 rounded">{selectedTool.version}</span>
                      <span className="text-slate-600">{selectedTool.vendor}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    selectedTool.approval_status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-accent-emerald/20' :
                    selectedTool.approval_status === 'Pending' ? 'bg-amber-100 text-amber-900 border-accent-amber/20' :
                    'bg-red-100 text-red-800 border-accent-red/20'
                  }`}>
                    {selectedTool.approval_status === 'Approved' && <CheckCircle className="w-4 h-4" />}
                    {selectedTool.approval_status === 'Pending' && <Clock className="w-4 h-4" />}
                    {selectedTool.approval_status === 'Unapproved' && <AlertTriangle className="w-4 h-4" />}
                    {selectedTool.approval_status}
                  </div>
                </div>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Overview & Purpose</h4>
                    <p className="text-slate-800 leading-relaxed bg-white/50 p-4 rounded-xl border border-slate-200/40">
                      {selectedTool.purpose}
                    </p>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Usage & Integration</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-slate-200/40 rounded-xl p-4">
                        <p className="text-xs text-slate-600 mb-1 font-medium">Lifecycle Stage</p>
                        <p className="font-semibold text-slate-900 flex items-center gap-2"><Activity className="w-4 h-4 text-slate-600" /> {selectedTool.hiring_stage}</p>
                      </div>
                      <div className="border border-slate-200/40 rounded-xl p-4">
                        <p className="text-xs text-slate-600 mb-1 font-medium">Where it influences hiring</p>
                        <p className="text-sm text-slate-900">Evaluates candidates during the {selectedTool.hiring_stage.toLowerCase()} process.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Governance & Ownership</h4>
                    <div className="border border-slate-200/40 rounded-xl divide-y divide-slate-100">
                      <div className="p-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Owner</span>
                        <span className="text-sm font-semibold text-slate-900">{selectedTool.owner}</span>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Last Review Date</span>
                        <span className="text-sm font-semibold text-slate-900">{selectedTool.last_review}</span>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Policies Applied</span>
                        <span className="text-sm font-semibold text-accent-blue">Global AI Hiring Policy</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 flex justify-between">
                      Risk Profile
                      <span className={`text-xs ${selectedTool.risk_level === 'High' ? 'text-red-600' : selectedTool.risk_level === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>{selectedTool.risk_level} Risk</span>
                    </h4>
                    <div className="bg-white/50 border border-slate-200/40 rounded-xl p-4 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">Known Concerns</p>
                        <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
                          {selectedTool.known_concerns.map((concern, idx) => <li key={idx}>{concern}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">Controls in Place</p>
                        <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
                          {selectedTool.controls.map((control, idx) => <li key={idx}>{control}</li>)}
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Audit & Recent Events</h4>
                    <div className="space-y-3">
                      {selectedTool.recent_events.map((event, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <History className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                          <span className="text-slate-800">{event}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-6 bg-white/50 border-t border-slate-200/60 shrink-0 space-y-3">
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-white/80 backdrop-blur-md border border-slate-200/80 hover:border-slate-400 text-slate-800 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-slate-200/50">
                    <History className="w-4 h-4" /> View Model History
                  </button>
                  <button className="flex-1 py-3 bg-white/80 backdrop-blur-md border border-slate-200/80 hover:border-slate-400 text-slate-800 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-slate-200/50">
                    <ShieldCheck className="w-4 h-4" /> Run Risk Review
                  </button>
                </div>
                <button onClick={() => document.dispatchEvent(new CustomEvent('open-assistant'))} className="w-full py-3 bg-white hover:bg-brand-deep text-slate-900 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-md">
                  <HelpCircle className="w-4 h-4" /> Ask Hiring Guardian
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>

      <AIToolRegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTools} 
      />
    </div>
  );
};
