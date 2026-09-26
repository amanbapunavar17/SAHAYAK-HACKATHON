import React from 'react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  PieChart, 
  Award, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const AdminResolutionPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-success-soft text-sahayak-success font-semibold text-xs mb-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Campus Integrity Metrics</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Resolution & Recovery Analytics
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary">
          Tracking time-to-handover, false claim prevention rates, and student satisfaction metrics.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">Avg Turnaround Time</span>
          <p className="font-heading font-black text-3xl text-sahayak-blue-deep">14.8 hrs</p>
          <p className="text-[11px] text-sahayak-success font-semibold">45% faster than physical notice boards</p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">Verification Accuracy</span>
          <p className="font-heading font-black text-3xl text-sahayak-blue">100%</p>
          <p className="text-[11px] text-sahayak-text-muted">Zero unauthorized handovers recorded</p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">Proctor Passcode Checkouts</span>
          <p className="font-heading font-black text-3xl text-sahayak-gold">342</p>
          <p className="text-[11px] text-sahayak-text-muted">Completed via cryptographically signed OTPs</p>
        </NeumorphicCard>
      </div>

      {/* Category Resolution Breakdown */}
      <NeumorphicCard className="p-6 border border-sahayak-brown/15 space-y-4">
        <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
          Resolution Rate by Item Category
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Calculators & Lab Hardware (fx-991CW, etc.)</span>
              <span className="text-sahayak-blue font-bold">98% Recovered</span>
            </div>
            <div className="w-full h-2.5 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div className="h-full bg-sahayak-blue rounded-full w-[98%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Smart Watches & Audio Earbuds</span>
              <span className="text-sahayak-blue font-bold">92% Recovered</span>
            </div>
            <div className="w-full h-2.5 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div className="h-full bg-sahayak-blue-sky rounded-full w-[92%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Student ID Cards & Wallets</span>
              <span className="text-sahayak-blue font-bold">100% Recovered</span>
            </div>
            <div className="w-full h-2.5 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div className="h-full bg-sahayak-success rounded-full w-[100%]" />
            </div>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};
