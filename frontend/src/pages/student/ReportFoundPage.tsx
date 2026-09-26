import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { reportsService, assistantService } from '../../lib/services';
import { ItemCategory, ImageSource } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { 
  UploadCloud, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Building,
  Award
} from 'lucide-react';

const CATEGORIES: ItemCategory[] = [
  'ELECTRONICS',
  'DOCUMENTS_ID',
  'CALCULATORS',
  'KEYS',
  'BAGS_WALLETS',
  'ACCESSORIES',
  'BOOKS_NOTES',
  'OTHER'
];

const CAMPUS_DISCOVERY_LOCATIONS = [
  'Sir MV Block - Ground Floor Corridor',
  'Sir MV Block - 2nd Floor Labs',
  'Central Library - Main Reading Hall',
  'North Canteen - Table 14',
  'Administrative Block - Reception',
  'Sports Complex - Court 2',
  'Parking Lot A - Near Bike Stand'
];

const CAMPUS_STORAGE_POINTS = [
  'Main Campus Security Desk (Main Entrance Locker)',
  'Sir MV Block Department Proctor Office (Room 102)',
  'Central Library Security Desk',
  'With Finder (Self-Custody pending handover)'
];

export const ReportFoundPage: React.FC = () => {
  const { studentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('ELECTRONICS');
  const [description, setDescription] = useState('');
  const [incidentPlace, setIncidentPlace] = useState(CAMPUS_DISCOVERY_LOCATIONS[0]);
  const [currentLocation, setCurrentLocation] = useState(CAMPUS_STORAGE_POINTS[0]);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('11:15');

  // Found Image (Required)
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60');
  const [imageSource, setImageSource] = useState<ImageSource>('USER_CAPTURED');

  const [aiAssisting, setAiAssisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  const handleAiAssistance = async () => {
    if (!title) return;
    setAiAssisting(true);
    try {
      const generated = await assistantService.generateReportDescription(title, category, incidentPlace);
      setDescription(generated);
    } finally {
      setAiAssisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const report = await reportsService.createReport({
        type: 'FOUND',
        title,
        category,
        description,
        status: 'SUBMITTED',
        incidentPlace,
        currentLocation,
        incidentDate,
        incidentTime,
        images: [
          {
            id: `img-${Date.now()}`,
            url: imageUrl,
            source: imageSource,
            isReference: false,
            uploadedAt: new Date().toISOString()
          }
        ],
        reporterId: studentUser?.id || 'std-1',
        reporterName: studentUser?.fullName || 'Rahul Sharma',
        reporterUSN: studentUser?.usn || '4NI21CS089',
        isAnonymous: false
      });

      setCreatedReportId(report.id);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-success-soft text-sahayak-success font-semibold text-xs">
          <Award className="w-3.5 h-3.5" />
          <span>Good Samaritan Recovery Pipeline</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-lg mx-auto">
          Help return lost property to a fellow NIE student. Reporting a found item earns you verified Finder Points and Good Samaritan recognition!
        </p>

        <div className="pt-2 max-w-xs mx-auto">
          <SAHAYAKThread activeStep={step === 3 ? 2 : 1} height={3} />
        </div>
      </div>

      {/* STEP 1: Check Active Lost Reports */}
      {step === 1 && (
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-sahayak-gold-soft/50 border border-sahayak-gold/30">
            <Info className="w-5 h-5 text-sahayak-blue-deep shrink-0" />
            <p className="text-xs text-sahayak-text-primary leading-relaxed">
              <span className="font-bold">Check missing reports first:</span> Someone on campus might currently be searching for this item.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-sahayak-text-muted">
              Active Missing Item Reports on NIE North
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center font-bold text-xs">
                    WATCH
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-sahayak-text-primary">Noise ColorFit Pro 4</h4>
                    <p className="text-[11px] text-sahayak-text-muted">Lost by Rahul (4NI21CS089)</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTitle('Noise ColorFit Pro 4');
                    setCategory('ELECTRONICS');
                    setStep(2);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold"
                >
                  This Is It
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sahayak-gold-soft text-sahayak-blue-deep flex items-center justify-center font-bold text-xs">
                    CALC
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-sahayak-text-primary">Casio Scientific fx-991CW</h4>
                    <p className="text-[11px] text-sahayak-text-muted">Lost by Ananya (4NI21IS042)</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTitle('Casio Scientific fx-991CW');
                    setCategory('CALCULATORS');
                    setStep(2);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold"
                >
                  This Is It
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-sahayak-brown/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-sahayak-text-secondary">
              Not listed above?
            </span>
            <button
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <span>Submit New Found Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </NeumorphicCard>
      )}

      {/* STEP 2: Fill Found Item Form */}
      {step === 2 && (
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Item Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casio Scientific Calculator fx-991CW"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SEPARATE: Place Found VS Current Physical Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/15">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sahayak-blue" />
                  <span>Where Did You Find It? *</span>
                </label>
                <select
                  value={incidentPlace}
                  onChange={(e) => setIncidentPlace(e.target.value)}
                  className="w-full bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  {CAMPUS_DISCOVERY_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <p className="text-[11px] text-sahayak-text-muted">Exact discovery spot on campus</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-sahayak-gold" />
                  <span>Current Physical Location *</span>
                </label>
                <select
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  {CAMPUS_STORAGE_POINTS.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
                <p className="text-[11px] text-sahayak-text-muted">Where the item is physically stored now</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Date Found *
                </label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Approx Time *
                </label>
                <input
                  type="time"
                  required
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>
            </div>

            {/* Found Item Photo */}
            <div className="space-y-3 p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/15">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Photo of Found Item (Required for AI Matching) *
                </label>
                <span className="text-[11px] font-bold text-sahayak-success">Source: Captured</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src={imageUrl}
                  alt="Found Preview"
                  className="w-24 h-24 rounded-xl object-cover border border-sahayak-brown/20 shadow-sm"
                />
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL or take photo"
                    className="w-full bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary"
                  />
                  <p className="text-[11px] text-sahayak-text-muted">
                    Photo will be processed for neural visual features.
                  </p>
                </div>
              </div>
            </div>

            {/* Description with AI Assistant */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Public Visual Description
                </label>
                <button
                  type="button"
                  onClick={handleAiAssistance}
                  disabled={aiAssisting || !title}
                  className="inline-flex items-center gap-1.5 text-xs text-sahayak-blue font-bold hover:underline disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
                  <span>{aiAssisting ? 'Generating with AI...' : 'AI Auto-Draft'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="General description without revealing secret distinguishing clues..."
                className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl p-3 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-sahayak-brown/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Registering & Initiating Match Engine...</span>
                ) : (
                  <>
                    <span>Submit Found Item & Earn +30 Points</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </NeumorphicCard>
      )}

      {/* STEP 3: Success Confirmation */}
      {step === 3 && (
        <NeumorphicCard className="p-8 text-center space-y-6 border border-sahayak-brown/15 shadow-neumorph-lg">
          <div className="w-16 h-16 rounded-full bg-sahayak-success-soft text-sahayak-success mx-auto flex items-center justify-center shadow-neumorph-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-sahayak-blue-deep">
              Found Report Submitted!
            </h2>
            <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-md mx-auto">
              Report <span className="font-mono font-bold text-sahayak-blue">#{createdReportId || 'rep-found-10'}</span> has been registered. You have been awarded <span className="font-bold text-sahayak-gold">+30 Good Samaritan Points</span>!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between text-sahayak-text-secondary">
              <span>Item:</span>
              <span className="font-bold text-sahayak-text-primary">{title}</span>
            </div>
            <div className="flex justify-between text-sahayak-text-secondary">
              <span>Current Physical Stash:</span>
              <span className="font-bold text-sahayak-blue">{currentLocation}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/student/rewards"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-sahayak-gold" />
              <span>View Finder Points & Rewards</span>
            </Link>
            <Link
              to="/student"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold hover:border-sahayak-blue"
            >
              Dashboard
            </Link>
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
};
