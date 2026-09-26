import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { useAuth } from '../../lib/authContext';
import { 
  User, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  Building,
  Key
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { step = 'identity' } = useParams<{ step?: string }>();
  const navigate = useNavigate();
  const { registerStudent } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    usn: '',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [error, setError] = useState<string | null>(null);

  const updateField = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const getStepNumber = () => {
    switch (step) {
      case 'identity': return 1;
      case 'academic': return 2;
      case 'security': return 3;
      case 'complete': return 4;
      default: return 1;
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 'identity' || !step) {
      if (!formData.fullName || !formData.email) {
        setError('Please fill in your full name and NIE email.');
        return;
      }
      navigate('/register/academic');
    } else if (step === 'academic') {
      if (!formData.usn) {
        setError('Please provide your NIE USN (e.g. 4NI21CS089).');
        return;
      }
      navigate('/register/security');
    } else if (step === 'security') {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      registerStudent(formData);
      navigate('/register/complete');
    }
  };

  const stepNumber = getStepNumber();

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sahayak-blue-ice border border-sahayak-blue-sky/30 text-sahayak-blue font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
            <span>NIE Student Registration</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Join SAHAYAK
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Step {stepNumber} of 4: {step === 'academic' ? 'Academic Details' : step === 'security' ? 'Security & Verification' : step === 'complete' ? 'Setup Complete' : 'Personal Identity'}
          </p>
        </div>

        {/* Step Progress Thread */}
        <div className="px-2">
          <SAHAYAKThread activeStep={stepNumber} height={3} />
          <div className="flex justify-between text-[11px] font-semibold text-sahayak-text-muted mt-2">
            <span className={stepNumber >= 1 ? 'text-sahayak-blue font-bold' : ''}>Identity</span>
            <span className={stepNumber >= 2 ? 'text-sahayak-blue font-bold' : ''}>Academic</span>
            <span className={stepNumber >= 3 ? 'text-sahayak-blue font-bold' : ''}>Security</span>
            <span className={stepNumber >= 4 ? 'text-sahayak-success font-bold' : ''}>Complete</span>
          </div>
        </div>

        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-sahayak-error-soft text-sahayak-error text-xs font-semibold">
              {error}
            </div>
          )}

          {stepNumber === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Full Name (as per NIE Records)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  NIE Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.sharma@nie.ac.in"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Mobile Number (for Handover SMS)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Academic Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {stepNumber === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  University Seat Number (USN)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4NI21CS089"
                  value={formData.usn}
                  onChange={(e) => updateField('usn', e.target.value.toUpperCase())}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Department / Branch
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                    Current Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => updateField('semester', Number(e.target.value))}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                    Section
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.section}
                    onChange={(e) => updateField('section', e.target.value.toUpperCase())}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm uppercase text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/register/identity')}
                  className="px-4 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Security</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {stepNumber === 3 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => updateField('agreeTerms', e.target.checked)}
                  className="mt-1 rounded text-sahayak-blue focus:ring-sahayak-blue"
                />
                <label htmlFor="agreeTerms" className="text-xs text-sahayak-text-secondary leading-normal">
                  I agree to abide by the NIE Code of Conduct and acknowledge that false item claims are subject to institutional disciplinary action.
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/register/academic')}
                  className="px-4 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
                >
                  <span>Complete Registration</span>
                  <CheckCircle2 className="w-4 h-4 text-sahayak-gold" />
                </button>
              </div>
            </form>
          )}

          {stepNumber === 4 && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-sahayak-success-soft text-sahayak-success mx-auto flex items-center justify-center shadow-neumorph-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="font-heading font-bold text-xl text-sahayak-text-primary">
                  Account Ready!
                </h2>
                <p className="text-xs text-sahayak-text-secondary max-w-sm mx-auto">
                  Your student account for <span className="font-mono font-bold text-sahayak-blue">{formData.usn || '4NI21CS089'}</span> has been initialized. You have been awarded 50 Starter Finder Points!
                </p>
              </div>

              <Link
                to="/student"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all w-full"
              >
                <span>Enter Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-sahayak-brown/10 text-center">
            <p className="text-xs text-sahayak-text-muted">
              Already registered?{' '}
              <Link to="/login" className="text-sahayak-blue font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};
