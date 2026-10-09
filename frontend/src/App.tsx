import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { 
  LayoutDashboard, Database, Users, FileText, UserCheck, 
  ShieldCheck, Activity, History, PlaySquare, Search, 
  Bell, HelpCircle, CheckCircle2, Command, LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dashboard } from './components/Dashboard'
import { AIRegistry } from './components/AIRegistry'
import { Evaluations } from './components/Evaluations'
import { AuditTrail } from './components/AuditTrail'
import { CandidateGovernance } from './components/CandidateGovernance'
import { HumanReview } from './components/HumanReview'
import { Policies } from './components/Policies'
import { Monitoring } from './components/Monitoring'
import { DecisionReplay } from './components/DecisionReplay'
import { FloatingAssistant } from './components/FloatingAssistant'
import { useDemoStore } from './context/DemoContext'
import { useAuth } from './context/AuthContext'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { ComplianceDashboard } from './pages/ComplianceDashboard'
import { GovernanceTracker, type GovernanceStage } from './components/GovernanceTracker'
import { SplashScreen } from './components/SplashScreen';

import dashboardImg from './assets/images/dashboard-office.jpg';
import registryImg from './assets/images/ai-infrastructure.jpg';
import policyImg from './assets/images/compliance.jpg';
import reviewImg from './assets/images/human-review.jpg';
import decisionImg from './assets/images/decision-replay.jpg';
import monitorImg from './assets/images/monitoring-soc.jpg';
import auditImg from './assets/images/audit-forensics.jpg';
import candidateImg from './assets/images/candidate-workplace.jpg';
import complianceGovImg from './assets/images/compliance-governance.jpg';
import evalEventImg from './assets/images/evaluation-workspace.jpg';
import { AppLogo } from './components/AppLogo';
import { NotificationPanel } from './components/NotificationPanel';
import { HelpPanel } from './components/HelpPanel';

function App() {
  const { isAuthenticated, logout, user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard')

  const getBackgroundImage = () => {
    switch (activeTab) {
      case 'Dashboard': return dashboardImg;
      case 'AI Tool Registration': return registryImg;
      case 'Policy Mapping': return policyImg;
      case 'Candidate Evaluation Event': return evalEventImg;
      case 'Human Review': return reviewImg;
      case 'Decision Record': return decisionImg;
      case 'Monitoring': return monitorImg;
      case 'Audit Report': return auditImg;
      case 'Candidates': return candidateImg;
      case 'Compliance': return complianceGovImg;
      default: return dashboardImg;
    }
  };
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [toasts, setToasts] = useState<{id: string, message: string}[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const showToast = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }

  const { runDemoScenario } = useDemoStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'GOVERNANCE WORKFLOW',
      items: [
        { name: 'AI Tool Registration', icon: Database, stage: 'AI Tool Registration' },
        { name: 'Policy Mapping', icon: ShieldCheck, stage: 'Policy Mapping' },
        { name: 'Candidate Evaluation Event', icon: FileText, stage: 'Candidate Evaluation Event' },
        { name: 'Human Review', icon: UserCheck, stage: 'Human Review' },
        { name: 'Decision Record', icon: PlaySquare, stage: 'Decision Record' },
        { name: 'Monitoring', icon: Activity, stage: 'Monitoring' },
        { name: 'Audit Report', icon: History, stage: 'Audit Report' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Candidates', icon: Users },
        { name: 'Compliance', icon: CheckCircle2 },
      ]
    }
  ];

  const allNavItems = navGroups.flatMap(g => g.items) as { name: string, icon: any, stage?: GovernanceStage }[];
  const activeNavItem = allNavItems.find(i => i.name === activeTab);
  const currentStage = activeNavItem?.stage;

  const handleCommand = (cmd: string) => {
    setShowCommandPalette(false)
    setCommandQuery('')
    if (cmd.startsWith('Go to ')) {
      const tab = cmd.replace('Go to ', '')
      const match = allNavItems.find(n => n.name.toLowerCase() === tab.toLowerCase() || tab.includes(n.name))
      if (match) setActiveTab(match.name)
    } else if (cmd === 'Add Candidate') {
      setActiveTab('Candidates')
      setTimeout(() => showToast('Candidate creation mode active'), 300)
    } else if (cmd === 'Load Demo Case') {
      runDemoScenario()
      showToast('Demo case loaded successfully')
    }
  }

  const filteredCommands = [
    ...allNavItems.map(n => `Go to ${n.name}`),
    'Add Candidate',
    'Load Demo Case',
    'Ask Hiring Guardian'
  ].filter(c => c.toLowerCase().includes(commandQuery.toLowerCase()))

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard onNavigate={setActiveTab} />
      case 'AI Tool Registration': return <AIRegistry />
      case 'Candidates': return <CandidateGovernance onAction={(a) => { if(a === 'toast:candidate_added') showToast('Candidate case created'); }} />
      case 'Candidate Evaluation Event': return <Evaluations />
      case 'Human Review': return <HumanReview />
      case 'Policy Mapping': return <Policies />
      case 'Monitoring': return <Monitoring />
      case 'Audit Report': return <AuditTrail />
      case 'Decision Record': return <DecisionReplay />
      case 'Compliance': return <ComplianceDashboard />
      default: return <Dashboard onNavigate={setActiveTab} />
    }
  }

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={() => showToast('Successfully logged in')} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen flex font-sans text-slate-700 bg-transparent overflow-hidden selection:bg-accent-blue/20 relative">
      
      {/* Toast Notifications */}
      <div className="fixed top-24 right-10 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              className="bg-brand-midnight text-slate-900 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-200/60"
            >
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-midnight/40 backdrop-blur-sm" 
              onClick={() => setShowCommandPalette(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center px-4 py-4 border-b border-slate-100">
                <Command className="w-5 h-5 text-slate-600 mr-3" />
                <input 
                  autoFocus
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder="Type a command or search..." 
                  className="flex-1 bg-transparent border-none outline-none text-slate-700 text-lg placeholder-slate-400 font-medium"
                />
                <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[10px] font-bold text-slate-600 bg-slate-100 rounded border border-slate-200">ESC</kbd>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <p className="text-center py-8 text-slate-600 text-sm">No commands found.</p>
                ) : (
                  filteredCommands.map((cmd, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleCommand(cmd)}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 hover:text-accent-blue transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium text-slate-700 group-hover:text-accent-blue">{cmd}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <aside className="w-[240px] bg-white text-slate-700 flex flex-col shrink-0 h-screen relative z-20 shadow-2xl border-r border-slate-200/40">
        <div className="p-6 pt-8">
          <div className="flex items-center gap-3 text-slate-900 mb-4">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-500/20 shadow-inner group cursor-pointer hover:bg-blue-500/20 transition-colors">
              <AppLogo className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-[13px] font-black tracking-widest text-slate-900 leading-tight font-sans">
                AI HIRING<br/>GUARDIAN
              </h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <h3 className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name)}
                      title={item.name}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-xs font-semibold relative overflow-hidden group ${
                        isActive 
                          ? 'text-slate-900 bg-blue-50 border border-blue-500/20 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></span>
                      )}
                      <Icon className={`h-4 w-4 relative z-10 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700 group-hover:scale-110'}`} />
                      <span className="relative z-10">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200/40 space-y-5 bg-white">
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-3 flex-1 hover:bg-slate-100 p-2 -mx-2 rounded-lg transition-colors border border-transparent hover:border-slate-200/60 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/10">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="text-left flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-600 truncate">{user?.role || 'Governance Team'}</p>
              </div>
            </div>
            <button onClick={logout} className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-md transition-colors ml-auto" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-[#F8FAFC]">
        
        {/* Immersive Edge-to-Edge Background for entire application */}
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <motion.img 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={getBackgroundImage()} 
            alt={`${activeTab} Background`} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-blue-900/10 to-transparent mix-blend-multiply"></div>
        </div>

        {/* Top Floating Bar */}
        <header className="flex-none h-16 flex items-center justify-between px-8 z-30 bg-white/70 backdrop-blur-md border-b border-slate-200/60 shadow-sm relative">
          <div className="flex-1 max-w-xl">
            <div 
              onClick={() => setShowCommandPalette(true)}
              className="relative group bg-white rounded-lg border border-slate-200/60 hover:border-blue-500/50 hover:shadow-sm transition-all cursor-pointer flex items-center"
            >
              <Search className="absolute left-3.5 h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
              <div className="w-full pl-10 pr-12 py-2 bg-transparent text-xs text-slate-600 font-medium">
                Search candidates, models, audits...
              </div>
              <div className="absolute right-2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[9px] font-bold text-slate-600 bg-white/50 rounded border border-slate-200/60 shadow-sm">⌘K</kbd>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-6">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white/60 transition-colors outline-none">
                <Bell className="h-4 w-4" />
              </button>
              <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
            </div>
            <div className="relative">
              <button onClick={() => setShowHelp(!showHelp)} className="p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white/60 transition-colors outline-none">
                <HelpCircle className="h-4 w-4" />
              </button>
              <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} onNavigate={setActiveTab} />
            </div>
          </div>
        </header>

        {/* Dynamic Governance Tracker */}
        {currentStage && <GovernanceTracker currentStage={currentStage as GovernanceStage} />}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative">
          <div className={currentStage ? "pt-0" : "pt-6"}>
            {renderContent()}
          </div>
        </main>
        
        <FloatingAssistant currentContext={activeTab} onAction={(a) => {
          if (a.startsWith('toast:')) showToast(a.replace('toast:', '').replace('_', ' '));
          else if (a === 'Add') setActiveTab('Candidates');
          else if (a === 'Search') setShowCommandPalette(true);
          else if (a === 'Replay') setActiveTab('Decision Replay');
          else setActiveTab(a);
        }} />
      </div>
    </div>
  )
}

export default App
