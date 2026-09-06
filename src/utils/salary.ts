import { JobOpportunity } from '../types';

export interface ParsedSalary {
  min: number | null;
  max: number | null;
  midpoint: number | null;
  currency: string;
  isHourly: boolean;
  isDisclosed: boolean;
  raw: string;
}

export interface SalaryRangeBucket {
  id: string;
  label: string;
  shortLabel: string;
  minBound: number;
  maxBound: number;
  count: number;
  percentage: number;
  avgFitScore: number;
  jobs: JobOpportunity[];
  color: string;
}

export interface PipelineSalaryStats {
  totalJobs: number;
  disclosedCount: number;
  undisclosedCount: number;
  medianSalary: number | null;
  avgSalary: number | null;
  minSalary: number | null;
  maxSalary: number | null;
  highestRole: JobOpportunity | null;
  lowestRole: JobOpportunity | null;
  buckets: SalaryRangeBucket[];
}

/**
 * Standard bracket definitions for annual USD compensation.
 */
const BUCKET_DEFINITIONS = [
  { id: 'under_120k', label: 'Under $120k', shortLabel: '<$120k', minBound: 0, maxBound: 119999, color: '#94A3B8' },
  { id: '120k_150k', label: '$120k – $150k', shortLabel: '$120k–$150k', minBound: 120000, maxBound: 149999, color: '#eab308' },
  { id: '150k_180k', label: '$150k – $180k', shortLabel: '$150k–$180k', minBound: 150000, maxBound: 179999, color: '#ffd7a9' },
  { id: '180k_210k', label: '$180k – $210k', shortLabel: '$180k–$210k', minBound: 180000, maxBound: 209999, color: '#f97316' },
  { id: '210k_240k', label: '$210k – $240k', shortLabel: '$210k–$240k', minBound: 210000, maxBound: 239999, color: '#22C55E' },
  { id: '240k_plus', label: '$240k+', shortLabel: '$240k+', minBound: 240000, maxBound: Infinity, color: '#38bdf8' },
  { id: 'undisclosed', label: 'Competitive / Undisclosed', shortLabel: 'Undisclosed', minBound: -1, maxBound: -1, color: '#64748B' },
];

/**
 * Parses raw salary strings (e.g., "$160,000 / yr", "$150k - $200k", "$85/hr")
 * into normalized annualized numbers.
 */
export function parseSalary(salaryStr: string | undefined): ParsedSalary {
  if (!salaryStr || typeof salaryStr !== 'string') {
    return { min: null, max: null, midpoint: null, currency: '$', isHourly: false, isDisclosed: false, raw: 'Undisclosed' };
  }

  const clean = salaryStr.trim();
  const lower = clean.toLowerCase();

  // Check for undisclosed keywords
  if (
    lower.includes('competitive') ||
    lower.includes('undisclosed') ||
    lower.includes('not disclosed') ||
    lower.includes('doe') ||
    lower.includes('negotiable') ||
    lower.includes('not provided')
  ) {
    return { min: null, max: null, midpoint: null, currency: '$', isHourly: false, isDisclosed: false, raw: clean };
  }

  const isHourly = lower.includes('/hr') || lower.includes('/hour') || lower.includes('per hour') || lower.includes('ph');

  // Match all numbers, potentially with 'k', 'm', commas, decimals
  // E.g., "$150,000", "$150k", "150K", "180000"
  const numberMatches = clean.match(/\$?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?|\d+\.?\d*)\s*(k|m)?/gi);

  if (!numberMatches || numberMatches.length === 0) {
    return { min: null, max: null, midpoint: null, currency: '$', isHourly: false, isDisclosed: false, raw: clean };
  }

  const parsedValues: number[] = [];

  for (const token of numberMatches) {
    const t = token.replace(/[\$,\s]/g, '').toLowerCase();
    let num = 0;
    if (t.endsWith('k')) {
      num = parseFloat(t.slice(0, -1)) * 1000;
    } else if (t.endsWith('m')) {
      num = parseFloat(t.slice(0, -1)) * 1000000;
    } else {
      num = parseFloat(t);
      // If it looks like "150" in a context of salary without 'k', but between 50 and 999 and not hourly, assume k
      if (num >= 50 && num <= 999 && !isHourly) {
        num = num * 1000;
      }
    }

    if (!isNaN(num) && num > 0) {
      if (isHourly && num < 1000) {
        // Annualize 40 hrs/wk * 52 weeks = 2080 hrs
        num = Math.round(num * 2080);
      }
      parsedValues.push(num);
    }
  }

  if (parsedValues.length === 0) {
    return { min: null, max: null, midpoint: null, currency: '$', isHourly, isDisclosed: false, raw: clean };
  }

  const min = Math.min(...parsedValues);
  const max = Math.max(...parsedValues);
  const midpoint = Math.round((min + max) / 2);

  return {
    min,
    max,
    midpoint,
    currency: '$',
    isHourly,
    isDisclosed: true,
    raw: clean,
  };
}

/**
 * Calculates complete salary distribution across jobs in the pipeline.
 */
export function calculatePipelineSalaryDistribution(jobs: JobOpportunity[]): PipelineSalaryStats {
  const buckets: SalaryRangeBucket[] = BUCKET_DEFINITIONS.map((def) => ({
    ...def,
    count: 0,
    percentage: 0,
    avgFitScore: 0,
    jobs: [],
  }));

  const disclosedSalaries: { midpoint: number; job: JobOpportunity }[] = [];

  jobs.forEach((job) => {
    const parsed = parseSalary(job.salary);

    if (!parsed.isDisclosed || parsed.midpoint === null) {
      const undisclosedBucket = buckets.find((b) => b.id === 'undisclosed');
      if (undisclosedBucket) {
        undisclosedBucket.count += 1;
        undisclosedBucket.jobs.push(job);
      }
      return;
    }

    disclosedSalaries.push({ midpoint: parsed.midpoint, job });

    // Find bucket
    const mid = parsed.midpoint;
    const bucket = buckets.find(
      (b) => b.id !== 'undisclosed' && mid >= b.minBound && mid <= b.maxBound
    );

    if (bucket) {
      bucket.count += 1;
      bucket.jobs.push(job);
    } else {
      // Fallback to highest bracket if exceeds max
      const highest = buckets.find((b) => b.id === '240k_plus');
      if (highest) {
        highest.count += 1;
        highest.jobs.push(job);
      }
    }
  });

  const totalJobs = jobs.length;
  const disclosedCount = disclosedSalaries.length;
  const undisclosedCount = totalJobs - disclosedCount;

  // Calculate percentages and average fit scores
  buckets.forEach((b) => {
    b.percentage = totalJobs > 0 ? Math.round((b.count / totalJobs) * 100) : 0;
    if (b.jobs.length > 0) {
      const sumFit = b.jobs.reduce((acc, curr) => acc + (curr.fitScore || 0), 0);
      b.avgFitScore = Math.round(sumFit / b.jobs.length);
    }
  });

  let medianSalary: number | null = null;
  let avgSalary: number | null = null;
  let minSalary: number | null = null;
  let maxSalary: number | null = null;
  let highestRole: JobOpportunity | null = null;
  let lowestRole: JobOpportunity | null = null;

  if (disclosedCount > 0) {
    disclosedSalaries.sort((a, b) => a.midpoint - b.midpoint);
    minSalary = disclosedSalaries[0].midpoint;
    maxSalary = disclosedSalaries[disclosedSalaries.length - 1].midpoint;
    lowestRole = disclosedSalaries[0].job;
    highestRole = disclosedSalaries[disclosedSalaries.length - 1].job;

    const sum = disclosedSalaries.reduce((acc, curr) => acc + curr.midpoint, 0);
    avgSalary = Math.round(sum / disclosedCount);

    const midIdx = Math.floor(disclosedCount / 2);
    if (disclosedCount % 2 === 0) {
      medianSalary = Math.round((disclosedSalaries[midIdx - 1].midpoint + disclosedSalaries[midIdx].midpoint) / 2);
    } else {
      medianSalary = disclosedSalaries[midIdx].midpoint;
    }
  }

  return {
    totalJobs,
    disclosedCount,
    undisclosedCount,
    medianSalary,
    avgSalary,
    minSalary,
    maxSalary,
    highestRole,
    lowestRole,
    buckets,
  };
}

/**
 * Format currency number to standard compact/full USD display (e.g. $185,000 or $185k)
 */
export function formatSalaryUsd(amount: number | null | undefined, compact = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
  if (compact) {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${Math.round(amount / 1000)}k`;
    return `$${amount}`;
  }
  return `$${amount.toLocaleString()}`;
}
