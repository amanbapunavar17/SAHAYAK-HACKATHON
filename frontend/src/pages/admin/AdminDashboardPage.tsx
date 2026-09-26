import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsService, verificationService, auditService, matchingService } from '../../lib/services';
import { ItemReport, VerificationCase, AuditEvent, MatchItem } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  ShieldAlert, 
  ClipboardList, 
  GitCompare, 
  MapPin, 
  Award, 
  ScrollText, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  UserCheck,
  TrendingUp
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [r, c, a, m] = await Promise.all([
          reportsService.getAll(),
          verificationService.getAllCases(),
          auditService.getRecentLogs(),
          matchingService.getMatches()
        ]);
        setReports(r);
        setCases(c);
        setAuditLogs(a);
        setMatches(m);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return <LoadingState message="Connecting to NIE Security Master Log..." />;
  }

  const pendingVerifications = cases.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'PENDING');
  const activeCasesCount = reports.filter(r => r.status !== 'RETURNED').length;

  return (
    <div className="space-y-8">
      {/* Security Console Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-sahayak-blue-deep text-white shadow-neumorph relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sahayak-gold text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Campus Security & Proctor Command</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              NIE North Security Master Console
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl">
              Centralized custody management, ownership verification approvals, and chain-of-custody audit logs for all 4 campus zones.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/admin/reports"
              className="px-5 py-3 rounded-xl bg-sahayak-gold text-sahayak-blue-deep font-heading font-bold text-xs sm:text-sm shadow-neumorph hover:bg-sahayak-gold-light transition-all flex items-center gap-2"
            >
              <span>Manage Cases ({reports.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sahayak-gold via-sahayak-blue-sky to-white/30" />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Cases"
          value={reports.length}
          subtitle="4 Active • 1 Resolved"
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Pending Proctor Review"
          value={pendingVerifications.length}
          subtitle="Immediate Action Required"
          icon={AlertTriangle}
          color="gold"
        />
        <StatCard
          title="Neural AI Matches"
          value={matches.length}
          subtitle="Avg 89% Confidence"
          icon={GitCompare}
          color="blue"
        />
        <StatCard
          title="Custody Handover Rate"
          value="96.8%"
          subtitle="Zero Disputed Claims"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Pending Verifications Attention Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-sahayak-gold" />
            <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
              Pending Proctor Verification Queue
            </h2>
          </div>
          <Link to="/admin/reports" className="text-xs font-bold text-sahayak-blue hover:underline">
            View All Cases
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cases.map((c) => (
            <NeumorphicCard key={c.id} className="p-5 border border-sahayak-brown/15 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sahayak-blue bg-sahayak-blue-ice px-2 py-0.5 rounded">
                    Case #{c.id}
                  </span>
                  <h3 className="font-heading font-bold text-base text-sahayak-text-primary mt-1">
                    Claimant: {c.claimantName} ({c.claimantUSN})
                  </h3>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 text-xs space-y-1.5">
                <span className="font-bold text-sahayak-text-muted uppercase text-[10px]">Confidential Clues:</span>
                <p className="text-sahayak-text-secondary italic">"{c.answersSubmitted[0] || 'Bezel scratch & serial match'}"</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-sahayak-brown/10 text-xs">
                <span className="text-sahayak-text-muted">Assigned: {c.handoverLocation}</span>
                <Link
                  to={`/admin/reports/${c.reportId}`}
                  className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold hover:bg-sahayak-blue-mid flex items-center gap-1"
                >
                  <span>Review & Approve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      </div>

      {/* Recent Security Audit Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-sahayak-blue" />
            <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
              Immutable Chain-of-Custody Audit Trail
            </h2>
          </div>
          <Link to="/admin/audit" className="text-xs font-bold text-sahayak-blue hover:underline">
            Full Audit Logs
          </Link>
        </div>

        <NeumorphicCard className="p-0 border border-sahayak-brown/15 overflow-hidden shadow-neumorph">
          <div className="divide-y divide-sahayak-brown/10 text-xs">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-sahayak-cream-soft/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-sahayak-blue shrink-0" />
                  <div>
                    <p className="font-bold text-sahayak-text-primary">{log.description}</p>
                    <p className="text-[11px] text-sahayak-text-muted">
                      Actor: <strong className="text-sahayak-text-secondary">{log.actor}</strong> • Case #{log.caseId || 'sys'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[11px] text-sahayak-text-muted">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};
