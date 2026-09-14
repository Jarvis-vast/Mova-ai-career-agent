import { FactVerificationStatus } from '../src/types';

export interface CandidateFactRecord {
  id: string;
  candidateId: string;
  factType: 'identity' | 'experience' | 'education' | 'skill' | 'project' | 'certification' | 'rule' | 'preference';
  field: string;
  claim: string;
  value: string;
  source: string;
  confidence: number;
  status: FactVerificationStatus;
  extractedAt: string;
  notes?: string;
}

export interface ExtractionResult {
  facts: CandidateFactRecord[];
  inferredCount: number;
  verifiedCount: number;
  unknownCount: number;
}

/**
 * Extracts facts from raw resume text with strict truthfulness.
 * NEVER invents employers, dates, degrees, or certifications.
 * If a field cannot be confidently extracted, it is recorded as UNKNOWN.
 */
export function extractFactsFromResumeText(
  rawText: string,
  candidateId: string = 'candidate-om',
  sourceName: string = 'Uploaded Resume'
): ExtractionResult {
  const timestamp = new Date().toISOString();
  const facts: CandidateFactRecord[] = [];

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    facts.push({
      id: `fact-unknown-${Date.now()}-1`,
      candidateId,
      factType: 'identity',
      field: 'resume_content',
      claim: 'Resume content empty or unparseable',
      value: 'UNKNOWN',
      source: sourceName,
      confidence: 0,
      status: 'UNKNOWN',
      extractedAt: timestamp,
      notes: 'No readable text was provided for fact extraction.',
    });

    return {
      facts,
      inferredCount: 0,
      verifiedCount: 0,
      unknownCount: 1,
    };
  }

  // 1. Name
  const firstLine = lines[0].replace(/^(name\s*:\s*)/i, '').trim();
  if (firstLine && firstLine.length < 60 && !firstLine.includes('@')) {
    facts.push({
      id: `fact-id-name-${Date.now()}`,
      candidateId,
      factType: 'identity',
      field: 'name',
      claim: `Candidate Name: ${firstLine}`,
      value: firstLine,
      source: sourceName,
      confidence: 0.92,
      status: 'VERIFIED',
      extractedAt: timestamp,
    });
  } else {
    facts.push({
      id: `fact-id-name-${Date.now()}`,
      candidateId,
      factType: 'identity',
      field: 'name',
      claim: 'Candidate name not deterministically identified in header',
      value: 'UNKNOWN',
      source: sourceName,
      confidence: 0.0,
      status: 'UNKNOWN',
      extractedAt: timestamp,
      notes: 'Could not confidently isolate candidate name; preserved as UNKNOWN.',
    });
  }

  // 2. Email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    facts.push({
      id: `fact-id-email-${Date.now()}`,
      candidateId,
      factType: 'identity',
      field: 'email',
      claim: `Email: ${emailMatch[0]}`,
      value: emailMatch[0],
      source: sourceName,
      confidence: 0.99,
      status: 'VERIFIED',
      extractedAt: timestamp,
    });
  } else {
    facts.push({
      id: `fact-id-email-${Date.now()}`,
      candidateId,
      factType: 'identity',
      field: 'email',
      claim: 'Email address not found',
      value: 'UNKNOWN',
      source: sourceName,
      confidence: 0.0,
      status: 'UNKNOWN',
      extractedAt: timestamp,
    });
  }

  // 3. Phone
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    facts.push({
      id: `fact-id-phone-${Date.now()}`,
      candidateId,
      factType: 'identity',
      field: 'phone',
      claim: `Phone: ${phoneMatch[0]}`,
      value: phoneMatch[0],
      source: sourceName,
      confidence: 0.95,
      status: 'VERIFIED',
      extractedAt: timestamp,
    });
  } else {
    facts.push({
      id: `fact-id-phone-${Date.now()}`,
      candidateId,
      factType: 'identity',
      field: 'phone',
      claim: 'Phone number not found in document',
      value: 'UNKNOWN',
      source: sourceName,
      confidence: 0.0,
      status: 'UNKNOWN',
      extractedAt: timestamp,
    });
  }

  // 4. Skills extraction against comprehensive dictionary
  const dictionary = [
    { name: 'Python', category: 'Programming' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'SQL', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'Logistics Operations', category: 'Operations' },
    { name: 'SLA Monitoring', category: 'Operations' },
    { name: 'MIS Reporting', category: 'Analytics' },
    { name: 'Incident Dispatch', category: 'Operations' },
    { name: 'Prompt Engineering', category: 'AI' },
    { name: 'Process Automation', category: 'Automation' },
    { name: 'Google Sheets / App Script', category: 'Automation' },
  ];

  let detectedSkillCount = 0;
  for (const item of dictionary) {
    const escaped = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(rawText)) {
      detectedSkillCount++;
      facts.push({
        id: `fact-skill-${Date.now()}-${detectedSkillCount}`,
        candidateId,
        factType: 'skill',
        field: 'skill',
        claim: `Direct mention: ${item.name}`,
        value: item.name,
        source: sourceName,
        confidence: 0.94,
        status: 'VERIFIED',
        extractedAt: timestamp,
      });
    }
  }

  // Record non-detected critical cloud/advanced skills as UNKNOWN so we never assume candidate knows them
  const benchmarkSkills = ['Kubernetes', 'AWS', 'Rust', 'Go'];
  for (const bSkill of benchmarkSkills) {
    const escaped = bSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (!regex.test(rawText)) {
      facts.push({
        id: `fact-skill-unknown-${Date.now()}-${bSkill.toLowerCase()}`,
        candidateId,
        factType: 'skill',
        field: 'skill',
        claim: `Competency in ${bSkill}`,
        value: 'UNKNOWN',
        source: sourceName,
        confidence: 0.0,
        status: 'UNKNOWN',
        extractedAt: timestamp,
        notes: `No evidence for ${bSkill} found in document. Preserved as UNKNOWN.`,
      });
    }
  }

  // 5. Education
  const eduRegex = /(?:bachelor|master|b\.com|b\.tech|b\.sc|b\.e|m\.sc|m\.tech|degree|diploma|university|college|institute)/i;
  let eduFound = false;
  for (const line of lines) {
    if (eduRegex.test(line) && line.length < 120) {
      eduFound = true;
      facts.push({
        id: `fact-edu-${Date.now()}`,
        candidateId,
        factType: 'education',
        field: 'degree',
        claim: line,
        value: line,
        source: sourceName,
        confidence: 0.88,
        status: 'VERIFIED',
        extractedAt: timestamp,
      });
      break;
    }
  }

  if (!eduFound) {
    // NEVER invent "Accredited University" or "BS in Computer Science"!
    facts.push({
      id: `fact-edu-unknown-${Date.now()}`,
      candidateId,
      factType: 'education',
      field: 'degree',
      claim: 'Higher education degree/institution',
      value: 'UNKNOWN',
      source: sourceName,
      confidence: 0.0,
      status: 'UNKNOWN',
      extractedAt: timestamp,
      notes: 'No degree or university was found in the text. Not fabricated.',
    });
  }

  // 6. Certifications
  const certRegex = /(?:certified|certification|license|credential|aws certified|pmp|scrum master)/i;
  let certFound = false;
  for (const line of lines) {
    if (certRegex.test(line) && line.length < 100) {
      certFound = true;
      facts.push({
        id: `fact-cert-${Date.now()}`,
        candidateId,
        factType: 'certification',
        field: 'certification',
        claim: line,
        value: line,
        source: sourceName,
        confidence: 0.85,
        status: 'VERIFIED',
        extractedAt: timestamp,
      });
    }
  }

  if (!certFound) {
    facts.push({
      id: `fact-cert-unknown-${Date.now()}`,
      candidateId,
      factType: 'certification',
      field: 'certification',
      claim: 'Professional Certifications',
      value: 'UNKNOWN',
      source: sourceName,
      confidence: 0.0,
      status: 'UNKNOWN',
      extractedAt: timestamp,
      notes: 'No industry certifications identified in dossier.',
    });
  }

  const inferredCount = facts.filter((f) => f.status === 'INFERRED').length;
  const verifiedCount = facts.filter((f) => f.status === 'VERIFIED').length;
  const unknownCount = facts.filter((f) => f.status === 'UNKNOWN').length;

  return {
    facts,
    inferredCount,
    verifiedCount,
    unknownCount,
  };
}
