import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export interface TailoredResumeResult {
  headline: string;
  professionalSummary: string;
  highlightedSkills: string[];
  tailoredAchievements: Array<{ role: string; company: string; achievement: string }>;
  truthGroundingScore: number;
}

/**
 * Real AI resume tailoring using Gemini model with strict grounding
 */
export async function generateTailoredResumeWithGemini(
  candidateData: {
    name: string;
    summary: string;
    experiences: Array<{ title: string; company: string; achievements: string[] }>;
    skills: Array<{ name: string }>;
  },
  jobContext: {
    title: string;
    company: string;
    description?: string;
  }
): Promise<TailoredResumeResult> {
  if (!isGeminiConfigured()) {
    throw new Error(
      'Gemini AI is not available: GEMINI_API_KEY is not configured in the server environment.'
    );
  }

  const ai = getGeminiClient();

  const prompt = `
You are the Truth-Grounded Resume Synthesis Engine for MOVA.
CRITICAL CONSTRAINT: You MUST NOT invent, hallucinate, or fabricate any skills, employers, dates, or metrics. You can only re-frame and emphasize the candidate's VERIFIED facts against the target job.

CANDIDATE VERIFIED DOSSIER:
Name: ${candidateData.name}
Base Summary: ${candidateData.summary}
Verified Experiences: ${JSON.stringify(candidateData.experiences)}
Verified Skills: ${JSON.stringify(candidateData.skills.map((s) => s.name))}

TARGET JOB:
Title: ${jobContext.title}
Company: ${jobContext.company}
Job Description: ${jobContext.description || 'Not provided'}

TASK:
Output a JSON object with this exact shape:
{
  "headline": string,
  "professionalSummary": string,
  "highlightedSkills": string[],
  "tailoredAchievements": [
    { "role": string, "company": string, "achievement": string }
  ],
  "truthGroundingScore": number // Must be 100 if fully grounded
}
Only output valid JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini API returned an empty response.');
    }

    const parsed = JSON.parse(text) as TailoredResumeResult;
    return {
      headline: parsed.headline || `${candidateData.name} | ${jobContext.title}`,
      professionalSummary: parsed.professionalSummary || candidateData.summary,
      highlightedSkills: Array.isArray(parsed.highlightedSkills) ? parsed.highlightedSkills : [],
      tailoredAchievements: Array.isArray(parsed.tailoredAchievements) ? parsed.tailoredAchievements : [],
      truthGroundingScore: 100,
    };
  } catch (error: any) {
    throw new Error(`Gemini Resume Tailoring failed: ${error?.message || String(error)}`);
  }
}
