const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "const [activeTab, setActiveTab] = useState('Dashboard')",
  "const [activeTab, setActiveTab] = useState('Dashboard')\n  const [isSearchFocused, setIsSearchFocused] = useState(false)"
);

content = content.replace(
  /<input \s*type="text" \s*placeholder="Search candidates, models, audits..." \s*className="w-full pl-12 pr-16 py-3.5 bg-transparent border-none rounded-xl text-sm focus:ring-2 focus:ring-accent-blue\/20 transition-all outline-none text-slate-700 placeholder-slate-400 font-medium"\s*\/>/g,
  `<input 
                type="text" 
                placeholder="Search candidates, models, audits..." 
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-12 pr-16 py-3.5 bg-transparent border-none rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 transition-all outline-none text-slate-700 placeholder-slate-400 font-medium"
              />
              {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Quick Categories</p>
                    <div className="flex flex-col gap-1">
                      {['Candidates', 'AI Models', 'Audit Events', 'Policies', 'Decisions'].map((cat, i) => (
                        <button key={i} className="text-left px-3 py-2 hover:bg-slate-50 hover:text-accent-blue text-sm font-medium text-slate-700 rounded-lg transition-colors flex items-center gap-2">
                          <Search className="w-4 h-4 text-slate-400" /> {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}`
);

content = content.replace(
  /className="relative group shadow-sm bg-white\/80 backdrop-blur-xl rounded-xl border border-slate-200\/50 hover:border-slate-300 transition-colors"/g,
  `className={\`relative group shadow-sm bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/50 hover:border-slate-300 transition-all \${isSearchFocused ? 'ring-2 ring-accent-blue/20 scale-[1.02]' : ''}\`}`
);

fs.writeFileSync('src/App.tsx', content);
