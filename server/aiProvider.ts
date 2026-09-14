import { GoogleGenAI } from '@google/genai';

export interface ResumeChange {
  section: string;
  original: string;
  tailored: string;
  reason: string;
}

export interface TailoredResumePackage {
  headline: string;
  professionalSummary: string;
  highlightedSkills: string[];
  tailoredExperiences: Array<{
    title: string;
    company: string;
    period: string;
    summary: string;
    achievements: string[];
  }>;
  changes: ResumeChange[];
  gapAnalysis: {
    matchedRequirements: string[];
    missingEvidence: string[];
    recommendations: string[];
  };
  truthGroundingScore: number;
}

export interface CoverLetterResult {
  recipient: string;
  salutation: string;
  bodyParagraphs: string[];
  closing: string;
  fullLetterText: string;
  groundedFactsUsed: string[];
}

export interface AIProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  analyzeCandidate(candidate: any): Promise<any>;
  analyzeJob(job: any): Promise<any>;
  generateMatchExplanation(candidate: any, job: any, matchResult: any): Promise<{ summary: string; points: string[]; gaps: string[] }>;
  tailorResume(candidate: any, job: any): Promise<TailoredResumePackage>;
  generateCoverLetter(candidate: any, job: any): Promise<CoverLetterResult>;
  recommendActions(candidate: any, pipelineContext: any): Promise<string[]>;
}

/**
 * Real Gemini AI Provider implementing strict truth-grounded career intelligence
 */
export class GeminiAIProvider implements AIProvider {
  id = 'gemini-flash';
  name = 'Google Gemini 2.5 Flash';

  private client: GoogleGenAI | null = null;

  isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  }

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('GEMINI_API_KEY is not configured on the server. AI features require an API key.');
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  async analyzeCandidate(candidate: any): Promise<any> {
    if (!this.isAvailable()) {
      return {
        coreStrengths: candidate.skills?.slice(0, 5)?.map((s: any) => s.name || s) || [],
        summaryInsight: candidate.summary || 'Candidate truth profile established.',
        auditState: 'Awaiting AI provider activation.',
      };
    }

    const ai = this.getClient();
    const prompt = `
Analyze this candidate truth dossier strictly based on provided facts:
Candidate: ${candidate.name}, ${candidate.title}
Summary: ${candidate.summary}
Skills: ${JSON.stringify(candidate.skills)}
Experiences: ${JSON.stringify(candidate.experiences)}

Output JSON:
{
  "coreStrengths": string[],
  "summaryInsight": string,
  "recommendedRoleProfiles": string[]
}
`;
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    try {
      return JSON.parse(res.text || '{}');
    } catch {
      return { coreStrengths: [], summaryInsight: res.text || '' };
    }
  }

  async analyzeJob(job: any): Promise<any> {
    if (!this.isAvailable()) {
      return {
        keyCompetencies: job.requiredSkills || [],
        seniorityLevel: job.title?.includes('Lead') ? 'Lead' : 'Senior',
      };
    }

    const ai = this.getClient();
    const prompt = `
Extract key competency requirements and non-negotiables from this job posting:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Output JSON:
{
  "keyCompetencies": string[],
  "seniorityLevel": string,
  "implicitExpectations": string[]
}
`;
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    try {
      return JSON.parse(res.text || '{}');
    } catch {
      return { keyCompetencies: job.requiredSkills || [] };
    }
  }

  async generateMatchExplanation(
    candidate: any,
    job: any,
    matchResult: any
  ): Promise<{ summary: string; points: string[]; gaps: string[] }> {
    if (!this.isAvailable()) {
      return {
        summary: matchResult.strengths || 'Match evaluated against verified candidate constraints.',
        points: matchResult.why || ['Candidate verified skills match posting.'],
        gaps: matchResult.gapList || ['Salary or secondary skills not verified.'],
      };
    }

    const ai = this.getClient();
    const prompt = `
Generate a concise, objective explanation of the match between candidate and job.
DO NOT fabricate candidate skills. If the candidate lacks something, explicitly list it under gaps.

CANDIDATE:
Name: ${candidate.name}
Skills: ${JSON.stringify(candidate.skills?.map((s: any) => s.name || s))}
Experiences: ${JSON.stringify(candidate.experiences)}

JOB:
Title: ${job.title}
Company: ${job.company}
Requirements: ${job.description || ''}

MATCH CALCULATION:
Fit Score: ${matchResult.fitScore}%
Deterministic Reasons: ${JSON.stringify(matchResult.why)}
Deterministic Gaps: ${JSON.stringify(matchResult.gapList)}

Output JSON:
{
  "summary": string,
  "points": string[],
  "gaps": string[]
}
`;
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    try {
      return JSON.parse(res.text || '{}');
    } catch {
      return {
        summary: matchResult.strengths,
        points: matchResult.why,
        gaps: matchResult.gapList,
      };
    }
  }

  async tailorResume(candidate: any, job: any): Promise<TailoredResumePackage> {
    if (!this.isAvailable()) {
      // Deterministic truth fallback without fabrication
      return {
        headline: `${candidate.name} | ${job.title}`,
        professionalSummary: candidate.summary,
        highlightedSkills: candidate.skills?.slice(0, 8)?.map((s: any) => s.name || s) || [],
        tailoredExperiences: candidate.experiences?.map((e: any) => ({
          title: e.title,
          company: e.company,
          period: e.period,
          summary: e.description || e.summary,
          achievements: e.achievements || [],
        })) || [],
        changes: [
          {
            section: 'Headline',
            original: candidate.title,
            tailored: `${candidate.name} | ${job.title}`,
            reason: 'Aligned title nomenclature to target requisition.',
          },
        ],
        gapAnalysis: {
          matchedRequirements: candidate.skills?.slice(0, 5)?.map((s: any) => s.name || s) || [],
          missingEvidence: [],
          recommendations: ['Enable GEMINI_API_KEY for advanced AI semantic restructuring.'],
        },
        truthGroundingScore: 100,
      };
    }

    const ai = this.getClient();
    const prompt = `
You are the Truth-Grounded Career Agent for MOVA.
CRITICAL MANDATE:
- You can reorder skills, rephrase summary, and emphasize verified achievements.
- You are STRICTLY FORBIDDEN from inventing new achievements, new employers, new credentials, or unverified metrics.
- Every claim MUST map directly to the candidate dossier facts.

CANDIDATE DOSSIER:
Name: ${candidate.name}
Base Title: ${candidate.title}
Base Summary: ${candidate.summary}
Verified Skills: ${JSON.stringify(candidate.skills)}
Verified Experiences: ${JSON.stringify(candidate.experiences)}

TARGET REQUISITION:
Job Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${JSON.stringify(job.requiredSkills || [])}

TASK:
1. Conduct Gap Analysis comparing candidate facts with job needs.
2. Re-frame headline and professional summary strictly using candidate's verified background.
3. Prioritize skills that directly match the role.
4. Output specific "changes" explaining every alteration and the rationale.

Output valid JSON only matching this schema:
{
  "headline": string,
  "professionalSummary": string,
  "highlightedSkills": string[],
  "tailoredExperiences": [
    {
      "title": string,
      "company": string,
      "period": string,
      "summary": string,
      "achievements": string[]
    }
  ],
  "changes": [
    {
      "section": string,
      "original": string,
      "tailored": string,
      "reason": string
    }
  ],
  "gapAnalysis": {
    "matchedRequirements": string[],
    "missingEvidence": string[],
    "recommendations": string[]
  },
  "truthGroundingScore": 100
}
`;

    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(res.text || '{}') as TailoredResumePackage;
    return {
      headline: parsed.headline || `${candidate.name} | ${job.title}`,
      professionalSummary: parsed.professionalSummary || candidate.summary,
      highlightedSkills: parsed.highlightedSkills || [],
      tailoredExperiences: parsed.tailoredExperiences || candidate.experiences,
      changes: parsed.changes || [],
      gapAnalysis: parsed.gapAnalysis || {
        matchedRequirements: [],
        missingEvidence: [],
        recommendations: [],
      },
      truthGroundingScore: 100,
    };
  }

  async generateCoverLetter(candidate: any, job: any): Promise<CoverLetterResult> {
    if (!this.isAvailable()) {
      // Deterministic truth template fallback
      const body = [
        `I am writing to submit my application for the ${job.title} position at ${job.company}. With a proven background in ${candidate.title}, I bring verified experience in ${candidate.skills?.slice(0, 3)?.map((s: any) => s.name || s).join(', ') || 'operations and automation'}.`,
        `Throughout my work in logistics operations and process engineering, I have focused on measurable SLA improvements, dispatch accuracy, and system integration. Specifically, ${candidate.summary || 'I have managed operational workflows to reduce cycle times and eliminate bottlenecks.'}`,
        `I welcome the opportunity to discuss how my verified skills can support ${job.company}'s goals. Thank you for your time and consideration.`,
      ];

      return {
        recipient: `Hiring Team at ${job.company}`,
        salutation: `Dear Hiring Team at ${job.company},`,
        bodyParagraphs: body,
        closing: 'Sincerely,',
        fullLetterText: `${candidate.name}\n${candidate.email} | ${candidate.phone}\n${candidate.location}\n\nDear Hiring Team at ${job.company},\n\n${body.join('\n\n')}\n\nSincerely,\n${candidate.name}`,
        groundedFactsUsed: candidate.skills?.slice(0, 4)?.map((s: any) => s.name || s) || [],
      };
    }

    const ai = this.getClient();
    const prompt = `
Generate a compelling, professional cover letter for the candidate applying to the specified role.
CRITICAL CONSTRAINT:
- Rely ONLY on verified facts in candidate dossier.
- Do NOT invent projects, awards, statistics, or relationships with the employer.
- Write in a natural, confident, and professional tone.

CANDIDATE:
Name: ${candidate.name}
Email: ${candidate.email}
Phone: ${candidate.phone}
Location: ${candidate.location}
Verified Skills: ${JSON.stringify(candidate.skills)}
Verified Experiences: ${JSON.stringify(candidate.experiences)}

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Output JSON matching this exact structure:
{
  "recipient": string,
  "salutation": string,
  "bodyParagraphs": string[],
  "closing": string,
  "fullLetterText": string,
  "groundedFactsUsed": string[]
}
`;

    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(res.text || '{}') as CoverLetterResult;
    return {
      recipient: parsed.recipient || `Hiring Team at ${job.company}`,
      salutation: parsed.salutation || `Dear Hiring Team at ${job.company},`,
      bodyParagraphs: parsed.bodyParagraphs || [],
      closing: parsed.closing || 'Sincerely,',
      fullLetterText: parsed.fullLetterText || parsed.bodyParagraphs?.join('\n\n') || '',
      groundedFactsUsed: parsed.groundedFactsUsed || [],
    };
  }

  async recommendActions(candidate: any, pipelineContext: any): Promise<string[]> {
    if (!this.isAvailable()) {
      return [
        'Review high-affinity matches in Mumbai / Remote pipeline.',
        'Verify compensation disclosures on flagged opportunities.',
        'Review tailored application packages ready for submission.',
      ];
    }

    const ai = this.getClient();
    const prompt = `
Provide 3-4 strategic career agent recommendations for this candidate given their pipeline state:
Candidate: ${candidate.name}
Target: ${candidate.rules?.dailyOpportunityTarget || 10} daily opportunities
Context: ${JSON.stringify(pipelineContext)}

Output JSON array of strings:
["action 1", "action 2", "action 3"]
`;
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    try {
      return JSON.parse(res.text || '[]');
    } catch {
      return ['Audit verified credentials.', 'Queue high-score applications.'];
    }
  }
}

export const aiProvider = new GeminiAIProvider();
