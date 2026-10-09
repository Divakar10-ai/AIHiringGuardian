import { useState, useEffect } from 'react';
import { Download, ShieldCheck, Activity, Users, Scale, FileText } from 'lucide-react';
import { getComplianceSummary } from '../api/compliance';
import type { ComplianceSummary } from '../api/compliance';

export const ComplianceDashboard = () => {
  const [data, setData] = useState<ComplianceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const summary = await getComplianceSummary();
        setData(summary);
      } catch (err: any) {
        console.error(err);
        setError('Unable to load compliance report. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExportCSVNative = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8001/api/v1/compliance/export-csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compliance_report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
        <Activity className="w-8 h-8 animate-spin text-accent-blue" />
        <p className="font-semibold">Loading compliance data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
        <ShieldCheck className="w-12 h-12 text-slate-700" />
        <p className="font-semibold text-slate-600">{error || 'No compliance data available yet.'}</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-[1440px] mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="bg-slate-900/70 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg">
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Compliance & Governance</h1>
          <p className="text-slate-200 mt-2 font-medium drop-shadow-md">Executive overview of AI hiring usage and human oversight</p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button 
            onClick={handleExportCSVNative}
            disabled={isExporting}
            className="px-5 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200/50 text-slate-900 font-bold text-sm rounded-xl shadow-md hover:bg-white flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-blue-600" /> {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button 
            disabled
            className="px-5 py-2.5 bg-slate-900/90 text-white font-bold text-sm rounded-xl shadow-md opacity-50 cursor-not-allowed flex items-center gap-2 border border-slate-700"
            title="PDF generation currently unsupported by backend architecture"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* COMPLIANCE OVERVIEW */}
      <section>
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
          <Activity className="w-4 h-4 text-blue-600" /> Compliance Overview
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-sm font-bold text-slate-500 uppercase">Candidates Processed</p>
            <p className="text-4xl font-black text-brand-midnight mt-4">{data.metrics.total_candidates}</p>
            <p className="text-xs font-semibold text-slate-600 mt-2">{data.metrics.candidates_with_consent} Consented</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-sm font-bold text-slate-500 uppercase">AI Evaluations</p>
            <p className="text-4xl font-black text-brand-midnight mt-4">{data.metrics.total_evaluations}</p>
            <p className="text-xs font-semibold text-slate-600 mt-2">Across {data.metrics.candidates_evaluated} candidates</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-sm font-bold text-slate-500 uppercase">Human Reviews</p>
            <p className="text-4xl font-black text-brand-midnight mt-4">{data.metrics.total_reviews}</p>
            <p className="text-xs font-semibold text-slate-600 mt-2">{data.metrics.pending_reviews} Pending</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Scale className="w-20 h-20 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase relative z-10 flex items-center gap-1.5">
               AI Overrides <Scale className="w-4 h-4 text-blue-500" />
            </p>
            <p className="text-4xl font-black text-brand-midnight mt-4 relative z-10">{data.metrics.overrides}</p>
            <p className="text-xs font-semibold text-slate-600 mt-2 relative z-10">{data.metrics.override_rate}% Override Rate</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-8">
        {/* AI GOVERNANCE TABLE */}
        <section>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> AI Tool Usage
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">AI Tool</th>
                  <th className="py-3 px-4">Vendor & Version</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Evals</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.ai_tools.map((tool) => (
                  <tr key={tool.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-midnight">{tool.name}</td>
                    <td className="py-3 px-4 text-slate-600">{tool.vendor} <span className="text-slate-600">v{tool.version}</span></td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tool.approval_status === 'Approved' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {tool.approval_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-600">{tool.evaluations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DECISION OVERSIGHT TABLE */}
        <section>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
            <Users className="w-4 h-4 text-blue-600" /> Decision Oversight
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">AI Rec</th>
                  <th className="py-3 px-4">Human Dec</th>
                  <th className="py-3 px-4 text-center">Override</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.decisions.map((dec, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-600">{dec.candidate_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-500">{dec.ai_recommendation || 'N/A'}</td>
                    <td className="py-3 px-4 font-bold text-brand-midnight">{dec.human_decision}</td>
                    <td className="py-3 px-4 text-center">
                      {dec.override ? (
                        <span className="px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue text-[10px] font-bold uppercase">YES</span>
                      ) : (
                        <span className="text-slate-700 font-bold text-[10px]">NO</span>
                      )}
                    </td>
                  </tr>
                ))}
                {data.decisions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No decisions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* AUDIT ACTIVITY */}
      <section>
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
          <FileText className="w-4 h-4 text-blue-600" /> Recent Governance Activity
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            {data.audit_activity.map((audit) => (
              <div key={audit.id} className="flex gap-4 items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-accent-blue mt-2"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-brand-midnight text-sm">{audit.event_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs font-bold text-slate-600">{new Date(audit.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{audit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
