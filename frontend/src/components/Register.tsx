import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { apiClient } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role] = useState('HR_REVIEWER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await apiClient('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          role
        })
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-blue to-brand-deep shadow-2xl mb-6 ring-4 ring-white/10">
            <AppLogo className="h-8 w-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-sans tracking-tight">Register</h1>
          <p className="text-slate-600 font-medium">Create your AI Hiring Guardian account</p>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-3xl border border-slate-200/80 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl text-emerald-600 text-sm font-medium">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                placeholder="john@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Account'}
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-slate-700 text-sm hover:text-blue-700 font-semibold transition-colors">
                Already have an account? <span className="text-blue-600">Sign in</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
