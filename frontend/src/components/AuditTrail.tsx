import { useState, useEffect } from 'react';
import { History, Search, Download, ChevronRight, User, Bot, AlertTriangle, FileText, Copy, PlaySquare, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuditLogs, type AuditLog } from '../api/audit';

export function AuditTrail() {
  const [auditEvents, setAuditEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Need to filter locally if we want what's on screen
      const sorted = [...auditEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const filtered = sorted.filter(e => 
        e.event_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.actor_name && e.actor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.candidate_id && e.candidate_id.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      if (filtered.length === 0) {
        alert("No events to export matching the current filters.");
        return;
      }

      const headers = ['ID', 'Timestamp', 'Event Type', 'Description', 'Candidate ID', 'AI Tool ID', 'Actor Name', 'Metadata'];
      const rows = filtered.map(e => [
        e.id,
        e.timestamp,
        e.event_type,
        `"${(e.description || '').replace(/"/g, '""')}"`,
        e.candidate_id || 'N/A',
        e.ai_tool_id || 'N/A',
        `"${(e.actor_name || '').replace(/"/g, '""')}"`,
        `"${JSON.stringify(e.metadata_json || {}).replace(/"/g, '""')}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `ai-hiring-guardian-audit-report-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        const data = await getAuditLogs();
        setAuditEvents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch audit events');
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);
  
  // Sort events newest first
  const sortedEvents = [...auditEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const filteredEvents = sortedEvents.filter(e => 
    e.event_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.actor_name && e.actor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.candidate_id && e.candidate_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEventStyle = (action: string) => {
    if (action.includes('MAPPED') || action.includes('UNMAPPED')) return { icon: ShieldCheck, color: 'emerald', type: 'Policy Action' };
    if (action.includes('OVERRIDE')) return { icon: AlertTriangle, color: 'amber', type: 'Human Action' };
    if (action.includes('REVIEW')) return { icon: User, color: 'emerald', type: 'Human Action' };
    if (action.includes('AI') || action.includes('SCORE')) return { icon: Bot, color: 'blue', type: 'AI Action' };
    return { icon: FileText, color: 'slate', type: 'System Event' };
  };

  return (
    <div className="bg-transparent min-h-full pb-20 relative px-8 py-8 h-full flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
      
        {/* Sleek Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">Audit Report</h1>
            <p className="text-sm text-slate-100 font-medium max-w-2xl drop-shadow-md">
              Every meaningful governance action is recorded and immutable.
            </p>
          </div>
        </div>

      <div className="relative z-20 flex-1 flex flex-col w-full">
        
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col flex-1 h-[calc(100vh-200px)]">
          
          {/* Filters Bar */}
          <div className="p-6 border-b border-slate-200/60 bg-white/50 flex flex-wrap gap-4 items-center shrink-0">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input 
                type="text" 
                placeholder="Search events by candidate, action, or actor..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all font-medium" 
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-blue/20">
                <option>All Actors</option>
                <option>System</option>
                <option>Admin User</option>
                <option>AI Model</option>
              </select>
              <select className="px-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-blue/20">
                <option>All Events</option>
                <option>AI Evaluation</option>
                <option>Recommendation</option>
                <option>Human Override</option>
              </select>
            </div>
            <button 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-6 py-3 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 transition-colors ml-auto shadow-md border border-slate-200/60 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>

          {/* Forensic Timeline */}
          <div className="p-8 lg:p-12 flex-1 bg-white/80 backdrop-blur-md relative overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <History className="w-5 h-5 text-accent-blue" /> Forensic Ledger ({filteredEvents.length})
              </h2>

              {loading ? (
                <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-slate-200/60 text-slate-600">
                  <p>Loading audit events...</p>
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-red-50 rounded-2xl border border-dashed border-red-200 text-red-500">
                  <p>{error}</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-slate-200/60 text-slate-600">
                  <History className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                  <p>No audit events found. Events will appear as you process candidates.</p>
                </div>
              ) : (
                <div className="space-y-4 relative before:content-[''] before:absolute before:left-[110px] before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
                  <AnimatePresence>
                    {filteredEvents.map((event) => {
                      const style = getEventStyle(event.event_type);
                      const Icon = style.icon;
                      const d = new Date(event.timestamp);
                      const isHumanOverride = event.event_type.includes('OVERRIDE');
                      
                      return (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <div 
                          onClick={() => setSelectedEvent(event)}
                          className={`flex items-center gap-6 p-4 rounded-xl border cursor-pointer transition-all group relative bg-white/80 backdrop-blur-md ${
                            selectedEvent?.id === event.id ? 'border-accent-blue shadow-md ring-1 ring-accent-blue z-10' : 'border-slate-200/60 hover:border-slate-200/80 hover:shadow-md shadow-slate-200/50'
                          } ${isHumanOverride ? 'bg-accent-amber/5 border-accent-amber/30' : ''}`}
                        >
                          <div className="w-16 shrink-0 text-right pr-2">
                            <p className="text-sm font-bold text-slate-900">{d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
                            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">{d.toLocaleDateString()}</p>
                          </div>

                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10 border-4 border-white ${
                            isHumanOverride ? 'bg-accent-amber text-slate-900 shadow-lg shadow-accent-amber/30' :
                            style.color === 'emerald' ? 'bg-accent-emerald text-slate-900 shadow-md shadow-accent-emerald/20' :
                            style.color === 'blue' ? 'bg-accent-blue text-slate-900 shadow-md shadow-accent-blue/20' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-accent-blue transition-colors">{event.event_type}</h3>
                              {isHumanOverride && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-amber text-slate-900 uppercase tracking-wider">Override</span>}
                            </div>
                            <p className="text-sm text-slate-600 truncate">
                              Actor: <span className="font-semibold text-slate-800">{event.actor_name || 'System'}</span> | Target: <span className="font-semibold text-slate-800">{event.candidate_id || 'System'}</span>
                            </p>
                          </div>

                          <div className="shrink-0 text-slate-700 group-hover:text-accent-blue transition-colors">
                            <ChevronRight className="w-6 h-6" />
                          </div>
                        </div>
                      </motion.div>
                    )})}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Right Detail Drawer */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/40 backdrop-blur-sm z-40"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white/80 backdrop-blur-md shadow-2xl z-50 flex flex-col border-l border-slate-200/60"
            >
              <div className="p-6 bg-white text-slate-900 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-accent-blue" />
                  <h3 className="text-lg font-bold uppercase tracking-wide">Event Record</h3>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/60 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white/50">
                
                {selectedEvent.event_type.includes('OVERRIDE') && (
                  <div className="bg-accent-amber/10 border border-accent-amber/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-bold uppercase tracking-wider text-sm">Human Override Detected</span>
                    </div>
                    <p className="text-sm text-slate-800">This event marks a deviation from the system's automated recommendation.</p>
                  </div>
                )}

                <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl overflow-hidden shadow-md shadow-slate-200/50">
                  <div className="px-4 py-3 border-b border-slate-200/40 flex justify-between items-center bg-white/50">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Event ID</span>
                    <button className="text-accent-blue hover:text-blue-700 flex items-center gap-1 text-xs font-semibold" onClick={() => {navigator.clipboard.writeText(selectedEvent.id.toString()); alert("Event ID Copied");}}>
                      <Copy className="w-3 h-3" /> COPY
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-mono text-xs text-slate-700 break-all">{selectedEvent.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-md px-4 py-4 border border-slate-200/60 rounded-xl shadow-md shadow-slate-200/50">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Timestamp</p>
                    <p className="text-sm font-semibold text-slate-900">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-md px-4 py-4 border border-slate-200/60 rounded-xl shadow-md shadow-slate-200/50">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Actor</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedEvent.actor_name || 'System'}</p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md px-4 py-4 border border-slate-200/60 rounded-xl shadow-md shadow-slate-200/50">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Entity / Target</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedEvent.candidate_id || 'System Component'}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md px-4 py-4 border border-slate-200/60 rounded-xl shadow-md shadow-slate-200/50">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Event Type</p>
                  <p className="text-base font-bold text-slate-900">{selectedEvent.event_type}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md px-4 py-4 border border-slate-200/60 rounded-xl shadow-md shadow-slate-200/50">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Description</p>
                  <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>

                {selectedEvent.metadata_json && (
                  <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl overflow-hidden shadow-md shadow-slate-200/50">
                    <div className="px-4 py-3 border-b border-slate-200/40 bg-white/50 flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-600"/>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Metadata</span>
                    </div>
                    <div className="p-4 bg-white/50">
                      <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap">
                        {JSON.stringify(selectedEvent.metadata_json, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-200/60 shrink-0">
                <button className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-brand-deep transition-all flex items-center justify-center gap-2 shadow-lg">
                  <PlaySquare className="w-5 h-5" /> VIEW IN DECISION REPLAY
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
