/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavPath,
  JobOpportunity,
  ApplicationRecord,
  MissionLogItem,
  CandidateProfile,
  FollowUpItem,
  InterviewRecord,
  CompanyRadarItem,
} from './types';
import {
  initialCandidateProfile,
  initialJobs,
  initialApplications,
  initialMissionLogs,
  initialFollowUp,
  initialInterviews,
  initialCompanies,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { JobsView } from './components/JobsView';
import { ApplicationsView } from './components/ApplicationsView';
import { CandidateBrainView } from './components/CandidateBrainView';
import { CompaniesView } from './components/CompaniesView';
import { FollowUpsView } from './components/FollowUpsView';
import { InterviewsView } from './components/InterviewsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { Check, X } from 'lucide-react';

// Modals
import { DecisionModal } from './components/modals/DecisionModal';
import { EvidencePayloadModal } from './components/modals/EvidencePayloadModal';
import { ResumePackageModal } from './components/modals/ResumePackageModal';
import { FollowUpModal } from './components/modals/FollowUpModal';
import { RulesConfigModal } from './components/modals/RulesConfigModal';
import { LinkedInAuthModal } from './components/modals/LinkedInAuthModal';
import { fetchLinkedInAuthStatus } from './services/linkedinAuth';

export default function App() {
  const [currentPath, setCurrentPath] = useState<NavPath>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [cycleCadenceMinutes, setCycleCadenceMinutes] = useState(30);
  const [cycleMinutesRemaining, setCycleMinutesRemaining] = useState(30);
  const [cycleNumber, setCycleNumber] = useState(1);

  // Core Data State
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(initialCandidateProfile);
  const [jobs, setJobs] = useState<JobOpportunity[]>(initialJobs);
  const [applications, setApplications] = useState<ApplicationRecord[]>(initialApplications);
  const [logs, setLogs] = useState<MissionLogItem[]>(initialMissionLogs);
  const [followUp, setFollowUp] = useState<FollowUpItem | null>(initialFollowUp);
  const [interviews, setInterviews] = useState<InterviewRecord[]>(initialInterviews);
  const [companies, setCompanies] = useState<CompanyRadarItem[]>(initialCompanies);

  // Modal States
  const [selectedDecisionJob, setSelectedDecisionJob] = useState<JobOpportunity | null>(null);
  const [selectedEvidenceApp, setSelectedEvidenceApp] = useState<ApplicationRecord | null>(null);
  const [evidenceMode, setEvidenceMode] = useState<'evidence' | 'payload'>('evidence');
  const [selectedResumeJob, setSelectedResumeJob] = useState<JobOpportunity | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hydrate authentic LinkedIn profile status on startup
  useEffect(() => {
    fetchLinkedInAuthStatus().then((res) => {
      if (res.authenticated && res.profile) {
        setCandidateProfile((prev) => ({
          ...prev,
          name: res.profile?.name || prev.name,
          email: res.profile?.email || prev.email,
          avatarUrl: res.profile?.picture || prev.avatarUrl,
          linkedInAuth: res.profile || undefined,
        }));
      }
    });
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Countdown timer simulation for cycle
  useEffect(() => {
    if (!isAgentActive) return;
    const timer = setInterval(() => {
      setCycleMinutesRemaining((prev) => (prev <= 1 ? cycleCadenceMinutes : prev - 1));
    }, 60000);
    return () => clearInterval(timer);
  }, [isAgentActive, cycleCadenceMinutes]);

  // Action: Trigger immediate cycle
  const handleTriggerCycle = () => {
    const newCycleNum = cycleNumber + 1;
    setCycleNumber(newCycleNum);
    setCycleMinutesRemaining(cycleCadenceMinutes);

    const newLog: MissionLogItem = {
      id: `log-${Date.now()}`,
      agentName: 'Research Agent',
      time: 'Just now',
      headline: `Triggered Autonomous Cycle #${newCycleNum}: Evaluated radar opportunities`,
      subDetail: 'Evaluated against candidate brain rules · Matching filters active',
      badgeText: 'CYCLE ACTIVE',
      badgeType: 'info',
      icon: 'sparkles',
    };
    setLogs((prev) => [newLog, ...prev]);
    setToastMessage(`Cycle #${newCycleNum} executed`);
  };

  // Action: Toggle agent pause/resume
  const handleToggleAgent = () => {
    const nextState = !isAgentActive;
    setIsAgentActive(nextState);

    const logItem: MissionLogItem = {
      id: `log-${Date.now()}`,
      agentName: 'Match Agent',
      time: 'Just now',
      headline: nextState
        ? 'Agent Resumed: Autonomous pipeline monitors active'
        : 'Agent Paused: Scheduled auto-dispatches suspended',
      subDetail: nextState
        ? 'Candidate hard constraints and cadence active'
        : 'Manual confirmation required for pipeline actions',
      badgeText: nextState ? 'RESUMED' : 'PAUSED',
      badgeType: nextState ? 'success' : 'warning',
      icon: 'shield',
    };
    setLogs((prev) => [logItem, ...prev]);
  };

  // Action: Add a new discovered job
  const handleAddJob = (job: JobOpportunity) => {
    setJobs((prev) => [job, ...prev]);
    const newLog: MissionLogItem = {
      id: `log-${Date.now()}`,
      agentName: 'Research Agent',
      time: 'Just now',
      headline: `Opportunity Logged: ${job.title} at ${job.company}`,
      subDetail: `Evaluated fit score: ${job.fitScore}/100 · ${
        job.hardConstraintsPassed ? 'Hard constraints satisfied' : 'Flagged for candidate policy review'
      }`,
      badgeText: 'LOGGED',
      badgeType: job.hardConstraintsPassed ? 'success' : 'warning',
      icon: 'sparkles',
    };
    setLogs((prev) => [newLog, ...prev]);
    setToastMessage(`Added ${job.title} to pipeline`);
  };

  // Action: Advance job to submitted application
  const handleAdvanceJob = (job: JobOpportunity) => {
    const token = `CONF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const receiptNum = Math.floor(1000 + Math.random() * 9000);
    const adapterType = 'Direct Portal';
    const newApp: ApplicationRecord = {
      id: `app-${Date.now()}`,
      company: job.company,
      jobTitle: job.title,
      location: job.location,
      status: 'VERIFIED',
      confirmationToken: token,
      receiptId: `#REC-${receiptNum}`,
      resumeVersion: 'v1.0 (Evidence Anchored)',
      evidenceCoverage: '100% Grounded',
      adapter: adapterType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      signedReceiptHash: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      payloadJson: JSON.stringify(
        {
          candidate: candidateProfile.name || 'Candidate',
          role: job.title,
          company: job.company,
          adapter: adapterType,
          token,
          submitted_at: new Date().toISOString(),
        },
        null,
        2
      ),
    };

    setApplications((prev) => [newApp, ...prev]);
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: 'VERIFIED' } : j))
    );

    const logItem: MissionLogItem = {
      id: `log-${Date.now()}`,
      agentName: 'Verification Agent',
      time: 'Just now',
      headline: `Application Submitted & Verified: ${job.title} at ${job.company}`,
      subDetail: `Captured external platform token ${token} via ${adapterType}`,
      badgeText: 'SUBMITTED',
      badgeType: 'success',
      icon: 'shield',
    };
    setLogs((prev) => [logItem, ...prev]);
    setToastMessage(`Application verified for ${job.company}`);
  };

  // Action: Override a blocked job
  const handleApplyOverride = (jobId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'SCHEDULED',
              hardConstraintsPassed: true,
              strengths: `${j.strengths} (Candidate Manual Override Applied)`,
            }
          : j
      )
    );

    const logItem: MissionLogItem = {
      id: `log-${Date.now()}`,
      agentName: 'Match Agent',
      time: 'Just now',
      headline: `Manual Override Applied: Role #${jobId} unlocked for pipeline dispatch`,
      subDetail: 'Candidate explicitly waived policy veto for this target role',
      badgeText: 'OVERRIDDEN',
      badgeType: 'info',
      icon: 'rule',
    };
    setLogs((prev) => [logItem, ...prev]);
    setToastMessage('Role policy overridden');
  };

  // Action: Update candidate rules
  const handleUpdateRules = (newRules: CandidateProfile['rules']) => {
    setCandidateProfile((prev) => ({ ...prev, rules: newRules }));

    const logItem: MissionLogItem = {
      id: `log-${Date.now()}`,
      agentName: 'Match Agent',
      time: 'Just now',
      headline: 'Candidate Guardrails Updated: Recalibrated policy constraints',
      subDetail: `Salary floor: ${newRules.salaryFloor || 'None'} · Location constraint: ${newRules.locationConstraint || 'None'}`,
      badgeText: 'RULES SYNCED',
      badgeType: 'success',
      icon: 'rule',
    };
    setLogs((prev) => [logItem, ...prev]);
    setToastMessage('Guardrails saved');
  };

  // Inspect log handler
  const handleInspectLog = (log: MissionLogItem) => {
    if (log.headline.includes('Application Submitted') || log.headline.includes('Verified')) {
      setCurrentPath('applications');
    } else if (log.headline.includes('Opportunity') || log.headline.includes('Cycle')) {
      setCurrentPath('jobs');
    } else {
      setCurrentPath('candidate-brain');
    }
  };

  // Search handler: filter matching jobs/apps
  const activeJobs = searchQuery
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs;

  const activeApps = searchQuery
    ? applications.filter(
        (a) =>
          a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : applications;

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-sans antialiased flex selection:bg-[#ffd7a9]/30 selection:text-[#ffd7a9]">
      {/* Left Fixed Navigation Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(p) => {
          setCurrentPath(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAgentActive={isAgentActive}
        cycleCadenceMinutes={cycleCadenceMinutes}
        jobsCount={jobs.length}
      />

      {/* Main Layout Area */}
      <div className="pl-[240px] flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cycleNumber={cycleNumber}
          isAgentActive={isAgentActive}
          onNavigate={(p) => {
            setCurrentPath(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onTriggerCycle={handleTriggerCycle}
          candidateProfile={candidateProfile}
          logs={logs}
          onOpenLinkedInAuth={() => setIsLinkedInModalOpen(true)}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 mt-16 overflow-y-auto">
          {currentPath === 'overview' && (
            <OverviewView
              onNavigate={(p) => {
                setCurrentPath(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenRules={() => setIsRulesModalOpen(true)}
              isAgentActive={isAgentActive}
              onToggleAgent={handleToggleAgent}
              logs={logs}
              cycleMinutesRemaining={cycleMinutesRemaining}
              onInspectLog={handleInspectLog}
              candidateProfile={candidateProfile}
              jobs={jobs}
              applications={applications}
              followUp={followUp}
              interviews={interviews}
            />
          )}

          {currentPath === 'jobs' && (
            <JobsView
              jobs={activeJobs}
              candidateProfile={candidateProfile}
              onOpenDecision={(job) => setSelectedDecisionJob(job)}
              onOpenPackage={(job) => setSelectedResumeJob(job)}
              onOpenRules={() => setIsRulesModalOpen(true)}
              onTriggerCycle={handleTriggerCycle}
              cycleNumber={cycleNumber}
              onAddJob={handleAddJob}
              onAdvanceJob={handleAdvanceJob}
            />
          )}

          {currentPath === 'applications' && (
            <ApplicationsView
              applications={activeApps}
              followUp={followUp}
              onOpenEvidence={(app) => {
                setSelectedEvidenceApp(app);
                setEvidenceMode('evidence');
              }}
              onOpenPayload={(app) => {
                setSelectedEvidenceApp(app);
                setEvidenceMode('payload');
              }}
              onOpenFollowUp={() => setIsFollowUpModalOpen(true)}
              onOpenRules={() => setIsRulesModalOpen(true)}
              onNavigate={(p) => {
                setCurrentPath(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentPath === 'candidate-brain' && (
            <CandidateBrainView
              candidateProfile={candidateProfile}
              onOpenRules={() => setIsRulesModalOpen(true)}
              onNavigate={(p) => {
                setCurrentPath(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onUpdateProfile={(updated) => {
                setCandidateProfile(updated);
                setToastMessage('Candidate Brain profile updated');
              }}
              onLogAction={(newLog) => setLogs((prev) => [newLog, ...prev])}
              onOpenLinkedInModal={() => setIsLinkedInModalOpen(true)}
            />
          )}

          {currentPath === 'companies' && (
            <CompaniesView
              companies={companies}
              onNavigate={(p) => {
                setCurrentPath(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentPath === 'follow-ups' && (
            <FollowUpsView
              followUp={followUp}
              onOpenFollowUpModal={() => setIsFollowUpModalOpen(true)}
            />
          )}

          {currentPath === 'interviews' && (
            <InterviewsView
              interviews={interviews}
              candidateProfile={candidateProfile}
              onAddInterview={(newInt) => {
                setInterviews((prev) => [newInt, ...prev]);
                setToastMessage(`Interview logged for ${newInt.company}`);
              }}
            />
          )}

          {currentPath === 'analytics' && (
            <AnalyticsView
              applications={applications}
              jobs={jobs}
              onNavigate={(p) => {
                setCurrentPath(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectJob={(job) => setSelectedDecisionJob(job)}
            />
          )}

          {currentPath === 'settings' && (
            <SettingsView
              candidateProfile={candidateProfile}
              onUpdateRules={handleUpdateRules}
              onOpenRules={() => setIsRulesModalOpen(true)}
              isAgentActive={isAgentActive}
              onToggleAgent={handleToggleAgent}
              cycleCadence={cycleCadenceMinutes}
              onUpdateCadence={setCycleCadenceMinutes}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <DecisionModal
        job={selectedDecisionJob}
        onClose={() => setSelectedDecisionJob(null)}
        onApplyOverride={handleApplyOverride}
      />

      <EvidencePayloadModal
        application={selectedEvidenceApp}
        mode={evidenceMode}
        onClose={() => setSelectedEvidenceApp(null)}
      />

      <ResumePackageModal
        job={selectedResumeJob}
        candidateProfile={candidateProfile}
        onClose={() => setSelectedResumeJob(null)}
      />

      <FollowUpModal
        followUp={isFollowUpModalOpen ? followUp : null}
        onClose={() => setIsFollowUpModalOpen(false)}
        onPauseAutomation={() => {
          if (followUp) {
            setFollowUp((prev) => (prev ? { ...prev, status: 'PAUSED' } : null));
          }
          setToastMessage('Follow-up automation paused');
        }}
      />

      {isRulesModalOpen && (
        <RulesConfigModal
          isOpen={isRulesModalOpen}
          rules={candidateProfile.rules}
          onSave={handleUpdateRules}
          onClose={() => setIsRulesModalOpen(false)}
          onReturnToSettings={() => setCurrentPath('settings')}
        />
      )}

      {/* LinkedIn OAuth 2.0 Identity & Live Ingestion Modal */}
      {isLinkedInModalOpen && (
        <LinkedInAuthModal
          isOpen={isLinkedInModalOpen}
          onClose={() => setIsLinkedInModalOpen(false)}
          candidateProfile={candidateProfile}
          onProfileUpdated={(updated) => {
            setCandidateProfile(updated);
            if (updated.linkedInAuth) {
              const logItem: MissionLogItem = {
                id: `log-${Date.now()}`,
                agentName: 'Verification Agent',
                time: 'Just now',
                headline: `LinkedIn OAuth Verified: Ingested authentic identity for ${updated.linkedInAuth.name}`,
                subDetail: `OpenID Connect verified · sub: ${updated.linkedInAuth.sub} · Email: ${updated.linkedInAuth.email || 'N/A'}`,
                badgeText: 'IDENTITY SYNCED',
                badgeType: 'success',
                icon: 'check',
              };
              setLogs((prev) => [logItem, ...prev]);
            }
          }}
          onShowToast={(msg) => setToastMessage(msg)}
        />
      )}

      {/* Success Toast Notification */}
      {toastMessage && (
        <div
          id="toast-guardrails-saved"
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#201f20] border border-[#ffd7a9]/40 text-[#F8F9FA] shadow-2xl text-xs font-mono animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="w-5 h-5 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center border border-[#22C55E]/40 shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-[#ffd7a9]">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#A1A1AA] hover:text-[#F8F9FA] p-0.5 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
