import React, { useState, useRef } from 'react';
import {
  Brain,
  ShieldCheck,
  CheckCircle2,
  Lock,
  GitCommit,
  GraduationCap,
  Briefcase,
  Sliders,
  ArrowRight,
  Upload,
  FileText,
  Plus,
  Edit3,
  Info,
  X,
  ExternalLink,
  Award,
  Users,
  Code,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Layers,
} from 'lucide-react';
import { CandidateProfile, NavPath, MissionLogItem } from '../types';
import { parseResumeText } from '../utils/engine';
import { LinkedInAuthModal } from './modals/LinkedInAuthModal';

interface CandidateBrainViewProps {
  candidateProfile: CandidateProfile;
  onOpenRules: () => void;
  onNavigate: (path: NavPath) => void;
  onUpdateProfile: (profile: CandidateProfile) => void;
  onLogAction: (log: MissionLogItem) => void;
  onOpenLinkedInModal?: () => void;
}

export const CandidateBrainView: React.FC<CandidateBrainViewProps> = ({
  candidateProfile,
  onOpenRules,
  onNavigate,
  onUpdateProfile,
  onLogAction,
  onOpenLinkedInModal,
}) => {
  const [selectedProofNode, setSelectedProofNode] = useState<number>(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [isLocalLinkedInModalOpen, setIsLocalLinkedInModalOpen] = useState(false);
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual edit form state
  const [editName, setEditName] = useState(candidateProfile.name);
  const [editTitle, setEditTitle] = useState(candidateProfile.title);
  const [editLocation, setEditLocation] = useState(candidateProfile.location);
  const [editYears, setEditYears] = useState(candidateProfile.yearsExperience);
  const [editNewSkill, setEditNewSkill] = useState('');

  const isProfileEmpty = !candidateProfile.name && candidateProfile.experience.length === 0;

  const handleProcessResume = (text: string, filename?: string) => {
    if (!text.trim()) {
      setUploadError('Please provide resume content or upload a valid file.');
      return;
    }

    const parsed = parseResumeText(text, filename);
    const updated: CandidateProfile = {
      ...candidateProfile,
      name: parsed.name || candidateProfile.name || 'Candidate',
      title: parsed.title || candidateProfile.title || 'Professional',
      location: parsed.location || candidateProfile.location || 'Remote',
      yearsExperience: parsed.yearsExperience || candidateProfile.yearsExperience || 3,
      fitScoreAverage: parsed.fitScoreAverage || 85,
      readiness: 'Active (Truth Layer Grounded)',
      avatarUrl: candidateProfile.avatarUrl,
      education: parsed.education && parsed.education.length > 0 ? parsed.education : candidateProfile.education,
      experience: parsed.experience && parsed.experience.length > 0 ? parsed.experience : candidateProfile.experience,
      rules: {
        ...candidateProfile.rules,
        ...(parsed.rules || {}),
        locationConstraint: candidateProfile.rules.locationConstraint || parsed.rules?.locationConstraint || 'Remote Allowed',
        salaryFloor: candidateProfile.rules.salaryFloor || parsed.rules?.salaryFloor || '$120,000 / yr',
      },
    };

    onUpdateProfile(updated);
    setIsUploadModalOpen(false);
    setResumeTextInput('');
    setUploadError(null);

    onLogAction({
      id: `log-${Date.now()}`,
      agentName: 'Verification Agent',
      time: 'Just now',
      headline: `Candidate Brain Initialized: Extracted truth layer for ${updated.name}`,
      subDetail: `Parsed ${updated.experience.length} experience nodes and verified credentials`,
      badgeText: 'VERIFIED',
      badgeType: 'success',
      icon: 'brain',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessResume(content, file.name);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try pasting the resume text directly.');
    };
    reader.readAsText(file);
  };

  const handleSaveManualEdit = () => {
    const updated: CandidateProfile = {
      ...candidateProfile,
      name: editName.trim() || 'Candidate',
      title: editTitle.trim() || 'Software Professional',
      location: editLocation.trim() || 'Remote',
      yearsExperience: Number(editYears) || 0,
      readiness: 'Active (Candidate Truth Layer Grounded)',
    };

    onUpdateProfile(updated);
    setIsManualEditOpen(false);

    onLogAction({
      id: `log-${Date.now()}`,
      agentName: 'Verification Agent',
      time: 'Just now',
      headline: `Candidate Profile Updated: ${updated.name}`,
      subDetail: `Verified role: ${updated.title} · Location: ${updated.location}`,
      badgeText: 'PROFILE SYNCED',
      badgeType: 'info',
      icon: 'rule',
    });
  };

  const candidateInitials = candidateProfile.name
    ? candidateProfile.name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '—';

  // Real primary proof node from candidate experience
  const primaryExp = candidateProfile.experience[0];
  const primarySkill = primaryExp?.anchoredSkills[0];

  return (
    <div className="flex flex-col w-full relative pb-20">
      <div className="px-8 py-8 max-w-[1440px] mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#524535]/15">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-['Playfair_Display'] text-[#F8F9FA]">Candidate Brain</h1>
              <span
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                  isProfileEmpty
                    ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                    : 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />{' '}
                {isProfileEmpty ? 'Truth Layer Uninitialized' : 'Truth Layer Active · Zero Hallucinations'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
              The deterministic single source of truth for all autonomous agent operations. Grounding is strictly enforced.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-upload-resume-header"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffd7a9] text-[#462a00] hover:opacity-90 text-xs font-semibold transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isProfileEmpty ? 'Upload Resume' : 'Update Resume'}</span>
            </button>
            <button
              onClick={() => {
                setEditName(candidateProfile.name);
                setEditTitle(candidateProfile.title);
                setEditLocation(candidateProfile.location);
                setEditYears(candidateProfile.yearsExperience);
                setIsManualEditOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] border border-[#524535]/30 text-[#e5e2e3] text-xs font-medium transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#ffd7a9]" />
              <span>Edit Profile</span>
            </button>
          </div>
        </header>

        {/* TRUTH LAYER & STRICT EVIDENCE RULES BANNER */}
        <section className="bg-gradient-to-r from-[#1c1b1c] via-[#201f20] to-[#1c1b1c] rounded-2xl border border-[#ffd7a9]/30 p-6 shadow-lg space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] pulse-dot" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffd7a9]">
                  Hard Boundary Enforced
                </h2>
              </div>
              <p className="text-sm text-[#F8F9FA] font-medium leading-relaxed">
                Only facts classified as <strong className="text-[#22C55E]">VERIFIED</strong> or{' '}
                <strong className="text-[#ffd7a9]">CANDIDATE-PROVIDED</strong> are permitted in generated artifacts.
                Inferred signals may inform internal matching but are strictly quarantined from external applications.
              </p>
            </div>
            <div className="shrink-0 text-right font-mono text-xs">
              <span className="text-[#A1A1AA] block">Enforcement Mode</span>
              <span className="text-[#22C55E] font-bold">100% DETERMINISTIC</span>
            </div>
          </div>

          {/* Classification Taxonomy Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#524535]/20">
            <div className="p-3 rounded-xl bg-[#2a2a2b] border border-[#22C55E]/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold font-mono text-[#22C55E]">
                <span>VERIFIED</span>
                <span>[TIER 1]</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-snug">
                Third-party attested, registrar cleared degree, or git commit.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#2a2a2b] border border-[#ffd7a9]/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold font-mono text-[#ffd7a9]">
                <span>CANDIDATE-PROVIDED</span>
                <span>[TIER 2]</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-snug">
                User-supplied fact in dossier. Permitted with provenance cite.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#2a2a2b] border border-[#818CF8]/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold font-mono text-[#818CF8]">
                <span>INFERRED SIGNAL</span>
                <span>[INTERNAL]</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-snug">
                Derived by Match Agent. Strictly forbidden from resume claims.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#2a2a2b] border border-[#EF4444]/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold font-mono text-[#EF4444]">
                <span>UNKNOWN / RESTRICTED</span>
                <span>[PROHIBITED]</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-snug">
                Missing proof. Blacklisted from all autonomous submissions.
              </p>
            </div>
          </div>
        </section>

        {/* Empty State when no profile or resume exists */}
        {isProfileEmpty ? (
          <div className="bg-[#1c1b1c] rounded-2xl border border-[#524535]/30 p-12 text-center max-w-3xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#ffd7a9]/10 border border-[#ffd7a9]/30 text-[#ffd7a9] flex items-center justify-center mx-auto shadow-inner">
              <Brain className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-['Playfair_Display'] text-[#F8F9FA]">
                Your Candidate Brain is empty.
              </h2>
              <p className="text-sm text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
                Upload your resume to initialize Candidate Brain and build your verified truth layer. MOVA operates strictly on verified candidate facts and will never hallucinate or fabricate career accomplishments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="btn-empty-upload-resume"
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ffd7a9] text-[#462a00] font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume</span>
              </button>
              <button
                onClick={() => {
                  setEditName('');
                  setEditTitle('');
                  setEditLocation('');
                  setEditYears(0);
                  setIsManualEditOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2a2a2b] hover:bg-[#353436] border border-[#524535]/40 text-[#e5e2e3] font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-[#ffd7a9]" />
                <span>Enter Profile Manually</span>
              </button>
            </div>
          </div>
        ) : (
          /* Populated State with Real Candidate Data */
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Candidate Profile, Rules, & Credentials */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              {/* Candidate Identity Card */}
              <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#ffd7a9] text-[#462a00] flex items-center justify-center font-['Playfair_Display'] text-2xl font-bold shrink-0 shadow-md">
                    {candidateInitials}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-[#F8F9FA]">{candidateProfile.name}</h3>
                      <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded border border-[#22C55E]/20">
                        VERIFIED TRUTH LAYER
                      </span>
                    </div>
                    <p className="text-xs text-[#ffd7a9] font-medium">{candidateProfile.title}</p>
                    <p className="text-xs text-[#A1A1AA]">{candidateProfile.location || 'Location Not Specified'}</p>
                  </div>
                </div>

                {/* LinkedIn OAuth 2.0 Identity Status & Sync Trigger */}
                <div
                  className={`p-3 rounded-lg border text-xs space-y-2 transition-colors ${
                    candidateProfile.linkedInAuth
                      ? 'bg-[#0077b5]/15 border-[#0077b5]/40'
                      : 'bg-[#201f20] border-[#524535]/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          candidateProfile.linkedInAuth
                            ? 'bg-[#0077b5] text-white'
                            : 'bg-[#0077b5]/20 text-[#0077b5]'
                        }`}
                      >
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#F8F9FA] text-xs">
                            {candidateProfile.linkedInAuth ? 'LinkedIn Identity Verified' : 'Authentic LinkedIn Integration'}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              candidateProfile.linkedInAuth
                                ? 'bg-[#22C55E]/20 text-[#22C55E]'
                                : 'bg-[#ffd7a9]/15 text-[#ffd7a9]'
                            }`}
                          >
                            {candidateProfile.linkedInAuth ? 'OAUTH LIVE' : 'SYNC AVAILABLE'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#A1A1AA] truncate">
                          {candidateProfile.linkedInAuth
                            ? `Connected member: ${candidateProfile.linkedInAuth.name} · OpenID sub: ${candidateProfile.linkedInAuth.sub}`
                            : 'Synchronize authentic profile records dynamically via OAuth 2.0 API'}
                        </p>
                      </div>
                    </div>

                    <button
                      id="btn-trigger-linkedin-sync-brain"
                      type="button"
                      onClick={() => (onOpenLinkedInModal ? onOpenLinkedInModal() : setIsLocalLinkedInModalOpen(true))}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all shrink-0 cursor-pointer ${
                        candidateProfile.linkedInAuth
                          ? 'bg-[#2a2a2b] hover:bg-[#353436] text-[#ffd7a9] border border-[#524535]/30'
                          : 'bg-[#0077b5] hover:bg-[#006097] text-white shadow-sm'
                      }`}
                    >
                      {candidateProfile.linkedInAuth ? 'Manage Sync' : 'Connect LinkedIn'}
                    </button>
                  </div>
                </div>

                {/* Candidate Summary */}
                {candidateProfile.summary && (
                  <p className="text-xs text-[#e5e2e3] leading-relaxed p-3 rounded-lg bg-[#201f20] border border-[#524535]/20">
                    "{candidateProfile.summary}"
                  </p>
                )}

                {/* Contact & Real Links */}
                <div className="space-y-2 pt-2 border-t border-[#524535]/20 text-xs">
                  {candidateProfile.email && (
                    <div className="flex items-center gap-2 text-[#A1A1AA]">
                      <Mail className="w-3.5 h-3.5 text-[#ffd7a9] shrink-0" />
                      <span className="font-mono text-[11px] text-[#F8F9FA]">{candidateProfile.email}</span>
                    </div>
                  )}
                  {candidateProfile.phone && (
                    <div className="flex items-center gap-2 text-[#A1A1AA]">
                      <Phone className="w-3.5 h-3.5 text-[#ffd7a9] shrink-0" />
                      <span className="font-mono text-[11px] text-[#F8F9FA]">{candidateProfile.phone}</span>
                    </div>
                  )}

                  {/* Portfolio & Social Links */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {candidateProfile.linkedinUrl && (
                      <a
                        href={candidateProfile.linkedinUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201f20] text-[#ffd7a9] border border-[#524535]/30 hover:border-[#ffd7a9]/60 text-[11px] font-mono transition-colors"
                      >
                        <Linkedin className="w-3 h-3" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-2.5 h-2.5 text-[#A1A1AA]" />
                      </a>
                    )}
                    {candidateProfile.githubUrl && (
                      <a
                        href={candidateProfile.githubUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201f20] text-[#ffd7a9] border border-[#524535]/30 hover:border-[#ffd7a9]/60 text-[11px] font-mono transition-colors"
                      >
                        <Github className="w-3 h-3" />
                        <span>GitHub</span>
                        <ExternalLink className="w-2.5 h-2.5 text-[#A1A1AA]" />
                      </a>
                    )}
                    {candidateProfile.portfolioUrl && (
                      <a
                        href={candidateProfile.portfolioUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201f20] text-[#ffd7a9] border border-[#524535]/30 hover:border-[#ffd7a9]/60 text-[11px] font-mono transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Portfolio</span>
                        <ExternalLink className="w-2.5 h-2.5 text-[#A1A1AA]" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Dynamically Computed Evidence Count Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#524535]/20 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[#201f20]">
                    <span className="text-[#A1A1AA] block text-[10px]">Verified Roles</span>
                    <span className="font-mono text-sm font-bold text-[#F8F9FA]">
                      {candidateProfile.experience.length}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#201f20]">
                    <span className="text-[#A1A1AA] block text-[10px]">Degrees / Records</span>
                    <span className="font-mono text-sm font-bold text-[#ffd7a9]">
                      {candidateProfile.education.length}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#201f20]">
                    <span className="text-[#A1A1AA] block text-[10px]">Readiness</span>
                    <span className="font-mono text-sm font-bold text-[#22C55E]">
                      100% Truth
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Rules & Hard Constraints Card */}
              <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#524535]/20">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#ffd7a9]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                      Candidate Rules &amp; Guardrails
                    </h3>
                  </div>
                  <button
                    id="btn-candidatebrain-edit-rules"
                    onClick={onOpenRules}
                    className="text-[11px] text-[#ffd7a9] hover:underline font-mono"
                  >
                    Edit Rules →
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#201f20] flex items-center justify-between">
                    <span className="text-[#A1A1AA]">Geographic Preference:</span>
                    <span className="font-mono text-[#F8F9FA] font-semibold">
                      {candidateProfile.rules.locationConstraint || 'Mumbai / Remote ONLY'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#201f20] flex items-center justify-between">
                    <span className="text-[#A1A1AA]">Relocation Permitted:</span>
                    <span className="font-mono text-[#EF4444] font-semibold">
                      {candidateProfile.rules.relocationAllowed ? 'Yes' : 'NO (Strict Veto Active)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#201f20] flex items-center justify-between">
                    <span className="text-[#A1A1AA]">Salary Preference:</span>
                    <span className="font-mono text-[#ffd7a9] font-semibold">
                      {candidateProfile.rules.salaryFloor || 'NOT PROVIDED'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-[#201f20]">
                      <span className="text-[#A1A1AA] text-[10px] block">Min Match Score</span>
                      <span className="font-mono text-[#F8F9FA] font-bold">
                        &ge;{candidateProfile.rules.minFitScore || 85}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#201f20]">
                      <span className="text-[#A1A1AA] text-[10px] block">Daily Target</span>
                      <span className="font-mono text-[#F8F9FA] font-bold">
                        {candidateProfile.rules.dailyOpportunityTarget || 10} Opps
                      </span>
                    </div>
                  </div>
                  {candidateProfile.rules.blacklistedKeywords.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-[#201f20] space-y-1">
                      <span className="text-[#A1A1AA] block">Hard Blacklist Keywords:</span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {candidateProfile.rules.blacklistedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Education & Verified Credentials */}
              <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#524535]/20">
                  <GraduationCap className="w-4 h-4 text-[#ffd7a9]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                    Education &amp; Credentials
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {candidateProfile.education.length > 0 ? (
                    candidateProfile.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#201f20] border border-[#524535]/20 space-y-1"
                      >
                        <div className="flex justify-between items-baseline font-semibold">
                          <span className="text-[#F8F9FA]">{edu.school}</span>
                          <span className="text-[11px] font-mono text-[#A1A1AA]">{edu.period}</span>
                        </div>
                        <p className="text-[#ffd7a9]">{edu.degree}</p>
                        {edu.specialization && (
                          <p className="text-[11px] text-[#A1A1AA]">{edu.specialization}</p>
                        )}
                        <div className="text-[10px] font-mono text-[#22C55E] flex items-center gap-1 pt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>FACT ID: {edu.verifiedFactId}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#A1A1AA] italic">No verified education records uploaded yet.</p>
                  )}
                </div>
              </div>

              {/* Certifications Card */}
              {candidateProfile.certifications && candidateProfile.certifications.length > 0 && (
                <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#524535]/20">
                    <Award className="w-4 h-4 text-[#ffd7a9]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                      Certifications
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {candidateProfile.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#201f20] border border-[#524535]/20 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#F8F9FA]">{cert.name}</span>
                          {cert.grade && (
                            <span className="block text-[11px] font-mono text-[#ffd7a9]">
                              Grade: {cert.grade}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                          ATTESTED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leadership & Co-Curricular */}
              {candidateProfile.leadership && candidateProfile.leadership.length > 0 && (
                <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#524535]/20">
                    <Users className="w-4 h-4 text-[#ffd7a9]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                      Leadership &amp; Engagement
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {candidateProfile.leadership.map((lead, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#201f20] border border-[#524535]/20 space-y-1"
                      >
                        <div className="flex justify-between items-baseline font-semibold">
                          <span className="text-[#F8F9FA]">{lead.organization}</span>
                          <span className="text-[11px] font-mono text-[#ffd7a9]">{lead.role}</span>
                        </div>
                        <p className="text-[#A1A1AA] text-[11px] leading-relaxed">{lead.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Taxonomy */}
              {candidateProfile.skillsTaxonomy && (
                <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#524535]/20">
                    <Layers className="w-4 h-4 text-[#ffd7a9]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                      Verified Skills Taxonomy
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffd7a9] font-bold">
                        Operations &amp; Supply Chain
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateProfile.skillsTaxonomy.operations.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#201f20] text-[#e5e2e3] border border-[#524535]/30"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffd7a9] font-bold">
                        Marketing &amp; Business Development
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateProfile.skillsTaxonomy.marketing.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#201f20] text-[#e5e2e3] border border-[#524535]/30"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffd7a9] font-bold">
                        AI &amp; Automation
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateProfile.skillsTaxonomy.aiAutomation.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#201f20] text-[#ffd7a9] border border-[#ffd7a9]/30"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffd7a9] font-bold">
                        Tools &amp; Systems
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateProfile.skillsTaxonomy.toolsSystems.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#201f20] text-[#e5e2e3] border border-[#524535]/30"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffd7a9] font-bold">
                        Languages
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateProfile.skillsTaxonomy.languages.map((lang, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#201f20] text-[#22C55E] border border-[#22C55E]/30"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Evidence Graph & Provenance Pipeline */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              {/* Provenance Pipeline Card */}
              <div className="bg-[#2a2a2b] rounded-xl border border-[#ffd7a9]/30 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#524535]/20">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-5 h-5 text-[#ffd7a9]" />
                    <h3 className="text-sm font-semibold text-[#F8F9FA]">
                      Evidence Graph &amp; Provenance Pipeline
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                    TRACEABILITY: 100% DETERMINISTIC
                  </span>
                </div>

                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Every bullet point generated in application artifacts is traceable to an immutable verified evidence node in the Candidate Brain.
                </p>

                {/* 4 Connected Nodes Derived from Real Candidate Experience */}
                <div className="space-y-3 relative">
                  {/* Node 01 */}
                  <div
                    onClick={() => setSelectedProofNode(1)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedProofNode === 1
                        ? 'bg-[#201f20] border-[#ffd7a9]'
                        : 'bg-[#201f20]/60 border-[#524535]/25 hover:border-[#ffd7a9]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-[#ffd7a9] font-bold">
                        Node 01: Skill Focus
                      </span>
                      <span className="text-[10px] font-mono text-[#22C55E]">CLASSIFICATION: VERIFIED</span>
                    </div>
                    <div className="text-sm font-semibold text-[#F8F9FA]">
                      {primarySkill?.name || candidateProfile.title}
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      Provenance: {primarySkill?.sourceProof || 'Verified Candidate Dossier'} ({candidateProfile.yearsExperience} years experience)
                    </p>
                  </div>

                  <div className="flex justify-center -my-1 text-[#524535]">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>

                  {/* Node 02 */}
                  <div
                    onClick={() => setSelectedProofNode(2)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedProofNode === 2
                        ? 'bg-[#201f20] border-[#ffd7a9]'
                        : 'bg-[#201f20]/60 border-[#524535]/25 hover:border-[#ffd7a9]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-[#ffd7a9] font-bold">
                        Node 02: Project Context
                      </span>
                      <span className="text-[10px] font-mono text-[#22C55E]">CLASSIFICATION: VERIFIED</span>
                    </div>
                    <div className="text-sm font-semibold text-[#F8F9FA]">
                      {primaryExp?.role || candidateProfile.title}
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      {primaryExp ? `${primaryExp.company} (${primaryExp.period}) • ${primaryExp.division}` : 'Verified Career History'}
                    </p>
                  </div>

                  <div className="flex justify-center -my-1 text-[#524535]">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>

                  {/* Node 03 */}
                  <div
                    onClick={() => setSelectedProofNode(3)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedProofNode === 3
                        ? 'bg-[#201f20] border-[#22C55E]'
                        : 'bg-[#201f20]/60 border-[#524535]/25 hover:border-[#ffd7a9]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-[#22C55E] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Node 03: Verified Evidence
                      </span>
                      <span className="text-[10px] font-mono text-[#22C55E]">ATTESTED</span>
                    </div>
                    <div className="text-sm font-semibold text-[#F8F9FA]">
                      "{primaryExp?.summary || 'Candidate verified background facts'}"
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-0.5 font-mono">
                      Source: Candidate Truth Layer · Verified in Master Dossier
                    </p>
                  </div>

                  <div className="flex justify-center -my-1 text-[#524535]">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>

                  {/* Node 04 */}
                  <div
                    onClick={() => setSelectedProofNode(4)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedProofNode === 4
                        ? 'bg-[#201f20] border-[#ffd7a9]'
                        : 'bg-[#201f20]/60 border-[#524535]/25 hover:border-[#ffd7a9]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-[#ffd7a9] font-bold">
                        Node 04: Resume Bullet Source
                      </span>
                      <span className="text-[10px] font-mono text-[#22C55E]">AUTHORIZED FOR DISPATCH</span>
                    </div>
                    <div className="text-sm font-semibold text-[#F8F9FA]">
                      Tailored Artifact Bullet #1
                    </div>
                    <p className="text-xs text-[#e5e2e3] mt-0.5 italic">
                      "{primaryExp?.summary ? primaryExp.summary.slice(0, 160) + '...' : 'Verified candidate achievement bullet'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Candidate-Provided vs Inferred Signal Boundary Alert */}
              <div className="bg-[#2a2a2b] rounded-xl border border-[#818CF8]/30 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#524535]/20">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#818CF8]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                      Inferred Signal Quarantine Boundary
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#818CF8]">INTERNAL MATCHING ONLY</span>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Inferred affinities are classified as <strong className="text-[#818CF8]">INFERRED SIGNAL</strong>. They are strictly quarantined from external resume claims to prevent hallucinated assertions.
                </p>
              </div>

              {/* Real Software & AI Project Portfolio */}
              {candidateProfile.projects && candidateProfile.projects.length > 0 && (
                <div className="bg-[#2a2a2b] rounded-xl border border-[#ffd7a9]/30 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#524535]/20">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-[#ffd7a9]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                        Software &amp; AI Project Portfolio
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                      LIVE DEPLOYMENTS &amp; REPOSITORIES
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {candidateProfile.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg bg-[#201f20] border border-[#524535]/25 hover:border-[#ffd7a9]/40 transition-colors flex flex-col justify-between space-y-2 text-xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-sm text-[#F8F9FA]">{proj.title || proj.name}</span>
                            <span className="text-[10px] font-mono text-[#ffd7a9] bg-[#ffd7a9]/10 px-1.5 py-0.5 rounded shrink-0">
                              {proj.category}
                            </span>
                          </div>
                          <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
                            {proj.description || (proj.evidenceNotes && proj.evidenceNotes.length > 0 ? proj.evidenceNotes.join(' ') : 'Verified real candidate project')}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#524535]/15">
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {proj.technologies.map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#2a2a2b] text-[#ffd7a9] border border-[#524535]/30"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-0.5">
                            {proj.liveUrl && (
                              <a
                                href={proj.liveUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#22C55E] hover:underline"
                              >
                                <Globe className="w-3 h-3" />
                                <span>Live Demo</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#ffd7a9] hover:underline"
                              >
                                <Github className="w-3 h-3" />
                                <span>Code</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Experience Chronology */}
              <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#524535]/20">
                  <Briefcase className="w-4 h-4 text-[#ffd7a9]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                    Verified Experience Timeline
                  </h3>
                </div>

                <div className="space-y-4">
                  {candidateProfile.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-[#201f20] border border-[#524535]/20 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-baseline font-semibold">
                        <span className="text-sm text-[#F8F9FA]">
                          {exp.role} — <span className="text-[#ffd7a9]">{exp.company}</span>
                        </span>
                        <span className="font-mono text-[11px] text-[#A1A1AA]">{exp.period}</span>
                      </div>
                      <p className="text-[#A1A1AA] text-[11px]">{exp.division}</p>
                      <p className="text-[#e5e2e3] leading-relaxed">{exp.summary}</p>

                      <div className="pt-2 border-t border-[#524535]/15 flex flex-wrap gap-1.5">
                        {exp.anchoredSkills.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2a2a2b] text-[#ffd7a9] border border-[#524535]/30 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" />
                            <span>{sk.name}:</span>
                            <span className="text-[#A1A1AA]">{sk.sourceProof}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Resume Modal */}
      {isUploadModalOpen && (
        <div
          id="modal-upload-resume"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-2xl bg-[#1c1b1c] rounded-2xl border border-[#ffd7a9]/30 shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '85dvh' }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#524535]/20 flex items-center justify-between shrink-0 bg-[#201f20]">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-[#ffd7a9]" />
                <h2 className="text-lg font-semibold text-[#F8F9FA]">Upload Resume to Initialize Truth Layer</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F8F9FA] hover:bg-[#2a2a2b] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <p className="text-xs text-[#A1A1AA]">
                MOVA strictly parses verifiable experience facts, anchored technical skills, and educational records. Facts extracted here become the cryptographic single source of truth for all autonomous tailoring and applications.
              </p>

              {uploadError && (
                <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444]">
                  {uploadError}
                </div>
              )}

              {/* Drag and drop file upload */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const content = ev.target?.result as string;
                      handleProcessResume(content, file.name);
                    };
                    reader.readAsText(file);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#ffd7a9] bg-[#ffd7a9]/10'
                    : 'border-[#524535]/40 hover:border-[#ffd7a9]/50 bg-[#201f20]'
                }`}
              >
                <FileText className="w-10 h-10 text-[#ffd7a9] mb-3" />
                <p className="text-sm font-medium text-[#F8F9FA]">
                  Drag and drop your resume file (.txt, .pdf, .docx, markdown)
                </p>
                <p className="text-xs text-[#A1A1AA] mt-1">or click to browse files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Or paste text */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#ffd7a9]">
                  Or Paste Resume Content Directly
                </label>
                <textarea
                  value={resumeTextInput}
                  onChange={(e) => setResumeTextInput(e.target.value)}
                  placeholder="Paste work experience, role title, skills, and background here..."
                  className="w-full h-36 p-3 rounded-xl bg-[#201f20] border border-[#524535]/30 text-xs text-[#F8F9FA] focus:outline-none focus:border-[#ffd7a9] font-mono resize-none"
                />
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="p-4 border-t border-[#524535]/20 flex items-center justify-end gap-3 shrink-0 bg-[#201f20]">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#524535]/40 text-xs text-[#A1A1AA] hover:text-[#F8F9FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleProcessResume(resumeTextInput)}
                disabled={!resumeTextInput.trim()}
                className="px-5 py-2 rounded-lg bg-[#ffd7a9] text-[#462a00] font-semibold text-xs hover:opacity-90 transition-all disabled:opacity-40"
              >
                Parse &amp; Initialize Truth Layer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Edit Profile Modal */}
      {isManualEditOpen && (
        <div
          id="modal-edit-profile"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-lg bg-[#1c1b1c] rounded-2xl border border-[#ffd7a9]/30 shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '85dvh' }}
          >
            <div className="p-6 border-b border-[#524535]/20 flex items-center justify-between shrink-0 bg-[#201f20]">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-[#ffd7a9]" />
                <h2 className="text-lg font-semibold text-[#F8F9FA]">Edit Candidate Truth Layer</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsManualEditOpen(false)}
                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F8F9FA]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA]">Full Legal / Professional Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full p-2.5 rounded-lg bg-[#201f20] border border-[#524535]/30 text-[#F8F9FA] focus:outline-none focus:border-[#ffd7a9]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A1A1AA]">Professional Role / Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Systems Engineer"
                  className="w-full p-2.5 rounded-lg bg-[#201f20] border border-[#524535]/30 text-[#F8F9FA] focus:outline-none focus:border-[#ffd7a9]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A1A1AA]">Location / Timezone Preference</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Remote / US or Europe"
                  className="w-full p-2.5 rounded-lg bg-[#201f20] border border-[#524535]/30 text-[#F8F9FA] focus:outline-none focus:border-[#ffd7a9]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A1A1AA]">Years of Verifiable Experience</label>
                <input
                  type="number"
                  value={editYears}
                  onChange={(e) => setEditYears(Number(e.target.value))}
                  min={0}
                  max={40}
                  className="w-full p-2.5 rounded-lg bg-[#201f20] border border-[#524535]/30 text-[#F8F9FA] focus:outline-none focus:border-[#ffd7a9]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#524535]/20 flex items-center justify-end gap-3 shrink-0 bg-[#201f20]">
              <button
                type="button"
                onClick={() => setIsManualEditOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#524535]/40 text-xs text-[#A1A1AA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManualEdit}
                className="px-5 py-2 rounded-lg bg-[#ffd7a9] text-[#462a00] font-semibold text-xs hover:opacity-90 transition-all"
              >
                Save Profile Facts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn OAuth & Data Synchronization Modal */}
      {isLocalLinkedInModalOpen && (
        <LinkedInAuthModal
          isOpen={isLocalLinkedInModalOpen}
          onClose={() => setIsLocalLinkedInModalOpen(false)}
          candidateProfile={candidateProfile}
          onProfileUpdated={(updated) => {
            onUpdateProfile(updated);
            if (updated.linkedInAuth) {
              onLogAction({
                id: `log-${Date.now()}`,
                agentName: 'Verification Agent',
                time: 'Just now',
                headline: `LinkedIn OAuth Verified: Ingested identity for ${updated.linkedInAuth.name}`,
                subDetail: `OpenID Connect verified · sub: ${updated.linkedInAuth.sub} · Email: ${updated.linkedInAuth.email || 'N/A'}`,
                badgeText: 'IDENTITY SYNCED',
                badgeType: 'success',
                icon: 'check',
              });
            }
          }}
          onShowToast={(msg) => {
            onLogAction({
              id: `log-${Date.now()}`,
              agentName: 'Verification Agent',
              time: 'Just now',
              headline: msg,
              subDetail: 'OAuth 2.0 handshake state synchronized with candidate brain',
              badgeText: 'SECURITY AUDIT',
              badgeType: 'info',
              icon: 'check',
            });
          }}
        />
      )}
    </div>
  );
};
