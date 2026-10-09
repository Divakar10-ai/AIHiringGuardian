const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'ComplianceDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    target: `<h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Compliance Overview
        </h2>`,
    replacement: `<h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
          <Activity className="w-4 h-4 text-blue-600" /> Compliance Overview
        </h2>`
  },
  {
    target: `<h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> AI Tool Usage
          </h2>`,
    replacement: `<h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> AI Tool Usage
          </h2>`
  },
  {
    target: `<h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> Decision Oversight
          </h2>`,
    replacement: `<h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
            <Users className="w-4 h-4 text-blue-600" /> Decision Oversight
          </h2>`
  }
];

let changed = false;
for (const { target, replacement } of replacements) {
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    changed = true;
  } else {
    console.warn("Could not find target:", target);
  }
}

fs.writeFileSync(filePath, content);
console.log("Updated ComplianceDashboard.tsx headings");
