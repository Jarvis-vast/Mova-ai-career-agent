export interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  url?: string;
  description: string;
  salary?: string;
  source: string;
  isDemo: boolean;
  postedAt: string;
  employmentType: string;
  skills: string[];
  sourceVerified: boolean;
  retrievedAt: string;
}

export interface JobSource {
  id: string;
  name: string;
  type: 'DEMO' | 'PUBLIC_API' | 'AUTHORIZED_FEED';
  enabled: boolean;
  isDemo: boolean;
  fetchJobs(): Promise<NormalizedJob[]>;
  normalizeJob(rawJob: any): NormalizedJob;
  deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[];
}

/**
 * Generates canonical key for deduplication across job boards
 */
export function generateCanonicalKey(company: string, title: string, location: string = ''): string {
  const cleanComp = (company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLoc = (location || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanComp}:${cleanTitle}:${cleanLoc.slice(0, 10)}`;
}

/**
 * 1. Demo Job Source: Synthetic benchmark roles explicitly labeled
 */
export class DemoJobSource implements JobSource {
  id = 'source-demo-synthetic';
  name = 'Demo Job Source';
  type: 'DEMO' = 'DEMO';
  enabled = true;
  isDemo = true;

  async fetchJobs(): Promise<NormalizedJob[]> {
    const rawDemoRoles = [
      {
        id: 'demo-job-1',
        title: 'Lead Operations & Dispatch Manager',
        company: 'Nexus Logistics Global',
        location: 'Mumbai, Maharashtra, India',
        remote: false,
        workMode: 'Hybrid',
        salary: '$140,000 - $160,000 / yr',
        url: 'https://example.com/careers/nexus-logistics-lead-ops',
        description:
          'Seeking an Operations Lead in Mumbai to oversee SLA monitoring, dispatch automation, and MIS analytics across multi-region logistics operations. Proficiency in Python automation, Google Apps Script, and incident command required.',
        postedAt: '2026-09-10T10:00:00Z',
        employmentType: 'Full-time',
        skills: ['Logistics Operations', 'SLA Monitoring', 'MIS Reporting', 'Incident Dispatch', 'Python', 'Process Automation'],
      },
      {
        id: 'demo-job-2',
        title: 'Senior Systems Automation Specialist',
        company: 'CloudRail Systems',
        location: 'Remote (Global)',
        remote: true,
        workMode: 'Remote',
        salary: '$135,000 - $155,000 / yr',
        url: 'https://example.com/careers/cloudrail-automation-specialist',
        description:
          'Fully remote role designing automated workflows, dashboard telemetry, and prompt-engineered operational bots. Candidate must possess verified expertise in process automation, SQL reporting, and SLA monitoring.',
        postedAt: '2026-09-12T14:30:00Z',
        employmentType: 'Full-time',
        skills: ['Process Automation', 'Prompt Engineering', 'SQL', 'SLA Monitoring', 'Python'],
      },
      {
        id: 'demo-job-3',
        title: 'Field Operations Supervisor (Relocation Mandatory)',
        company: 'Arctic Offshore Freight',
        location: 'Bengaluru, Karnataka, India (Relocation Required)',
        remote: false,
        workMode: 'On-site',
        salary: '$95,000 / yr',
        url: 'https://example.com/careers/arctic-field-sup',
        description:
          'On-site field logistics supervisor position in Bengaluru. Candidate relocation to Bengaluru is mandatory. Manages depot dispatch and warehouse staff.',
        postedAt: '2026-09-13T08:00:00Z',
        employmentType: 'Full-time',
        skills: ['Logistics Operations', 'Warehouse Management', 'Inventory Control'],
      },
      {
        id: 'demo-job-4',
        title: 'Principal Distributed Infrastructure Architect',
        company: 'HyperScale Networks',
        location: 'Remote',
        remote: true,
        workMode: 'Remote',
        salary: '$220,000 / yr',
        url: 'https://example.com/careers/hyperscale-infra',
        description:
          'Requires 10+ years architecting multi-region Kubernetes clusters, eBPF network telemetry, Rust kernel modules, and hardware acceleration.',
        postedAt: '2026-09-11T12:00:00Z',
        employmentType: 'Full-time',
        skills: ['Kubernetes', 'Rust', 'eBPF', 'Distributed Systems', 'AWS'],
      },
    ];

    const normalized = rawDemoRoles.map((r) => this.normalizeJob(r));
    return this.deduplicateJobs(normalized);
  }

  normalizeJob(rawJob: any): NormalizedJob {
    return {
      id: rawJob.id,
      title: rawJob.title,
      company: rawJob.company,
      location: rawJob.location,
      remote: Boolean(rawJob.remote || rawJob.location?.toLowerCase().includes('remote')),
      workMode: rawJob.workMode || (rawJob.remote ? 'Remote' : 'Hybrid'),
      url: rawJob.url,
      description: rawJob.description || '',
      salary: rawJob.salary || 'Undisclosed',
      source: 'Demo Job Source',
      isDemo: true,
      postedAt: rawJob.postedAt || new Date().toISOString(),
      employmentType: rawJob.employmentType || 'Full-time',
      skills: Array.isArray(rawJob.skills) ? rawJob.skills : [],
      sourceVerified: false,
      retrievedAt: new Date().toISOString(),
    };
  }

  deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
    const seen = new Set<string>();
    return jobs.filter((j) => {
      const key = generateCanonicalKey(j.company, j.title, j.location);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

/**
 * 2. Real Public Feed Job Source:
 * Fetches real tech & operations roles from Remotive's official public API.
 * Uses permitted open REST endpoints with timeouts, no scraping, no CAPTCHA bypass.
 */
export class PublicFeedJobSource implements JobSource {
  id = 'source-remotive-public';
  name = 'Remotive Public Feed';
  type: 'PUBLIC_API' = 'PUBLIC_API';
  enabled = true;
  isDemo = false;

  async fetchJobs(): Promise<NormalizedJob[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Official free public API for remote jobs
      const res = await fetch('https://remotive.com/api/remote-jobs?limit=15', {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MOVA-Career-Agent/2.0 (Public Research Feed)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Public feed returned status ${res.status}`);
      }

      const data = (await res.json()) as { jobs?: any[] };
      const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];

      const normalized = rawJobs.map((r) => this.normalizeJob(r));
      return this.deduplicateJobs(normalized);
    } catch (err: unknown) {
      console.warn('PublicFeedJobSource query failed, providing empty or cached fallback:', err);
      return [];
    }
  }

  normalizeJob(raw: any): NormalizedJob {
    // Strip HTML tags from description if present
    const cleanDesc = (raw.description || '')
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const tags = Array.isArray(raw.tags) ? raw.tags : [];

    return {
      id: `remotive-${raw.id || Math.random().toString(36).slice(2, 9)}`,
      title: raw.title || 'Untitled Role',
      company: raw.company_name || 'Organization',
      location: raw.candidate_required_location || 'Remote',
      remote: true,
      workMode: 'Remote',
      url: raw.url || undefined,
      description: cleanDesc.slice(0, 1200),
      salary: raw.salary && raw.salary.trim().length > 0 ? raw.salary : 'Undisclosed',
      source: 'Remotive Public Feed',
      isDemo: false,
      postedAt: raw.publication_date || new Date().toISOString(),
      employmentType: raw.job_type || 'Full-time',
      skills: tags.slice(0, 8),
      sourceVerified: true,
      retrievedAt: new Date().toISOString(),
    };
  }

  deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
    const seen = new Set<string>();
    return jobs.filter((j) => {
      const key = generateCanonicalKey(j.company, j.title, j.location);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

/**
 * JobSourceManager orchestrating registered job sources
 */
export class JobSourceManager {
  private sources: JobSource[] = [];

  constructor() {
    this.registerSource(new DemoJobSource());
    this.registerSource(new PublicFeedJobSource());
  }

  registerSource(source: JobSource) {
    this.sources.push(source);
  }

  getSources(): Array<{ id: string; name: string; type: string; enabled: boolean; isDemo: boolean }> {
    return this.sources.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      enabled: s.enabled,
      isDemo: s.isDemo,
    }));
  }

  async discoverJobs(mode: 'DEMO' | 'PRODUCTION' = 'DEMO'): Promise<{ jobs: NormalizedJob[]; sourcesPolled: string[] }> {
    const activeSources = this.sources.filter((s) => {
      if (!s.enabled) return false;
      if (mode === 'PRODUCTION') {
        // Production mode rejects demo sources
        return !s.isDemo;
      }
      // Demo mode includes demo sources and may optionally test public feeds
      return true;
    });

    const sourcesPolled: string[] = [];
    let combined: NormalizedJob[] = [];

    for (const source of activeSources) {
      try {
        sourcesPolled.push(source.name);
        const fetched = await source.fetchJobs();
        combined.push(...fetched);
      } catch (e) {
        console.error(`Error polling job source ${source.name}:`, e);
      }
    }

    // Overall deduplication
    const seen = new Set<string>();
    const deduplicated = combined.filter((j) => {
      const key = generateCanonicalKey(j.company, j.title, j.location);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      jobs: deduplicated,
      sourcesPolled,
    };
  }
}

export const jobSourceManager = new JobSourceManager();
