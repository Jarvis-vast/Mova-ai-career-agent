import { z } from 'zod';

export const CandidateTruthClassificationSchema = z.enum([
  'VERIFIED',
  'USER_PROVIDED',
  'INFERRED',
  'UNKNOWN',
]);

export const WorkModeSchema = z.enum(['Remote', 'Hybrid', 'On-site']);

export const ApplicationStatusSchema = z.enum([
  'READY',
  'EXECUTING',
  'SUBMISSION_ATTEMPTED',
  'VERIFYING',
  'VERIFIED',
  'FAILED',
  'BLOCKED',
  'UNSUPPORTED',
  'RESPONSE',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]);

export const AgentStateStatusSchema = z.enum([
  'ACTIVE',
  'IDLE',
  'PAUSED',
  'ERROR',
  'BLOCKED',
]);

export const CandidatePreferencesSchema = z.object({
  location: z.string(),
  relocation: z.boolean(),
  minMatchScore: z.number().min(0).max(100),
  dailyQualifiedOpportunityTarget: z.number().min(1),
  salaryPreference: z.string(),
});

export const CandidateRulesSchema = z.object({
  locationConstraint: z.string(),
  salaryFloor: z.string(),
  relocationAllowed: z.boolean(),
  blacklistedKeywords: z.array(z.string()),
  applicationMode: z.enum(['Autonomous Zero-Touch', 'Semi-Autonomous', 'Manual Review']),
  minFitScore: z.number().min(0).max(100),
  dailyOpportunityTarget: z.number().min(1),
});

export const CreateJobSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(1),
  location: z.string().min(1),
  workMode: WorkModeSchema.default('Remote'),
  salary: z.string().default('Competitive / Undisclosed'),
  description: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  source: z.string().default('DIRECT_INPUT'),
  url: z.string().url().optional(),
});

export const EvaluateJobSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(1),
  location: z.string().min(1),
  workMode: WorkModeSchema.default('Remote'),
  salary: z.string().default('Competitive / Undisclosed'),
  description: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
});

export const CreateApplicationSchema = z.object({
  jobId: z.string(),
  adapter: z.string().default('Direct Portal'),
  tailoredResumeId: z.string().optional(),
});

export const ExecuteAttemptSchema = z.object({
  adapter: z.string().default('Direct Portal'),
  externalReference: z.string().optional(),
  evidenceToken: z.string().optional(),
});

export const CreateInterviewSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  date: z.string(),
  time: z.string(),
  type: z.enum(['Technical', 'Behavioral', 'System Design', 'Recruiter Screen', 'Onsite Loop']),
  stage: z.string(),
  interviewer: z.string(),
  status: z.enum(['Scheduled', 'Completed', 'Rescheduled', 'Cancelled']),
  notes: z.string().optional(),
  meetingUrl: z.string().optional(),
});

export const GenerateResumeSchema = z.object({
  jobId: z.string().optional(),
  jobTitle: z.string(),
  company: z.string(),
  jobDescription: z.string().optional(),
});

export const UpdateAgentStateSchema = z.object({
  status: AgentStateStatusSchema,
  cadenceMinutes: z.number().min(5).max(1440).optional(),
});
