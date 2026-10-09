const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /border-slate-200\/60\/60/g, to: 'border-slate-200/60' },
  { from: /bg-white\/50\/50/g, to: 'bg-white/50' },
  { from: /bg-white\/100/g, to: 'bg-white' },
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
    console.log(`Cleaned ${file}`);
  }
}
