import { 
  User, 
  StudentProfile, 
  AdminUser, 
  ItemReport, 
  MatchItem, 
  VerificationCase, 
  Message, 
  HandoverSchedule, 
  LeaderboardEntry, 
  NotificationItem, 
  AuditEvent,
  RewardTransaction,
  CampusLocation
} from '../types';

export const mockCurrentUser: StudentProfile = {
  id: 'usr_zayan_01',
  fullName: 'Shaik Zayan Ahmed',
  name: 'Shaik Zayan Ahmed',
  email: '4ni22cs142@nie.ac.in',
  role: 'student',
  usn: '4NI22CS142',
  department: 'Computer Science & Engineering',
  semester: 6,
  academicYear: '2022 - 2026',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  points: 480,
  finderPoints: 480,
  recoveredCount: 7,
  badgeLevel: 'Gold Campus Hero',
  phone: '+91 98450 XXXXX',
  emergencyContact: '+91 94480 XXXXX',
  notificationsEnabled: true,
  emailAlertsEnabled: true,
  privacyShieldActive: true,
};

export const mockAdminUser: AdminUser = {
  id: 'adm_nagaraj_01',
  fullName: 'Dr. Nagaraj S. (Admin & Proctor)',
  name: 'Dr. Nagaraj S. (Admin & Proctor)',
  email: 'proctor.north@nie.ac.in',
  role: 'admin',
  department: 'NIE North Campus Administration & Student Welfare',
  designation: 'Chief Campus Proctor & Custodian',
  points: 1250,
  finderPoints: 1250,
  recoveredCount: 42,
  badgeLevel: 'Legendary Steward',
  permissions: ['ALL_CASES', 'MANUAL_VERIFY', 'AUDIT_LOGS', 'SECURITY_OVERRIDE', 'REWARD_MANAGEMENT']
};

export const mockCampusLocations: CampusLocation[] = [
  { id: 'loc_mb_block', name: 'MB Block (Academic Block)', zone: 'Academic Block', floor: 'All Floors (G to 3rd)', latitude: 12.3713084, longitude: 76.5869772 },
  { id: 'loc_sb_lab', name: 'SB Block (LAB Building)', zone: 'Lab Block', floor: 'Ground & 1st Floor', latitude: 12.3714376, longitude: 76.5847868 },
  { id: 'loc_library', name: 'NIE North Central Library', zone: 'Library', floor: '1st Floor Reading Hall', latitude: 12.3715731, longitude: 76.5871760 },
  { id: 'loc_food_court', name: 'NIE Food Court & Cafeteria', zone: 'Canteen', latitude: 12.3728602, longitude: 76.5856585 },
  { id: 'loc_gopi_canteen', name: "Gopi's Canteen", zone: 'Canteen', latitude: 12.3708848, longitude: 76.5866563 },
  { id: 'loc_coca_canteen', name: 'Coca-Cola Canteen', zone: 'Canteen', latitude: 12.3709261, longitude: 76.5849526 },
  { id: 'loc_bus_parking', name: 'College Bus Parking & EV Station', zone: 'Parking', latitude: 12.3709634, longitude: 76.5842074 },
  { id: 'loc_bike_parking', name: 'Student Two-Wheeler Parking', zone: 'Parking', latitude: 12.3709215, longitude: 76.5845615 },
  { id: 'loc_security_gate', name: 'Main Campus Security Gate & Custody Desk', zone: 'Gate', latitude: 12.3708164, longitude: 76.5857619 }
];

export const mockReports: ItemReport[] = [
  {
    id: 'rep_lost_001',
    type: 'LOST',
    title: 'Blue Dell XPS Laptop Sleeve & Scientific Calculator',
    category: 'Electronics & Gadgets',
    description: 'Dark navy blue padded Dell 14-inch sleeve with Casio fx-991CW calculator and Parker pen inside front zipper.',
    dateLostOrFound: '2026-09-25',
    timeLostOrFound: '11:45 AM',
    incidentPlace: 'MB Block — 2nd Floor (CR-204 Lecture Hall)',
    currentLocation: 'Reported Missing',
    images: [
      {
        id: 'img_01',
        url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
        source: 'REFERENCE_IMAGE',
        uploadedAt: '2026-09-25T12:00:00Z'
      }
    ],
    status: 'MATCH_SUGGESTED',
    user: mockCurrentUser,
    brand: 'Dell / Casio',
    primaryColor: 'Navy Blue',
    identifyingMarks: 'Small silver NIE IEEE student sticker on bottom corner of calculator',
    secretVerificationClue: 'What color is the pen clip inside the front zipper pocket?',
    rewardPointsEligible: 50,
    createdAt: '2026-09-25T12:10:00Z',
    updatedAt: '2026-09-26T14:30:00Z',
    matchedReportId: 'rep_fnd_002'
  },
  {
    id: 'rep_fnd_002',
    type: 'FOUND',
    title: 'Navy Padded Laptop Sleeve with Calculator inside',
    category: 'Electronics & Gadgets',
    description: 'Found on the 3rd bench in CR-204 after 4th hour Mathematics lecture. Has a scientific calculator inside.',
    dateLostOrFound: '2026-09-25',
    timeLostOrFound: '12:15 PM',
    incidentPlace: 'MB Block — 2nd Floor (CR-204)',
    currentLocation: 'NIE Main Security Gate (Under Duty Officer S. Kumar)',
    images: [
      {
        id: 'img_02',
        url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
        source: 'USER_CAPTURED',
        uploadedAt: '2026-09-25T12:30:00Z'
      }
    ],
    status: 'VERIFICATION_PENDING',
    user: {
      id: 'usr_rohit_02',
      name: 'Rohit Verma',
      email: '4ni22ec088@nie.ac.in',
      role: 'student',
      usn: '4NI22EC088',
      department: 'Electronics & Communication',
      finderPoints: 310,
      recoveredCount: 4,
      badgeLevel: 'Silver Guardian'
    },
    brand: 'Dell',
    primaryColor: 'Navy Blue',
    rewardPointsEligible: 50,
    createdAt: '2026-09-25T12:35:00Z',
    updatedAt: '2026-09-26T15:00:00Z'
  },
  {
    id: 'rep_lost_003',
    type: 'LOST',
    title: 'Brown Leather Fossil Wallet with NIE College ID',
    category: 'Wallets & Money',
    description: 'Brown bifold leather wallet containing college smart ID card, driving license, and campus library barcode.',
    dateLostOrFound: '2026-09-26',
    timeLostOrFound: '01:30 PM',
    incidentPlace: 'NIE Food Court — North Outdoor Lawn Table',
    currentLocation: 'Reported Missing',
    images: [
      {
        id: 'img_03',
        url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
        source: 'REFERENCE_IMAGE',
        uploadedAt: '2026-09-26T13:45:00Z'
      }
    ],
    status: 'ACTIVE_SEARCHING',
    user: mockCurrentUser,
    brand: 'Fossil',
    primaryColor: 'Warm Brown',
    secretVerificationClue: 'What is the last four digits on the student library barcode?',
    rewardPointsEligible: 60,
    createdAt: '2026-09-26T13:50:00Z',
    updatedAt: '2026-09-26T13:50:00Z'
  },
  {
    id: 'rep_fnd_004',
    type: 'FOUND',
    title: 'Boat Airdopes 141 True Wireless Case (Black)',
    category: 'Electronics & Gadgets',
    description: 'Black charging case with left earbud found on library discussion table near digital stack room.',
    dateLostOrFound: '2026-09-26',
    timeLostOrFound: '04:10 PM',
    incidentPlace: 'NIE Central Library — 1st Floor Discussion Area',
    currentLocation: 'Central Library Help Desk (Librarian Mr. Mahesh)',
    images: [
      {
        id: 'img_04',
        url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        source: 'USER_CAPTURED',
        uploadedAt: '2026-09-26T16:20:00Z'
      }
    ],
    status: 'ACTIVE_SEARCHING',
    user: {
      id: 'usr_ananya_03',
      name: 'Ananya Rao',
      email: '4ni23is014@nie.ac.in',
      role: 'student',
      usn: '4NI23IS014',
      department: 'Information Science & Engineering',
      finderPoints: 190,
      recoveredCount: 2,
      badgeLevel: 'Bronze Helper'
    },
    brand: 'boAt',
    primaryColor: 'Matte Black',
    rewardPointsEligible: 40,
    createdAt: '2026-09-26T16:25:00Z',
    updatedAt: '2026-09-26T16:25:00Z'
  },
  {
    id: 'rep_fnd_005',
    type: 'FOUND',
    title: 'Yamaha FZ Bike Key with Red Metal NIE Keychain',
    category: 'Keys & Access Cards',
    description: 'Key found near two-wheeler parking shed column #4.',
    dateLostOrFound: '2026-09-24',
    timeLostOrFound: '05:30 PM',
    incidentPlace: 'Student Two-Wheeler Parking (Pillar 4)',
    currentLocation: 'Campus Security Gate Main Desk',
    images: [
      {
        id: 'img_05',
        url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
        source: 'USER_CAPTURED',
        uploadedAt: '2026-09-24T17:40:00Z'
      }
    ],
    status: 'SAFELY_RETURNED',
    user: {
      id: 'usr_kavitha_04',
      name: 'Kavitha M.',
      email: '4ni22me045@nie.ac.in',
      role: 'student',
      usn: '4NI22ME045',
      department: 'Mechanical Engineering',
      finderPoints: 520,
      recoveredCount: 8,
      badgeLevel: 'Gold Campus Hero'
    },
    brand: 'Yamaha',
    primaryColor: 'Black & Silver',
    rewardPointsEligible: 40,
    createdAt: '2026-09-24T17:45:00Z',
    updatedAt: '2026-09-25T11:00:00Z'
  }
];

export const mockMatches: MatchItem[] = [
  {
    id: 'mat_001',
    lostReport: mockReports[0], // Blue Dell Laptop Sleeve
    foundReport: mockReports[1], // Found sleeve in CR-204
    similarityScore: 94,
    signals: {
      categoryMatch: true,
      timeProximityScore: 92,
      locationProximityScore: 98,
      imageSimilarityScore: 89,
      textSimilarityScore: 95,
      attributeMatchScore: 96,
      reasons: [
        'Exact room match: MB Block 2nd Floor CR-204 Lecture Hall',
        'Time window delta: 30 minutes apart after Mathematics lecture',
        'Item attribute correlation: Navy blue Dell 14-inch sleeve with Casio scientific calculator',
        'Computer vision detected matching padded zipper contour and logo badge placement'
      ]
    },
    status: 'VERIFICATION_REQUESTED',
    suggestedAt: '2026-09-25T12:40:00Z',
    matchClues: [
      'Incident location exactly matches (MB Block CR-204)',
      'Both descriptions specify Casio scientific calculator inside sleeve pocket',
      'Finder deposited item directly with campus security for safe verification'
    ]
  }
];

export const mockVerificationCases: VerificationCase[] = [
  {
    id: 'case_ver_001',
    matchId: 'mat_001',
    lostReportId: 'rep_lost_001',
    foundReportId: 'rep_fnd_002',
    claimantUser: mockCurrentUser,
    finderUser: mockReports[1].user,
    questions: [
      {
        id: 'q_01',
        question: 'What model or sticker is present on the Casio calculator?',
        providedAnswer: 'Casio fx-991CW with silver IEEE NIE student chapter badge',
        isVerified: true
      },
      {
        id: 'q_02',
        question: 'What additional writing instrument is in the front compartment?',
        providedAnswer: 'A black Parker Jotter pen with golden clip',
        isVerified: true
      }
    ],
    status: 'OWNERSHIP_CONFIRMED',
    confidenceRating: 'High',
    manualReviewNotes: 'Verified against duty officer logbook at Security Desk. Perfect item details match.',
    assignedStaff: 'Officer S. Kumar (Chief Gate In-Charge)',
    createdAt: '2026-09-25T13:00:00Z'
  }
];

export const mockHandoverSchedule: HandoverSchedule = {
  id: 'hnd_001',
  caseId: 'case_ver_001',
  method: 'CAMPUS_SECURITY_MAIN_GATE',
  locationName: 'NIE North Campus Main Gate Security Office',
  scheduledDate: '2026-09-27',
  scheduledTimeWindow: '10:00 AM - 04:00 PM',
  qrVerificationCode: 'SAHAYAK-REC-2026-9941',
  otpCode: '7492',
  isFinderConfirmed: true,
  isClaimantConfirmed: false,
  isStaffWitnessed: true,
  status: 'SCHEDULED'
};

export const mockMessages: Message[] = [
  {
    id: 'msg_01',
    caseId: 'case_ver_001',
    senderId: 'sys_00',
    senderName: 'SAHAYAK Match Guard',
    senderRole: 'security',
    text: '🛡️ Protected Case Room created. Direct personal contact numbers are hidden to protect privacy.',
    timestamp: '2026-09-25T13:05:00Z',
    isSystemMessage: true
  },
  {
    id: 'msg_02',
    caseId: 'case_ver_001',
    senderId: 'usr_rohit_02',
    senderName: 'Rohit Verma (Finder)',
    senderRole: 'student',
    text: 'Hey! I found your laptop sleeve on bench 3 in CR-204 after math class. I handed it safely to Officer Kumar at the Main Gate security desk so you can pick it up safely!',
    timestamp: '2026-09-25T13:12:00Z'
  },
  {
    id: 'msg_03',
    caseId: 'case_ver_001',
    senderId: 'usr_zayan_01',
    senderName: 'Shaik Zayan Ahmed (Claimant)',
    senderRole: 'student',
    text: 'Thank you so much Rohit! Really appreciate you depositing it at the gate. I will collect it during lunch break with my student ID!',
    timestamp: '2026-09-25T13:18:00Z'
  },
  {
    id: 'msg_04',
    caseId: 'case_ver_001',
    senderId: 'adm_nagaraj_01',
    senderName: 'Officer S. Kumar (Security Duty)',
    senderRole: 'admin',
    text: 'Item is safely logged under Token #REC-402 in the security custody locker. Please show the SAHAYAK QR/OTP code when claiming.',
    timestamp: '2026-09-25T13:30:00Z'
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: 'usr_lb_01',
      name: 'Pooja Hegde',
      email: '4ni21ec072@nie.ac.in',
      role: 'student',
      usn: '4NI21EC072',
      department: 'Electronics & Communication',
      finderPoints: 890,
      recoveredCount: 14,
      badgeLevel: 'Legendary Steward'
    },
    points: 890,
    recoveriesCount: 14,
    streakDays: 18,
    department: 'ECE (4th Year)'
  },
  {
    rank: 2,
    user: {
      id: 'usr_lb_02',
      name: 'Varun Kashyap',
      email: '4ni22is118@nie.ac.in',
      role: 'student',
      usn: '4NI22IS118',
      department: 'Information Science',
      finderPoints: 720,
      recoveredCount: 11,
      badgeLevel: 'Legendary Steward'
    },
    points: 720,
    recoveriesCount: 11,
    streakDays: 12,
    department: 'ISE (3rd Year)'
  },
  {
    rank: 3,
    user: mockCurrentUser,
    points: 480,
    recoveriesCount: 7,
    streakDays: 9,
    department: 'CSE (3rd Year)',
    isCurrentUser: true
  },
  {
    rank: 4,
    user: {
      id: 'usr_lb_04',
      name: 'Kavitha M.',
      email: '4ni22me045@nie.ac.in',
      role: 'student',
      usn: '4NI22ME045',
      department: 'Mechanical Engineering',
      finderPoints: 440,
      recoveredCount: 6,
      badgeLevel: 'Gold Campus Hero'
    },
    points: 440,
    recoveriesCount: 6,
    streakDays: 6,
    department: 'Mech (3rd Year)'
  },
  {
    rank: 5,
    user: {
      id: 'usr_lb_05',
      name: 'Rohit Verma',
      email: '4ni22ec088@nie.ac.in',
      role: 'student',
      usn: '4NI22EC088',
      department: 'Electronics & Communication',
      finderPoints: 360,
      recoveredCount: 5,
      badgeLevel: 'Silver Guardian'
    },
    points: 360,
    recoveriesCount: 5,
    streakDays: 5,
    department: 'ECE (3rd Year)'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_01',
    userId: 'usr_zayan_01',
    type: 'MATCH_FOUND',
    title: 'High Confidence Match Detected (94%)',
    message: 'A found report in MB Block CR-204 matches your Dell laptop sleeve report.',
    linkUrl: '/student/matches/mat_001',
    isRead: false,
    needsAction: true,
    timestamp: '2026-09-25T12:40:00Z'
  },
  {
    id: 'notif_02',
    userId: 'usr_zayan_01',
    type: 'VERIFICATION_UPDATE',
    title: 'Ownership Verification Approved',
    message: 'Officer S. Kumar verified your ownership answers. Safe handover scheduled.',
    linkUrl: '/student/recovery/case_ver_001',
    isRead: false,
    needsAction: true,
    timestamp: '2026-09-25T13:00:00Z'
  },
  {
    id: 'notif_03',
    userId: 'usr_zayan_01',
    type: 'REWARD_EARNED',
    title: '+50 Finder Points Credited',
    message: 'You earned 50 Finder Points for safely reporting and recovering campus belongings.',
    linkUrl: '/student/rewards',
    isRead: true,
    timestamp: '2026-09-24T18:00:00Z'
  }
];

export const mockRewardHistory: RewardTransaction[] = [
  {
    id: 'rwd_01',
    userId: 'usr_zayan_01',
    caseId: 'case_ver_001',
    points: 50,
    reason: 'Verified Recovery Handover of Academic Material (Dell Laptop Sleeve)',
    badgeAwarded: 'Campus Guardian Pin',
    timestamp: '2026-09-25T13:30:00Z'
  },
  {
    id: 'rwd_02',
    userId: 'usr_zayan_01',
    points: 40,
    reason: 'Safely Handed Found Scientific Calculator to Faculty Office',
    timestamp: '2026-09-18T14:15:00Z'
  },
  {
    id: 'rwd_03',
    userId: 'usr_zayan_01',
    points: 100,
    reason: 'Milestone 5 Successful Verified Campus Recoveries',
    badgeAwarded: 'Gold Campus Hero',
    timestamp: '2026-09-10T16:00:00Z'
  }
];

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'aud_001',
    timestamp: '2026-09-26T15:20:00Z',
    eventType: 'HANDOVER_COMPLETED',
    actorName: 'Officer S. Kumar',
    actorRole: 'security',
    caseId: 'case_ver_001',
    status: 'SUCCESS',
    description: 'Physical handover completed at Main Gate security desk with dual OTP confirmation.'
  },
  {
    id: 'aud_002',
    timestamp: '2026-09-26T13:00:00Z',
    eventType: 'VERIFICATION_ATTEMPT',
    actorName: 'Shaik Zayan Ahmed',
    actorRole: 'student',
    caseId: 'case_ver_001',
    status: 'SUCCESS',
    description: 'Ownership verification questions answered with 100% attribute match.'
  },
  {
    id: 'aud_003',
    timestamp: '2026-09-25T12:40:00Z',
    eventType: 'MATCH_GENERATED',
    actorName: 'SAHAYAK Multi-Signal AI',
    actorRole: 'admin',
    caseId: 'mat_001',
    status: 'SUCCESS',
    description: 'AI Multi-Signal match calculated 94% similarity based on spatio-temporal and CV descriptors.'
  },
  {
    id: 'aud_004',
    timestamp: '2026-09-25T12:35:00Z',
    eventType: 'REPORT_CREATED',
    actorName: 'Rohit Verma (4NI22EC088)',
    actorRole: 'student',
    status: 'SUCCESS',
    description: 'New FOUND item report submitted for MB Block CR-204.'
  }
];

// Compatibility Export Aliases
export const mockItemReports = mockReports;
export const mockRewardTransactions = mockRewardHistory;
export const initialMessages = mockMessages;
export const initialNotifications = mockNotifications;

