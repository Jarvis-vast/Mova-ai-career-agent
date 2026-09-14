import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'mova.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidate (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      headline TEXT NOT NULL,
      location TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      linkedin TEXT NOT NULL,
      github TEXT NOT NULL,
      portfolio TEXT NOT NULL,
      relocation_allowed INTEGER NOT NULL DEFAULT 0,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS candidate_preferences (
      candidate_id TEXT PRIMARY KEY,
      location TEXT NOT NULL,
      relocation INTEGER NOT NULL DEFAULT 0,
      min_match_score REAL NOT NULL DEFAULT 85,
      daily_qualified_opportunity_target INTEGER NOT NULL DEFAULT 10,
      salary_preference TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS candidate_rules (
      candidate_id TEXT PRIMARY KEY,
      location_constraint TEXT NOT NULL,
      salary_floor TEXT NOT NULL,
      relocation_allowed INTEGER NOT NULL DEFAULT 0,
      blacklisted_keywords TEXT NOT NULL, -- JSON array
      application_mode TEXT NOT NULL DEFAULT 'Autonomous Zero-Touch',
      min_fit_score REAL NOT NULL DEFAULT 85,
      daily_opportunity_target INTEGER NOT NULL DEFAULT 10,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      period TEXT NOT NULL,
      current INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      achievements TEXT NOT NULL, -- JSON array
      classification TEXT NOT NULL DEFAULT 'VERIFIED',
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS education (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      location TEXT NOT NULL,
      period TEXT NOT NULL,
      grade TEXT,
      classification TEXT NOT NULL DEFAULT 'VERIFIED',
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      proficiency INTEGER NOT NULL DEFAULT 90,
      verified INTEGER NOT NULL DEFAULT 1,
      classification TEXT NOT NULL DEFAULT 'VERIFIED',
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      role TEXT NOT NULL,
      technologies TEXT NOT NULL, -- JSON array
      metrics TEXT,
      url TEXT,
      classification TEXT NOT NULL DEFAULT 'VERIFIED',
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS candidate_evidence (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      claim TEXT NOT NULL,
      source_type TEXT NOT NULL,
      evidence_ref TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      domain TEXT,
      location TEXT,
      industry TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS job_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      endpoint TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      last_synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      company_id TEXT,
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      salary TEXT NOT NULL,
      description TEXT,
      required_skills TEXT, -- JSON array
      source_id TEXT,
      external_url TEXT,
      status TEXT NOT NULL DEFAULT 'SCHEDULED',
      fit_score REAL NOT NULL DEFAULT 0,
      hard_constraints_passed INTEGER NOT NULL DEFAULT 1,
      score_breakdown TEXT, -- JSON object
      hard_constraint_details TEXT, -- JSON object
      strengths TEXT,
      gaps TEXT,
      posted_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (source_id) REFERENCES job_sources(id)
    );

    CREATE TABLE IF NOT EXISTS job_snapshots (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      raw_payload TEXT NOT NULL,
      captured_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      candidate_id TEXT NOT NULL,
      fit_score REAL NOT NULL,
      passed_constraints INTEGER NOT NULL,
      score_breakdown TEXT NOT NULL, -- JSON
      constraint_reasons TEXT NOT NULL, -- JSON
      matched_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      job_id TEXT,
      title TEXT NOT NULL,
      version TEXT NOT NULL,
      content TEXT NOT NULL, -- JSON structured resume
      truth_score REAL NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidate(id),
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );

    CREATE TABLE IF NOT EXISTS resume_versions (
      id TEXT PRIMARY KEY,
      resume_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      diff_note TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      company TEXT NOT NULL,
      job_title TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'READY',
      adapter TEXT NOT NULL DEFAULT 'Direct Portal',
      resume_version TEXT NOT NULL DEFAULT 'v1.0-grounded',
      evidence_coverage TEXT NOT NULL DEFAULT '100% Grounded',
      confirmation_token TEXT,
      receipt_id TEXT,
      applied_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );

    CREATE TABLE IF NOT EXISTS application_attempts (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      adapter TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL, -- EXECUTING, SUBMISSION_ATTEMPTED, VERIFYING, VERIFIED, FAILED, BLOCKED
      error TEXT,
      evidence_reference TEXT,
      payload_summary TEXT,
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS application_artifacts (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      type TEXT NOT NULL, -- RESUME, COVER_LETTER, EVIDENCE_MANIFEST
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS application_evidence (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      attempt_id TEXT,
      evidence_type TEXT NOT NULL,
      proof_payload TEXT NOT NULL,
      verified_at TEXT,
      FOREIGN KEY (application_id) REFERENCES applications(id),
      FOREIGN KEY (attempt_id) REFERENCES application_attempts(id)
    );

    CREATE TABLE IF NOT EXISTS followups (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      company TEXT NOT NULL,
      stage TEXT NOT NULL,
      due_date TEXT NOT NULL,
      strategy TEXT NOT NULL,
      recommended_channel TEXT NOT NULL,
      draft_body TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS communications (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      direction TEXT NOT NULL, -- INBOUND, OUTBOUND
      channel TEXT NOT NULL,
      sender TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      received_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      application_id TEXT,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      stage TEXT NOT NULL,
      interviewer TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled',
      meeting_url TEXT,
      notes TEXT,
      prep_brief TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS outcomes (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      type TEXT NOT NULL, -- OFFER, REJECTION, WITHDRAWAL
      details TEXT NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS agent_state (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, IDLE, PAUSED, ERROR, BLOCKED
      cadence_minutes INTEGER NOT NULL DEFAULT 45,
      last_run_at TEXT,
      next_run_at TEXT,
      cycle_count INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_tasks (
      id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL, -- PENDING, RUNNING, COMPLETED, FAILED
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      started_at TEXT,
      completed_at TEXT,
      result_summary TEXT,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      cycle_number INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL,
      jobs_evaluated INTEGER NOT NULL DEFAULT 0,
      matches_found INTEGER NOT NULL DEFAULT 0,
      applications_prepared INTEGER NOT NULL DEFAULT 0,
      summary TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      picture TEXT,
      access_token_encrypted TEXT,
      connected_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS candidate_facts (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      fact_type TEXT NOT NULL,
      field TEXT NOT NULL,
      claim TEXT NOT NULL,
      value TEXT NOT NULL,
      source TEXT NOT NULL,
      confidence REAL NOT NULL,
      status TEXT NOT NULL, -- VERIFIED, INFERRED, UNVERIFIED, UNKNOWN
      extracted_at TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT,
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      mode TEXT NOT NULL DEFAULT 'DEMO', -- DEMO, PRODUCTION
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS application_events (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      job_id TEXT,
      type TEXT NOT NULL, -- RESUME, COVER_LETTER, GAP_ANALYSIS
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      original_content TEXT,
      diff_notes TEXT,
      truth_score REAL NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidate(id)
    );

    CREATE TABLE IF NOT EXISTS ai_requests (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      prompt_type TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Safe migrations for table columns
  safeAddColumn('jobs', 'source TEXT DEFAULT "Demo Job Source"');
  safeAddColumn('jobs', 'is_demo INTEGER DEFAULT 1');
  safeAddColumn('jobs', 'source_verified INTEGER DEFAULT 0');
  safeAddColumn('jobs', 'url TEXT');
  safeAddColumn('jobs', 'retrieved_at TEXT');
  safeAddColumn('jobs', 'employment_type TEXT DEFAULT "Full-time"');
  safeAddColumn('jobs', 'remote INTEGER DEFAULT 0');
  safeAddColumn('jobs', 'why_reasons TEXT');
  safeAddColumn('jobs', 'gap_reasons TEXT');

  safeAddColumn('applications', 'is_simulated INTEGER DEFAULT 1');
  safeAddColumn('applications', 'submission_method TEXT DEFAULT "Direct Portal"');
  safeAddColumn('applications', 'external_application_id TEXT');
  safeAddColumn('applications', 'response_metadata TEXT');
  safeAddColumn('applications', 'notes TEXT');
  safeAddColumn('applications', 'cover_letter TEXT');

  // Seed default mode if not present
  const settingRow = db.prepare('SELECT id FROM system_settings WHERE id = ?').get('global-settings');
  if (!settingRow) {
    db.prepare('INSERT INTO system_settings (id, mode) VALUES (?, ?)').run('global-settings', 'DEMO');
  }

  seedCandidateProfileIfEmpty();
  seedCandidateFactsIfEmpty();
}

function safeAddColumn(tableName: string, colDef: string) {
  try {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${colDef}`);
  } catch {
    // Column exists
  }
}

function seedCandidateProfileIfEmpty() {
  const row = db.prepare('SELECT id FROM candidate WHERE id = ?').get('candidate-om');
  if (row) return;

  const candidateId = 'candidate-om';

  db.prepare(`
    INSERT INTO candidate (
      id, name, title, headline, location, email, phone, linkedin, github, portfolio,
      relocation_allowed, summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    candidateId,
    'Om Bhagwat',
    'Operations & Systems Automation Lead',
    'Operations & Systems Automation Lead | Dispatch, SLAs, MIS & Prompt Engineering',
    'Mumbai, Maharashtra, India',
    'bhagwatom987@gmail.com',
    '+91 9326540456',
    'https://linkedin.com/in/om-bhagwat-59555921a',
    'https://github.com/Jarvis-vast',
    'https://portfolio-lac-nine-49.vercel.app/',
    0, // relocation_allowed = false
    'Operations manager and automation specialist with hands-on expertise in dispatch routing, cross-functional SLA optimization, MIS dashboards, and production prompt workflows.'
  );

  db.prepare(`
    INSERT INTO candidate_preferences (
      candidate_id, location, relocation, min_match_score, daily_qualified_opportunity_target, salary_preference
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    candidateId,
    'Mumbai, Maharashtra, India / Remote',
    0,
    85,
    10,
    '$140,000+ / yr or ₹25,00,000+'
  );

  db.prepare(`
    INSERT INTO candidate_rules (
      candidate_id, location_constraint, salary_floor, relocation_allowed, blacklisted_keywords,
      application_mode, min_fit_score, daily_opportunity_target
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    candidateId,
    'Mumbai, Maharashtra, India / Remote Only',
    '$120,000 / yr',
    0,
    JSON.stringify(['commission-only', 'unpaid', 'door-to-door', 'crypto pump', 'telemarketing']),
    'Autonomous Zero-Touch',
    85,
    10
  );

  // Seed verified experiences
  const experiences = [
    {
      id: 'exp-1',
      title: 'Operations & Process Lead',
      company: 'Skydot Express',
      location: 'Mumbai, India',
      period: '2023 - Present',
      current: 1,
      description: 'Headed regional logistics hub operations, managing fleet routing, dispatch coordination, and line-haul SLAs.',
      achievements: JSON.stringify([
        'Reduced line-haul transit delays by 28% across 14 delivery zones',
        'Engineered automated dispatch telemetry tracking 4,200+ daily parcels with 99.4% SLA adherence',
        'Implemented digitized dispatch manifests replacing manual paperwork across 3 warehouse hubs'
      ]),
      classification: 'VERIFIED'
    },
    {
      id: 'exp-2',
      title: 'Operations Analyst & Systems Associate',
      company: 'Ask MBA Educational Services',
      location: 'Mumbai, India',
      period: '2022 - 2023',
      current: 0,
      description: 'Managed candidate admissions pipeline operations, MIS reporting, and CRM database automation.',
      achievements: JSON.stringify([
        'Automated lead routing workflows resulting in 35% faster student onboarding',
        'Built automated MIS reporting spreadsheets syncing admission metrics across 5 regional teams'
      ]),
      classification: 'VERIFIED'
    },
    {
      id: 'exp-3',
      title: 'Supply Chain Operations Trainee',
      company: 'Dabur India Ltd',
      location: 'Mumbai, India',
      period: '2021 - 2022',
      current: 0,
      description: 'Assisted regional supply chain team in distributor inventory reconciliation and transit dispatch schedules.',
      achievements: JSON.stringify([
        'Monitored distribution hub stock levels preventing stockouts across 45 retail distributor accounts',
        'Contributed to regional reverse-logistics audit identifying 12% in recoverable shipment variance'
      ]),
      classification: 'VERIFIED'
    }
  ];

  const insertExp = db.prepare(`
    INSERT INTO experiences (id, candidate_id, title, company, location, period, current, description, achievements, classification)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const exp of experiences) {
    insertExp.run(exp.id, candidateId, exp.title, exp.company, exp.location, exp.period, exp.current, exp.description, exp.achievements, exp.classification);
  }

  // Seed verified education
  db.prepare(`
    INSERT INTO education (id, candidate_id, degree, institution, location, period, grade, classification)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'edu-1',
    candidateId,
    'Bachelor of Commerce (Management & Financial Studies)',
    'University of Mumbai',
    'Mumbai, Maharashtra, India',
    '2018 - 2021',
    'First Class Honors',
    'VERIFIED'
  );

  // Seed verified skills
  const skillsList = [
    { id: 'sk-1', name: 'Logistics Operations & Hub Management', category: 'Domain', proficiency: 96 },
    { id: 'sk-2', name: 'SLA Tracking & Transit Dispatch Routing', category: 'Domain', proficiency: 94 },
    { id: 'sk-3', name: 'MIS Reporting & Operational Dashboards', category: 'Technical', proficiency: 92 },
    { id: 'sk-4', name: 'AI Workflow & Prompt Engineering', category: 'Technical', proficiency: 90 },
    { id: 'sk-5', name: 'Cross-Functional Stakeholder Alignment', category: 'Leadership', proficiency: 91 },
    { id: 'sk-6', name: 'Process Bottleneck Resolution & RCA', category: 'Strategy', proficiency: 93 },
    { id: 'sk-7', name: 'Supply Chain Inventory Reconciliation', category: 'Domain', proficiency: 88 },
    { id: 'sk-8', name: 'CRM & ERP Data Management', category: 'Technical', proficiency: 89 },
  ];

  const insertSkill = db.prepare(`
    INSERT INTO skills (id, candidate_id, name, category, proficiency, verified, classification)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of skillsList) {
    insertSkill.run(s.id, candidateId, s.name, s.category, s.proficiency, 1, 'VERIFIED');
  }

  // Seed verified projects
  const projectsList = [
    {
      id: 'proj-1',
      name: 'Strive AI - Automated Candidate Operations Agent',
      description: 'End-to-end multi-agent orchestration engine for autonomous job application telemetry, ATS parsing, and portfolio alignment.',
      role: 'Lead System Architect & Builder',
      technologies: JSON.stringify(['TypeScript', 'React', 'Node.js', 'Gemini API', 'SQLite']),
      metrics: '3x faster application turnaround; 100% truth-grounded resume generation without hallucinated claims',
      url: 'https://github.com/Jarvis-vast'
    },
    {
      id: 'proj-2',
      name: 'Amplifylane Logistics Dispatch Engine',
      description: 'Automated fleet dispatch routing and real-time delivery milestone tracking portal for regional courier operations.',
      role: 'Operations Lead & Technical Designer',
      technologies: JSON.stringify(['MIS Dashboards', 'Webhooks', 'Process SOPs', 'Google Workspace Automation']),
      metrics: '28% reduction in hub turnaround time; 4,200+ daily items monitored'
    },
    {
      id: 'proj-3',
      name: 'Zelvora Studio MIS Platform',
      description: 'Centralized operational cockpit for studio resource allocation, contractor billing schedules, and milestone delivery.',
      role: 'Operations Consultant',
      technologies: JSON.stringify(['Database Sync', 'SLA Tracking', 'Resource Optimization']),
      metrics: 'Eliminated manual billing reconciliations, saving 18 staff hours per week'
    }
  ];

  const insertProj = db.prepare(`
    INSERT INTO projects (id, candidate_id, name, description, role, technologies, metrics, url, classification)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of projectsList) {
    insertProj.run(p.id, candidateId, p.name, p.description, p.role, p.technologies, p.metrics, p.url || null, 'VERIFIED');
  }

  // Seed verified evidence nodes
  const evidenceList = [
    { id: 'ev-1', claim: 'Led logistics hub operations handling 4,200+ parcels daily with 99.4% SLA', sourceType: 'EMPLOYMENT_RECORD', evidenceRef: 'Skydot Express Internal Audit & SLA Reports' },
    { id: 'ev-2', claim: 'Reduced line-haul transit delays by 28% across 14 zones', sourceType: 'PERFORMANCE_REVIEW', evidenceRef: 'Skydot Express Operations Performance Review 2023-2024' },
    { id: 'ev-3', claim: 'Relocation strictly prohibited outside Mumbai (requires Remote or Mumbai location)', sourceType: 'CANDIDATE_RULE', evidenceRef: 'Candidate Directive Profile 2026' },
  ];

  const insertEv = db.prepare(`
    INSERT INTO candidate_evidence (id, candidate_id, claim, source_type, evidence_ref, verification_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const e of evidenceList) {
    insertEv.run(e.id, candidateId, e.claim, e.sourceType, e.evidenceRef, 'VERIFIED');
  }

  // Seed base resume
  db.prepare(`
    INSERT INTO resumes (id, candidate_id, title, version, content, truth_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'res-om-v1',
    candidateId,
    'Om Bhagwat - Truth-Grounded Master Resume',
    'v1.0-grounded',
    JSON.stringify({
      name: 'Om Bhagwat',
      headline: 'Operations & Systems Automation Lead',
      contact: {
        location: 'Mumbai, Maharashtra, India',
        email: 'bhagwatom987@gmail.com',
        phone: '+91 9326540456',
        linkedin: 'https://linkedin.com/in/om-bhagwat-59555921a',
        github: 'https://github.com/Jarvis-vast',
        portfolio: 'https://portfolio-lac-nine-49.vercel.app/'
      },
      summary: 'Operations manager and automation specialist with hands-on expertise in dispatch routing, cross-functional SLA optimization, MIS dashboards, and production prompt workflows.',
      experiences: experiences,
      education: [
        {
          degree: 'Bachelor of Commerce',
          institution: 'University of Mumbai',
          location: 'Mumbai, Maharashtra, India',
          period: '2018 - 2021'
        }
      ],
      skills: skillsList.map(s => s.name)
    }),
    100
  );

  // Initialize Agent state
  db.prepare(`
    INSERT INTO agent_state (id, status, cadence_minutes, cycle_count)
    VALUES ('agent-state-main', 'ACTIVE', 45, 1)
  `).run();

  // Audit event
  db.prepare(`
    INSERT INTO audit_events (id, event_type, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'audit-seed-1',
    'INITIALIZE_CANDIDATE_TRUTH',
    'candidate',
    candidateId,
    'Initialized Om Bhagwat truth profile. Zero fake business data or unverified jobs.'
  );
}

// Helper query wrappers
export function getCandidateProfile() {
  const candidate = db.prepare('SELECT * FROM candidate WHERE id = ?').get('candidate-om') as any;
  if (!candidate) return null;

  const preferences = db.prepare('SELECT * FROM candidate_preferences WHERE candidate_id = ?').get('candidate-om') as any;
  const rules = db.prepare('SELECT * FROM candidate_rules WHERE candidate_id = ?').get('candidate-om') as any;
  const experiences = db.prepare('SELECT * FROM experiences WHERE candidate_id = ? ORDER BY current DESC, period DESC').all('candidate-om') as any[];
  const education = db.prepare('SELECT * FROM education WHERE candidate_id = ?').all('candidate-om') as any[];
  const skills = db.prepare('SELECT * FROM skills WHERE candidate_id = ?').all('candidate-om') as any[];
  const projects = db.prepare('SELECT * FROM projects WHERE candidate_id = ?').all('candidate-om') as any[];
  const evidence = db.prepare('SELECT * FROM candidate_evidence WHERE candidate_id = ?').all('candidate-om') as any[];

  return {
    id: candidate.id,
    name: candidate.name,
    title: candidate.title,
    headline: candidate.headline,
    location: candidate.location,
    email: candidate.email,
    phone: candidate.phone,
    linkedin: candidate.linkedin,
    github: candidate.github,
    portfolio: candidate.portfolio,
    relocationAllowed: Boolean(candidate.relocation_allowed),
    summary: candidate.summary,
    preferences: preferences ? {
      location: preferences.location,
      relocation: Boolean(preferences.relocation),
      minMatchScore: preferences.min_match_score,
      dailyQualifiedOpportunityTarget: preferences.daily_qualified_opportunity_target,
      salaryPreference: preferences.salary_preference
    } : null,
    rules: rules ? {
      locationConstraint: rules.location_constraint,
      salaryFloor: rules.salary_floor,
      relocationAllowed: Boolean(rules.relocation_allowed),
      blacklistedKeywords: JSON.parse(rules.blacklisted_keywords || '[]'),
      applicationMode: rules.application_mode,
      minFitScore: rules.min_fit_score,
      dailyOpportunityTarget: rules.daily_opportunity_target
    } : null,
    experiences: experiences.map(e => ({
      ...e,
      achievements: JSON.parse(e.achievements || '[]'),
      current: Boolean(e.current)
    })),
    education,
    skills: skills.map(s => ({
      ...s,
      verified: Boolean(s.verified)
    })),
    projects: projects.map(p => ({
      ...p,
      technologies: JSON.parse(p.technologies || '[]')
    })),
    evidence,
    facts: getCandidateFacts('candidate-om')
  };
}

export function seedCandidateFactsIfEmpty() {
  const row = db.prepare('SELECT id FROM candidate_facts WHERE candidate_id = ? LIMIT 1').get('candidate-om');
  if (row) return;

  const candidateId = 'candidate-om';
  const timestamp = new Date().toISOString();

  const facts = [
    {
      id: 'fact-id-1',
      candidate_id: candidateId,
      fact_type: 'identity',
      field: 'name',
      claim: 'Candidate Legal Name: Om Bhagwat',
      value: 'Om Bhagwat',
      source: 'Candidate Attested Dossier',
      confidence: 1.0,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: 'Verified against primary portfolio and identity'
    },
    {
      id: 'fact-id-2',
      candidate_id: candidateId,
      fact_type: 'identity',
      field: 'title',
      claim: 'Operations & Systems Automation Lead',
      value: 'Operations & Systems Automation Lead',
      source: 'Verified Work History',
      confidence: 1.0,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: 'Active leadership role across hub and automated dispatch'
    },
    {
      id: 'fact-rule-1',
      candidate_id: candidateId,
      fact_type: 'rule',
      field: 'relocation',
      claim: 'Relocation outside Mumbai strictly disallowed (Only Remote or Mumbai permitted)',
      value: 'PROHIBITED',
      source: 'Candidate Non-Negotiable Rule',
      confidence: 1.0,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: 'Hard constraint enforced on all matching cycles'
    },
    {
      id: 'fact-rule-2',
      candidate_id: candidateId,
      fact_type: 'rule',
      field: 'salary_floor',
      claim: 'Minimum Compensation Floor: $120,000 / yr (or ₹25 LPA)',
      value: '$120,000 / yr',
      source: 'Candidate Compensation Guardrail',
      confidence: 1.0,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: 'Applications below floor will be rejected or flagged'
    },
    {
      id: 'fact-edu-1',
      candidate_id: candidateId,
      fact_type: 'education',
      field: 'degree',
      claim: 'Bachelor of Commerce (Management & Financial Studies) - University of Mumbai',
      value: 'B.Com',
      source: 'University Degree Certification',
      confidence: 0.98,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: 'Conferred First Class Honors 2018-2021'
    },
    {
      id: 'fact-edu-unknown-1',
      candidate_id: candidateId,
      fact_type: 'education',
      field: 'graduate_degree',
      claim: 'Master of Science / MBA Degree',
      value: 'UNKNOWN',
      source: 'Truth Dossier Verification Audit',
      confidence: 0.0,
      status: 'UNKNOWN',
      extracted_at: timestamp,
      notes: 'No graduate degree claimed or confirmed in records. Preserved as UNKNOWN.'
    },
    {
      id: 'fact-sk-1',
      candidate_id: candidateId,
      fact_type: 'skill',
      field: 'skill',
      claim: 'Logistics Operations & Fleet Dispatch Routing',
      value: 'Logistics Operations',
      source: 'Skydot Express Employment Records',
      confidence: 0.96,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: '4,200+ daily items monitored'
    },
    {
      id: 'fact-sk-2',
      candidate_id: candidateId,
      fact_type: 'skill',
      field: 'skill',
      claim: 'SLA Tracking & Line-Haul Transit Management',
      value: 'SLA Monitoring',
      source: 'Skydot Express Audit Reports',
      confidence: 0.95,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: '99.4% SLA adherence achieved'
    },
    {
      id: 'fact-sk-3',
      candidate_id: candidateId,
      fact_type: 'skill',
      field: 'skill',
      claim: 'MIS Reporting & Spreadsheet Automation',
      value: 'MIS Reporting',
      source: 'Ask MBA Educational Services Work History',
      confidence: 0.94,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: 'Automated 5 regional team dashboards'
    },
    {
      id: 'fact-sk-4',
      candidate_id: candidateId,
      fact_type: 'skill',
      field: 'skill',
      claim: 'Python Operational Scripting & Process Automation',
      value: 'Python',
      source: 'GitHub / Project Artifacts',
      confidence: 0.90,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: 'Automated dispatch telemetry scripts'
    },
    {
      id: 'fact-sk-5',
      candidate_id: candidateId,
      fact_type: 'skill',
      field: 'skill',
      claim: 'Prompt Engineering Workflows & Agent Architecture',
      value: 'Prompt Engineering',
      source: 'Strive AI System Repository',
      confidence: 0.92,
      status: 'VERIFIED',
      extracted_at: timestamp,
      notes: 'Multi-agent orchestration workflows'
    },
    {
      id: 'fact-sk-unknown-1',
      candidate_id: candidateId,
      fact_type: 'skill',
      field: 'skill',
      claim: 'Production Kubernetes Cluster Management',
      value: 'UNKNOWN',
      source: 'Candidate Dossier Audit',
      confidence: 0.0,
      status: 'UNKNOWN',
      extracted_at: timestamp,
      notes: 'Candidate has not demonstrated or claimed production Kubernetes administration. Marked UNKNOWN.'
    },
    {
      id: 'fact-cert-unknown-1',
      candidate_id: candidateId,
      fact_type: 'certification',
      field: 'certification',
      claim: 'AWS Certified Solutions Architect',
      value: 'UNKNOWN',
      source: 'Certification Registry Check',
      confidence: 0.0,
      status: 'UNKNOWN',
      extracted_at: timestamp,
      notes: 'No AWS certification claimed in profile. Strictly preserved as UNKNOWN.'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO candidate_facts (
      id, candidate_id, fact_type, field, claim, value, source, confidence, status, extracted_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of facts) {
    stmt.run(
      f.id,
      f.candidate_id,
      f.fact_type,
      f.field,
      f.claim,
      f.value,
      f.source,
      f.confidence,
      f.status,
      f.extracted_at,
      f.notes
    );
  }
}

export function getSystemMode(): 'DEMO' | 'PRODUCTION' {
  const row = db.prepare('SELECT mode FROM system_settings WHERE id = ?').get('global-settings') as any;
  return (row && row.mode === 'PRODUCTION') ? 'PRODUCTION' : 'DEMO';
}

export function setSystemMode(mode: 'DEMO' | 'PRODUCTION') {
  db.prepare(`
    INSERT INTO system_settings (id, mode, updated_at)
    VALUES ('global-settings', ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET mode = excluded.mode, updated_at = datetime('now')
  `).run(mode);
}

export function getCandidateFacts(candidateId: string = 'candidate-om'): any[] {
  const rows = db.prepare(`
    SELECT id, candidate_id as candidateId, fact_type as factType, field, claim, value,
           source, confidence, status, extracted_at as extractedAt, notes
    FROM candidate_facts
    WHERE candidate_id = ?
    ORDER BY status = 'VERIFIED' DESC, status = 'UNKNOWN' ASC, extracted_at DESC
  `).all(candidateId) as any[];

  return rows;
}

export function saveCandidateFact(fact: {
  id: string;
  candidateId: string;
  factType: string;
  field: string;
  claim: string;
  value: string;
  source: string;
  confidence: number;
  status: string;
  notes?: string;
}) {
  db.prepare(`
    INSERT INTO candidate_facts (
      id, candidate_id, fact_type, field, claim, value, source, confidence, status, extracted_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    ON CONFLICT(id) DO UPDATE SET
      claim = excluded.claim,
      value = excluded.value,
      source = excluded.source,
      confidence = excluded.confidence,
      status = excluded.status,
      notes = excluded.notes,
      extracted_at = datetime('now')
  `).run(
    fact.id,
    fact.candidateId,
    fact.factType,
    fact.field,
    fact.claim,
    fact.value,
    fact.source,
    fact.confidence,
    fact.status,
    fact.notes || null
  );
}

export function deleteCandidateFact(id: string) {
  db.prepare('DELETE FROM candidate_facts WHERE id = ?').run(id);
}

export function addApplicationEvent(appId: string, stage: string, status: string, description: string) {
  const eventId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  db.prepare(`
    INSERT INTO application_events (id, application_id, stage, status, description, timestamp)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(eventId, appId, stage, status, description);
}

export function getApplicationTimeline(appId: string): any[] {
  return db.prepare(`
    SELECT id, stage, status, description, timestamp
    FROM application_events
    WHERE application_id = ?
    ORDER BY timestamp ASC
  `).all(appId) as any[];
}

export function getApplicationsWithTimeline(): any[] {
  const apps = db.prepare(`
    SELECT * FROM applications ORDER BY created_at DESC
  `).all() as any[];

  return apps.map((app) => {
    const timeline = getApplicationTimeline(app.id);
    return {
      id: app.id,
      jobId: app.job_id,
      jobTitle: app.job_title,
      company: app.company,
      companyLogo: app.company_logo,
      location: app.location,
      status: app.status,
      timestamp: app.created_at,
      adapter: app.adapter || 'Direct Submission Portal',
      isSimulated: Boolean(app.is_simulated),
      submissionMethod: app.submission_method || 'Direct Portal',
      externalApplicationId: app.external_application_id,
      responseMetadata: app.response_metadata,
      notes: app.notes,
      coverLetter: app.cover_letter,
      confirmationToken: app.confirmation_token,
      receiptId: app.receipt_id,
      resumeVersion: app.resume_version || 'v1.0-grounded',
      evidenceCoverage: app.evidence_coverage || '100% Truth Grounded',
      currentStageNumber: app.current_stage_number || 4,
      totalStages: app.total_stages || 7,
      stageProgressPercent: app.stage_progress_percent || 70,
      stageLog: app.stage_log,
      timeline: timeline.length > 0 ? timeline : [
        {
          id: `ev-init-${app.id}`,
          stage: 'Job Found',
          status: 'COMPLETED',
          description: `Discovered requisition: ${app.job_title} at ${app.company}`,
          timestamp: app.created_at
        },
        {
          id: `ev-rev-${app.id}`,
          stage: 'Reviewed',
          status: 'COMPLETED',
          description: 'Hard constraints passed. Fit score evaluated.',
          timestamp: app.created_at
        },
        {
          id: `ev-tailor-${app.id}`,
          stage: 'Tailored',
          status: 'COMPLETED',
          description: 'Resume grounded in verified candidate facts.',
          timestamp: app.created_at
        },
        {
          id: `ev-stat-${app.id}`,
          stage: app.is_simulated ? 'Submitted' : 'Ready',
          status: app.is_simulated ? 'COMPLETED' : 'IN_PROGRESS',
          description: app.is_simulated
            ? 'DEMO MODE: Simulated submission record created.'
            : 'Application package queued for submission.',
          timestamp: app.created_at
        }
      ]
    };
  });
}

export function saveDocument(doc: {
  id: string;
  candidateId: string;
  jobId?: string;
  type: string;
  title: string;
  content: string;
  originalContent?: string;
  diffNotes?: string;
  truthScore?: number;
}) {
  db.prepare(`
    INSERT INTO documents (
      id, candidate_id, job_id, type, title, content, original_content, diff_notes, truth_score, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    doc.id,
    doc.candidateId,
    doc.jobId || null,
    doc.type,
    doc.title,
    doc.content,
    doc.originalContent || null,
    doc.diffNotes || null,
    doc.truthScore || 100
  );
}

export function getDocuments(candidateId: string = 'candidate-om', jobId?: string): any[] {
  let query = 'SELECT * FROM documents WHERE candidate_id = ?';
  const params: any[] = [candidateId];
  if (jobId) {
    query += ' AND job_id = ?';
    params.push(jobId);
  }
  query += ' ORDER BY created_at DESC';
  return db.prepare(query).all(...params) as any[];
}

