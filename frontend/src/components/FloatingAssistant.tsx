import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, ShieldCheck, ChevronRight, Plus, Database, Search, Zap, PlaySquare, CheckCircle2 } from 'lucide-react';
import { useDemoStore } from '../context/DemoContext';

export const FloatingAssistant = ({ currentContext, onAction }: { currentContext: string, onAction?: (action: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | 'complete'>(null);
  const { runDemoScenario, auditEvents, candidates } = useDemoStore();

  const handleAction = (action: string) => {
    setIsMenuOpen(false);
    if (action === 'Scan') {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setScanResult('complete');
      }, 2500);
      return;
    }
    if (action === 'Demo') {
      runDemoScenario();
      if (onAction) onAction('toast:demo_loaded');
      return;
    }
    if (onAction) onAction(action);
  };

  const menuItems = [
    { id: 'Add', icon: Plus, label: 'Add Candidate', tooltip: 'Create a governed hiring case' },
    { id: 'Demo', icon: Database, label: 'Load Demo Case', tooltip: 'Populate demo data' },
    { id: 'Search', icon: Search, label: 'Search', tooltip: 'Find candidates or models' },
    { id: 'Scan', icon: Zap, label: 'Quick Risk Scan', tooltip: 'Scan current hiring decisions for governance risks' },
    { id: 'Replay', icon: PlaySquare, label: 'Decision Replay', tooltip: 'Reconstruct a complete decision' },
  ];

  return (
    <div className="fixed bottom-6 right-8 z-50 flex flex-col items-end gap-4">
      {/* Risk Scan Modal */}
      <AnimatePresence>
        {(isScanning || scanResult === 'complete') && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50"
          >
            <div className="bg-brand-midnight p-5 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-accent-blue" />
                <h3 className="font-semibold text-sm tracking-wide uppercase">Risk Scan</h3>
              </div>
              <button onClick={() => { setIsScanning(false); setScanResult(null); }} className="text-slate-600 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-b-2 border-accent-blue mb-4"
                  />
                  <p className="text-sm font-semibold text-slate-600 animate-pulse">Analyzing application data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                    <p className="font-semibold">Governance Scan Complete</p>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex justify-between"><span>AI systems analyzed</span><span className="font-bold text-slate-800">12</span></div>
                    <div className="flex justify-between"><span>Require review</span><span className="font-bold text-slate-800">3</span></div>
                    <div className="flex justify-between text-red-600 font-medium"><span>Critical issue</span><span>1</span></div>
                    <div className="flex justify-between text-amber-600 font-medium"><span>Policy warnings</span><span>2</span></div>
                    <div className="flex justify-between"><span>Audit coverage</span><span className="font-bold text-emerald-600">94%</span></div>
                  </div>
                  <button onClick={() => { setScanResult(null); if(onAction) onAction('Monitoring'); }} className="w-full py-3 mt-4 bg-brand-midnight text-slate-900 text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors">
                    VIEW RISKS
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ staggerChildren: 0.05 }}
            className="flex flex-col gap-3 mb-2"
          >
            {menuItems.map((item, idx) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: (menuItems.length - idx) * 0.05 }}
                onClick={() => handleAction(item.id)}
                className="group relative flex items-center gap-4 bg-brand-midnight/90 backdrop-blur-md text-slate-900 p-3 pr-5 rounded-full shadow-lg border border-slate-200/60 hover:bg-brand-midnight transition-colors"
              >
                <div className="absolute right-full mr-4 bg-brand-midnight text-slate-900 text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.tooltip}
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-brand-midnight rotate-45"></div>
                </div>
                <div className="bg-white/60 p-2 rounded-full group-hover:bg-accent-blue/20 transition-colors">
                  <item.icon className="w-4 h-4 text-slate-700 group-hover:text-accent-blue" />
                </div>
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assistant Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[400px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden flex flex-col z-50"
          >
            <div className="bg-brand-midnight p-6 flex items-center justify-between text-slate-900 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="bg-accent-blue/20 p-2.5 rounded-xl border border-accent-blue/30 shadow-inner">
                  <ShieldCheck className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-wide uppercase">AI Hiring Guardian</h3>
                  <p className="text-xs text-slate-600">Your governance copilot</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-slate-900 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 bg-brand-soft min-h-[320px] flex flex-col">
              <div className="flex gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0 border border-accent-blue/20">
                  <Sparkles className="w-4 h-4 text-accent-blue" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm text-sm text-slate-700 shadow-sm border border-slate-200 leading-relaxed">
                  I am analyzing the <span className="font-semibold text-brand-midnight">{currentContext}</span> context. 
                  {candidates.length > 0 ? ` I see ${candidates.length} active candidates and ${auditEvents.length} recorded events.` : ''} 
                  How can I help?
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {['What are the current governance risks?', 'Explain the latest AI decision', 'Generate an audit report'].map((prompt, i) => (
                  <button key={i} className="w-full text-left px-4 py-3.5 text-[13px] bg-white border border-slate-200 rounded-xl hover:border-accent-blue hover:text-accent-blue transition-all flex items-center justify-between group">
                    <span className="font-medium text-slate-700 group-hover:text-accent-blue uppercase tracking-wider">{prompt}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-accent-blue transition-colors" />
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="relative">
                <input type="text" placeholder="Ask a governance question..." className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent-blue hover:bg-accent-blue hover:text-slate-900 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Toggle Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsMenuOpen(!isMenuOpen); setIsOpen(false); }}
          className="w-14 h-14 rounded-full bg-white text-brand-midnight shadow-lg border border-slate-200 flex items-center justify-center hover:border-accent-blue hover:text-accent-blue transition-colors z-50"
        >
          <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }}>
            <Plus className="w-6 h-6" />
          </motion.div>
        </motion.button>

        {/* Assistant Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setIsOpen(!isOpen); setIsMenuOpen(false); }}
          className="bg-brand-midnight/95 backdrop-blur-md text-slate-900 px-6 py-4 rounded-[1.25rem] shadow-[0_10px_40px_-10px_rgba(7,17,38,0.5)] flex items-center gap-4 border border-slate-200/60 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/0 via-accent-blue/10 to-accent-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex items-center gap-4">
            <ShieldCheck className="w-6 h-6 text-accent-blue group-hover:scale-110 transition-transform duration-300" />
            <div className="text-left flex flex-col justify-center">
              <p className="text-[13px] font-bold tracking-wider uppercase leading-none group-hover:text-slate-900 text-slate-100 transition-colors">ASK HIRING GUARDIAN</p>
              <p className="text-[11px] text-slate-700 mt-1 uppercase tracking-widest whitespace-nowrap">Your governance copilot</p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
