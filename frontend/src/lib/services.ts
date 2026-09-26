import { ItemReport, MatchItem, VerificationCase, AuditEvent, Message } from '../types';
import { mockReports, mockMatches, mockVerificationCases, mockAuditEvents, mockMessages, mockItemReports } from './mockData';

// Local storage keys
const REPORTS_KEY = 'sahayak_reports';
const MATCHES_KEY = 'sahayak_matches';
const CASES_KEY = 'sahayak_cases';
const AUDIT_KEY = 'sahayak_audit';

// Helper to safely get from localStorage
function getLocal<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function setLocal<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Reports Service
export const reportsService = {
  getReports: (): ItemReport[] => {
    return getLocal<ItemReport[]>(REPORTS_KEY, mockItemReports || mockReports);
  },

  getAll: (): ItemReport[] => {
    return reportsService.getReports();
  },

  getReportById: (id: string): ItemReport => {
    const reports = reportsService.getReports();
    const found = reports.find(r => 
      r.id === id || 
      r.id.toLowerCase() === id.toLowerCase() ||
      r.id.includes(id) ||
      id.includes(r.id)
    );
    return found || reports[0];
  },

  getById: (id: string): ItemReport => {
    return reportsService.getReportById(id);
  },

  createReport: (reportData: Partial<ItemReport>): ItemReport => {
    const reports = reportsService.getReports();
    const newReport: ItemReport = {
      id: `rep_${Date.now().toString().slice(-4)}`,
      type: reportData.type || 'LOST',
      title: reportData.title || 'Untitled Item',
      category: reportData.category || 'OTHER',
      description: reportData.description || '',
      incidentPlace: reportData.incidentPlace || 'Sir MV Block',
      currentLocation: reportData.currentLocation || 'NIE Main Security Desk Locker',
      incidentDate: reportData.incidentDate || new Date().toISOString().split('T')[0],
      incidentTime: reportData.incidentTime || '12:00',
      images: reportData.images && reportData.images.length > 0 ? reportData.images : [
        {
          id: `img-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
          source: 'USER_UPLOADED',
          uploadedAt: new Date().toISOString()
        }
      ],
      status: reportData.status || 'SUBMITTED',
      reporterId: reportData.reporterId || 'std-1',
      reporterName: reportData.reporterName || 'Rahul Sharma',
      reporterUSN: reportData.reporterUSN || '4NI21CS089',
      brand: reportData.brand,
      color: reportData.color,
      distinguishingFeatures: reportData.distinguishingFeatures,
      isAnonymous: reportData.isAnonymous || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newReport, ...reports];
    setLocal(REPORTS_KEY, updated);

    // Audit log
    auditService.logEvent({
      eventType: 'REPORT_CREATED',
      actorName: newReport.reporterName,
      actor: newReport.reporterName,
      status: 'SUCCESS',
      caseId: newReport.id,
      description: `New ${newReport.type} report created: ${newReport.title} at ${newReport.incidentPlace}`
    });

    return newReport;
  },

  updateStatus: (id: string, status: string): ItemReport | undefined => {
    const reports = reportsService.getReports();
    const idx = reports.findIndex(r => r.id === id || r.id.includes(id));
    if (idx !== -1) {
      reports[idx].status = status;
      reports[idx].updatedAt = new Date().toISOString();
      setLocal(REPORTS_KEY, reports);
      return reports[idx];
    }
    return undefined;
  }
};

// Multi-Signal Matching Service
export const matchingService = {
  getMatches: (): MatchItem[] => {
    return getLocal<MatchItem[]>(MATCHES_KEY, mockMatches);
  },

  getMatchById: (id: string): MatchItem => {
    const matches = matchingService.getMatches();
    const found = matches.find(m => 
      m.id === id || 
      m.id.toLowerCase() === id.toLowerCase() ||
      m.id.includes(id) ||
      id.includes(m.id) ||
      m.lostReport.id === id ||
      m.foundReport.id === id
    );
    return found || matches[0];
  }
};

// Verification & Case Service
export const verificationService = {
  getCases: (): VerificationCase[] => {
    return getLocal<VerificationCase[]>(CASES_KEY, mockVerificationCases);
  },

  getAllCases: (): VerificationCase[] => {
    return verificationService.getCases();
  },

  getCaseById: (id: string): VerificationCase => {
    const cases = verificationService.getCases();
    const found = cases.find(c => 
      c.id === id || 
      c.id.toLowerCase() === id.toLowerCase() ||
      c.matchId === id || 
      c.reportId === id ||
      c.id.includes(id)
    );
    return found || cases[0];
  },

  submitVerification: (matchOrReportId: string, clues: string[]): VerificationCase => {
    const cases = verificationService.getCases();
    const newCase: VerificationCase = {
      id: `c-${Date.now().toString().slice(-3)}`,
      matchId: matchOrReportId,
      reportId: matchOrReportId,
      claimantName: 'Shaik Zayan Ahmed',
      claimantUSN: '4NI22CS142',
      answersSubmitted: clues.length > 0 ? clues : ['Bezel scratch & sticker mark on back'],
      status: 'UNDER_REVIEW',
      handoverLocation: 'NIE Main Security Desk Locker #3',
      createdAt: new Date().toISOString()
    };

    const updated = [newCase, ...cases];
    setLocal(CASES_KEY, updated);

    auditService.logEvent({
      eventType: 'VERIFICATION_ATTEMPT',
      actor: 'Shaik Zayan Ahmed (4NI22CS142)',
      caseId: newCase.id,
      status: 'SUCCESS',
      description: `Claimant submitted confidential verification clues for case #${newCase.id}`
    });

    return newCase;
  },

  verifyCase: (caseId: string, officerId: string = 'SEC-01', otp: string = 'NIE-8842'): VerificationCase => {
    const cases = verificationService.getCases();
    const idx = cases.findIndex(c => c.id === caseId || c.matchId === caseId);
    if (idx !== -1) {
      cases[idx].status = 'VERIFIED';
      cases[idx].handoverOtp = otp;
      cases[idx].handoverStatus = 'SCHEDULED';
      cases[idx].assignedStaff = officerId;
      setLocal(CASES_KEY, cases);

      auditService.logEvent({
        eventType: 'VERIFICATION_APPROVED',
        actor: `Officer ${officerId} (NIE Security)`,
        caseId: caseId,
        status: 'SUCCESS',
        description: `Ownership confirmed. Issued OTP ${otp} for locker pickup.`
      });

      return cases[idx];
    }
    return cases[0];
  },

  completeHandover: (caseId: string): VerificationCase => {
    const cases = verificationService.getCases();
    const idx = cases.findIndex(c => c.id === caseId || c.matchId === caseId);
    if (idx !== -1) {
      cases[idx].status = 'COMPLETED';
      cases[idx].handoverStatus = 'COMPLETED';
      setLocal(CASES_KEY, cases);

      auditService.logEvent({
        eventType: 'HANDOVER_COMPLETED',
        actor: 'Security Desk #1 Officer',
        caseId: caseId,
        status: 'SUCCESS',
        description: `Handover signed off and item released to verified owner.`
      });

      return cases[idx];
    }
    return cases[0];
  }
};

// Audit Service
export const auditService = {
  getEvents: (): AuditEvent[] => {
    return getLocal<AuditEvent[]>(AUDIT_KEY, mockAuditEvents);
  },

  getRecentLogs: (): AuditEvent[] => {
    return auditService.getEvents();
  },

  logEvent: (eventData: Partial<AuditEvent>): AuditEvent => {
    const events = auditService.getEvents();
    const newEvent: AuditEvent = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventType: eventData.eventType || 'SYSTEM_ACTION',
      actor: eventData.actor || eventData.actorName || 'System Service',
      actorName: eventData.actorName || eventData.actor || 'System Service',
      caseId: eventData.caseId,
      status: eventData.status || 'SUCCESS',
      description: eventData.description || 'System event recorded'
    };

    setLocal(AUDIT_KEY, [newEvent, ...events]);
    return newEvent;
  }
};

// AI Campus Assistant Service
export const assistantService = {
  generateReportDescription: async (title: string, category: string, location: string): Promise<string> => {
    return `Misplaced item: ${title} (${category.replace('_', ' ')}) near ${location}. In good condition with standard distinguishing markings. Please contact NIE Proctor office for verification.`;
  },

  askQuestion: async (query: string): Promise<string> => {
    const lower = query.toLowerCase();
    if (lower.includes('where') || lower.includes('locker') || lower.includes('security') || lower.includes('desk')) {
      return 'Official NIE North Campus collection and handover points are located at:\n1. Main Security Desk (Ground Floor, Main Entrance Gate) - Open 24/7\n2. Sir MV Block Department Proctor Office (Room 102)\n3. Central Library Circulation Helpdesk\n4. North Canteen Security Desk.';
    }
    if (lower.includes('verify') || lower.includes('proof') || lower.includes('claim')) {
      return 'To verify ownership:\n1. Open your match in the AI Match Radar.\n2. Click "Verify My Ownership".\n3. Answer confidential questions (such as wallpaper photo, secret scratch marks, or exact loss scenario).\n4. Once reviewed by NIE Security/Proctor, you will receive a secure OTP to collect the item.';
    }
    if (lower.includes('point') || lower.includes('reward') || lower.includes('points') || lower.includes('samaritan')) {
      return 'Good Samaritan points are awarded for verified returns:\n- Reporting found items: +30 Points\n- Successful proctor-verified handover: +50 Points\nPoints can be redeemed for NIE Cafeteria vouchers, extended library privileges, and official Dean of Student Affairs certificates.';
    }
    return 'Thank you for asking SAHAYAK. You can report lost or found items directly from the student dashboard, track live AI similarity scores in the Match Radar, or visit the NIE North Main Security Desk for assistance.';
  }
};
