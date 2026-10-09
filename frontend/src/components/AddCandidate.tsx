import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, ChevronRight, ChevronLeft, User, BookOpen, Briefcase, Cpu, ShieldCheck } from 'lucide-react';

const steps = [
  { id: 'profile', title: 'Basic Profile', icon: User },
  { id: 'education', title: 'Education', icon: BookOpen },
  { id: 'experience', title: 'Experience', icon: Briefcase },
  { id: 'skills', title: 'Skills & Projects', icon: Cpu },
  { id: 'consent', title: 'Consent', icon: ShieldCheck }
];

import { createCandidate, recordConsent } from '../api/candidates';

export const AddCandidate = ({ onClose, onSave }: { onClose: () => void, onSave: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    targetRole: '',
    location: '',
    education: [{ degree: '', university: '', graduationYear: '' }],
    experience: [{ jobTitle: '', company: '', years: '', description: '' }],
    skills: '',
    projects: [{ name: '', description: '', technologies: '' }],
    consent: false
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleSave = async () => {
    if (!formData.consent) return;
    setLoading(true);
    setError(null);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      const payload = {
        ...formData,
        skills: skillsArray,
      };

      const newCandidate = await createCandidate(payload);
      
      await recordConsent(newCandidate.id, {
        informed: true,
        recorded: true
      });

      onSave();
    } catch (err: any) {
      setError(err?.message || 'Failed to create candidate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pt-[5vh]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200/40 flex justify-between items-center bg-white/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Add New Candidate</h3>
            <p className="text-sm text-slate-600">Create a candidate profile for AI evaluation</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-200 transition-colors"><X className="w-5 h-5"/></button>
        </div>

        {/* Stepper */}
        <div className="flex border-b border-slate-200/40 px-8 py-4 shrink-0 bg-white/80 backdrop-blur-md items-center justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors border-2 ${
                  isActive ? 'bg-accent-blue text-slate-900 border-accent-blue shadow-md' : 
                  isCompleted ? 'bg-accent-emerald text-slate-900 border-accent-emerald' : 
                  'bg-white/80 backdrop-blur-md text-slate-600 border-slate-200/60'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-accent-blue' : isCompleted ? 'text-slate-900' : 'text-slate-600'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="px-8 py-3 bg-red-50 text-red-600 text-sm font-medium border-b border-red-100">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white/50">
          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md p-8 rounded-xl border border-slate-200/60 shadow-md shadow-slate-200/50">
            
            {currentStep === 0 && (
              <div className="space-y-5">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Basic Profile</h4>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Full Name</label>
                    <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20" placeholder="e.g. Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Target Role</label>
                    <input type="text" value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20" placeholder="e.g. Senior Software Engineer" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Location</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20" placeholder="e.g. New York, NY or Remote" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-5">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Education</h4>
                {formData.education.map((edu, i) => (
                  <div key={i} className="p-4 border border-slate-200/60 rounded-xl bg-white/50 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">Degree</label>
                      <input type="text" value={edu.degree} onChange={e => { const newEd = [...formData.education]; newEd[i].degree = e.target.value; setFormData({...formData, education: newEd}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="e.g. BS Computer Science" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Institution</label>
                        <input type="text" value={edu.university} onChange={e => { const newEd = [...formData.education]; newEd[i].university = e.target.value; setFormData({...formData, education: newEd}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="University Name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Graduation Year</label>
                        <input type="text" value={edu.graduationYear} onChange={e => { const newEd = [...formData.education]; newEd[i].graduationYear = e.target.value; setFormData({...formData, education: newEd}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="2020" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Recent Experience</h4>
                {formData.experience.map((exp, i) => (
                  <div key={i} className="p-4 border border-slate-200/60 rounded-xl bg-white/50 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Job Title</label>
                        <input type="text" value={exp.jobTitle} onChange={e => { const newEx = [...formData.experience]; newEx[i].jobTitle = e.target.value; setFormData({...formData, experience: newEx}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="e.g. Software Engineer" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Company</label>
                        <input type="text" value={exp.company} onChange={e => { const newEx = [...formData.experience]; newEx[i].company = e.target.value; setFormData({...formData, experience: newEx}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="Company Name" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">Years of Experience</label>
                      <input type="number" value={exp.years} onChange={e => { const newEx = [...formData.experience]; newEx[i].years = e.target.value; setFormData({...formData, experience: newEx}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="e.g. 3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">Description</label>
                      <textarea value={exp.description} onChange={e => { const newEx = [...formData.experience]; newEx[i].description = e.target.value; setFormData({...formData, experience: newEx}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md h-24 resize-none" placeholder="Describe responsibilities and achievements..." />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Skills & Projects</h4>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Technical & Soft Skills (comma separated)</label>
                  <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="React, Python, Machine Learning, Leadership" />
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-200/40">
                  <h5 className="font-semibold text-slate-900 mb-4">Notable Project</h5>
                  {formData.projects.map((proj, i) => (
                    <div key={i} className="p-4 border border-slate-200/60 rounded-xl bg-white/50 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Project Name</label>
                        <input type="text" value={proj.name} onChange={e => { const newP = [...formData.projects]; newP[i].name = e.target.value; setFormData({...formData, projects: newP}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="e.g. Migration to Microservices" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Description</label>
                        <textarea value={proj.description} onChange={e => { const newP = [...formData.projects]; newP[i].description = e.target.value; setFormData({...formData, projects: newP}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md h-20 resize-none" placeholder="What was achieved?" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Technologies Used</label>
                        <input type="text" value={proj.technologies} onChange={e => { const newP = [...formData.projects]; newP[i].technologies = e.target.value; setFormData({...formData, projects: newP}); }} className="w-full p-3 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/20 bg-white/80 backdrop-blur-md" placeholder="e.g. Docker, AWS, Node.js" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-accent-blue/10 rounded-xl text-accent-blue">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Governance & Consent</h4>
                    <p className="text-sm text-slate-600">Required for AI processing</p>
                  </div>
                </div>

                <div className="p-6 bg-white/50 border border-slate-200/60 rounded-xl space-y-4">
                  <p className="text-sm text-slate-800">
                    By confirming, you verify that the candidate has explicitly consented to having their professional data processed by the AI Hiring Guardian system for the purpose of evaluation and shortlisting.
                  </p>
                  
                  <label className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl cursor-pointer hover:border-accent-blue/50 transition-colors">
                    <input type="checkbox" checked={formData.consent} onChange={e => setFormData({...formData, consent: e.target.checked})} className="mt-1 w-5 h-5 rounded border-slate-200/80 text-accent-blue focus:ring-accent-blue/20" />
                    <div>
                      <span className="block text-sm font-semibold text-slate-900">I confirm candidate consent</span>
                      <span className="block text-xs text-slate-600 mt-1">Automated screening notice has been provided.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200/40 bg-white/80 backdrop-blur-md shrink-0 flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={currentStep === 0 || loading}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-white/60 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button 
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-brand-deep transition-colors flex items-center gap-2"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={!formData.consent || loading}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-900 bg-accent-blue hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Candidate'} <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
