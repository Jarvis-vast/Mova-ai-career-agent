import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Sliders, AlertCircle } from 'lucide-react';
import { CandidateProfile } from '../../types';

interface RulesConfigModalProps {
  isOpen?: boolean;
  rules: CandidateProfile['rules'];
  onSave: (newRules: CandidateProfile['rules']) => void;
  onClose: () => void;
  onReturnToSettings?: () => void;
}

export const RulesConfigModal: React.FC<RulesConfigModalProps> = ({
  isOpen = true,
  rules,
  onSave,
  onClose,
  onReturnToSettings,
}) => {
  if (!isOpen) return null;

  const [locationConstraint, setLocationConstraint] = useState(rules.locationConstraint);
  const [salaryFloor, setSalaryFloor] = useState(rules.salaryFloor);
  const [relocationAllowed, setRelocationAllowed] = useState(rules.relocationAllowed);
  const [minFitScore, setMinFitScore] = useState(rules.minFitScore);
  const [dailyOpportunityTarget, setDailyOpportunityTarget] = useState(rules.dailyOpportunityTarget);
  const [blacklistedKeywords, setBlacklistedKeywords] = useState(
    rules.blacklistedKeywords.join(', ')
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Sync state when rules prop updates
  useEffect(() => {
    setLocationConstraint(rules.locationConstraint);
    setSalaryFloor(rules.salaryFloor);
    setRelocationAllowed(rules.relocationAllowed);
    setMinFitScore(rules.minFitScore);
    setDailyOpportunityTarget(rules.dailyOpportunityTarget);
    setBlacklistedKeywords(rules.blacklistedKeywords.join(', '));
    setValidationError(null);
  }, [rules]);

  // Body scroll lock & preservation
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  // Focus management (trap & restore)
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  // Handle Cancel action (discards changes & returns)
  const handleCancel = () => {
    setLocationConstraint(rules.locationConstraint);
    setSalaryFloor(rules.salaryFloor);
    setRelocationAllowed(rules.relocationAllowed);
    setMinFitScore(rules.minFitScore);
    setDailyOpportunityTarget(rules.dailyOpportunityTarget);
    setBlacklistedKeywords(rules.blacklistedKeywords.join(', '));
    setValidationError(null);

    onClose();
    if (onReturnToSettings) {
      onReturnToSettings();
    }
  };

  // Escape key support
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [rules, onReturnToSettings, onClose]);

  // Tab key trap inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // Save validation and submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationConstraint.trim()) {
      setValidationError('Geographic Preference & Location Constraint cannot be empty.');
      return;
    }
    if (!salaryFloor.trim()) {
      setValidationError('Salary Floor cannot be empty.');
      return;
    }
    if (isNaN(minFitScore) || minFitScore < 0 || minFitScore > 100) {
      setValidationError('Minimum Match Fit Score must be a valid number between 0 and 100.');
      return;
    }
    if (isNaN(dailyOpportunityTarget) || dailyOpportunityTarget < 1) {
      setValidationError('Daily Qualified Target must be at least 1.');
      return;
    }

    const updatedRules: CandidateProfile['rules'] = {
      ...rules,
      locationConstraint: locationConstraint.trim(),
      salaryFloor: salaryFloor.trim(),
      relocationAllowed,
      minFitScore,
      dailyOpportunityTarget,
      blacklistedKeywords: blacklistedKeywords
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    onSave(updatedRules);
    onClose();
    if (onReturnToSettings) {
      onReturnToSettings();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guardrails-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="bg-[#201f20] border border-[#524535]/40 rounded-2xl w-[calc(100vw-24px)] sm:w-full sm:max-w-[720px] max-h-[90dvh] sm:max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden focus:outline-none animate-in fade-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-[#524535]/20 flex items-start justify-between bg-[#201f20]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-semibold flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Autonomous Control Plane
              </span>
              <span className="text-xs text-[#22C55E] font-mono">Strict Active</span>
            </div>
            <h3 id="guardrails-modal-title" className="text-lg font-semibold text-[#F8F9FA]">
              Configure Candidate Rules &amp; Hard Constraints
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Deterministic guardrails evaluated before the LLM drafting cycle begins.
            </p>
          </div>
          <button
            id="btn-guardrails-close"
            type="button"
            onClick={handleCancel}
            aria-label="Close dialog"
            className="text-[#A1A1AA] hover:text-[#F8F9FA] p-1.5 rounded-lg hover:bg-[#2a2a2b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form wrapping scrollable content + sticky footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            {validationError && (
              <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-[#EF4444] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Location Constraint */}
            <div>
              <label htmlFor="guardrail-location" className="block font-semibold text-[#ffd7a9] mb-1">
                Geographic Preference &amp; Location Constraint
              </label>
              <input
                id="guardrail-location"
                ref={firstInputRef}
                type="text"
                value={locationConstraint}
                onChange={(e) => {
                  setLocationConstraint(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
              />
              <p className="text-[11px] text-[#A1A1AA] mt-1">
                Example: Mumbai / Remote ONLY (Any job requiring physical on-site in other cities will be blocked)
              </p>
            </div>

            {/* Relocation Toggle */}
            <div className="p-3.5 rounded-xl bg-[#2a2a2b] border border-[#524535]/20 flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#F8F9FA] block">Allow Relocation?</span>
                <p className="text-[11px] text-[#A1A1AA]">
                  When disabled, roles requiring relocation will be automatically classified as DO NOT APPLY.
                </p>
              </div>
              <button
                type="button"
                id="guardrail-relocation-toggle"
                onClick={() => setRelocationAllowed(!relocationAllowed)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  relocationAllowed ? 'bg-[#22C55E]' : 'bg-[#353436]'
                }`}
                aria-label={relocationAllowed ? 'Relocation allowed' : 'Relocation disallowed'}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    relocationAllowed ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Minimum Salary Floor */}
            <div>
              <label htmlFor="guardrail-salary" className="block font-semibold text-[#ffd7a9] mb-1">
                Salary Floor (Minimum Compensation Threshold)
              </label>
              <input
                id="guardrail-salary"
                type="text"
                value={salaryFloor}
                onChange={(e) => {
                  setSalaryFloor(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
              />
            </div>

            {/* Minimum Fit Score & Daily Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guardrail-min-fit" className="block font-semibold text-[#ffd7a9] mb-1">
                  Minimum Match Fit Score (0-100)
                </label>
                <input
                  id="guardrail-min-fit"
                  type="number"
                  min="0"
                  max="100"
                  value={minFitScore}
                  onChange={(e) => {
                    setMinFitScore(Number(e.target.value));
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                />
              </div>
              <div>
                <label htmlFor="guardrail-daily-target" className="block font-semibold text-[#ffd7a9] mb-1">
                  Daily Qualified Target
                </label>
                <input
                  id="guardrail-daily-target"
                  type="number"
                  min="1"
                  max="50"
                  value={dailyOpportunityTarget}
                  onChange={(e) => {
                    setDailyOpportunityTarget(Number(e.target.value));
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                />
              </div>
            </div>

            {/* Hard Blacklist Keywords */}
            <div>
              <label htmlFor="guardrail-blacklist" className="block font-semibold text-[#ffd7a9] mb-1">
                Hard Blacklist Keywords (Comma-separated)
              </label>
              <input
                id="guardrail-blacklist"
                type="text"
                value={blacklistedKeywords}
                onChange={(e) => setBlacklistedKeywords(e.target.value)}
                className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
              />
              <p className="text-[11px] text-[#A1A1AA] mt-1">
                Companies or job descriptions containing these keywords are permanently rejected.
              </p>
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="shrink-0 sticky bottom-0 bg-[#201f20] border-t border-[#524535]/20 px-5 sm:px-6 py-4 flex items-center justify-between z-10">
            <span className="text-[11px] font-mono text-[#A1A1AA]">
              Policy Engine: Strict Deterministic
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-guardrails-cancel"
                onClick={handleCancel}
                className="px-4 py-2 bg-[#2a2a2b] hover:bg-[#353436] rounded-lg text-xs font-medium text-[#F8F9FA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-guardrails-save"
                className="px-4 py-2 bg-[#ffd7a9] text-[#462a00] font-semibold rounded-lg text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Guardrails
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
