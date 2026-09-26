import React from 'react';
import { MatchItem } from '../../types';
import { NeumorphicCard } from '../ui/NeumorphicCard';
import { SAHAYAKThread } from '../ui/SAHAYAKThread';
import { ArrowRight, Sparkles, MapPin, Calendar, CheckCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface MatchCardProps {
  match: MatchItem;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { lostReport, foundReport, similarityScore, signals } = match;
  const matchReasons = signals?.reasons || match.matchClues || [
    'Category and temporal window alignment',
    'Spatial coordinates match Sir MV Block vicinity'
  ];

  const lostImg = lostReport?.images?.[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400';
  const foundImg = foundReport?.images?.[0]?.url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400';

  return (
    <NeumorphicCard variant="interactive" className="p-6 border border-sahayak-brown/15 shadow-neumorph">
      {/* Match Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sahayak-brown/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sahayak-blue-ice text-sahayak-blue rounded-xl border border-sahayak-blue-sky/40 shadow-inner">
            <Sparkles className="w-5 h-5 text-sahayak-gold" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sahayak-text-muted">Multi-Signal AI Match</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-heading text-sahayak-blue-deep">
                {similarityScore || 92}% Match Signal
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sahayak-success-soft text-sahayak-success font-semibold border border-sahayak-success/30">
                High Confidence
              </span>
            </div>
          </div>
        </div>

        <Link
          to={`/student/matches/${match.id}`}
          className="px-4 py-2 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-1.5"
        >
          <span>Verify & Connect</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Side-by-Side Dual Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Lost Report Side */}
        <div className="p-3.5 bg-sahayak-cream rounded-xl border border-sahayak-brown/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sahayak-error-soft text-sahayak-error">LOST REPORT</span>
            <span className="text-[10px] text-sahayak-text-muted font-mono">#{lostReport?.id?.slice(-6).toUpperCase() || 'REP-01'}</span>
          </div>
          <div className="flex gap-3">
            <img
              src={lostImg}
              alt={lostReport?.title || 'Lost Item'}
              className="w-14 h-14 rounded-lg object-cover bg-sahayak-cream-soft shrink-0 border border-sahayak-brown/15"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-sahayak-text-primary truncate">{lostReport?.title || 'Reported Lost Item'}</h4>
              <p className="text-[11px] text-sahayak-text-secondary line-clamp-2 mt-0.5">{lostReport?.description || 'Item reported missing on campus.'}</p>
            </div>
          </div>
          <div className="text-xs text-sahayak-text-secondary pt-2 border-t border-sahayak-brown/10">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sahayak-blue shrink-0" />
              <span className="truncate">{lostReport?.incidentPlace || 'Sir MV Block'}</span>
            </div>
          </div>
        </div>

        {/* Found Report Side */}
        <div className="p-3.5 bg-sahayak-cream rounded-xl border border-sahayak-brown/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sahayak-success-soft text-sahayak-success">FOUND RECOVERY</span>
            <span className="text-[10px] text-sahayak-text-muted font-mono">#{foundReport?.id?.slice(-6).toUpperCase() || 'REP-02'}</span>
          </div>
          <div className="flex gap-3">
            <img
              src={foundImg}
              alt={foundReport?.title || 'Found Item'}
              className="w-14 h-14 rounded-lg object-cover bg-sahayak-cream-soft shrink-0 border border-sahayak-brown/15"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-sahayak-text-primary truncate">{foundReport?.title || 'Recovered Item'}</h4>
              <p className="text-[11px] text-sahayak-text-secondary line-clamp-2 mt-0.5">{foundReport?.description || 'Found and deposited at campus desk.'}</p>
            </div>
          </div>
          <div className="text-xs text-sahayak-text-secondary pt-2 border-t border-sahayak-brown/10">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sahayak-success shrink-0" />
              <span className="truncate">{foundReport?.incidentPlace || 'Central Library'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SAHAYAK Thread Connector */}
      <SAHAYAKThread height={2} activeStep={2} />

      {/* Why This Match Signals List */}
      <div className="mt-3 p-3 bg-sahayak-cream/80 rounded-xl border border-sahayak-brown/10 text-xs">
        <span className="font-bold text-sahayak-text-primary block mb-1.5">Match Signals:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {matchReasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-sahayak-text-secondary text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-sahayak-success mt-0.5 shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </NeumorphicCard>
  );
};
