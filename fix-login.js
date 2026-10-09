const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');
const files = ['Login.tsx', 'Register.tsx'];

const replacements = [
  // Remember Me
  { from: /text-sm font-medium text-slate-700/g, to: 'text-sm font-semibold text-slate-900' },
  // Forgot password
  { from: /text-accent-blue hover:text-brand-deep/g, to: 'text-blue-600 hover:text-blue-800' },
  // Checkbox border
  { from: /border-slate-200\/80 text-accent-blue focus:ring-accent-blue\/20/g, to: 'border-slate-300 text-blue-600 focus:ring-blue-500/20' },
  // Sign in / Sign up button
  { from: /bg-white hover:bg-brand-deep text-slate-900 rounded-xl font-bold transition-all shadow-lg shadow-brand-midnight\/20/g, to: 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md' },
  // Register link
  { from: /text-slate-600 text-sm hover:text-slate-900 font-medium/g, to: 'text-slate-700 text-sm hover:text-blue-700 font-semibold' },
  // Divider text
  { from: /text-sm font-semibold text-slate-600 uppercase tracking-wider/g, to: 'text-sm font-bold text-slate-500 uppercase tracking-wider' },
  { from: /bg-slate-200/g, to: 'bg-slate-300' },
  // OAuth buttons
  { from: /bg-white\/80 backdrop-blur-md border border-slate-200\/60 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold transition-colors opacity-75 cursor-not-allowed/g, to: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-xl font-bold transition-colors cursor-not-allowed shadow-sm' },
  // Demo button
  { from: /bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200/g, to: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300' },
  // Demo text
  { from: /text-center text-xs text-slate-600 mt-3 font-medium/g, to: 'text-center text-xs text-slate-700 mt-3 font-semibold' },
];

for (const file of files) {
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
