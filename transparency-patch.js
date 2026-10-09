const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');

const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  if (file === 'App.tsx' || file === 'GovernanceTracker.tsx' || file === 'FloatingAssistant.tsx' || file === 'Dashboard.tsx') continue;

  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/className="bg-\[\#050B14\] min-h-full/g, 'className="bg-transparent min-h-full');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
