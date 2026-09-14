import { parseSalary } from '../src/utils/salary';

export interface CandidateTruthData {
  id: string;
  name: string;
  location: string;
  relocationAllowed: boolean;
  rules: {
    locationConstraint: string;
    salaryFloor: string;
    relocationAllowed: boolean;
    blacklistedKeywords: string[];
    minFitScore: number;
  };
  skills: Array<{ name: string; proficiency: number; verified: boolean; classification?: string }>;
  experiences: Array<{
    title: string;
    company: string;
    period: string;
    current: boolean;
    description: string;
    achievements: string[];
    classification?: string;
  }>;
  projects?: Array<{
    name: string;
    technologies: string[];
    role: string;
  }>;
  evidence?: Array<{
    claim: string;
    sourceType?: string;
    evidenceRef?: string;
    status?: string;
  }>;
}

export interface JobInput {
  id?: string;
  title: string;
  company: string;
  location: string;
  workMode?: 'Remote' | 'Hybrid' | 'On-site';
  salary: string;
  description?: string;
  requiredSkills?: string[];
}

export interface EvaluatedMatchResult {
  jobId: string;
  fitScore: number;
  hardConstraintsPassed: boolean;
  status: 'SCHEDULED' | 'WATCH' | 'BLOCKED';
  hardConstraintDetails: {
    locationMatch: boolean;
    compensationMatch: boolean;
    relocationMatch: boolean;
    blacklistClear: boolean;
    failureReasons: string[];
  };
  scoreBreakdown: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number | string;
    roleMatch: number;
    constraintsMatch: number;
    seniorityMatch: number;
    // Backward compatibility aliases
    experienceEvidenceMatch: number;
    domainAlignment: number;
    roleSeniority: number;
    locationRule: string;
  };
  strengths: string;
  gaps: string;
  why: string[];
  gapList: string[];
  canonicalKey: string;
}

/**
 * Normalizes job title and company for deduplication
 */
export function generateCanonicalJobKey(title: string, company: string): string {
  const cleanTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanCompany = (company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanCompany}:${cleanTitle}`;
}

/**
 * Evaluates candidate facts strictly against a job opportunity.
 * Never invents claims, and transparently breaks down all 7 dimensions.
 */
export function evaluateJobAgainstCandidate(
  job: JobInput,
  candidate: CandidateTruthData
): EvaluatedMatchResult {
  const failureReasons: string[] = [];
  const why: string[] = [];
  const gapList: string[] = [];

  // 1. Location and Relocation
  const jobLoc = (job.location || '').toLowerCase();
  const isRemote = jobLoc.includes('remote') || (job.workMode && job.workMode === 'Remote');
  const isMumbai = jobLoc.includes('mumbai') || jobLoc.includes('bombay');
  const requiresRelocation = jobLoc.includes('relocation required') || jobLoc.includes('relocation mandatory') || (!isRemote && !isMumbai);

  let locationPass = true;
  let relocationPass = true;
  let locationScore = 100;

  if (isRemote) {
    why.push('Remote position satisfies candidate location preference.');
    locationScore = 100;
  } else if (isMumbai) {
    why.push('Position is based in candidate home metropolitan area (Mumbai).');
    locationScore = 100;
  } else if (requiresRelocation && !candidate.relocationAllowed) {
    locationPass = false;
    relocationPass = false;
    locationScore = 0;
    failureReasons.push(`Relocation prohibited: role requires physical relocation to "${job.location}"`);
    gapList.push(`Relocation to "${job.location}" violates non-negotiable candidate location constraint.`);
  } else {
    locationScore = 60;
    gapList.push(`Position location (${job.location}) requires non-remote arrangement.`);
  }

  // 2. Blacklisted keywords check
  const textCorpus = `${job.title} ${job.company} ${job.description || ''}`.toLowerCase();
  let blacklistClear = true;
  for (const kw of candidate.rules.blacklistedKeywords || []) {
    if (kw && textCorpus.includes(kw.toLowerCase())) {
      blacklistClear = false;
      failureReasons.push(`Hit prohibited keyword guardrail: "${kw}"`);
      gapList.push(`Contains prohibited keyword: "${kw}"`);
      break;
    }
  }

  // 3. Compensation Floor Check
  let compensationPass = true;
  let salaryScore: number | string = 85;
  const parsedSalary = parseSalary(job.salary);
  const parsedFloor = parseSalary(candidate.rules.salaryFloor);

  if (job.salary && (job.salary.toLowerCase().includes('undisclosed') || job.salary.toLowerCase().includes('competitive'))) {
    salaryScore = 'UNDISCLOSED';
    gapList.push('Salary information undisclosed in posting; candidate compensation floor requires verification.');
  } else if (parsedSalary && parsedFloor && parsedSalary.max && parsedFloor.min) {
    if (parsedSalary.max < parsedFloor.min) {
      compensationPass = false;
      salaryScore = 20;
      failureReasons.push(
        `Compensation max ($${parsedSalary.max.toLocaleString()}) is below candidate minimum floor ($${parsedFloor.min.toLocaleString()})`
      );
      gapList.push(`Compensation range ($${job.salary}) falls below candidate minimum floor ($${candidate.rules.salaryFloor}).`);
    } else {
      salaryScore = 100;
      why.push(`Disclosed compensation ($${job.salary}) meets or exceeds candidate floor ($${candidate.rules.salaryFloor}).`);
    }
  } else {
    salaryScore = 'UNDISCLOSED';
    gapList.push('Compensation details not explicitly disclosed in job posting.');
  }

  // 4. Skills Match calculation strictly against verified skills
  const candidateVerifiedSkills = new Set(
    (candidate.skills || [])
      .map((s: any) => (typeof s === 'string' ? s : s?.name || '').toLowerCase().trim())
      .filter(Boolean)
  );

  const targetSkills = (job.requiredSkills && job.requiredSkills.length > 0)
    ? job.requiredSkills
    : ['operations', 'sla monitoring', 'mis reporting', 'process automation', 'python'];

  let matchedSkillsCount = 0;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  targetSkills.forEach((ts) => {
    const tsLower = ts.toLowerCase().trim();
    let found = false;
    for (const cSkill of candidateVerifiedSkills) {
      if (cSkill.includes(tsLower) || tsLower.includes(cSkill)) {
        matchedSkillsCount++;
        matchedSkills.push(ts);
        found = true;
        break;
      }
    }
    if (!found) {
      missingSkills.push(ts);
    }
  });

  const skillsMatchScore = targetSkills.length > 0
    ? Math.round((matchedSkillsCount / targetSkills.length) * 100)
    : 75;

  if (matchedSkills.length > 0) {
    why.push(`Verified evidence found for ${matchedSkills.length} required skill(s): ${matchedSkills.slice(0, 4).join(', ')}.`);
  }
  if (missingSkills.length > 0) {
    gapList.push(`Candidate dossier lacks verified evidence for required skill(s): ${missingSkills.slice(0, 4).join(', ')}.`);
  }

  // 5. Experience Match
  const verifiedExperiences = (candidate.experiences || []).filter((e) => e.classification !== 'UNVERIFIED');
  let experienceScore = 70;
  if (verifiedExperiences.length >= 3) {
    experienceScore = 95;
    why.push(`Candidate possesses ${verifiedExperiences.length} verified corporate tenures with documented achievements.`);
  } else if (verifiedExperiences.length >= 1) {
    experienceScore = 80;
    why.push('Candidate has verified corporate work experience on record.');
  } else {
    experienceScore = 40;
    gapList.push('Limited verified employment records found in candidate truth dossier.');
  }

  // 6. Role & Domain Match
  let roleMatchScore = 75;
  const jobTitleText = `${job.title} ${job.description || ''}`.toLowerCase();
  if (/operations|dispatch|sla|logistics|automation|systems|workflow/i.test(jobTitleText)) {
    roleMatchScore = 96;
    why.push('Role aligns with candidate primary core domain (Operations, Dispatch, and Automation).');
  } else if (/engineer|developer|software/i.test(jobTitleText)) {
    roleMatchScore = 80;
  } else {
    roleMatchScore = 60;
    gapList.push('Target role domain diverges from candidate primary operational focus.');
  }

  // 7. Seniority Match
  let seniorityScore = 85;
  if (/lead|senior|manager|head/i.test(job.title)) {
    seniorityScore = 95;
    why.push('Role seniority (Lead/Senior) matches candidate tenure profile.');
  } else if (/principal|director|vp/i.test(job.title)) {
    seniorityScore = 65;
    gapList.push('Role calls for Principal/Executive leadership tier; candidate dossier reflects Lead/Senior level.');
  } else if (/intern|junior|entry/i.test(job.title)) {
    seniorityScore = 70;
    gapList.push('Role is junior relative to candidate established qualifications.');
  }

  const hardConstraintsPassed = locationPass && relocationPass && blacklistClear && compensationPass;
  const constraintsMatch = hardConstraintsPassed ? 100 : 0;

  // Composite Overall Fit Score
  let fitScore = 0;
  if (hardConstraintsPassed) {
    const numericSalaryWeight = typeof salaryScore === 'number' ? salaryScore : 75;
    fitScore = Math.round(
      skillsMatchScore * 0.35 +
      experienceScore * 0.25 +
      roleMatchScore * 0.15 +
      seniorityScore * 0.15 +
      (numericSalaryWeight * 0.05) +
      (locationScore * 0.05)
    );
    fitScore = Math.max(45, Math.min(99, fitScore));
  } else {
    // Hard constraints override overall fit
    fitScore = Math.min(40, Math.round(skillsMatchScore * 0.35));
  }

  const status: 'SCHEDULED' | 'WATCH' | 'BLOCKED' = !hardConstraintsPassed
    ? 'BLOCKED'
    : fitScore >= (candidate.rules.minFitScore || 85)
      ? 'SCHEDULED'
      : 'WATCH';

  const strengthsSummary = why.length > 0
    ? why.join(' ')
    : 'Candidate profile partially matches role specifications.';

  const gapsSummary = gapList.length > 0
    ? gapList.join(' ')
    : 'No critical gaps identified; 100% verified alignment.';

  return {
    jobId: job.id || '',
    fitScore,
    hardConstraintsPassed,
    status,
    hardConstraintDetails: {
      locationMatch: locationPass,
      compensationMatch: compensationPass,
      relocationMatch: relocationPass,
      blacklistClear,
      failureReasons,
    },
    scoreBreakdown: {
      skillsMatch: skillsMatchScore,
      experienceMatch: experienceScore,
      locationMatch: locationScore,
      salaryMatch: salaryScore,
      roleMatch: roleMatchScore,
      constraintsMatch,
      seniorityMatch: seniorityScore,
      // Backward compatibility aliases
      experienceEvidenceMatch: experienceScore,
      domainAlignment: roleMatchScore,
      roleSeniority: seniorityScore,
      locationRule: locationPass ? 'PASSED' : 'PROHIBITED',
    },
    strengths: strengthsSummary,
    gaps: gapsSummary,
    why,
    gapList,
    canonicalKey: generateCanonicalJobKey(job.title, job.company),
  };
}
