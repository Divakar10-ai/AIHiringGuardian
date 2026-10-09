import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Cpu, CheckCircle } from 'lucide-react';
import { createAITool, type CreateAIToolPayload } from '../api/aiTools';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AIToolRegistrationModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateAIToolPayload>({
    name: '',
    vendor: '',
    purpose: '',
    version: '',
    hiring_stage: 'Screening',
    risk_level: 'Medium',
    approval_status: 'Pending Review'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.vendor || !formData.purpose || !formData.version) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await createAITool(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
        setFormData({
          name: '', vendor: '', purpose: '', version: '', hiring_stage: 'Screening', risk_level: 'Medium', approval_status: 'Pending Review'
        });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to register AI system.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-midnight/60 backdrop-blur-md z-40"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-2xl bg-white rounded-2xl shadow-2xl h-fit max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                Register AI System
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            {success ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful</h3>
                <p className="text-slate-600">The AI system has been registered and is pending governance review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">System Name <span className="text-red-500">*</span></label>
                      <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. HireVue AI" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Vendor <span className="text-red-500">*</span></label>
                      <input name="vendor" value={formData.vendor} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. HireVue Inc." />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Version <span className="text-red-500">*</span></label>
                      <input name="version" value={formData.version} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. v2.4.1" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Hiring Stage</label>
                      <select name="hiring_stage" value={formData.hiring_stage} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="Sourcing">Sourcing</option>
                        <option value="Screening">Screening</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Background Check">Background Check</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Primary Purpose <span className="text-red-500">*</span></label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Describe the business purpose and mechanism of this AI tool..."></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Initial Risk Level</label>
                      <select name="risk_level" value={formData.risk_level} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Initial Governance Status</label>
                      <select name="approval_status" value={formData.approval_status} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="Pending Review">Pending Review</option>
                        <option value="Approved">Approved (Exception)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Register System
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
