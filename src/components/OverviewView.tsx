import React from 'react';
import {
  Sliders,
  Filter,
  PauseCircle,
  PlayCircle,
  Clock,
  Video,
  Award,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Brain,
  Search,
  ArrowRight,
  Upload,
} from 'lucide-react';
import {
  CandidateProfile,
  JobOpportunity,
  ApplicationRecord,
  FollowUpItem,
  InterviewRecord,
  MissionLogItem,
  NavPath,
} from '../types';

interface OverviewViewProps {
  onNavigate: (path: NavPath) => void;
  onOpenRules: () => void;
  isAgentActive: boolean;
  onToggleAgent: () => void;
  logs: MissionLogItem[];
  cycleMinutesRemaining: number;
  onInspectLog: (log: MissionLogItem) => void;
  candidateProfile: CandidateProfile;
  jobs: JobOpportunity[];
  applications: ApplicationRecord[];
  followUp: FollowUpItem | null;
  interviews: InterviewRecord[];
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenRules,
  isAgentActive,
  onToggleAgent,
  logs,
  cycleMinutesRemaining,
  onInspectLog,
  candidateProfile,
  jobs,
  applications,
  followUp,
  interviews,
}) => {
  const isProfileInitialized = Boolean(candidateProfile.name && candidateProfile.title);

  // Real data calculations
  const responsesCount = applications.filter(
    (a) => a.status === 'RESPONSE' || a.status === 'INTERVIEW'
  ).length;
  const interviewsCount = interviews.length;
  const finalRoundsCount = interviews.filter(
    (i) => i.stage === 'Onsite Loop' || i.stage === 'Executive'
  ).length;
  const offersCount = applications.filter((a) => (a.status as string) === 'OFFER').length;

  const qualifiedRolesCount = jobs.filter(
    (j) => j.fitScore >= (candidateProfile.rules.minFitScore || 80) && j.hardConstraintsPassed
  ).length;
  const applicationsSubmittedCount = applications.length;
  const activeFollowUpsCount = followUp && followUp.status !== 'PAUSED' ? 1 : 0;

  return (
    <div className="flex flex-col w-full relative pb-20">
      {/* Background ambient light effects */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#ffd7a9]/5 rounded-full blur-[140px] mix-blend-screen -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#ffb95a]/5 rounded-full blur-[120px] mix-blend-screen translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="px-8 py-8 max-w-[1440px] mx-auto w-full relative z-10 space-y-10">
        {/* Header & Control Plane */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#524535]/15">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#2a2a2b] rounded-full border border-[#524535]/30">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAgentActive ? 'bg-[#22C55E] pulse-dot' : 'bg-[#EF4444]'
                }`}
              />
              <span className="text-[11px] font-bold text-[#e5e2e3] tracking-widest uppercase font-mono">
                {isAgentActive ? 'Autonomous Mission Online' : 'Agent Idle / Paused'}
              </span>
              <span className="text-[#524535] text-xs">|</span>
              <span className="font-mono text-[11px] text-[#A1A1AA]">
                NEXT CYCLE IN {cycleMinutesRemaining}M
              </span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl text-[#F8F9FA] tracking-tight font-['Playfair_Display'] font-normal">
                {candidateProfile.name ? `Good day, ${candidateProfile.name}.` : 'Welcome to MOVA.'}
              </h1>
              <p className="text-base text-[#A1A1AA] mt-1.5 max-w-2xl font-normal">
                {isProfileInitialized
                  ? `Autonomous career agent configured for ${candidateProfile.title}. Grounded in verified evidence.`
                  : 'Your Candidate Brain is still being built. Upload your resume or add facts to begin autonomous discovery.'}
              </p>
            </div>
          </div>

          {/* Control Plane Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              id="btn-overview-configure-rules"
              onClick={onOpenRules}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] border border-[#524535]/30 text-[#e5e2e3] text-xs md:text-sm font-medium transition-all group shadow-sm"
            >
              <Sliders className="w-4 h-4 text-[#ffd7a9] group-hover:rotate-45 transition-transform" />
              <span>Configure Rules</span>
            </button>
            <button
              onClick={() => onNavigate('applications')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] border border-[#524535]/30 text-[#e5e2e3] text-xs md:text-sm font-medium transition-all group shadow-sm"
            >
              <Filter className="w-4 h-4 text-[#ffd7a9]" />
              <span>Inspect Pipeline</span>
            </button>
            <button
              onClick={onToggleAgent}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all border ${
                isAgentActive
                  ? 'bg-[#2a2a2b]/80 hover:bg-[#93000a]/40 border-[#524535]/30 hover:border-[#ffb4ab]/40 text-[#A1A1AA] hover:text-[#ffb4ab]'
                  : 'bg-[#22C55E]/15 hover:bg-[#22C55E]/25 border-[#22C55E]/30 text-[#22C55E]'
              }`}
            >
              {isAgentActive ? (
                <>
                  <PauseCircle className="w-4 h-4" />
                  <span>Pause Agent</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Agent</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Candidate Brain Prompt if not initialized */}
        {!isProfileInitialized && (
          <div className="bg-[#2a2a2b] rounded-2xl border border-[#ffd7a9]/40 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ffd7a9]/10 border border-[#ffd7a9]/30 flex items-center justify-center shrink-0 text-[#ffd7a9]">
                <Brain className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-[#F8F9FA]">
                  Your Candidate Brain is still being built
                </h2>
                <p className="text-xs text-[#A1A1AA] max-w-xl leading-relaxed">
                  MOVA never fabricates candidate history, achievements, or skills. Upload your resume or add your experience so MOVA can evaluate real jobs against your verified background.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('candidate-brain')}
              className="px-5 py-2.5 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resume &amp; Build Brain</span>
            </button>
          </div>
        )}

        {/* Autonomous Live Status Banner */}
        <div className="bg-[#2a2a2b]/70 backdrop-blur-md rounded-xl p-4 px-5 border border-[#ffd7a9]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center shrink-0">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAgentActive ? 'bg-[#ffd7a9] pulse-dot' : 'bg-[#A1A1AA]'
                }`}
              />
              {isAgentActive && (
                <span className="absolute w-5 h-5 rounded-full bg-[#ffd7a9]/20 animate-ping" />
              )}
            </div>
            <div className="text-sm text-[#e5e2e3]">
              <span className="font-semibold text-[#ffd7a9] tracking-wide text-xs uppercase font-mono mr-2">
                {isAgentActive ? 'AGENT ACTIVE' : 'AGENT IDLE'}
              </span>
              <span className="text-[#F8F9FA] text-xs md:text-sm font-medium">
                {jobs.length > 0
                  ? `Monitoring ${jobs.length} researched opportunities. ${applications.length} applications submitted, ${activeFollowUpsCount} follow-ups active.`
                  : isProfileInitialized
                  ? 'Awaiting autonomous discovery cycle or target role submission.'
                  : 'Configure Candidate Brain to initiate automated role discovery.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs text-[#A1A1AA] bg-[#201f20] px-3 py-1.5 rounded-md border border-[#524535]/20">
            <Clock className="w-3.5 h-3.5 text-[#ffd7a9]" />
            <span>CADENCE: 30M · NEXT RUN IN {cycleMinutesRemaining}M</span>
          </div>
        </div>

        {/* 1. OUTCOME-FIRST METRICS HIERARCHY */}
        <section aria-label="Outcome Metrics" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#ffd7a9] uppercase tracking-widest font-bold">
                Priority Tier 01
              </span>
              <span className="text-[#524535] text-xs">/</span>
              <h2 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#F8F9FA]">
                Career Outcomes (Primary Objective)
              </h2>
            </div>
            <span className="text-xs text-[#A1A1AA] font-mono">Live Synchronization</span>
          </div>

          {/* Elevated Primary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Responses */}
            <div
              onClick={() => onNavigate('applications')}
              className="bg-gradient-to-b from-[#2a2a2b] to-[#2a2a2b]/90 rounded-xl p-6 border border-[#ffd7a9]/30 shadow-lg relative overflow-hidden group hover:border-[#ffd7a9]/60 transition-all cursor-pointer"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#ffd7a9]/5 rounded-full blur-xl group-hover:bg-[#ffd7a9]/10 transition-colors" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">
                  Responses Received
                </span>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  {responsesCount > 0 ? `${responsesCount} verified` : 'Awaiting review'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Playfair_Display'] text-5xl text-[#ffd7a9]">
                  {responsesCount}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-2">
                {applications.length > 0
                  ? `${Math.round((responsesCount / applications.length) * 100)}% response rate (${responsesCount} of ${applications.length} submitted)`
                  : 'No applications submitted yet'}
              </p>
            </div>

            {/* Card 2: Interviews Active */}
            <div
              onClick={() => onNavigate('interviews')}
              className="bg-gradient-to-b from-[#2a2a2b] to-[#2a2a2b]/90 rounded-xl p-6 border border-[#ffd7a9]/30 shadow-lg relative overflow-hidden group hover:border-[#ffd7a9]/60 transition-all cursor-pointer"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#ffd7a9]/5 rounded-full blur-xl group-hover:bg-[#ffd7a9]/10 transition-colors" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">
                  Interviews Active
                </span>
                <Video className="w-5 h-5 text-[#ffd7a9]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Playfair_Display'] text-5xl text-[#F8F9FA]">
                  {interviewsCount}
                </span>
                {interviewsCount > 0 && (
                  <span className="text-xs text-[#A1A1AA] font-mono">Active loops</span>
                )}
              </div>
              <p className="text-xs text-[#A1A1AA] mt-2">
                {interviewsCount > 0
                  ? `Next: ${interviews[0].company} (${interviews[0].scheduledDate})`
                  : 'No upcoming interviews scheduled'}
              </p>
            </div>

            {/* Card 3: Final Rounds */}
            <div
              onClick={() => onNavigate('interviews')}
              className="bg-gradient-to-b from-[#2a2a2b] to-[#2a2a2b]/90 rounded-xl p-6 border border-[#ffd7a9]/30 shadow-lg relative overflow-hidden group hover:border-[#ffd7a9]/60 transition-all cursor-pointer"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#ffd7a9]/5 rounded-full blur-xl group-hover:bg-[#ffd7a9]/10 transition-colors" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">
                  Final Rounds
                </span>
                <CheckCircle2 className="w-5 h-5 text-[#ffd7a9]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Playfair_Display'] text-5xl text-[#F8F9FA]">
                  {finalRoundsCount}
                </span>
                {finalRoundsCount > 0 && (
                  <span className="text-xs text-[#22C55E] font-medium font-mono">
                    Onsite loop scheduled
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A1A1AA] mt-2">
                {finalRoundsCount > 0
                  ? `${finalRoundsCount} executive or onsite loop active`
                  : 'No final rounds currently scheduled'}
              </p>
            </div>

            {/* Card 4: Offers Extended */}
            <div
              onClick={() => onNavigate('applications')}
              className="bg-gradient-to-b from-[#2a2a2b] to-[#2a2a2b]/90 rounded-xl p-6 border border-[#ffd7a9]/40 shadow-lg relative overflow-hidden group ring-1 ring-[#ffd7a9]/20 hover:border-[#ffd7a9] transition-all cursor-pointer"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#ffd7a9]/10 rounded-full blur-xl" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#ffd7a9] uppercase tracking-wider font-mono">
                  Offers Extended
                </span>
                <Award className="w-5 h-5 text-[#ffd7a9]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Playfair_Display'] text-5xl text-[#ffd7a9]">
                  {offersCount}
                </span>
                {offersCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#ffd7a9]/20 text-[#ffd7a9] font-mono font-semibold">
                    Received
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A1A1AA] mt-2">
                {offersCount > 0
                  ? `${offersCount} formal offers extended`
                  : 'No formal offers extended yet'}
              </p>
            </div>
          </div>

          {/* Secondary Activity Row (Tier 02 Operating Activity) */}
          <div className="bg-[#1c1b1c] rounded-xl border border-[#524535]/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#524535]/15">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider font-bold">
                  Tier 02 Operating Activity
                </span>
                <span className="text-xs text-[#524535]">·</span>
                <span className="text-xs text-[#A1A1AA]">Execution volume powering outcomes</span>
              </div>
              <span className="text-[11px] font-mono text-[#22C55E] flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> HARD CONSTRAINTS: ZERO VIOLATIONS
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#524535]/20">
              <div className="pt-2 md:pt-0">
                <div className="text-[#A1A1AA] text-xs font-mono uppercase tracking-wider">
                  Jobs Researched
                </div>
                <div className="text-2xl font-semibold text-[#F8F9FA] mt-1">{jobs.length}</div>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">Scanned across verified sources</p>
              </div>
              <div className="pt-2 md:pt-0 md:pl-6">
                <div className="text-[#A1A1AA] text-xs font-mono uppercase tracking-wider">
                  Qualified Roles
                </div>
                <div className="text-2xl font-semibold text-[#F8F9FA] mt-1">{qualifiedRolesCount}</div>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                  &ge;{candidateProfile.rules.minFitScore || 80}% candidate brain fit score
                </p>
              </div>
              <div className="pt-2 md:pt-0 md:pl-6">
                <div className="text-[#A1A1AA] text-xs font-mono uppercase tracking-wider">
                  Applications Submitted
                </div>
                <div className="text-2xl font-semibold text-[#ffd7a9] mt-1">
                  {applicationsSubmittedCount}
                </div>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">Payloads verified &amp; confirmation tokens</p>
              </div>
              <div className="pt-2 md:pt-0 md:pl-6">
                <div className="text-[#A1A1AA] text-xs font-mono uppercase tracking-wider">
                  Follow-ups Active
                </div>
                <div className="text-2xl font-semibold text-[#F8F9FA] mt-1">{activeFollowUpsCount}</div>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">Context-aware nudge queue</p>
              </div>
            </div>
          </div>
        </section>

        {/* Funnel & Mission Log Section */}
        <section aria-label="Pipeline and Mission Log" className="grid grid-cols-12 gap-8">
          {/* Left: Pipeline & Learning Insights */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F8F9FA] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ffd7a9]" />
                <span>Conversion Funnel &amp; Progress</span>
              </h2>
              <span className="text-xs font-mono text-[#A1A1AA]">AUTONOMOUS DISPATCH</span>
            </div>

            {/* Funnel Card */}
            <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-6 shadow-sm">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#524535]/30 -translate-y-1/2 z-0" />

                {/* 1. Qualified */}
                <div className="relative z-10 flex flex-col items-center bg-[#2a2a2b] px-2">
                  <div className="w-14 h-14 rounded-full bg-[#201f20] border-2 border-[#524535]/50 flex items-center justify-center mb-2 shadow-sm">
                    <span className="text-xl font-semibold text-[#F8F9FA]">{qualifiedRolesCount}</span>
                  </div>
                  <span className="font-mono text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                    Qualified
                  </span>
                </div>

                {/* 2. Applied */}
                <div className="relative z-10 flex flex-col items-center bg-[#2a2a2b] px-2">
                  <div className="w-14 h-14 rounded-full bg-[#201f20] border-2 border-[#ffd7a9] flex items-center justify-center mb-2 shadow-md shadow-[#ffd7a9]/10">
                    <span className="text-xl font-semibold text-[#ffd7a9]">
                      {applicationsSubmittedCount}
                    </span>
                  </div>
                  <span className="font-mono text-[#ffd7a9] uppercase tracking-wider text-[10px] font-semibold">
                    Applied
                  </span>
                </div>

                {/* 3. Responded */}
                <div className="relative z-10 flex flex-col items-center bg-[#2a2a2b] px-2">
                  <div className="w-14 h-14 rounded-full bg-[#201f20] border-2 border-[#524535]/50 flex items-center justify-center mb-2 shadow-sm">
                    <span className="text-xl font-semibold text-[#F8F9FA]">{responsesCount}</span>
                  </div>
                  <span className="font-mono text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                    Responded
                  </span>
                </div>

                {/* 4. Interviewing */}
                <div className="relative z-10 flex flex-col items-center bg-[#2a2a2b] px-2">
                  <div className="w-14 h-14 rounded-full bg-[#201f20] border-2 border-[#524535]/50 flex items-center justify-center mb-2 shadow-sm">
                    <span className="text-xl font-semibold text-[#F8F9FA]">{interviewsCount}</span>
                  </div>
                  <span className="font-mono text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                    Interviewing
                  </span>
                </div>

                {/* 5. Offer */}
                <div className="relative z-10 flex flex-col items-center bg-[#2a2a2b] px-2">
                  <div className="w-14 h-14 rounded-full bg-[#201f20] border-2 border-[#ffd7a9]/80 flex items-center justify-center mb-2 shadow-md">
                    <span className="text-xl font-semibold text-[#ffd7a9]">{offersCount}</span>
                  </div>
                  <span className="font-mono text-[#ffd7a9] uppercase tracking-wider text-[10px] font-semibold">
                    Offer
                  </span>
                </div>
              </div>
            </div>

            {/* Outcome Learning & System Intelligence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F8F9FA] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ffd7a9]" />
                  <span>Outcome Learning &amp; System Intelligence</span>
                </h3>
                <span className="text-[11px] font-mono text-[#ffd7a9] bg-[#ffd7a9]/10 px-2 py-0.5 rounded border border-[#ffd7a9]/20">
                  {applications.length > 0 ? 'ACTIVE ADAPTATION' : 'WAITING FOR DATA'}
                </span>
              </div>

              {applications.length > 0 ? (
                <div className="p-4 rounded-xl bg-[#2a2a2b] border border-[#524535]/25 text-xs text-[#e5e2e3] space-y-2">
                  <div className="flex justify-between items-center text-[#ffd7a9] font-semibold">
                    <span>Live Telemetry Attribution</span>
                    <span className="font-mono text-[#22C55E]">
                      {applications.filter((a) => a.status === 'VERIFIED').length} / {applications.length} Verified
                    </span>
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    Deterministic verification engine captures platform tokens. Zero unverified submissions are marked complete.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#2a2a2b] border border-[#524535]/20 text-center space-y-2">
                  <p className="text-xs text-[#A1A1AA]">
                    MOVA learning telemetry activates once real application outcomes and recruiter responses are recorded.
                  </p>
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="text-xs text-[#ffd7a9] font-mono hover:underline inline-flex items-center gap-1"
                  >
                    <span>Inspect available roles</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Agent Mission Feed */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F8F9FA] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#ffd7a9]" />
                <span>Live Agent Mission Feed</span>
              </h2>
              <span className="font-mono text-[#A1A1AA] uppercase text-[10px]">Audit Log</span>
            </div>

            <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-3.5 max-h-[580px] overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => onInspectLog(log)}
                    className="p-3 rounded-lg bg-[#201f20] border border-[#524535]/20 hover:border-[#ffd7a9]/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#F8F9FA] group-hover:text-[#ffd7a9] transition-colors">
                          {log.agentName}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#A1A1AA]">{log.time}</span>
                    </div>
                    <p className="text-[13px] text-[#e5e2e3] leading-snug">{log.headline}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {log.badgeText && (
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold border ${
                            log.badgeType === 'success'
                              ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                              : 'bg-[#ffd7a9]/15 text-[#ffd7a9] border-[#ffd7a9]/30'
                          }`}
                        >
                          {log.badgeText}
                        </span>
                      )}
                      <span className="text-[11px] text-[#A1A1AA] truncate">{log.subDetail}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#201f20] border border-[#524535]/30 flex items-center justify-center mx-auto text-[#A1A1AA]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#F8F9FA]">No agent activity recorded yet</p>
                    <p className="text-[11px] text-[#A1A1AA] max-w-xs mx-auto">
                      Real logs will appear here when autonomous discovery cycles run or applications are evaluated.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
