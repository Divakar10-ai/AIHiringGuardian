const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

const replacements = [
  // Headings
  { from: /<h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">/g, to: '<h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">' },
  // Subtitles
  { from: /<p className="text-sm text-slate-600 font-medium max-w-2xl">/g, to: '<p className="text-sm text-slate-100 font-medium max-w-2xl drop-shadow-md">' },
  // Buttons with blue background and dark text -> white text
  { from: /bg-blue-600 hover:bg-blue-700 text-slate-900/g, to: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { from: /bg-blue-500 hover:bg-blue-600 text-slate-900/g, to: 'bg-blue-500 hover:bg-blue-600 text-white' },
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
    console.log(`Updated ${file}`);
  }
}
