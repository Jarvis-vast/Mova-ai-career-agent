import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  FileCheck,
  Shield,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  FileCode2,
  RotateCcw,
  Check,
  Brain,
  Pause,
  Play,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { ApplicationRecord, FollowUpItem, NavPath } from '../types';

interface ApplicationsViewProps {
  applications: ApplicationRecord[];
  followUp: FollowUpItem | null;
  onOpenEvidence: (app: ApplicationRecord) => void;
  onOpenPayload: (app: ApplicationRecord) => void;
  onOpenFollowUp: () => void;
  onOpenRules: () => void;
  onNavigate: (path: NavPath) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  followUp,
  onOpenEvidence,
  onOpenPayload,
  onOpenFollowUp,
  onOpenRules,
  onNavigate,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'verified' | 'submitting' | 'unknown'>('all');

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(filterQuery.toLowerCase());

    if (selectedTab === 'verified')
      return matchesSearch && (app.status === 'VERIFIED' || app.status === 'INTERVIEW');
    if (selectedTab === 'submitting')
      return matchesSearch && app.status === 'SUBMITTING_VERIFYING';
    if (selectedTab === 'unknown')
      return matchesSearch && app.status === 'UNKNOWN_AUDIT';
    return matchesSearch;
  });

  const verifiedCount = applications.filter(
    (a) => a.status === 'VERIFIED' || a.status === 'INTERVIEW'
  ).length;
  const inFlightCount = applications.filter(
    (a) => a.status === 'SUBMITTING_VERIFYING'
  ).length;
  const auditCount = applications.filter(
    (a) => a.status === 'UNKNOWN_AUDIT'
  ).length;
  const responseCount = applications.filter(
    (a) => a.status === 'RESPONSE'
  ).length;
  const interviewCount = applications.filter(
    (a) => a.status === 'INTERVIEW'
  ).length;

  return (
    <div className="flex flex-col w-full relative pb-20">
      <div className="px-8 py-8 max-w-[1440px] mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#524535]/15">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-['Playfair_Display'] text-[#F8F9FA]">
                Application Pipeline
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-bold uppercase tracking-widest">
                Deterministic Verification
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
              Only submissions confirmed with external platform receipts and tokens are marked as Verified.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRules}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] border border-[#524535]/30 text-[#e5e2e3] text-xs font-medium transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-[#ffd7a9]" />
              <span>Execution Rules</span>
            </button>
          </div>
        </header>

        {/* Formal Lifecycle State Machine */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ffd7a9] font-mono">
              Formal Lifecycle State Machine
            </h2>
            <span className="text-[11px] font-mono text-[#A1A1AA]">
              ACTIVE PIPELINE TRACKING
            </span>
          </div>

          {/* Primary Lifecycle Track */}
          <div className="bg-[#1c1b1c] rounded-xl border border-[#524535]/20 p-4 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[760px] gap-2">
              {/* Discovered / Pipeline */}
              <div className="flex-1 flex flex-col items-center text-center p-2 rounded-lg bg-[#201f20] border border-[#524535]/15">
                <span className="text-xs text-[#A1A1AA] font-medium">Pipeline Total</span>
                <span className="text-xl font-bold font-mono text-[#F8F9FA] mt-0.5">{applications.length}</span>
                <span className="text-[9px] text-[#A1A1AA] mt-0.5">Recorded</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#524535] shrink-0" />

              {/* Submitting */}
              <div className="flex-1 flex flex-col items-center text-center p-2 rounded-lg bg-[#2a2a2b] border border-[#ffd7a9]/40 shadow-sm ring-1 ring-[#ffd7a9]/20">
                <span className="text-xs text-[#ffd7a9] font-bold">Submitting</span>
                <span className="text-xl font-bold font-mono text-[#ffd7a9] mt-0.5">{inFlightCount}</span>
                <span className="text-[9px] text-[#ffd7a9] mt-0.5">In-Flight</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#524535] shrink-0" />

              {/* Verified */}
              <div className="flex-1 flex flex-col items-center text-center p-2 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30">
                <span className="text-xs text-[#22C55E] font-bold">Verified</span>
                <span className="text-xl font-bold font-mono text-[#22C55E] mt-0.5">{verifiedCount}</span>
                <span className="text-[9px] text-[#22C55E] mt-0.5">Token Captured</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#524535] shrink-0" />

              {/* Response */}
              <div className="flex-1 flex flex-col items-center text-center p-2 rounded-lg bg-[#201f20] border border-[#524535]/15">
                <span className="text-xs text-[#A1A1AA] font-medium">Response</span>
                <span className="text-xl font-bold font-mono text-[#F8F9FA] mt-0.5">{responseCount}</span>
                <span className="text-[9px] text-[#A1A1AA] mt-0.5">Recruiter Ping</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#524535] shrink-0" />

              {/* Interview */}
              <div className="flex-1 flex flex-col items-center text-center p-2 rounded-lg bg-[#201f20] border border-[#524535]/15">
                <span className="text-xs text-[#A1A1AA] font-medium">Interview</span>
                <span className="text-xl font-bold font-mono text-[#ffd7a9] mt-0.5">{interviewCount}</span>
                <span className="text-[9px] text-[#ffd7a9] mt-0.5">Active Loops</span>
              </div>
            </div>

            {/* Terminal / Audit Strip */}
            <div className="mt-3 pt-3 border-t border-[#524535]/15 flex items-center justify-between text-xs text-[#A1A1AA] font-mono">
              <span className="text-[10px] uppercase text-[#A1A1AA]">Verification Status:</span>
              <div className="flex items-center gap-4">
                <span>Verified: <strong className="text-[#22C55E]">{verifiedCount}</strong></span>
                <span className="text-[#F59E0B]">Audit Required: <strong className="text-[#F59E0B]">{auditCount}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Column: Applications List */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Filter Controls */}
            <div className="flex items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTab === 'all'
                      ? 'bg-[#ffd7a9] text-[#462a00] font-semibold'
                      : 'bg-[#2a2a2b] text-[#A1A1AA] hover:text-[#F8F9FA]'
                  }`}
                >
                  All ({applications.length})
                </button>
                <button
                  onClick={() => setSelectedTab('verified')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTab === 'verified'
                      ? 'bg-[#ffd7a9] text-[#462a00] font-semibold'
                      : 'bg-[#2a2a2b] text-[#A1A1AA] hover:text-[#F8F9FA]'
                  }`}
                >
                  Verified Tokens ({verifiedCount})
                </button>
                <button
                  onClick={() => setSelectedTab('submitting')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTab === 'submitting'
                      ? 'bg-[#ffd7a9] text-[#462a00] font-semibold'
                      : 'bg-[#2a2a2b] text-[#A1A1AA] hover:text-[#F8F9FA]'
                  }`}
                >
                  In-Flight ({inFlightCount})
                </button>
              </div>

              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Search applications..."
                  className="w-full bg-[#2a2a2b] border border-[#524535]/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8F9FA] placeholder:text-[#A1A1AA]/60 outline-none focus:border-[#ffd7a9]/60"
                />
              </div>
            </div>

            {/* Applications List */}
            {filteredApps.length > 0 ? (
              <div className="space-y-4">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-4 hover:border-[#ffd7a9]/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-semibold text-[#F8F9FA]">{app.jobTitle}</h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#201f20] text-[#ffd7a9] font-mono border border-[#524535]/30">
                            {app.company}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#A1A1AA] flex-wrap font-mono">
                          <span>{app.location}</span>
                          <span>•</span>
                          <span>Adapter: {app.adapter}</span>
                          <span>•</span>
                          <span>Submitted: {app.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${
                            app.status === 'VERIFIED'
                              ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
                              : app.status === 'SUBMITTING_VERIFYING'
                              ? 'bg-[#ffd7a9]/15 border-[#ffd7a9]/30 text-[#ffd7a9]'
                              : 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
                          }`}
                        >
                          {app.status === 'VERIFIED' ? 'Verified Token' : app.status}
                        </span>
                      </div>
                    </div>

                    {/* Receipt & Token Info */}
                    <div className="p-3 bg-[#131314] rounded-lg border border-[#524535]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[#A1A1AA]">Receipt ID: </span>
                        <span className="text-[#ffd7a9]">{app.receiptId || 'Generating...'}</span>
                      </div>
                      <div>
                        <span className="text-[#A1A1AA]">Confirmation: </span>
                        <span className="text-[#22C55E]">{app.confirmationToken || 'Pending receipt...'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenEvidence(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#201f20] hover:bg-[#353436] text-xs font-medium text-[#F8F9FA] border border-[#524535]/30 flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#ffd7a9]" />
                          <span>Inspect Evidence Payload</span>
                        </button>
                        <button
                          onClick={() => onOpenPayload(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#201f20] hover:bg-[#353436] text-xs font-mono text-[#A1A1AA] hover:text-[#F8F9FA] border border-[#524535]/30 transition-colors"
                        >
                          Raw Payload
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Honest Empty State */
              <div className="bg-[#2a2a2b] rounded-2xl border border-[#524535]/25 p-12 text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#201f20] border border-[#524535]/30 flex items-center justify-center mx-auto text-[#ffd7a9]">
                  <Inbox className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-[#F8F9FA]">
                    No applications submitted yet
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    MOVA will record applications here once submitted. Only submissions confirmed with external platform receipts are classified as Verified.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="px-5 py-2.5 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                  >
                    <span>Inspect Discovered Opportunities</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Autonomous Follow-Up */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#524535]/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ffd7a9]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                    Autonomous Follow-Up
                  </h3>
                </div>
                {followUp && (
                  <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                    QUEUED: {followUp.countdown}
                  </span>
                )}
              </div>

              {followUp ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="font-semibold text-[#F8F9FA]">{followUp.role}</span>
                      <span className="text-[#A1A1AA]"> at {followUp.company}</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Recruiter: <strong className="text-[#F8F9FA]">{followUp.recruiter}</strong>
                    </p>
                  </div>

                  <div className="p-3 bg-[#131314] rounded-lg border border-[#524535]/20 space-y-2 text-xs">
                    <span className="text-[10px] font-mono text-[#ffd7a9] uppercase tracking-wider block">
                      Tailored Message Draft
                    </span>
                    <p className="text-[11px] text-[#e5e2e3] italic leading-relaxed line-clamp-4">
                      "{followUp.draftBody}"
                    </p>
                  </div>

                  <button
                    onClick={onOpenFollowUp}
                    className="w-full py-2 rounded-lg bg-[#ffd7a9] text-[#462a00] font-semibold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Draft &amp; Triggers</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs font-medium text-[#F8F9FA]">No follow-ups currently scheduled</p>
                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                    MOVA will schedule context-aware recruiter follow-ups once applications are submitted and awaiting response.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
