const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'components', 'Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `<div className="max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/50 border border-slate-200/60 backdrop-blur-md self-start">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase">System Operational</span>
             </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-4">
              Enterprise Oversight for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Algorithmic Hiring.</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed font-light">
              You have <strong>{summary?.metrics.pending_reviews || 0} reviews pending</strong> and <strong>{summary?.ai_tools.length || 0} active models</strong> operating within acceptable compliance thresholds. Maintain full transparency across all AI decisions.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <button onClick={() => onNavigate && onNavigate('Candidate Evaluation Event')} className="px-6 py-3 bg-white/80 border border-slate-200/60 text-slate-700 hover:bg-white backdrop-blur-sm rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 group">
              <Plus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" /> New Evaluation
            </button>
            <button onClick={() => onNavigate && onNavigate('Audit Report')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 group">
              <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" /> Generate Report
            </button>
          </div>`;

const replacement = `<div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent -mx-8 -my-6 px-8 py-6 rounded-2xl pointer-events-none blur-[2px] z-0"></div>
          
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
          </div>`;

content = content.replace(target, replacement);

const targetDiv = `<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">`;
const replacementDiv = `<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative">`;
content = content.replace(targetDiv, replacementDiv);

fs.writeFileSync(filePath, content);
console.log("Updated Dashboard.tsx");
