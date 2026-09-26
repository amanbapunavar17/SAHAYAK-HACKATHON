import React, { useState, useEffect } from 'react';
import { matchingService } from '../../lib/services';
import { MatchItem } from '../../types';
import { MatchCard } from '../../components/cards/MatchCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { Sparkles, Filter, Search, ShieldCheck } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await matchingService.getMatches();
        setMatches(data);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  if (loading) {
    return <LoadingState message="Scanning NIE North neural match radar..." />;
  }

  const filteredMatches = matches.filter(m => {
    const matchesQuery = m.lostReport.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.foundReport.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.lostReport.incidentPlace.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery && m.similarityScore >= filterScore;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
            <span>Multi-Signal Neural Match Center</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            AI Match Radar
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Cross-referenced lost reports and recovered campus items calculated across 5 verification vectors.
          </p>
        </div>

        <div className="w-48 hidden md:block">
          <SAHAYAKThread height={3} activeStep={2} />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
          <input
            type="text"
            placeholder="Search matching items, locations, reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-sahayak-text-muted">
            <Filter className="w-3.5 h-3.5" />
            <span>Signal Threshold:</span>
          </div>
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(Number(e.target.value))}
            className="bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs font-semibold text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
          >
            <option value={0}>All Matches</option>
            <option value={80}>High Signal (&ge; 80%)</option>
            <option value={90}>Very High (&ge; 90%)</option>
          </select>
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <EmptyState
          title="No Matching Pairs Found"
          description="There are currently no items matching your threshold. As new items are found on campus, our neural radar updates in real-time."
          actionText="Report a Lost Item"
          actionLink="/student/report-lost"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};
