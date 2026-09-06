import React, { useState, useEffect } from 'react';
import { Sliders, ShieldCheck, Pause, Play, Save, Check, AlertTriangle, Lock, Cpu } from 'lucide-react';
import { CandidateProfile } from '../types';

interface SettingsViewProps {
  candidateProfile: CandidateProfile;
  onUpdateRules: (newRules: CandidateProfile['rules']) => void;
  onOpenRules?: () => void;
  isAgentActive: boolean;
  onToggleAgent: () => void;
  cycleCadence: number;
  onUpdateCadence: (mins: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  candidateProfile,
  onUpdateRules,
  onOpenRules,
  isAgentActive,
  onToggleAgent,
  cycleCadence,
  onUpdateCadence,
}) => {
  const [rules, setRules] = useState(candidateProfile.rules);
  const [blacklistString, setBlacklistString] = useState(
    candidateProfile.rules.blacklistedKeywords.join(', ')
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setRules(candidateProfile.rules);
    setBlacklistString(candidateProfile.rules.blacklistedKeywords.join(', '));
  }, [candidateProfile.rules]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...rules,
      blacklistedKeywords: blacklistString.split(',').map((s) => s.trim()).filter(Boolean),
    };
    onUpdateRules(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col w-full relative pb-20">
      <div className="px-8 py-8 max-w-[1440px] mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#524535]/15">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-['Playfair_Display'] text-[#F8F9FA]">
                Autonomous Control Plane &amp; Rules
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-bold uppercase tracking-widest">
                Guardrails &amp; Execution
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
              Configure deterministic hard boundaries, candidate preferences, and cadence controls.
            </p>
          </div>

          <button
            onClick={onToggleAgent}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
              isAgentActive
                ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                : 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
            }`}
          >
            {isAgentActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAgentActive ? 'Emergency Pause All Operations' : 'Resume Autonomous Operations'}</span>
          </button>
        </header>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Deterministic Hard Constraints */}
          <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#524535]/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ffd7a9]" />
                <h3 className="text-sm font-semibold text-[#F8F9FA]">
                  Deterministic Hard Constraints
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#22C55E]">PRE-LLM GUARDRAILS</span>
                {onOpenRules && (
                  <button
                    type="button"
                    id="btn-open-guardrails-modal"
                    onClick={onOpenRules}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ffd7a9]/10 hover:bg-[#ffd7a9]/20 text-[#ffd7a9] border border-[#ffd7a9]/30 text-[11px] font-mono transition-colors"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Open Modal</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-[#ffd7a9] mb-1.5">
                  Geographic Location Constraint
                </label>
                <input
                  type="text"
                  value={rules.locationConstraint}
                  onChange={(e) => setRules({ ...rules, locationConstraint: e.target.value })}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                />
                <p className="text-[11px] text-[#A1A1AA] mt-1">
                  On-site roles outside this territory will be blocked with zero exceptions.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#ffd7a9] mb-1.5">
                  Compensation Floor (Minimum Salary)
                </label>
                <input
                  type="text"
                  value={rules.salaryFloor}
                  onChange={(e) => setRules({ ...rules, salaryFloor: e.target.value })}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                />
                <p className="text-[11px] text-[#A1A1AA] mt-1">
                  Roles offering below this figure will be suppressed.
                </p>
              </div>

              {/* Relocation Policy */}
              <div className="p-4 rounded-xl bg-[#201f20] border border-[#524535]/20 flex items-center justify-between col-span-1 md:col-span-2">
                <div>
                  <span className="font-semibold text-[#F8F9FA] block">Allow Relocation?</span>
                  <p className="text-[11px] text-[#A1A1AA]">
                    {rules.relocationAllowed
                      ? 'On-site opportunities requiring relocation are eligible.'
                      : 'On-site opportunities requiring relocation will be automatically blocked.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRules({ ...rules, relocationAllowed: !rules.relocationAllowed })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    rules.relocationAllowed ? 'bg-[#22C55E]' : 'bg-[#353436]'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      rules.relocationAllowed ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Blacklist */}
              <div className="col-span-1 md:col-span-2">
                <label className="block font-semibold text-[#ffd7a9] mb-1.5">
                  Hard Blacklist Keywords &amp; Domains (Comma-separated)
                </label>
                <input
                  type="text"
                  value={blacklistString}
                  onChange={(e) => setBlacklistString(e.target.value)}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Cadence & Target Volume */}
          <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#524535]/20">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#ffd7a9]" />
                <h3 className="text-sm font-semibold text-[#F8F9FA]">
                  Autonomous Agent Cadence &amp; Thresholds
                </h3>
              </div>
              <span className="text-xs font-mono text-[#ffd7a9]">EXECUTION POLICIES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-[#ffd7a9] mb-1.5">
                  Cycle Cadence (Minutes)
                </label>
                <select
                  value={cycleCadence}
                  onChange={(e) => onUpdateCadence(Number(e.target.value))}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                >
                  <option value={15}>15 Minutes (Rapid)</option>
                  <option value={30}>30 Minutes (Recommended Standard)</option>
                  <option value={60}>60 Minutes (Conservative)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#ffd7a9] mb-1.5">
                  Minimum Match Fit Score (0-100)
                </label>
                <input
                  type="number"
                  min="60"
                  max="100"
                  value={rules.minFitScore}
                  onChange={(e) => setRules({ ...rules, minFitScore: Number(e.target.value) })}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#ffd7a9] mb-1.5">
                  Daily Qualified Target
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={rules.dailyOpportunityTarget}
                  onChange={(e) => setRules({ ...rules, dailyOpportunityTarget: Number(e.target.value) })}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2.5 text-[#F8F9FA] outline-none focus:border-[#ffd7a9]/70"
                />
              </div>
            </div>
          </div>

          {/* Section 3: ATS Adapters & Integrations */}
          <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-[#F8F9FA]">
              Active ATS Adapters &amp; Protocol Health
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-[#201f20] rounded-lg border border-[#22C55E]/30 space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[#F8F9FA]">Greenhouse API Adapter</span>
                  <span className="text-[10px] font-mono text-[#22C55E]">v2.8 OK</span>
                </div>
                <p className="text-[#A1A1AA]">Webhook verification tokens enabled</p>
              </div>

              <div className="p-3 bg-[#201f20] rounded-lg border border-[#22C55E]/30 space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[#F8F9FA]">Lever Direct Adapter</span>
                  <span className="text-[10px] font-mono text-[#22C55E]">v3.1 OK</span>
                </div>
                <p className="text-[#A1A1AA]">Payload hash signing active</p>
              </div>

              <div className="p-3 bg-[#201f20] rounded-lg border border-[#ffd7a9]/30 space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[#F8F9FA]">Workday Custom Adapter</span>
                  <span className="text-[10px] font-mono text-[#ffd7a9]">v1.4 ACTIVE</span>
                </div>
                <p className="text-[#A1A1AA]">Audit retry backoff configured (45s SLA)</p>
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-4 bg-[#22C55E]/15 border border-[#22C55E]/30 rounded-xl text-[#22C55E] flex items-center gap-2 text-xs font-semibold">
              <Check className="w-4 h-4" /> Hard constraints and execution parameters saved successfully!
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#ffd7a9] text-[#462a00] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
