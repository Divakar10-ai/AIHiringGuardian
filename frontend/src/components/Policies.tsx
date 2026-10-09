import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Plus, X, Link as LinkIcon, Unlink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPolicies, createPolicy, mapPolicyToTool, unmapPolicyFromTool, type Policy } from '../api/policies';
import { getAITools, type FrontendAITool } from '../api/aiTools';
import { useAuth } from '../context/AuthContext';

export function Policies() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [availableTools, setAvailableTools] = useState<FrontendAITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activePolicyId, setActivePolicyId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Mapping state
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', status: 'ACTIVE' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [policiesData, toolsData] = await Promise.all([getPolicies(), getAITools()]);
      setPolicies(policiesData);
      setAvailableTools(toolsData);
      if (policiesData.length > 0 && !activePolicyId) {
        setActivePolicyId(policiesData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredPolicies = policies.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );
  const activePolicyData = policies.find(p => p.id === activePolicyId);


  const handleMapTool = async (policyId: number) => {
    if (!selectedToolId) return;
    setMapLoading(true);
    setMapError('');
    try {
      const updatedPolicy = await mapPolicyToTool(policyId, parseInt(selectedToolId, 10));
      setPolicies(prev => prev.map(p => p.id === policyId ? updatedPolicy : p));
      setSelectedToolId('');
    } catch (err: any) {
      setMapError(err.message || 'Failed to map tool');
    } finally {
      setMapLoading(false);
    }
  };

  const handleUnmapTool = async (policyId: number, toolId: number) => {
    setMapLoading(true);
    setMapError('');
    try {
      const updatedPolicy = await unmapPolicyFromTool(policyId, toolId);
      setPolicies(prev => prev.map(p => p.id === policyId ? updatedPolicy : p));
    } catch (err: any) {
      setMapError(err.message || 'Failed to unmap tool');
    } finally {
      setMapLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const newPolicy = await createPolicy(formData);
      setPolicies(prev => [...prev, newPolicy]);
      setActivePolicyId(newPolicy.id);
      setShowForm(false);
      setFormData({ name: '', description: '', category: '', status: 'ACTIVE' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create policy');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="bg-transparent min-h-full pb-20 relative px-8 py-8">
      <div className="max-w-[1600px] mx-auto">
      
        {/* Sleek Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">Policy Mapping</h1>
            <p className="text-sm text-slate-100 font-medium max-w-2xl drop-shadow-md">
              Define regulatory policies and bind them to active hiring models to ensure automated compliance.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {user?.role === 'ADMIN' && (
              <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-slate-200/50 shadow-blue-500/20 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Policy
              </button>
            )}
          </div>
        </div>

      <div className="relative z-20">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          
          {/* Policy List Sidebar */}
          <div className="w-full md:w-1/3 bg-white/50 border-r border-slate-200/60 flex flex-col">
            <div className="p-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">Policy Library</h2>
                {user?.role === 'ADMIN' && (
                  <button 
                    onClick={() => setShowForm(true)}
                    className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                    title="Add Policy"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="text" 
                  placeholder="Search policy library..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" 
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="text-center text-slate-600 py-10">Loading policies...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
              ) : filteredPolicies.length === 0 ? (
                <div className="text-center text-slate-600 py-10">No policies found.</div>
              ) : (
                filteredPolicies.map(policy => (
                  <button
                    key={policy.id}
                    onClick={() => { setActivePolicyId(policy.id); setShowForm(false); }}
                    className={`w-full text-left p-4 rounded-xl transition-all border ${
                      activePolicyId === policy.id && !showForm
                        ? 'bg-white/80 backdrop-blur-md shadow-md border-accent-blue ring-1 ring-accent-blue/20' 
                        : 'border-transparent hover:bg-white/60/80 hover:border-slate-200/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold text-sm ${activePolicyId === policy.id && !showForm ? 'text-slate-900' : 'text-slate-800'}`}>{policy.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{policy.status}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{policy.description}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Policy Detail Panel */}
          <div className="w-full md:w-2/3 flex flex-col bg-white/80 backdrop-blur-md">
            <AnimatePresence mode="wait">
              {showForm ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col p-10"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900">Create New Policy</h2>
                    <button onClick={() => setShowForm(false)} className="text-slate-600 hover:text-slate-800"><X className="w-5 h-5"/></button>
                  </div>
                  {formError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{formError}</div>}
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1">Policy Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-200/60 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1">Category / Framework</label>
                      <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 border border-slate-200/60 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 border border-slate-200/60 rounded-lg bg-white/80 backdrop-blur-md">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1">Description</label>
                      <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border border-slate-200/60 rounded-lg"></textarea>
                    </div>
                    <button type="submit" disabled={formLoading} className="w-full py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50">
                      {formLoading ? 'Creating...' : 'Create Policy'}
                    </button>
                  </form>
                </motion.div>
              ) : activePolicyData ? (
                <motion.div
                  key={activePolicyData.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="p-10 flex-1">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">
                          <ShieldCheck className="w-3 h-3" /> Governance Control
                        </div>
                        <h2 className="text-3xl font-semibold text-slate-900 mb-4">{activePolicyData.name}</h2>
                        <p className="text-slate-700 leading-relaxed text-lg max-w-2xl">{activePolicyData.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 pb-10 border-b border-slate-200/40">
                      <div><p className="text-xs text-slate-600 font-medium uppercase mb-1">Status</p><p className="font-semibold text-slate-900">{activePolicyData.status}</p></div>
                      <div><p className="text-xs text-slate-600 font-medium uppercase mb-1">Category</p><p className="font-semibold text-slate-900">{activePolicyData.category}</p></div>
                      <div><p className="text-xs text-slate-600 font-medium uppercase mb-1">Created</p><p className="font-semibold text-slate-900">{new Date(activePolicyData.created_at).toLocaleDateString()}</p></div>
                    </div>

                    {/* Policy Mapping */}
                    <div className="mb-10">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          Mapped AI Systems
                        </h3>
                      </div>
                      
                      {mapError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{mapError}</div>}

                      <div className="bg-white/50 rounded-xl border border-slate-200/40 overflow-hidden mb-6">
                        {activePolicyData.ai_tools && activePolicyData.ai_tools.length > 0 ? (
                          <div className="divide-y divide-slate-100">
                            {activePolicyData.ai_tools.map(tool => (
                              <div key={tool.id} className="p-4 flex items-center justify-between hover:bg-white/80 backdrop-blur-md transition-colors">
                                <div>
                                  <div className="font-medium text-slate-900">{tool.name}</div>
                                  <div className="text-xs text-slate-600 mt-0.5">{tool.vendor} • {tool.approval_status}</div>
                                </div>
                                {user?.role === 'ADMIN' && (
                                  <button 
                                    onClick={() => handleUnmapTool(activePolicyData.id, tool.id)}
                                    disabled={mapLoading}
                                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Unmap Tool"
                                  >
                                    <Unlink className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-slate-600">
                            <p>No AI tools are currently mapped to this policy.</p>
                          </div>
                        )}
                      </div>

                      {user?.role === 'ADMIN' && (
                        <div className="flex items-center gap-3">
                          <select 
                            value={selectedToolId} 
                            onChange={(e) => setSelectedToolId(e.target.value)}
                            className="flex-1 p-2.5 border border-slate-200/60 rounded-lg bg-white/80 backdrop-blur-md text-sm"
                          >
                            <option value="">Select an AI Tool to map...</option>
                            {availableTools.filter(t => !activePolicyData.ai_tools?.find(pt => pt.id.toString() === t.id)).map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.vendor})</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleMapTool(activePolicyData.id)}
                            disabled={!selectedToolId || mapLoading}
                            className="px-4 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Map Tool
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600">
                  Select a policy to view details
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
