import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { 
  GraduationCap, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus
} from 'lucide-react';

const QUICK_DEMO_STUDENTS = [
  { name: 'Rahul S. Verma', email: 'rahul.nie@nie.ac.in', usn: '4NI21CS089', dept: 'CSE' },
  { name: 'Zayan Ahmed', email: 'zayan@nie.ac.in', usn: '4NI22CS142', dept: 'CSE' },
  { name: 'Ananya Rao', email: 'ananya.nie@nie.ac.in', usn: '4NI22IS012', dept: 'ISE' },
  { name: 'Karthik Gowda', email: 'karthik.nie@nie.ac.in', usn: '4NI21EC045', dept: 'ECE' }
];

export const StudentLoginPage: React.FC = () => {
  const [email, setEmail] = useState('rahul.nie@nie.ac.in');
  const [password, setPassword] = useState('Student@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { loginStudent, registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleQuickSelect = (studentEmail: string) => {
    setEmail(studentEmail);
    setPassword('Student@123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await loginStudent(email, password);
      if (success) {
        navigate('/student');
      } else {
        setError('Invalid credentials. Please verify your institutional email and password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRegisterAndLogin = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const prefix = email.split('@')[0] || 'student';
      const cleanName = prefix.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const randomUSN = `4NI22CS${Math.floor(100 + Math.random() * 900)}`;

      await registerStudent({
        email,
        password: password || 'Student@123',
        fullName: cleanName || 'NIE Student',
        name: cleanName || 'NIE Student',
        usn: randomUSN,
        phone: '+91 98860 12345',
        department: 'Computer Science & Engineering',
        semester: 5,
        section: 'A'
      });
      navigate('/student');
    } catch (err: any) {
      setError(err?.message || 'Quick registration failed. Please use regular registration form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sahayak-blue text-white shadow-neumorph-sm mb-2">
            <GraduationCap className="w-7 h-7 text-sahayak-gold" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Student Sign In
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Access your NIE North Campus Lost & Found dashboard
          </p>
        </div>

        {/* Quick Demo Accounts Selection */}
        <div className="p-3 rounded-2xl bg-sahayak-cream border border-sahayak-brown/15 shadow-neumorph-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sahayak-text-secondary uppercase flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-sahayak-blue" />
              <span>1-Click Verified Student Accounts</span>
            </span>
            <span className="text-[10px] text-sahayak-text-muted">Password: Student@123</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_DEMO_STUDENTS.map((st) => (
              <button
                key={st.email}
                type="button"
                onClick={() => handleQuickSelect(st.email)}
                className={`p-2 rounded-xl text-left transition-all border text-xs ${
                  email === st.email 
                    ? 'bg-sahayak-blue text-white border-sahayak-blue shadow-sm' 
                    : 'bg-sahayak-cream-soft border-sahayak-brown/15 text-sahayak-text-primary hover:border-sahayak-blue/40'
                }`}
              >
                <p className="font-bold truncate text-[11px]">{st.name}</p>
                <p className={`text-[10px] truncate ${email === st.email ? 'text-sahayak-gold' : 'text-sahayak-text-muted'}`}>
                  {st.usn} • {st.dept}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Card Form */}
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-sahayak-error-soft border border-sahayak-error/20 flex flex-col gap-2 text-xs text-sahayak-error font-medium">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {error.includes('Invalid') && (
                  <button
                    type="button"
                    onClick={handleQuickRegisterAndLogin}
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sahayak-blue text-white font-bold text-[11px] hover:bg-sahayak-blue-mid mt-1"
                  >
                    <UserPlus className="w-3 h-3 text-sahayak-gold" />
                    <span>Create & Activate Account for {email}</span>
                  </button>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                NIE Institutional Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.nie@nie.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue transition-all"
                />
              </div>
              <p className="text-[11px] text-sahayak-text-muted">Must be a valid @nie.ac.in address</p>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-sahayak-blue font-semibold hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-4 pr-10 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sahayak-text-muted hover:text-sahayak-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to SAHAYAK</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-sahayak-brown/10 text-center space-y-3">
            <p className="text-xs text-sahayak-text-secondary">
              Don't have an account?{' '}
              <Link to="/register/identity" className="text-sahayak-blue font-bold hover:underline">
                Create Account
              </Link>
            </p>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="text-xs text-sahayak-text-muted hover:text-sahayak-blue-deep font-medium flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sahayak-gold" />
                <span>Switch to Campus Security / Admin Login</span>
              </Link>
            </div>
          </div>
        </NeumorphicCard>

        <div className="max-w-xs mx-auto">
          <SAHAYAKThread height={2} activeStep={1} />
        </div>
      </div>
    </div>
  );
};
