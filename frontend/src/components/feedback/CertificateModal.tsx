import React from 'react';
import { Award, CheckCircle, Download, X, Share2 } from 'lucide-react';
import { SAHAYAKThread } from '../ui/SAHAYAKThread';

export interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  recipientName?: string;
  itemName?: string;
  itemTitle?: string;
  caseId?: string;
  date?: string;
  pointsAwarded?: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  recipientName,
  itemName,
  itemTitle,
  caseId = 'case-ver-01',
  date = new Date().toLocaleDateString(),
  pointsAwarded = 50
}) => {
  if (!isOpen) return null;

  const displayName = recipientName || studentName || 'Shaik Zayan Ahmed';
  const displayItem = itemTitle || itemName || 'Recovered Belongings';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-sahayak-cream-soft rounded-3xl p-8 shadow-2xl border-4 border-sahayak-gold/60 text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-sahayak-cream hover:bg-sahayak-cream-soft text-sahayak-text-muted"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header Emblem */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sahayak-gold to-sahayak-gold-dark flex items-center justify-center text-white shadow-neumorph-sm mb-3 border-4 border-white">
            <Award className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-sahayak-gold-dark">
            The National Institute of Engineering, Mysuru
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-sahayak-blue-deep mt-1">
            Certificate of Campus Stewardship
          </h2>
          <p className="text-xs text-sahayak-text-secondary mt-1">
            SAHAYAK Official Recovery & Integrity Recognition • {date}
          </p>
        </div>

        <SAHAYAKThread showIcon text="Verified Campus Handover" />

        {/* Certificate Body Text */}
        <div className="bg-sahayak-cream p-6 rounded-2xl border border-sahayak-brown/15 text-sm leading-relaxed text-sahayak-text-primary space-y-3">
          <p className="text-xs uppercase tracking-wider text-sahayak-text-secondary">This is proudly awarded to</p>
          <h3 className="text-2xl font-bold font-heading text-sahayak-blue-deep tracking-wide">{displayName}</h3>
          <p className="text-xs text-sahayak-text-secondary max-w-md mx-auto">
            for demonstrating exemplary honesty, campus citizenship, and active responsibility in safeguarding and returning:
          </p>
          <p className="font-semibold text-base text-sahayak-text-primary bg-white/70 py-2 px-4 rounded-xl border border-sahayak-gold/30 inline-block">
            {displayItem}
          </p>
        </div>

        {/* Verification Footprint */}
        <div className="grid grid-cols-2 gap-4 text-xs text-left bg-sahayak-cream-soft p-4 rounded-xl border border-sahayak-brown/10">
          <div>
            <span className="text-[11px] text-sahayak-text-muted block">Case Reference</span>
            <span className="font-mono font-bold text-sahayak-blue">#{caseId.slice(-8).toUpperCase()}</span>
          </div>
          <div>
            <span className="text-[11px] text-sahayak-text-muted block">Finder Reward</span>
            <span className="font-bold text-sahayak-success">+{pointsAwarded} Finder Points Credited</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => alert('Certificate downloaded to your device as PDF!')}
            className="px-5 py-2.5 rounded-xl bg-sahayak-blue text-white font-bold text-xs shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Certificate (PDF)</span>
          </button>
          <button
            onClick={() => alert('Shareable link copied to clipboard!')}
            className="px-5 py-2.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary font-bold text-xs shadow-neumorph hover:border-sahayak-blue transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Milestone</span>
          </button>
        </div>
      </div>
    </div>
  );
};
