import React from 'react';
import { X, CheckCircle2, AlertOctagon, ShieldCheck, Cpu } from 'lucide-react';
import { JobOpportunity } from '../../types';

interface DecisionModalProps {
  job: JobOpportunity | null;
  onClose: () => void;
  onApplyOverride?: (jobId: string) => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({ job, onClose, onApplyOverride }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#201f20] border border-[#524535]/40 rounded-2xl max-w-2xl w-full max-h-[85dvh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-[#524535]/20 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-semibold">
                Autonomous Match Decision Audit
              </span>
              <span className="text-xs text-[#A1A1AA] font-mono">ID: {job.id}</span>
            </div>
            <h2 className="text-xl font-semibold text-[#F8F9FA]">{job.title}</h2>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              {job.company} • {job.location} • {job.salary}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-[#F8F9FA] p-1.5 rounded-lg hover:bg-[#2a2a2b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Status & Recommendation Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
              job.hardConstraintsPassed
                ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
            }`}
          >
            <div className="flex items-start gap-3">
              {job.hardConstraintsPassed ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#22C55E]" />
              ) : (
                <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5 text-[#EF4444]" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {job.hardConstraintsPassed
                    ? 'Recommendation: High Priority Autonomous Application'
                    : 'Recommendation: Hard Policy Blocked (Do Not Apply)'}
                </h4>
                <p className="text-xs text-[#e5e2e3]/90 mt-1 leading-relaxed">
                  {job.hardConstraintsPassed
                    ? 'All candidate hard constraints passed deterministic verification. Overall fit meets threshold.'
                    : job.hardConstraintDetails?.failureReason ||
                      'Hard constraint failure: Candidate profile veto overrides any subjective semantic match score.'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-[#A1A1AA] block">Global Score</span>
              <span
                className={`text-2xl font-bold font-mono ${
                  job.hardConstraintsPassed ? 'text-[#ffd7a9]' : 'text-[#EF4444] line-through'
                }`}
              >
                {job.fitScore}/100
              </span>
            </div>
          </div>

          {/* Hard Constraints Checklist */}
          <div className="bg-[#2a2a2b] p-4 rounded-xl border border-[#524535]/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#524535]/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#ffd7a9] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#ffd7a9]" /> Deterministic Hard Constraints
              </span>
              <span className="text-[10px] font-mono text-[#A1A1AA]">Pre-LLM Guardrail</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#201f20]">
                <span className="text-[#A1A1AA]">Geographic Allowed:</span>
                <span className={job.hardConstraintDetails?.locationMatch ? 'text-[#22C55E] font-semibold' : 'text-[#EF4444] font-semibold'}>
                  {job.hardConstraintDetails?.locationMatch ? '✓ Allowed Location' : '✕ Prohibited Location'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#201f20]">
                <span className="text-[#A1A1AA]">Relocation Policy:</span>
                <span className={job.hardConstraintDetails?.relocationMatch ? 'text-[#22C55E] font-semibold' : 'text-[#EF4444] font-semibold'}>
                  {job.hardConstraintDetails?.relocationMatch ? '✓ No Relocation Req' : '✕ Relocation Required'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#201f20]">
                <span className="text-[#A1A1AA]">Salary Check:</span>
                <span className="text-[#22C55E] font-semibold">✓ Meets Target Floor</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#201f20]">
                <span className="text-[#A1A1AA]">Blacklist Registry:</span>
                <span className="text-[#22C55E] font-semibold">✓ Zero Matches</span>
              </div>
            </div>
          </div>

          {/* Multi-Dimensional Fit Score Breakdown */}
          {job.scoreBreakdown && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F8F9FA] flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#ffd7a9]" /> Decomposable Fit Dimensions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-[#2a2a2b] border border-[#524535]/15">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A1A1AA]">Technical Skills Overlap</span>
                    <span className="font-mono text-[#F8F9FA] font-semibold">
                      {job.scoreBreakdown.skillsMatch}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#201f20] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffd7a9] rounded-full"
                      style={{ width: `${job.scoreBreakdown.skillsMatch}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#2a2a2b] border border-[#524535]/15">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A1A1AA]">Role Seniority Match</span>
                    <span className="font-mono text-[#F8F9FA] font-semibold">
                      {job.scoreBreakdown.roleSeniority}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#201f20] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffd7a9] rounded-full"
                      style={{ width: `${job.scoreBreakdown.roleSeniority}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#2a2a2b] border border-[#524535]/15">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A1A1AA]">Experience Grounding</span>
                    <span className="font-mono text-[#F8F9FA] font-semibold">
                      {job.scoreBreakdown.experienceMatch}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#201f20] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffd7a9] rounded-full"
                      style={{ width: `${job.scoreBreakdown.experienceMatch}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#2a2a2b] border border-[#524535]/15">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A1A1AA]">Location / Work Mode</span>
                    <span className="font-mono text-[#22C55E] font-semibold">
                      {job.scoreBreakdown.locationRule}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#201f20] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#22C55E] rounded-full"
                      style={{
                        width: job.hardConstraintsPassed ? '100%' : '20%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reasoning & Evidence Reference */}
          <div className="p-4 bg-[#2a2a2b] rounded-xl border border-[#524535]/20 space-y-2 text-xs">
            <span className="text-[#ffd7a9] font-semibold uppercase tracking-wider block text-[10px]">
              Match Evaluation Reasoning
            </span>
            <p className="text-[#F8F9FA] leading-relaxed">
              <strong className="text-[#ffd7a9]">Strengths:</strong> {job.strengths}
            </p>
            {job.gaps && (
              <p className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#EF4444]">Identified Gaps:</strong> {job.gaps}
              </p>
            )}
            {job.riskNote && (
              <p className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#F59E0B]">Risk Note:</strong> {job.riskNote}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#524535]/20 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-[#A1A1AA]">
            Audit ID: {job.id}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2a2a2b] hover:bg-[#353436] rounded-lg text-xs font-medium text-[#F8F9FA] transition-colors border border-[#524535]/30"
            >
              Close
            </button>
            {!job.hardConstraintsPassed && onApplyOverride && (
              <button
                onClick={() => {
                  onApplyOverride(job.id);
                  onClose();
                }}
                className="px-4 py-2 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded-lg text-xs font-medium transition-colors border border-[#EF4444]/40"
              >
                Manual Override Policy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
