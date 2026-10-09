const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');

const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /bg-\[\#F4F7FA\]/g, to: 'bg-[#050B14]' },
  { from: /bg-brand-soft/g, to: 'bg-[#050B14]' },
  { from: /text-slate-900/g, to: 'text-white' },
  { from: /text-slate-800/g, to: 'text-white' },
  { from: /text-slate-700/g, to: 'text-slate-200' },
  { from: /text-brand-midnight/g, to: 'text-white' },
  { from: /text-slate-500/g, to: 'text-slate-400' },
  { from: /text-slate-600/g, to: 'text-slate-300' },
  { from: /bg-white(?![\/\w])/g, to: 'bg-[#0F172A]/80 backdrop-blur-md' },
  { from: /border-slate-200/g, to: 'border-white/10' },
  { from: /border-slate-100/g, to: 'border-white/5' },
  { from: /border-slate-300/g, to: 'border-white/20' },
  { from: /bg-slate-50/g, to: 'bg-white/5' },
  { from: /bg-slate-100/g, to: 'bg-white/10' },
  { from: /hover:bg-slate-50/g, to: 'hover:bg-white/10' },
  { from: /hover:bg-slate-100/g, to: 'hover:bg-white/20' },
  { from: /shadow-sm/g, to: 'shadow-lg shadow-black/20' },
  { from: /bg-brand-midnight/g, to: 'bg-[#090E17]' },
];

for (const file of files) {
  // skip Dashboard.tsx since we already perfectly tuned it
  if (file === 'Dashboard.tsx') continue;
  if (file === 'GovernanceTracker.tsx') continue; // already tuned
  if (file === 'FloatingAssistant.tsx') continue;

  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
