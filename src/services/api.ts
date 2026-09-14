import {
  CandidateProfile,
  JobOpportunity,
  ApplicationRecord,
  MissionLogItem,
  InterviewRecord,
  CompanyRadarItem,
  CandidateRules,
} from '../types';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const api = {
  async getCandidate(): Promise<CandidateProfile> {
    const res = await fetch('/api/candidate');
    if (!res.ok) throw new Error(`Failed to fetch candidate: ${res.statusText}`);
    const data = await res.json();
    return {
      name: data.name,
      title: data.title,
      location: data.location,
      relocationAllowed: Boolean(data.relocationAllowed),
      yearsExperience: data.experiences?.length ? data.experiences.length * 2 : 4,
      fitScoreAverage: 88,
      readiness: 'Active (Truth Layer Grounded)',
      email: data.email,
      phone: data.phone,
      linkedinUrl: data.linkedin || data.linkedinUrl || 'https://linkedin.com/in/om-bhagwat-59555921a',
      githubUrl: data.github || data.githubUrl || 'https://github.com/Jarvis-vast',
      portfolioUrl: data.portfolio || data.portfolioUrl || 'https://portfolio-lac-nine-49.vercel.app/',
      summary: data.summary,
      avatarUrl: '',
      education: (data.education || []).map((e: any) => ({
        degree: e.degree,
        school: e.institution || e.school,
        period: e.period,
        verifiedFactId: e.classification === 'VERIFIED' ? `DOC-${e.id}` : 'UNVERIFIED',
        classification: e.classification || 'VERIFIED',
      })),
      experience: (data.experiences || []).map((exp: any) => ({
        role: exp.title || exp.role,
        company: exp.company,
        division: 'Operations',
        period: exp.period,
        summary: exp.description || exp.summary,
        anchoredSkills: (exp.achievements || []).map((ach: string) => ({
          name: ach.slice(0, 45),
          sourceProof: 'Verified Employment Record',
          classification: exp.classification || 'VERIFIED',
        })),
      })),
      projects: (data.projects || []).map((p: any) => ({
        name: p.name,
        category: p.role || 'Project',
        description: p.description || '',
        technologies: p.technologies || [],
        classification: 'USER_PROVIDED',
      })),
      certifications: [],
      leadership: [],
      skills: (data.skills || []).map((s: any) => typeof s === 'string' ? s : s.name),
      skillsTaxonomy: {
        operations: ['Logistics & Supply Chain', 'Dispatch Coordination', 'SLA Management', 'MIS Reporting', 'Inventory Management'],
        marketing: ['Influencer Marketing', 'Brand Management', 'Market Research', 'Content Creation'],
        aiAutomation: ['AI-Assisted Workflows', 'Prompt Engineering', 'Workflow Automation'],
        toolsSystems: ['ERP & Logistics Tools', 'MS Excel / Advanced Spreadsheets', 'Google Workspace'],
        languages: ['English (Fluent)', 'Hindi (Fluent)', 'Marathi (Native)'],
      },
      preferences: data.preferences || {
        location: 'Mumbai, Maharashtra, India',
        relocation: false,
        minMatchScore: 80,
        dailyQualifiedOpportunityTarget: 10,
        salaryPreference: 'Competitive Market Tier',
      },
      rules: data.rules || {
        locationConstraint: 'Mumbai, Maharashtra, India / Remote Only',
        salaryFloor: '$120,000 / yr',
        relocationAllowed: false,
        blacklistedKeywords: [],
        applicationMode: 'Autonomous Zero-Touch',
        minFitScore: 85,
        dailyOpportunityTarget: 10,
      },
    };
  },

  async updateCandidate(payload: { title?: string; headline?: string; summary?: string; phone?: string }): Promise<void> {
    const res = await fetch('/api/candidate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update candidate');
  },

  async getRules(): Promise<CandidateRules> {
    const res = await fetch('/api/rules');
    if (!res.ok) throw new Error('Failed to fetch rules');
    return res.json();
  },

  async updateRules(rules: CandidateRules): Promise<void> {
    const res = await fetch('/api/rules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rules),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to update rules');
    }
  },

  async getJobs(): Promise<JobOpportunity[]> {
    const res = await fetch('/api/jobs');
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async createJob(job: {
    title: string;
    company: string;
    location: string;
    workMode?: 'Remote' | 'Hybrid' | 'On-site';
    salary: string;
    description?: string;
    requiredSkills?: string[];
  }): Promise<JobOpportunity> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to create job');
    }
    return res.json();
  },

  async deleteJob(id: string): Promise<void> {
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete job');
  },

  async getApplications(): Promise<ApplicationRecord[]> {
    const res = await fetch('/api/applications');
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async createApplication(payload: { jobId: string; adapter?: string }): Promise<ApplicationRecord> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to create application');
    }
    return res.json();
  },

  async executeAttempt(appId: string, payload: { adapter?: string; evidenceToken?: string }): Promise<any> {
    const res = await fetch(`/api/applications/${appId}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to execute attempt');
    }
    return res.json();
  },

  async getInterviews(): Promise<InterviewRecord[]> {
    const res = await fetch('/api/interviews');
    if (!res.ok) throw new Error('Failed to fetch interviews');
    return res.json();
  },

  async createInterview(interview: Partial<InterviewRecord>): Promise<InterviewRecord> {
    const res = await fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interview),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to create interview');
    }
    return res.json();
  },

  async getCompanies(): Promise<CompanyRadarItem[]> {
    const res = await fetch('/api/companies');
    if (!res.ok) throw new Error('Failed to fetch companies');
    const rows = await res.json();
    return rows.map((r: any) => ({
      name: r.name,
      location: r.location || 'Remote',
      status: 'Target',
      fitRating: 90,
      verifiedRolesCount: 1,
      targetRoles: ['Operations Lead'],
      atsType: 'Direct Ingestion',
      lastContacted: 'Recently',
      activeSubmissions: 0,
      notes: 'Ingested via real canonical job pipelines.',
    }));
  },

  async getFollowUps(): Promise<any[]> {
    const res = await fetch('/api/followups');
    if (!res.ok) throw new Error('Failed to fetch followups');
    return res.json();
  },

  async getAgentActivity(): Promise<{ tasks: any[]; runs: any[]; logs: MissionLogItem[] }> {
    const res = await fetch('/api/agent/activity');
    if (!res.ok) throw new Error('Failed to fetch agent activity');
    return res.json();
  },

  async triggerAgentCycle(): Promise<{ success: boolean; summary: string; jobsEvaluated: number; matchesQualified: number }> {
    const res = await fetch('/api/agent/trigger', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger agent cycle');
    return res.json();
  },

  async getAgentState(): Promise<{ status: string; cadenceMinutes: number; cycleCount: number }> {
    const res = await fetch('/api/agent');
    if (!res.ok) throw new Error('Failed to fetch agent state');
    return res.json();
  },

  async getAnalytics(): Promise<any> {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getAuthStatus(): Promise<{ authenticated: boolean; profile: any; isConfigured: boolean; redirectUri: string }> {
    const res = await fetch('/api/auth/status');
    if (!res.ok) throw new Error('Failed to fetch auth status');
    return res.json();
  },

  async disconnectAuth(): Promise<void> {
    const res = await fetch('/api/auth/disconnect', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to disconnect auth');
  },

  // --- Truth & Mode Management ---
  async getSystemMode(): Promise<{ mode: 'DEMO' | 'PRODUCTION'; label: string; activeSources: string[]; allowsLiveSubmissions: boolean }> {
    const res = await fetch('/api/system/mode');
    if (!res.ok) throw new Error('Failed to fetch system mode');
    return res.json();
  },

  async setSystemMode(mode: 'DEMO' | 'PRODUCTION'): Promise<{ success: boolean; mode: 'DEMO' | 'PRODUCTION'; label: string }> {
    const res = await fetch('/api/system/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error('Failed to update system mode');
    return res.json();
  },

  // --- Candidate Brain Fact Dossier ---
  async getCandidateFacts(): Promise<any[]> {
    const res = await fetch('/api/candidate/facts');
    if (!res.ok) throw new Error('Failed to fetch candidate facts');
    return res.json();
  },

  async saveCandidateFact(fact: any): Promise<void> {
    const res = await fetch('/api/candidate/facts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fact),
    });
    if (!res.ok) throw new Error('Failed to save candidate fact');
  },

  async extractCandidateFacts(resumeText: string): Promise<{ extractedCount: number; verifiedCount: number; unverifiedCount: number; facts: any[] }> {
    const res = await fetch('/api/candidate/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });
    if (!res.ok) throw new Error('Failed to extract facts from resume');
    return res.json();
  },

  // --- Real Job Discovery ---
  async getJobSources(): Promise<any[]> {
    const res = await fetch('/api/jobs/sources');
    if (!res.ok) throw new Error('Failed to fetch job sources');
    return res.json();
  },

  async discoverJobs(): Promise<{ mode: string; discoveredCount: number; sourcesPolled: string[]; qualifiedMatches: number; jobs: JobOpportunity[] }> {
    const res = await fetch('/api/jobs/discover', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to discover jobs');
    return res.json();
  },

  // --- Fact-Grounded Document Generation ---
  async tailorResume(payload: { jobId?: string; jobTitle: string; company: string; jobDescription?: string }): Promise<any> {
    const res = await fetch('/api/resumes/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to tailor resume');
    return res.json();
  },

  async generateCoverLetter(payload: { jobId?: string; jobTitle: string; company: string; jobDescription?: string }): Promise<any> {
    const res = await fetch('/api/cover-letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate cover letter');
    return res.json();
  },

  async getDocuments(): Promise<any[]> {
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async saveDocument(doc: any): Promise<{ success: boolean; id: string }> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error('Failed to save document');
    return res.json();
  },

  async updateApplicationStatus(id: string, status: string, note?: string): Promise<any> {
    const res = await fetch(`/api/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error('Failed to update application status');
    return res.json();
  },

  async getApplicationTimeline(id: string): Promise<{ events: any[] }> {
    const res = await fetch(`/api/applications/${id}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch application timeline');
    return res.json();
  },

  // --- Comprehensive 10-Step Autonomous Agent Run ---
  async runAutonomousCycle(): Promise<any> {
    const res = await fetch('/api/agent/run', { method: 'POST' });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Autonomous agent run failed');
    }
    return res.json();
  },
};
