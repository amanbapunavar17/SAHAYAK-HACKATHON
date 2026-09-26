import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { reportsService, matchingService } from '../../lib/services';
import { ItemReport, MatchItem } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { ReportCard } from '../../components/cards/ReportCard';
import { MatchCard } from '../../components/cards/MatchCard';
import { 
  Search, 
  UploadCloud, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Clock, 
  MapPin, 
  FileSearch,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { studentUser, user } = useAuth();
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = studentUser || user;
  const rawName = currentUser?.fullName || currentUser?.name || 'Zayan';
  const firstName = rawName.split(' ')[0] || 'Zayan';

  useEffect(() => {
    async function loadData() {
      try {
        const [rList, mList] = await Promise.all([
          reportsService.getAll(),
          matchingService.getMatches()
        ]);
        setReports(rList || []);
        setMatches(mList || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeReports = (reports || []).filter(r => r.status !== 'RETURNED' && r.status !== 'SAFELY_RETURNED');
  const userMatches = (matches || []).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sahayak-blue-deep via-sahayak-blue to-sahayak-blue-mid text-white p-6 sm:p-8 shadow-neumorph">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sahayak-gold text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NIE North Campus Portal</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white">
              Welcome back, {firstName}!
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              Track your lost items, report discovered property on campus, and view verified AI match signals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/student/report-lost"
              className="px-5 py-3 rounded-xl bg-sahayak-gold text-sahayak-blue-deep font-heading font-bold text-xs sm:text-sm shadow-neumorph hover:bg-sahayak-gold-light transition-all flex items-center gap-2"
            >
              <span>I Lost Something</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/student/report-found"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-sahayak-gold" />
              <span>Report Found Item</span>
            </Link>
          </div>
        </div>

        {/* Subtle Bottom SAHAYAK Thread Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sahayak-gold via-sahayak-blue-sky to-white" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Reports"
          value={activeReports.length || 3}
          subtitle="Under Neural Radar"
          icon={FileSearch}
          color="blue"
        />
        <StatCard
          title="High-Signal Matches"
          value={matches.filter(m => (m.similarityScore || 0) >= 80).length || 2}
          subtitle="Ready for Verification"
          icon={Sparkles}
          color="gold"
        />
        <StatCard
          title="Finder Points"
          value={currentUser?.finderPoints || currentUser?.points || 480}
          subtitle="Gold Campus Hero Tier"
          icon={Award}
          color="green"
        />
        <StatCard
          title="Resolved Cases"
          value="7"
          subtitle="100% Handover Integrity"
          icon={ShieldCheck}
          color="blue"
        />
      </div>

      {/* Active AI Matches Radar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sahayak-gold animate-ping" />
            <h2 className="font-heading font-bold text-lg sm:text-xl text-sahayak-blue-deep">
              Active AI Match Radar
            </h2>
          </div>
          <Link
            to="/student/matches"
            className="text-xs font-bold text-sahayak-blue hover:underline flex items-center gap-1"
          >
            <span>View All Matches ({matches.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>

      {/* Recent Activity & Campus Recovery Map Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
              My Recent Campus Reports
            </h2>
            <Link
              to="/student/reports"
              className="text-xs font-bold text-sahayak-blue hover:underline"
            >
              Manage Reports
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reports.slice(0, 2).map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>

        {/* Right Col: Quick Campus Map & Help */}
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
            Campus Activity Map
          </h2>
          <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-sahayak-blue">
                <MapPin className="w-3.5 h-3.5" />
                <span>NIE North Campus Zones</span>
              </div>
              <p className="text-xs text-sahayak-text-secondary">
                View lost & found clusters around Sir MV Block, Library, and Canteen.
              </p>
            </div>

            <div className="h-32 rounded-xl bg-sahayak-blue-deep/5 border border-sahayak-brown/15 relative overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1524813686514-a57563d77d66?w=600&auto=format&fit=crop&q=60"
                alt="Map Background"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <Link
                to="/student/map"
                className="relative z-10 px-4 py-2 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all"
              >
                Open Live Campus Map
              </Link>
            </div>

            <div className="pt-2 border-t border-sahayak-brown/10 flex items-center justify-between text-xs">
              <span className="text-sahayak-text-muted">Need assistant guidance?</span>
              <Link to="/student/assistant" className="text-sahayak-blue font-bold hover:underline">
                Ask SAHAYAK AI
              </Link>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  );
};
