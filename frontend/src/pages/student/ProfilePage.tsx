import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { CertificateModal } from '../../components/feedback/CertificateModal';
import { 
  User, 
  GraduationCap, 
  Mail, 
  Phone, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Edit2,
  Lock,
  Building
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { studentUser } = useAuth();
  const [showCert, setShowCert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [phone, setPhone] = useState(studentUser?.phone || '+91 98765 43210');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
          <User className="w-3.5 h-3.5" />
          <span>NIE Verified Identity</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary">
          Academic identity, Good Samaritan achievements, and campus recovery records.
        </p>
      </div>

      {/* Main Profile Card */}
      <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-sahayak-brown/10">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-sahayak-brown/20 shadow-neumorph-sm relative">
            <img
              src={studentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
              alt={studentUser?.fullName}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 p-1 rounded-full bg-sahayak-success text-white">
              <CheckCircle2 className="w-3 h-3" />
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-sahayak-blue-deep">
                  {studentUser?.fullName || 'Rahul Sharma'}
                </h2>
                <p className="text-xs font-mono font-bold text-sahayak-blue uppercase">
                  USN: {studentUser?.usn || '4NI21CS089'}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sahayak-gold-soft text-sahayak-blue-deep border border-sahayak-gold/40 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sahayak-gold" />
                  <span>{studentUser?.points || 120} Finder Points</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-sahayak-text-secondary">
              {studentUser?.department || 'Computer Science & Engineering'} • Semester {studentUser?.semester || 6}, Section {studentUser?.section || 'A'}
            </p>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1">
            <span className="text-sahayak-text-muted font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sahayak-blue" />
              <span>Institutional Email</span>
            </span>
            <p className="font-semibold text-sahayak-text-primary">{studentUser?.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1">
            <span className="text-sahayak-text-muted font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sahayak-blue" />
              <span>Handover Contact Phone</span>
            </span>
            <p className="font-semibold text-sahayak-text-primary">{phone}</p>
          </div>
        </div>

        {/* Achievements & Certificates */}
        <div className="space-y-3 pt-2">
          <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep uppercase tracking-wider">
            Verified Integrity Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sahayak-gold-soft text-sahayak-gold flex items-center justify-center font-bold">
                  <Award className="w-5 h-5 text-sahayak-blue-deep" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-sahayak-text-primary">Good Samaritan Certificate</h4>
                  <p className="text-[11px] text-sahayak-text-muted">Issued by NIE Proctor Office</p>
                </div>
              </div>
              <button
                onClick={() => setShowCert(true)}
                className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold shadow-neumorph-sm hover:bg-sahayak-blue-mid"
              >
                View
              </button>
            </div>

            <div className="p-4 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-sahayak-text-primary">Silver Guardian Tier</h4>
                  <p className="text-[11px] text-sahayak-text-muted">Top 5% on campus</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sahayak-success">Active</span>
            </div>
          </div>
        </div>
      </NeumorphicCard>

      <CertificateModal
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        recipientName={studentUser?.fullName || 'Rahul Sharma'}
        itemTitle="Casio fx-991CW Calculator"
        date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        pointsAwarded={studentUser?.points || 120}
      />
    </div>
  );
};
