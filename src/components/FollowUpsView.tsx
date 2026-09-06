import React, { useState } from 'react';
import { Repeat, Clock, ShieldAlert, CheckCircle2, Eye, Pause, Play, Send, Check } from 'lucide-react';
import { FollowUpItem } from '../types';

interface FollowUpsViewProps {
  followUp: FollowUpItem | null;
  onOpenFollowUpModal: () => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followUp,
  onOpenFollowUpModal,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="flex flex-col w-full relative pb-20">
      <div className="px-8 py-8 max-w-[1440px] mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#524535]/15">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-['Playfair_Display'] text-[#F8F9FA]">
                Autonomous Follow-Up Engine
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-bold uppercase tracking-widest">
                Context-Aware Nudges
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
              Autonomous follow-ups advance pipeline velocity. Messages are auto-cancelled if the recruiter responds or an interview is scheduled.
            </p>
          </div>

          {followUp && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  isPaused
                    ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
                    : 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume Follow-up Queue' : 'Pause Follow-up Queue'}</span>
              </button>
            </div>
          )}
        </header>

        {/* Active In-Queue Card or Honest Empty State */}
        {followUp ? (
          <div className="bg-[#2a2a2b] rounded-2xl border border-[#ffd7a9]/40 p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#524535]/20">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#ffd7a9]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8F9FA]">
                  Next Scheduled Autonomous Nudge
                </h2>
              </div>
              <span className="text-xs font-mono text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/20 font-bold">
                COUNTDOWN: {followUp.countdown}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-[#F8F9FA]">{followUp.role}</h3>
                  <p className="text-xs text-[#ffd7a9] mt-0.5">{followUp.company}</p>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Target: <strong>{followUp.recruiter}</strong> • Application submitted {followUp.submittedDaysAgo} days ago
                  </p>
                </div>

                <div className="p-3.5 bg-[#131314] rounded-xl border border-[#524535]/25 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-[#ffd7a9] uppercase tracking-wider block">
                    Synthesized Persona Draft (Zero Hallucination)
                  </span>
                  <p className="text-[#e5e2e3] italic leading-relaxed">
                    "{followUp.draftBody}"
                  </p>
                  {followUp.evidenceRef && (
                    <span className="text-[10px] font-mono text-[#22C55E] block pt-1">
                      Evidence Anchor: {followUp.evidenceRef}
                    </span>
                  )}
                </div>
              </div>

              {/* Guardrails Box */}
              <div className="p-4 bg-[#201f20] rounded-xl border border-[#524535]/20 space-y-3 flex flex-col justify-between">
                <div className="space-y-2 text-xs">
                  <span className="text-xs font-semibold text-[#F8F9FA] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#F59E0B]" /> Automatic Cancellation Guardrails
                  </span>
                  <p className="text-[11px] text-[#A1A1AA]">
                    MOVA automatically kills this scheduled dispatch if any of the following events occur prior to T-0:
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {followUp.cancellationConditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#e5e2e3]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>{cond}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#524535]/15 flex items-center justify-between">
                  <button
                    onClick={onOpenFollowUpModal}
                    className="px-4 py-2 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Draft &amp; Triggers</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#2a2a2b] rounded-2xl border border-[#524535]/25 p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#201f20] border border-[#524535]/30 flex items-center justify-center mx-auto text-[#ffd7a9]">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-[#F8F9FA]">
                No follow-ups currently scheduled
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Follow-ups are automatically generated and scheduled once real applications have been submitted and are awaiting recruiter response.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
