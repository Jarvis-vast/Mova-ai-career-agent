import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  RotateCw,
  Eye,
  FileText,
  Plus,
  Briefcase,
  AlertCircle,
  X,
} from 'lucide-react';
import { JobOpportunity, CandidateProfile } from '../types';
import { evaluateJobMatch } from '../utils/engine';

interface JobsViewProps {
  jobs: JobOpportunity[];
  candidateProfile?: CandidateProfile;
  onOpenDecision: (job: JobOpportunity) => void;
  onOpenPackage: (job: JobOpportunity) => void;
  onOpenRules: () => void;
  onTriggerCycle: () => void;
  cycleNumber: number;
  onAddJob?: (job: JobOpportunity) => void;
  onAdvanceJob?: (job: JobOpportunity) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  candidateProfile,
  onOpenDecision,
  onOpenPackage,
  onOpenRules,
  onTriggerCycle,
  cycleNumber,
  onAddJob,
  onAdvanceJob,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'scheduled' | 'preparing' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New role form state
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newSalary, setNewSalary] = useState('$160,000 / yr');
  const [newWorkMode, setNewWorkMode] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [newDescription, setNewDescription] = useState('');

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'scheduled') return matchesSearch && job.status === 'SCHEDULED';
    if (filterType === 'preparing') return matchesSearch && job.status === 'PREPARING';
    if (filterType === 'blocked') return matchesSearch && job.status === 'BLOCKED';
    return matchesSearch;
  });

  const qualifiedCount = jobs.filter((j) => j.fitScore >= 80 && j.hardConstraintsPassed).length;
  const excludedCount = jobs.filter((j) => !j.hardConstraintsPassed).length;

  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    if (candidateProfile && onAddJob) {
      const evaluation = evaluateJobMatch(
        {
          title: newTitle.trim(),
          company: newCompany.trim(),
          location: newLocation.trim(),
          workMode: newWorkMode,
          salary: newSalary.trim(),
          description: newDescription.trim(),
        },
        candidateProfile
      );

      const newJob: JobOpportunity = {
        id: `job-${Date.now()}`,
        title: newTitle.trim(),
        company: newCompany.trim(),
        location: newLocation.trim(),
        workMode: newWorkMode,
        salary: newSalary.trim(),
        postedAgo: 'Just now',
        status: evaluation.hardConstraintsPassed
          ? evaluation.fitScore >= 85
            ? 'SCHEDULED'
            : 'PREPARING'
          : 'BLOCKED',
        fitScore: evaluation.fitScore,
        hardConstraintsPassed: evaluation.hardConstraintsPassed,
        hardConstraintDetails: evaluation.hardConstraintDetails,
        scoreBreakdown: evaluation.scoreBreakdown,
        strengths: evaluation.strengths,
        gaps: evaluation.gaps,
        artifactsReady: evaluation.hardConstraintsPassed ? 'Grounded package ready' : undefined,
      };

      onAddJob(newJob);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewCompany('');
      setNewDescription('');
    }
  };

  return (
    <div className="flex flex-col w-full relative pb-20">
      <div className="px-8 py-8 max-w-[1440px] mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#524535]/15">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-['Playfair_Display'] text-[#F8F9FA]">
                Jobs Discovery &amp; Evaluation
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-bold uppercase tracking-widest">
                Automated Scanner Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
              Autonomous scanner evaluates roles against candidate brain facts and hard constraint rules.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] border border-[#ffd7a9]/30 text-[#ffd7a9] text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Target Role</span>
            </button>
            <button
              onClick={onOpenRules}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] border border-[#524535]/30 text-[#e5e2e3] text-xs font-medium transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-[#ffd7a9]" />
              <span>Candidate Rules</span>
            </button>
            <button
              onClick={onTriggerCycle}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffd7a9] text-[#462a00] hover:opacity-90 text-xs font-semibold transition-all shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Trigger Cycle #{cycleNumber + 1}</span>
            </button>
          </div>
        </header>

        {/* Daily Target & Cadence Strip */}
        <div className="bg-[#1c1b1c] rounded-xl border border-[#524535]/20 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#ffd7a9] uppercase tracking-wider font-bold">
                  Daily Autonomous Target:
                </span>
                <span className="text-xs font-bold text-[#F8F9FA]">
                  {candidateProfile?.rules.dailyOpportunityTarget || 10} Qualified Opportunities
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                {jobs.length} researched • {qualifiedCount} qualified (&ge;80% match) • {excludedCount} excluded by hard constraints
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-[#201f20] border border-[#524535]/20 text-[#A1A1AA]">
                Threshold: <span className="text-[#F8F9FA] font-bold">Min Score &ge; {candidateProfile?.rules.minFitScore || 80}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#201f20] border border-[#524535]/20 text-[#22C55E] flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> STRICT ACTIVE
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#201f20] border border-[#524535]/20 text-[#ffd7a9]">
                Dispatch Mode: <span className="text-[#F8F9FA] font-bold">Continuous</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-[#ffd7a9] text-[#462a00] font-semibold'
                  : 'bg-[#2a2a2b] text-[#A1A1AA] hover:text-[#F8F9FA]'
              }`}
            >
              All Discovered ({jobs.length})
            </button>
            <button
              onClick={() => setFilterType('scheduled')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === 'scheduled'
                  ? 'bg-[#ffd7a9] text-[#462a00] font-semibold'
                  : 'bg-[#2a2a2b] text-[#A1A1AA] hover:text-[#F8F9FA]'
              }`}
            >
              Scheduled Queue ({jobs.filter((j) => j.status === 'SCHEDULED').length})
            </button>
            <button
              onClick={() => setFilterType('preparing')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === 'preparing'
                  ? 'bg-[#ffd7a9] text-[#462a00] font-semibold'
                  : 'bg-[#2a2a2b] text-[#A1A1AA] hover:text-[#F8F9FA]'
              }`}
            >
              Preparing Package ({jobs.filter((j) => j.status === 'PREPARING').length})
            </button>
            <button
              onClick={() => setFilterType('blocked')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === 'blocked'
                  ? 'bg-[#ffd7a9] text-[#462a00] font-semibold'
                  : 'bg-[#2a2a2b] text-[#A1A1AA] hover:text-[#F8F9FA]'
              }`}
            >
              Blocked by Rules ({jobs.filter((j) => j.status === 'BLOCKED').length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company..."
              className="w-full bg-[#2a2a2b] border border-[#524535]/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8F9FA] placeholder:text-[#A1A1AA]/60 outline-none focus:border-[#ffd7a9]/60"
            />
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-4 hover:border-[#ffd7a9]/40 transition-all"
              >
                {/* Top: Title, Company, Match Pill, Status Pill */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-semibold text-[#F8F9FA]">{job.title}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#201f20] text-[#ffd7a9] font-mono border border-[#524535]/30">
                        {job.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A1A1AA] flex-wrap">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.workMode}</span>
                      <span>•</span>
                      <span className="font-mono text-[#F8F9FA]">{job.salary}</span>
                      <span>•</span>
                      <span>Discovered {job.postedAgo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-[#ffd7a9]">
                        {job.fitScore}%
                      </div>
                      <span className="text-[10px] text-[#A1A1AA] font-mono block">Fit Score</span>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider ${
                        job.status === 'SCHEDULED'
                          ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
                          : job.status === 'PREPARING'
                          ? 'bg-[#ffd7a9]/15 border-[#ffd7a9]/30 text-[#ffd7a9]'
                          : 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                      }`}
                    >
                      {job.status}
                    </div>
                  </div>
                </div>

                {/* Match Details & Hard Constraint Notes */}
                <div className="p-3.5 bg-[#131314] rounded-lg border border-[#524535]/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#ffd7a9] flex items-center gap-1.5">
                      {job.hardConstraintsPassed ? (
                        <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                      )}
                      {job.hardConstraintsPassed
                        ? 'Deterministic Hard Constraints Passed'
                        : job.hardConstraintDetails?.failureReason || 'Blocked by Candidate Constraint'}
                    </span>
                    <span className="text-[10px] font-mono text-[#A1A1AA]">
                      Skills Overlap: {job.scoreBreakdown.skillsMatch}%
                    </span>
                  </div>

                  {job.strengths && (
                    <p className="text-[#A1A1AA] leading-relaxed">
                      <strong className="text-[#F8F9FA]">Grounding Match:</strong> {job.strengths}
                    </p>
                  )}
                  {job.artifactsReady && (
                    <span className="text-[11px] font-mono text-[#ffd7a9] block pt-1">
                      Artifact Status: {job.artifactsReady}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <span className="text-[11px] font-mono text-[#A1A1AA]">
                    {job.status === 'SCHEDULED' && 'Queue: Ready for next dispatch window'}
                    {job.status === 'PREPARING' && 'Agent: Synthesizing zero-hallucination artifact'}
                    {job.status === 'BLOCKED' && 'Suppressed: Candidate preference preserved'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDecision(job)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#201f20] hover:bg-[#353436] text-xs font-medium text-[#F8F9FA] border border-[#524535]/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#ffd7a9]" />
                      <span>Inspect Decision</span>
                    </button>

                    {job.status === 'PREPARING' && (
                      <button
                        onClick={() => onOpenPackage(job)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Package</span>
                      </button>
                    )}

                    {job.status === 'SCHEDULED' && (
                      <button
                        onClick={() => {
                          if (onAdvanceJob) {
                            onAdvanceJob(job);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Advance Immediately
                      </button>
                    )}

                    {job.status === 'BLOCKED' && (
                      <button
                        onClick={onOpenRules}
                        className="px-3.5 py-1.5 rounded-lg bg-[#201f20] hover:bg-[#353436] text-xs font-medium text-[#A1A1AA] hover:text-[#F8F9FA] border border-[#524535]/30"
                      >
                        Rule Settings
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Honest Empty State */
          <div className="bg-[#2a2a2b] rounded-2xl border border-[#524535]/25 p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#201f20] border border-[#524535]/30 flex items-center justify-center mx-auto text-[#ffd7a9]">
              <Briefcase className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-[#F8F9FA]">
                No qualified opportunities yet
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Your career agent is searching for relevant opportunities. Run autonomous discovery or add target roles manually to evaluate them against your Candidate Brain rules.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                onClick={onTriggerCycle}
                className="px-5 py-2.5 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
              >
                <RotateCw className="w-4 h-4" />
                <span>Run Autonomous Discovery</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-lg bg-[#201f20] hover:bg-[#353436] text-[#F8F9FA] text-xs font-semibold border border-[#524535]/30 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#ffd7a9]" />
                <span>Add Target Role</span>
              </button>
              <button
                onClick={onOpenRules}
                className="px-5 py-2.5 rounded-lg bg-[#201f20] hover:bg-[#353436] text-[#A1A1AA] hover:text-[#F8F9FA] text-xs font-mono border border-[#524535]/30 transition-colors"
              >
                Configure Guardrails
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Target Role Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-[#201f20] border border-[#524535]/40 rounded-2xl max-w-xl w-full max-h-[85dvh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#524535]/20 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-semibold">
                  Role Ingestion &amp; Real Evaluation
                </span>
                <h3 className="text-lg font-semibold text-[#F8F9FA] mt-1">
                  Add Target Opportunity
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  MOVA evaluates this role deterministically against your verified Candidate Brain.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#F8F9FA] p-1.5 rounded-lg hover:bg-[#2a2a2b] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#ffd7a9] mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#ffd7a9] mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#ffd7a9] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Remote or San Francisco, CA"
                      className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#ffd7a9] mb-1">
                      Work Mode
                    </label>
                    <select
                      value={newWorkMode}
                      onChange={(e) => setNewWorkMode(e.target.value as any)}
                      className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#ffd7a9] mb-1">
                    Offered Compensation
                  </label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. $160,000 / yr"
                    className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#ffd7a9] mb-1">
                    Job Description / Required Skills
                  </label>
                  <textarea
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Paste job description or required skills to evaluate real match score..."
                    className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-[#524535]/20 flex items-center justify-end gap-2 bg-[#201f20]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#2a2a2b] hover:bg-[#353436] rounded-lg text-xs text-[#F8F9FA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ffd7a9] text-[#462a00] font-semibold rounded-lg text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Evaluate &amp; Ingest Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
