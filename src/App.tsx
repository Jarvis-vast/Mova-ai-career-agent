/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
import { initialCandidateProfile } from './data/mockData';
import { api } from './services/api';
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

  // Core Data State - Initialized from persistent backend API
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(initialCandidateProfile);
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [logs, setLogs] = useState<MissionLogItem[]>([]);
  const [followUp, setFollowUp] = useState<FollowUpItem | null>(null);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyRadarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemMode, setSystemMode] = useState<'DEMO' | 'PRODUCTION'>('DEMO');

  // Modal States
  const [selectedDecisionJob, setSelectedDecisionJob] = useState<JobOpportunity | null>(null);
  const [selectedEvidenceApp, setSelectedEvidenceApp] = useState<ApplicationRecord | null>(null);
  const [evidenceMode, setEvidenceMode] = useState<'evidence' | 'payload'>('evidence');
  const [selectedResumeJob, setSelectedResumeJob] = useState<JobOpportunity | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch all domain data from persistent backend
  const refreshAllData = useCallback(async () => {
    try {
      const [
        cand,
        jobList,
        appList,
        intList,
        compList,
        agentActivity,
        agentState,
      ] = await Promise.all([
        api.getCandidate().catch(() => initialCandidateProfile),
        api.getJobs().catch(() => []),
        api.getApplications().catch(() => []),
        api.getInterviews().catch(() => []),
        api.getCompanies().catch(() => []),
        api.getAgentActivity().catch(() => ({ tasks: [], runs: [], logs: [] })),
        api.getAgentState().catch(() => ({ status: 'ACTIVE', cadenceMinutes: 30, cycleCount: 1 })),
      ]);

      setCandidateProfile(cand);
      setJobs(jobList);
      setApplications(appList);
      setInterviews(intList);
      setCompanies(compList);
      setLogs(agentActivity.logs || []);
      setIsAgentActive(agentState.status === 'ACTIVE');
      setCycleCadenceMinutes(agentState.cadenceMinutes || 30);
      setCycleNumber(agentState.cycleCount || 1);
    } catch (err) {
      console.error('Data hydration error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    api.getSystemMode().then((res) => {
      setSystemMode(res.mode);
    }).catch(() => {});
  }, [refreshAllData]);

  const handleToggleSystemMode = async () => {
    const nextMode = systemMode === 'DEMO' ? 'PRODUCTION' : 'DEMO';
    try {
      const res = await api.setSystemMode(nextMode);
      setSystemMode(res.mode);
      setToastMessage(`Switched to ${res.label}`);
      await refreshAllData();
    } catch (err: any) {
      setToastMessage(`Failed to switch mode: ${err.message}`);
    }
  };

  const handleDiscoverJobs = async () => {
    try {
      setToastMessage('Polling real active job sources...');
      const res = await api.discoverJobs();
      await refreshAllData();
      setToastMessage(`Discovery complete: ${res.discoveredCount} jobs found, ${res.qualifiedMatches} qualified.`);
    } catch (err: any) {
      setToastMessage(`Job discovery error: ${err.message}`);
    }
  };

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

  // Action: Trigger real 10-step immediate autonomous cycle
  const handleTriggerCycle = async () => {
    try {
      setToastMessage('Running 10-step autonomous career agent cycle...');
      const res = await api.runAutonomousCycle();
      const newCycleNum = cycleNumber + 1;
      setCycleNumber(newCycleNum);
      setCycleMinutesRemaining(cycleCadenceMinutes);

      // Refresh data
      await refreshAllData();
      setToastMessage(res.summary || `Cycle #${newCycleNum} executed`);
    } catch (err: any) {
      setToastMessage(`Cycle execution failed: ${err.message}`);
    }
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

  // Action: Add a new discovered job with real backend ingestion & evaluation
  const handleAddJob = async (job: JobOpportunity) => {
    try {
      const created = await api.createJob({
        title: job.title,
        company: job.company,
        location: job.location,
        workMode: job.workMode,
        salary: job.salary,
        description: job.description,
        requiredSkills: job.requiredSkills,
      });
      setJobs((prev) => [created, ...prev]);

      const newLog: MissionLogItem = {
        id: `log-${Date.now()}`,
        agentName: 'Research Agent',
        time: 'Just now',
        headline: `Opportunity Logged: ${created.title} at ${created.company}`,
        subDetail: `Evaluated fit score: ${created.fitScore}/100 · ${
          created.hardConstraintsPassed ? 'Hard constraints satisfied' : 'Flagged for candidate policy review'
        }`,
        badgeText: 'LOGGED',
        badgeType: created.hardConstraintsPassed ? 'success' : 'warning',
        icon: 'sparkles',
      };
      setLogs((prev) => [newLog, ...prev]);
      setToastMessage(`Ingested ${created.title} into pipeline`);
    } catch (err: any) {
      setToastMessage(`Failed to add job: ${err.message}`);
    }
  };

  // Action: Advance job to submitted application (No fake verification)
  const handleAdvanceJob = async (job: JobOpportunity) => {
    try {
      const newApp = await api.createApplication({
        jobId: job.id,
        adapter: 'Direct ATS Integration',
      });

      setApplications((prev) => [newApp, ...prev]);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: 'PREPARING' } : j))
      );

      const logItem: MissionLogItem = {
        id: `log-${Date.now()}`,
        agentName: 'Verification Agent',
        time: 'Just now',
        headline: `Application Created in Ready State: ${job.title} at ${job.company}`,
        subDetail: 'Submission package prepared · Requires execution & verifiable confirmation receipt',
        badgeText: 'READY',
        badgeType: 'info',
        icon: 'shield',
      };
      setLogs((prev) => [logItem, ...prev]);
      setToastMessage(`Application initialized in Ready state for ${job.company}`);
    } catch (err: any) {
      setToastMessage(`Cannot advance job: ${err.message}`);
    }
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

  // Action: Update candidate rules and persist to backend
  const handleUpdateRules = async (newRules: CandidateProfile['rules']) => {
    try {
      await api.updateRules(newRules);
      setCandidateProfile((prev) => ({ ...prev, rules: newRules }));

      // Refresh jobs as server re-evaluated them against new rules
      const updatedJobs = await api.getJobs();
      setJobs(updatedJobs);

      const logItem: MissionLogItem = {
        id: `log-${Date.now()}`,
        agentName: 'Match Agent',
        time: 'Just now',
        headline: 'Candidate Guardrails Updated: Recalibrated policy constraints',
        subDetail: `Salary floor: ${newRules.salaryFloor || 'None'} · Location constraint: ${newRules.locationConstraint || 'None'}`,
        badgeText: 'RULES SYNCED',
        badgeType: 'success',
        icon: 'sliders',
      };
      setLogs((prev) => [logItem, ...prev]);
      setToastMessage('Guardrails saved & pipeline re-evaluated');
    } catch (err: any) {
      setToastMessage(`Failed to save rules: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] flex font-['Inter',sans-serif]">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          setCurrentPath(path);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAgentActive={isAgentActive}
        cycleCadenceMinutes={cycleCadenceMinutes}
        jobsCount={jobs.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-[240px] flex flex-col min-w-0 bg-[#131314]">
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
          systemMode={systemMode}
          onToggleSystemMode={handleToggleSystemMode}
        />

        <main className="flex-1 overflow-x-hidden">
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
              onInspectLog={(_log) => setSelectedDecisionJob(jobs[0] || null)}
              candidateProfile={candidateProfile}
              jobs={jobs}
              applications={applications}
              followUp={followUp}
              interviews={interviews}
            />
          )}

          {currentPath === 'jobs' && (
            <JobsView
              jobs={jobs}
              candidateProfile={candidateProfile}
              onOpenDecision={(job) => setSelectedDecisionJob(job)}
              onOpenPackage={(job) => setSelectedResumeJob(job)}
              onOpenRules={() => setIsRulesModalOpen(true)}
              onTriggerCycle={handleTriggerCycle}
              cycleNumber={cycleNumber}
              onAddJob={handleAddJob}
              onAdvanceJob={handleAdvanceJob}
              systemMode={systemMode}
              onDiscoverJobs={handleDiscoverJobs}
            />
          )}

          {currentPath === 'applications' && (
            <ApplicationsView
              applications={applications}
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
              onAddInterview={async (newInt) => {
                try {
                  const created = await api.createInterview(newInt);
                  setInterviews((prev) => [created, ...prev]);
                  setToastMessage(`Interview logged for ${created.company}`);
                } catch (err: any) {
                  setToastMessage(`Failed to log interview: ${err.message}`);
                }
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
      <Analytics />
    </div>
  );
}
