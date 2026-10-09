const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');

const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
files.push('../App.tsx'); // Add App.tsx
files.push('../pages/ComplianceDashboard.tsx'); // Add ComplianceDashboard if exists

const replacements = [
  // Backgrounds
  { from: /bg-\[\#050B14\]/g, to: 'bg-transparent' }, // Because App.tsx will have the background
  { from: /bg-\[\#090E17\]\/80/g, to: 'bg-white/80' },
  { from: /bg-\[\#090E17\]\/90/g, to: 'bg-white/90' },
  { from: /bg-\[\#090E17\]\/60/g, to: 'bg-white/60' },
  { from: /bg-\[\#090E17\]/g, to: 'bg-white' },
  { from: /bg-\[\#0F172A\]\/80/g, to: 'bg-white/80' },
  { from: /bg-\[\#0F172A\]/g, to: 'bg-white' },
  { from: /bg-white\/5(?!0)/g, to: 'bg-white/50' },
  { from: /bg-white\/10(?!0)/g, to: 'bg-white/60' },
  // Text
  { from: /text-white/g, to: 'text-slate-900' },
  { from: /text-slate-200/g, to: 'text-slate-800' },
  { from: /text-slate-300/g, to: 'text-slate-700' },
  { from: /text-slate-400/g, to: 'text-slate-600' },
  // Borders
  { from: /border-white\/10/g, to: 'border-slate-200/60' },
  { from: /border-white\/5(?!0)/g, to: 'border-slate-200/40' },
  { from: /border-white\/20/g, to: 'border-slate-200/80' },
  // Hovers
  { from: /hover:bg-white\/10/g, to: 'hover:bg-slate-100' },
  { from: /hover:bg-white\/5/g, to: 'hover:bg-slate-50' },
  { from: /hover:text-white/g, to: 'hover:text-slate-900' },
  // Accents
  { from: /text-cyan-400/g, to: 'text-blue-600' },
  { from: /text-blue-400/g, to: 'text-blue-600' },
  { from: /bg-blue-500\/10/g, to: 'bg-blue-50' },
  { from: /bg-cyan-500\/10/g, to: 'bg-cyan-50' },
  { from: /shadow-\[0_0_15px_rgba\(59\,130\,246\,0\.15\)\]/g, to: 'shadow-sm' },
  { from: /shadow-\[0_0_15px_rgba\(0\,0\,0\,0\.5\)\]/g, to: 'shadow-sm' },
  { from: /shadow-lg shadow-black\/20/g, to: 'shadow-md shadow-slate-200/50' },
  { from: /shadow-lg shadow-black\/40/g, to: 'shadow-lg shadow-slate-200/50' },
];

for (const file of files) {
  // skip SplashScreen.tsx as user requested
  if (file === 'SplashScreen.tsx') continue;

  const filePath = path.join(componentsDir, file);
  if (!fs.existsSync(filePath)) continue;

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
