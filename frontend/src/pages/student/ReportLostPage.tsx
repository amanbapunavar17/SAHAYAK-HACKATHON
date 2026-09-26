import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { reportsService, assistantService } from '../../lib/services';
import { ItemCategory, ImageSource } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { 
  Search, 
  UploadCloud, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Eye,
  Info
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

const CAMPUS_LOCATIONS = [
  'Sir MV Block - 2nd Floor Labs',
  'Sir MV Block - Room 304 Lecture Hall',
  'Central Library - Ground Floor Reading Hall',
  'Central Library - 1st Floor Digital Center',
  'North Canteen - Main Dining Area',
  'Administrative Block - Accounts Section',
  'Sports Complex & Indoor Badminton Court',
  'Main Security Gate & Bus Stop'
];

export const ReportLostPage: React.FC = () => {
  const { studentUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: Pre-search / Check Found reports
  // Step 2: Fill Lost Form
  // Step 3: Success Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('ELECTRONICS');
  const [description, setDescription] = useState('');
  const [incidentPlace, setIncidentPlace] = useState(CAMPUS_LOCATIONS[0]);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('14:30');
  
  // Distinguishing Details
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');

  // Image
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60');
  const [imageSource, setImageSource] = useState<ImageSource>('USER_UPLOADED');

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
        type: 'LOST',
        title,
        category,
        description,
        status: 'SUBMITTED',
        incidentPlace,
        incidentDate,
        incidentTime,
        images: [
          {
            id: `img-${Date.now()}`,
            url: imageUrl,
            source: imageSource,
            isReference: imageSource === 'REFERENCE_IMAGE',
            uploadedAt: new Date().toISOString()
          }
        ],
        brand,
        color,
        distinguishingFeatures,
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
          <span>Loss Recovery Pipeline</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Report a Lost Item
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-lg mx-auto">
          Provide accurate details and photos to help the SAHAYAK neural matcher find your item across NIE North Campus.
        </p>

        <div className="pt-2 max-w-xs mx-auto">
          <SAHAYAKThread activeStep={step === 3 ? 2 : 1} height={3} />
        </div>
      </div>

      {/* STEP 1: Pre-Search Filter (Check if already turned in) */}
      {step === 1 && (
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-sahayak-blue-ice/50 border border-sahayak-blue-sky/30">
            <Info className="w-5 h-5 text-sahayak-blue shrink-0" />
            <p className="text-xs text-sahayak-text-primary leading-relaxed">
              <span className="font-bold">Before creating a report:</span> Someone might have already handed your item to Campus Security! Search existing recovered items first.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
            <input
              type="text"
              placeholder="e.g. Casio fx-991CW calculator, Noise smart watch, blue water bottle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-3 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-sahayak-text-muted">
              Recently Deposited at NIE Security
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=60"
                  alt="Item"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-sahayak-text-primary truncate">Noise ColorFit Pro 4</h4>
                  <p className="text-[11px] text-sahayak-text-muted">Found at Sir MV Block</p>
                </div>
                <Link
                  to="/student/matches/m-1"
                  className="px-2.5 py-1 rounded-lg bg-sahayak-blue text-white text-[11px] font-bold"
                >
                  Match
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200&auto=format&fit=crop&q=60"
                  alt="Item"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-sahayak-text-primary truncate">Casio fx-991CW Scientific</h4>
                  <p className="text-[11px] text-sahayak-text-muted">Found at Central Library</p>
                </div>
                <Link
                  to="/student/matches/m-2"
                  className="px-2.5 py-1 rounded-lg bg-sahayak-blue text-white text-[11px] font-bold"
                >
                  Match
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-sahayak-brown/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-sahayak-text-secondary">
              Item not listed above?
            </span>
            <button
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed with Lost Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </NeumorphicCard>
      )}

      {/* STEP 2: Comprehensive Lost Report Form */}
      {step === 2 && (
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Casio Scientific Calculator"
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

            {/* Incident Location & Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Estimated Place Lost *
                </label>
                <select
                  value={incidentPlace}
                  onChange={(e) => setIncidentPlace(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2.5 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Date Lost *
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

            {/* Image Upload & Source Attribution */}
            <div className="space-y-3 p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/15">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Item Photo / Reference Image
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-sahayak-text-muted">Source:</span>
                  <select
                    value={imageSource}
                    onChange={(e) => setImageSource(e.target.value as ImageSource)}
                    className="text-xs bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-lg px-2 py-1 text-sahayak-text-primary"
                  >
                    <option value="USER_UPLOADED">My Photo (Captured Prior)</option>
                    <option value="REFERENCE_IMAGE">Online Reference Image (Catalog)</option>
                    <option value="USER_CAPTURED">Camera Capture</option>
                  </select>
                </div>
              </div>

              {imageSource === 'REFERENCE_IMAGE' && (
                <p className="text-[11px] text-sahayak-gold-dark bg-sahayak-gold-soft/50 p-2 rounded-lg">
                  Notice: This image will be labeled as a Reference Material to prevent verification confusion.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src={imageUrl}
                  alt="Item Preview"
                  className="w-24 h-24 rounded-xl object-cover border border-sahayak-brown/20 shadow-sm"
                />
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL or choose file"
                    className="w-full bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                  <p className="text-[11px] text-sahayak-text-muted">
                    Clear photos significantly increase AI similarity match confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Description & AI Assistant */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Item Description & Context
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
                placeholder="Describe what happened, color specifics, stickers, marks, or any attached keychain..."
                className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl p-3 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
              />
            </div>

            {/* Distinguishing Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Brand / Make
                </label>
                <input
                  type="text"
                  placeholder="e.g. Casio, Noise, Apple"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Primary Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midnight Blue / Silver"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Secret Clue (For Verification)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scratch on bezel, name on back"
                  value={distinguishingFeatures}
                  onChange={(e) => setDistinguishingFeatures(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-sahayak-brown/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold"
              >
                Back to Search
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting & Running Match Radar...</span>
                ) : (
                  <>
                    <span>Submit Report & Activate Match Radar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </NeumorphicCard>
      )}

      {/* STEP 3: Submission Success State */}
      {step === 3 && (
        <NeumorphicCard className="p-8 text-center space-y-6 border border-sahayak-brown/15 shadow-neumorph-lg">
          <div className="w-16 h-16 rounded-full bg-sahayak-success-soft text-sahayak-success mx-auto flex items-center justify-center shadow-neumorph-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-sahayak-blue-deep">
              Lost Report Registered Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-md mx-auto">
              Report <span className="font-mono font-bold text-sahayak-blue">#{createdReportId || 'rep-99'}</span> is now active in the SAHAYAK neural match registry. We're continuously scanning newly handed-in items across NIE North Campus.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between text-sahayak-text-secondary">
              <span>Item:</span>
              <span className="font-bold text-sahayak-text-primary">{title}</span>
            </div>
            <div className="flex justify-between text-sahayak-text-secondary">
              <span>Estimated Location:</span>
              <span className="font-bold text-sahayak-text-primary">{incidentPlace}</span>
            </div>
            <div className="flex justify-between text-sahayak-text-secondary">
              <span>Status:</span>
              <span className="font-bold text-sahayak-blue">SEARCHING (Radar Active)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/student/matches"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <span>View Live Match Radar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/student"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold hover:border-sahayak-blue"
            >
              Back to Dashboard
            </Link>
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
};
