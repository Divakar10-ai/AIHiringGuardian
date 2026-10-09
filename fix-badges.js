const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

const replacements = [
  // Fix bad hovers
  { from: /hover:bg-slate-500/g, to: 'hover:bg-slate-50' },
  
  // Fix badges for contrast
  { from: /bg-accent-emerald\/10 text-accent-emerald/g, to: 'bg-emerald-100 text-emerald-800' },
  { from: /bg-accent-amber\/10 text-accent-amber/g, to: 'bg-amber-100 text-amber-900' },
  { from: /bg-accent-red\/10 text-accent-red/g, to: 'bg-red-100 text-red-800' },
  { from: /bg-accent-blue\/10 text-accent-blue/g, to: 'bg-blue-100 text-blue-800' },
  
  { from: /bg-emerald-500\/10 text-emerald-400/g, to: 'bg-emerald-100 text-emerald-800' },
  { from: /bg-amber-500\/10 text-amber-400/g, to: 'bg-amber-100 text-amber-900' },
  { from: /bg-red-500\/10 text-red-400/g, to: 'bg-red-100 text-red-800' },
  { from: /bg-blue-500\/10 text-blue-400/g, to: 'bg-blue-100 text-blue-800' },
  
  { from: /text-accent-emerald/g, to: 'text-emerald-600' },
  { from: /text-accent-amber/g, to: 'text-amber-600' },
  { from: /text-accent-red/g, to: 'text-red-600' },
  
  // Fix text-slate-800/900 inside dark badges if any? No, we used light backgrounds for cards.
];

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated badges in ${file}`);
  }
}
