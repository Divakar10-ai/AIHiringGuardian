import { useEffect, useRef } from 'react';
import { HelpCircle, Book, Shield, Users, FileText, CheckCircle2, PlaySquare, X, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function HelpPanel({ isOpen, onClose, onNavigate }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          ref={panelRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 origin-top-right flex flex-col max-h-[80vh]"
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-brand-midnight text-white">
            <h3 className="font-bold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" /> Help & Resources
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
               <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto p-4 custom-scrollbar bg-slate-50">
            
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About AI Hiring Guardian</h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                AI Hiring Guardian is an enterprise governance platform designed to ensure fair, transparent, and compliant use of Artificial Intelligence in your recruitment pipeline.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">7-Stage Governance Workflow</h4>
              <div className="space-y-2">
                <button onClick={() => handleNav('AI Tool Registration')} className="w-full flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-blue-50 p-1.5 rounded"><Cpu className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">1. AI Tool Registration</p>
                    <p className="text-xs text-slate-500">Register and assess models</p>
                  </div>
                </button>
                <button onClick={() => handleNav('Policy Mapping')} className="w-full flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-blue-50 p-1.5 rounded"><Shield className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">2. Policy Mapping</p>
                    <p className="text-xs text-slate-500">Map models to compliance</p>
                  </div>
                </button>
                <button onClick={() => handleNav('Candidates')} className="w-full flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-blue-50 p-1.5 rounded"><Users className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">3. Candidate Governance</p>
                    <p className="text-xs text-slate-500">Manage applicant profiles</p>
                  </div>
                </button>
                <button onClick={() => handleNav('Candidate Evaluation Event')} className="w-full flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-blue-50 p-1.5 rounded"><PlaySquare className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">4. AI Evaluation</p>
                    <p className="text-xs text-slate-500">Run model assessments</p>
                  </div>
                </button>
                <button onClick={() => handleNav('Human Review')} className="w-full flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-blue-50 p-1.5 rounded"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">5. Human Review</p>
                    <p className="text-xs text-slate-500">Oversight and overrides</p>
                  </div>
                </button>
                <button onClick={() => handleNav('Decision Record')} className="w-full flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-blue-50 p-1.5 rounded"><FileText className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">6. Decision Record</p>
                    <p className="text-xs text-slate-500">View final outcomes</p>
                  </div>
                </button>
                <button onClick={() => handleNav('Audit Report')} className="w-full flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-blue-50 p-1.5 rounded"><Book className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">7. Audit & Logs</p>
                    <p className="text-xs text-slate-500">System transparency</p>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
