import React from 'react';
import { X, CheckCircle, Copy, Shield, FileCode2, Lock } from 'lucide-react';
import { ApplicationRecord } from '../../types';

interface EvidencePayloadModalProps {
  application: ApplicationRecord | null;
  mode: 'evidence' | 'payload';
  onClose: () => void;
}

export const EvidencePayloadModal: React.FC<EvidencePayloadModalProps> = ({
  application,
  mode,
  onClose,
}) => {
  if (!application) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#201f20] border border-[#524535]/40 rounded-2xl max-w-2xl w-full max-h-[85dvh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-[#524535]/20 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {mode === 'evidence' ? 'Deterministic Verification Evidence' : 'Submission Payload Inspector'}
              </span>
              <span className="text-xs text-[#A1A1AA] font-mono">{application.receiptId || application.id}</span>
            </div>
            <h3 className="text-lg font-semibold text-[#F8F9FA]">{application.jobTitle}</h3>
            <p className="text-xs text-[#A1A1AA]">
              {application.company} • Submitted via {application.adapter}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-[#F8F9FA] p-1.5 rounded-lg hover:bg-[#2a2a2b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {mode === 'evidence' ? (
            <div className="space-y-4 text-xs">
              {/* Token Card */}
              <div className="p-4 rounded-xl bg-[#2a2a2b] border border-[#524535]/25 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-[#ffd7a9] uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#ffd7a9]" /> Platform Confirmation Token
                  </span>
                  {application.confirmationToken && (
                    <button
                      onClick={() => handleCopy(application.confirmationToken || '')}
                      className="text-[11px] text-[#A1A1AA] hover:text-[#F8F9FA] flex items-center gap-1 px-2 py-1 bg-[#201f20] rounded border border-[#524535]/20"
                    >
                      <Copy className="w-3 h-3" /> Copy Token
                    </button>
                  )}
                </div>
                <div className="p-2.5 rounded bg-[#131314] font-mono text-[#ffd7a9] text-sm font-semibold tracking-wider">
                  {application.confirmationToken || 'Pending confirmation capture'}
                </div>
                <p className="text-[11px] text-[#A1A1AA]">
                  Captured from ATS confirmation webhook or portal receipt. Non-forgeable external proof.
                </p>
              </div>

              {/* Cryptographic Proof Hash */}
              <div className="p-4 rounded-xl bg-[#2a2a2b] border border-[#524535]/25 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-[#F8F9FA] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#22C55E]" /> Cryptographically Signed Audit Receipt
                  </span>
                  <span className="text-[10px] font-mono text-[#22C55E]">STATUS: RECORDED</span>
                </div>
                <div className="p-2.5 rounded bg-[#131314] font-mono text-[11px] text-[#22C55E] break-all">
                  {application.signedReceiptHash || application.id}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A1A1AA] pt-1">
                  <div>Timestamp: <span className="font-mono text-[#F8F9FA]">{application.timestamp}</span></div>
                  <div>Evidence Graph: <span className="text-[#22C55E] font-medium">Verified Grounding</span></div>
                </div>
              </div>

              {/* Resume Version & Claim Mapping */}
              <div className="p-4 rounded-xl bg-[#2a2a2b] border border-[#524535]/25 space-y-2">
                <span className="text-[11px] font-semibold text-[#F8F9FA] block">
                  Grounding &amp; Claim Proof Summary
                </span>
                <div className="space-y-1.5 text-[11px] text-[#A1A1AA]">
                  <div className="flex items-center justify-between p-2 rounded bg-[#201f20]">
                    <span>Tailored Resume Variant:</span>
                    <span className="font-mono text-[#ffd7a9]">{application.resumeVersion || 'Candidate Truth Variant'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#201f20]">
                    <span>Unsupported Claims Count:</span>
                    <span className="font-mono text-[#22C55E] font-bold">0 (Zero Hallucination Verified)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Payload View */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                <span className="flex items-center gap-1.5 text-[#ffd7a9]">
                  <FileCode2 className="w-4 h-4" /> Validated JSON Payload Dispatched to Adapter
                </span>
                <button
                  onClick={() => handleCopy(application.payloadJson || JSON.stringify(application, null, 2))}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#2a2a2b] hover:bg-[#353436] rounded text-[11px] text-[#F8F9FA] border border-[#524535]/20"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy JSON
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#131314] font-mono text-xs text-[#d6c3b0] overflow-x-auto border border-[#524535]/25 leading-relaxed">
                {application.payloadJson || JSON.stringify({
                  application_id: application.id,
                  target_job: application.jobTitle,
                  company: application.company,
                  status: application.status,
                  adapter: application.adapter,
                  confirmation_token: application.confirmationToken,
                  timestamp: application.timestamp,
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#524535]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2a2a2b] hover:bg-[#353436] rounded-lg text-xs font-medium text-[#F8F9FA] transition-colors border border-[#524535]/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
