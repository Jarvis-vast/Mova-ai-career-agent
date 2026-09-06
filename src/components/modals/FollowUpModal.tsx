import React from 'react';
import { X, Clock, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { FollowUpItem } from '../../types';

interface FollowUpModalProps {
  followUp: FollowUpItem | null;
  onClose: () => void;
  onPauseAutomation?: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  followUp,
  onClose,
  onPauseAutomation,
}) => {
  if (!followUp) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#201f20] border border-[#524535]/40 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
        <div className="p-6 border-b border-[#524535]/20 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#ffd7a9]/15 text-[#ffd7a9] border border-[#ffd7a9]/30 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Autonomous Context-Aware Follow-Up
              </span>
              <span className="text-xs text-[#22C55E] font-mono">{followUp.countdown}</span>
            </div>
            <h3 className="text-lg font-semibold text-[#F8F9FA]">{followUp.role} at {followUp.company}</h3>
            <p className="text-xs text-[#A1A1AA]">
              Target Recruiter: {followUp.recruiter} • Application submitted {followUp.submittedDaysAgo} days ago
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-[#F8F9FA] p-1.5 rounded-lg hover:bg-[#2a2a2b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Dispatch Policy Note */}
          <div className="p-3.5 rounded-xl bg-[#2a2a2b] border border-[#524535]/20 space-y-1">
            <span className="text-[10px] font-mono text-[#ffd7a9] uppercase tracking-wider block font-semibold">
              MOVA Autonomous Dispatch Policy
            </span>
            <p className="text-[#F8F9FA] leading-relaxed">
              Message will be automatically dispatched at T-0 unless any cancellation condition is triggered.
              No manual email clicking required.
            </p>
          </div>

          {/* Synthesized Message Preview */}
          <div className="p-4 rounded-xl bg-[#131314] border border-[#524535]/25 space-y-3">
            <div className="flex justify-between items-center text-[11px] pb-2 border-b border-[#524535]/20">
              <span className="text-[#A1A1AA]">
                Subject: <strong className="text-[#F8F9FA]">{followUp.draftSubject}</strong>
              </span>
              <span className="text-[10px] font-mono text-[#22C55E]">✓ AI Persona Tailored</span>
            </div>
            <p className="text-[#e5e2e3] leading-relaxed italic">
              "{followUp.draftBody}"
            </p>
            <div className="pt-2 text-[10px] text-[#A1A1AA] flex items-center justify-between border-t border-[#524535]/15">
              <span>Evidence Anchor: <strong className="text-[#ffd7a9]">{followUp.evidenceRef}</strong></span>
              <span className="text-[#22C55E]">Zero Hallucination</span>
            </div>
          </div>

          {/* Automatic Cancellation Rules */}
          <div className="p-4 rounded-xl bg-[#2a2a2b] border border-[#524535]/20 space-y-2">
            <span className="text-xs font-semibold text-[#F8F9FA] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
              Automatic Cancellation Guardrails (Suppressed If Any Trigger Occurs)
            </span>
            <div className="space-y-1.5 pt-1">
              {followUp.cancellationConditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[#A1A1AA]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#524535]/20 flex items-center justify-between">
          <button
            onClick={() => {
              if (onPauseAutomation) onPauseAutomation();
              onClose();
            }}
            className="px-4 py-2 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] rounded-lg text-xs font-mono font-medium border border-[#EF4444]/30 transition-colors"
          >
            Override / Pause Follow-up Automation
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#ffd7a9] text-[#462a00] font-semibold rounded-lg text-xs hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
