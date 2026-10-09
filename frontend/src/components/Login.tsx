import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Key, Mail, Building2, UserCircle } from 'lucide-react';
import { AppLogo } from './AppLogo';
import workplaceImg from '../assets/images/candidate-workplace.jpg';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Login = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your work email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    
    const demoEmail = 'admin@aihiringguardian.demo';
    const demoPassword = 'demo123';

    try {
      try {
        // Attempt login first
        await login(demoEmail, demoPassword);
      } catch (err: any) {
        // If login fails (user doesn't exist in a fresh DB), create the demo user
        if (err?.status === 401 || err?.message?.includes('failed') || err?.message?.includes('Incorrect')) {
          const { apiClient } = await import('../api/client');
          await apiClient('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({
              name: 'Demo Admin',
              email: demoEmail,
              password: demoPassword,
              role: 'ADMIN'
            })
          });
          // Retry login after successful registration
          await login(demoEmail, demoPassword);
        } else {
          throw err;
        }
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-900 bg-transparent">
      {/* Left Side - Cinematic Image */}
      <div className="hidden lg:flex w-1/2 relative bg-white flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={workplaceImg} 
            alt="AI Hiring Guardian Workspace" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-blue-900/10 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3 text-white mb-4">
            <div className="bg-white/20 p-2.5 rounded-xl border border-white/30 shadow-inner group backdrop-blur-md">
              <AppLogo className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none font-sans drop-shadow-md">
                AI HIRING<br/>GUARDIAN
              </h1>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-12 mt-auto">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4 max-w-md">
            Responsible AI governance for the hiring lifecycle.
          </h2>
          <div className="space-y-2 mt-8 text-slate-700 font-medium">
            <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span> AI recommends.</p>
            <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span> Humans decide.</p>
            <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent-amber"></span> Governance remembers.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-600">Sign in to your governance workspace.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5" htmlFor="email">Work email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aihiringguardian.demo"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors bg-white/80 backdrop-blur-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="demo123"
                    className="w-full pl-10 pr-10 py-3 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors bg-white/80 backdrop-blur-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-700 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                  <span className="text-sm font-semibold text-slate-900">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>
              
              <div className="text-center mt-4">
                <Link to="/register" className="text-slate-700 text-sm hover:text-blue-700 font-semibold transition-colors">
                  Don't have an account? Register
                </Link>
              </div>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-300"></div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Or</span>
              <div className="flex-1 h-px bg-slate-300"></div>
            </div>

            <div className="space-y-3">
              <button disabled className="w-full py-3 flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-xl font-bold transition-colors cursor-not-allowed shadow-sm">
                <Building2 className="w-5 h-5 text-blue-600" />
                Continue with Microsoft
              </button>
              <button disabled className="w-full py-3 flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-xl font-bold transition-colors cursor-not-allowed shadow-sm">
                <UserCircle className="w-5 h-5 text-red-500" />
                Continue with Google
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200/40">
              <button
                onClick={handleDemoLogin}
                disabled={loading || demoLoading}
                className="w-full py-3 flex items-center justify-center gap-2 bg-accent-emerald/10 hover:bg-accent-emerald/20 text-emerald-600 border border-accent-emerald/20 rounded-xl font-bold transition-all"
              >
                {demoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enter Demo Workspace"}
              </button>
              <p className="text-center text-xs text-slate-700 mt-3 font-semibold">
                Bypasses login for hackathon evaluation purposes.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
