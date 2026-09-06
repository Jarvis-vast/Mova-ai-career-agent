export type NavPath = 
  | 'overview'
  | 'jobs'
  | 'applications'
  | 'companies'
  | 'follow-ups'
  | 'interviews'
  | 'candidate-brain'
  | 'analytics'
  | 'settings';

export type JobStatus = 
  | 'SCHEDULED'
  | 'PREPARING'
  | 'BLOCKED'
  | 'APPLIED'
  | 'REJECTED'
  | 'WATCH';

export type ApplicationStage = 
  | 'Discovered'
  | 'Qualified'
  | 'Preparing'
  | 'Submitting'
  | 'Verified'
  | 'Response'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Ghosted'
  | 'Unknown'
  | 'Failed';

export type EvidenceClassification = 
  | 'VERIFIED'
  | 'USER_PROVIDED'
  | 'INFERRED'
  | 'UNKNOWN'
  | 'CANDIDATE_PROVIDED'
  | 'INFERRED_SIGNAL'
  | 'UNKNOWN_RESTRICTED';

export interface CandidateEducation {
  degree: string;
  school: string;
  specialization?: string;
  period: string;
  verifiedFactId: string;
  classification?: EvidenceClassification;
}

export interface CandidateExperience {
  role: string;
  company: string;
  division: string;
  period: string;
  location?: string;
  contractType?: string;
  summary: string;
  responsibilities?: string[];
  anchoredSkills: Array<{
    name: string;
    sourceProof: string;
    classification: EvidenceClassification;
  }>;
}

export interface CandidateProject {
  name: string;
  title?: string;
  category: string;
  description?: string;
  technologies?: string[];
  liveUrl?: string;
  githubUrl?: string;
  evidenceNotes?: string[];
  classification?: EvidenceClassification;
}

export interface CandidateCertification {
  name: string;
  grade?: string;
  classification: EvidenceClassification;
}

export interface CandidateLeadership {
  organization: string;
  role: string;
  details: string;
  classification: EvidenceClassification;
}

export interface CandidateSkillsTaxonomy {
  operations: string[];
  marketing: string[];
  aiAutomation: string[];
  toolsSystems: string[];
  languages: string[];
}

export interface CandidatePreferences {
  location: string;
  relocation: boolean;
  minMatchScore: number;
  dailyQualifiedOpportunityTarget: number;
  salaryPreference: string;
}

export interface CandidateRules {
  locationConstraint: string;
  salaryFloor: string;
  relocationAllowed: boolean;
  blacklistedKeywords: string[];
  applicationMode: string;
  minFitScore: number;
  dailyOpportunityTarget: number;
}

export interface CandidateEvidenceNode {
  nodeId: string;
  title: string;
  subtitle: string;
  classification: EvidenceClassification;
  details: string;
  metadata: string;
  levelBadge?: string;
  commitHash?: string;
}

export interface LinkedInAuthProfile {
  sub: string;
  name: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  emailVerified?: boolean;
  picture?: string;
  locale?: {
    country?: string;
    language?: string;
  };
  connectedAt: string;
  provider: 'linkedin';
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  relocationAllowed: boolean;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  title: string;
  yearsExperience: number;
  fitScoreAverage: number;
  readiness: string;
  avatarUrl: string;
  education: CandidateEducation[];
  experience: CandidateExperience[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
  leadership: CandidateLeadership[];
  skills: string[];
  skillsTaxonomy: CandidateSkillsTaxonomy;
  evidenceNodes?: CandidateEvidenceNode[];
  preferences: CandidatePreferences;
  rules: CandidateRules;
  linkedInAuth?: LinkedInAuthProfile;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  salary: string;
  postedAgo: string;
  status: JobStatus;
  fitScore: number;
  hardConstraintsPassed: boolean;
  hardConstraintDetails?: {
    locationMatch: boolean;
    compensationMatch: boolean;
    relocationMatch: boolean;
    blacklistClear: boolean;
    failureReason?: string;
  };
  scoreBreakdown: {
    skillsMatch: number;
    roleSeniority: number;
    experienceMatch: number;
    locationRule: string;
    portfolioFit?: number;
    industryFit?: number;
  };
  strengths: string;
  gaps?: string;
  riskNote?: string;
  queuePosition?: number;
  cycleNumber?: number;
  tailoringProgress?: number;
  artifactsReady?: string;
  currencyFormat?: string;
}

export interface ApplicationRecord {
  id: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  status: 'VERIFIED' | 'SUBMITTING_VERIFYING' | 'UNKNOWN_AUDIT' | 'RESPONSE' | 'INTERVIEW';
  timestamp: string;
  adapter: string;
  confirmationToken?: string;
  receiptId?: string;
  resumeVersion: string;
  evidenceCoverage: string;
  currentStageNumber?: number;
  totalStages?: number;
  stageProgressPercent?: number;
  stageLog?: string;
  warningNote?: string;
  auditRetryIn?: string;
  attemptNumber?: string;
  signedReceiptHash?: string;
  payloadJson?: string;
}

export interface MissionLogItem {
  id: string;
  agentName: 'Verification Agent' | 'Application Agent' | 'Resume Agent' | 'Match Agent' | 'Research Agent';
  time: string;
  headline: string;
  subDetail: string;
  badgeText?: string;
  badgeType?: 'success' | 'info' | 'warning';
  icon: string;
}

export interface FollowUpItem {
  id: string;
  company: string;
  role: string;
  submittedDaysAgo: number;
  status: 'EXECUTING' | 'SCHEDULED' | 'PAUSED' | 'DELIVERED';
  countdown: string;
  recruiter: string;
  draftSubject: string;
  draftBody: string;
  cancellationConditions: string[];
  evidenceRef: string;
}

export interface InterviewRecord {
  id: string;
  company: string;
  role: string;
  stage: 'Tech Screen' | 'Hiring Manager' | 'Onsite Loop' | 'Executive';
  scheduledDate: string;
  roundDetails: string;
  salaryContext: string;
  interviewers: Array<{
    name: string;
    title: string;
    focusArea: string;
  }>;
  prepPackage: {
    keyQuestions: string[];
    starStories: Array<{
      situation: string;
      task: string;
      action: string;
      result: string;
      evidenceAnchor: string;
    }>;
    companySignals: string[];
    questionsToAsk: string[];
  };
}

export interface CompanyRadarItem {
  id: string;
  name: string;
  industry: string;
  hiringVelocity: 'High' | 'Moderate' | 'Selective';
  verifiedResponseRate: string;
  directPortalRoiMultiplier: string;
  adapterSupport: string;
  activeOpportunities: number;
  headquarters: string;
  techStack: string[];
}
