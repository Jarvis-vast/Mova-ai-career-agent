import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCanonicalJobKey,
  evaluateJobAgainstCandidate,
  CandidateTruthData,
} from '../server/engine';
import { extractFactsFromResumeText } from '../server/evidence';

describe('MOVA Truth & Grounding Engine Tests', () => {
  describe('Canonical Job Key & Deduplication', () => {
    it('normalizes job title and company across casing and special characters', () => {
      const key1 = generateCanonicalJobKey('Senior Operations Lead', 'Acme Corp');
      const key2 = generateCanonicalJobKey('  senior operations lead! ', 'Acme, Corp.');
      const key3 = generateCanonicalJobKey('SENIOR OPERATIONS LEAD', 'ACME CORP');

      assert.equal(key1, key2);
      assert.equal(key2, key3);
    });

    it('distinguishes different companies with identical titles', () => {
      const keyA = generateCanonicalJobKey('Staff Engineer', 'Company A');
      const keyB = generateCanonicalJobKey('Staff Engineer', 'Company B');
      assert.notEqual(keyA, keyB);
    });
  });

  describe('Candidate Brain Evidence Extraction', () => {
    it('extracts verified skills from resume text without hallucinations', () => {
      const sampleResume = `
        Alex Mercer
        Senior Infrastructure Lead
        San Francisco, CA • alex@example.com
        
        EXPERIENCE
        Staff Infrastructure Engineer — CloudFlow Inc (2021 - Present)
        Led Kubernetes cluster deployment across multi-cloud regions.
        Architected PostgreSQL replication pipelines with TypeScript and Terraform.

        EDUCATION
        B.S. in Computer Science — University of Washington (2018)

        SKILLS
        Kubernetes, Terraform, TypeScript, PostgreSQL, Docker, AWS
      `;

      const { facts } = extractFactsFromResumeText(sampleResume);

      // Verify facts were extracted
      assert.ok(facts.length > 0);

      // Verify skills are present
      const skillFacts = facts.filter((f) => f.factType === 'skill');
      const skillValues = skillFacts.map((f) => f.value.toLowerCase());
      assert.ok(skillValues.includes('kubernetes'));
      assert.ok(skillValues.includes('typescript'));
      assert.ok(skillValues.includes('postgresql'));

      // Verify all facts have provenance metadata
      for (const fact of facts) {
        assert.ok(fact.source === 'Uploaded Resume');
        assert.ok(fact.confidence >= 0 && fact.confidence <= 1.0);
        assert.ok(['VERIFIED', 'INFERRED', 'UNVERIFIED', 'UNKNOWN'].includes(fact.status));
      }

      // Verify no phantom skill was invented
      assert.ok(!skillValues.includes('quantum computing'));
      assert.ok(!skillValues.includes('brain surgery'));
    });

    it('handles sparse text safely by marking unknowns rather than hallucinating', () => {
      const minimalText = 'Software engineer looking for remote roles.';
      const { facts } = extractFactsFromResumeText(minimalText);

      // Should not hallucinate colleges or full experience blocks
      const eduFacts = facts.filter((f) => f.factType === 'education');
      assert.ok(eduFacts.length <= 1); // Only UNKNOWN marker or none
    });
  });

  describe('7-Dimension Explainable Job Matching', () => {
    const candidate: CandidateTruthData = {
      id: 'cand-1',
      name: 'Elena Rostova',
      location: 'Remote',
      relocationAllowed: false,
      rules: {
        locationConstraint: 'Remote',
        salaryFloor: '$140,000',
        relocationAllowed: false,
        blacklistedKeywords: ['Blocked Corp', 'Junior', 'Intern', 'Contract Only'],
        minFitScore: 80,
      },
      skills: [
        { name: 'Operations Management', proficiency: 95, verified: true },
        { name: 'Process Automation', proficiency: 90, verified: true },
        { name: 'Workday', proficiency: 85, verified: true },
        { name: 'Jira', proficiency: 90, verified: true },
        { name: 'SQL', proficiency: 80, verified: true },
      ],
      experiences: [
        {
          title: 'Senior Operations Manager',
          company: 'Nexus Scale',
          period: '2021 - Present',
          current: true,
          description: 'Scaled business systems',
          achievements: ['Reduced incident response by 40%'],
          classification: 'VERIFIED',
        },
        {
          title: 'Operations Lead',
          company: 'LogiGlobal',
          period: '2018 - 2021',
          current: false,
          description: 'Operations leadership',
          achievements: ['Automated dispatch'],
          classification: 'VERIFIED',
        },
        {
          title: 'Process Specialist',
          company: 'OpsWorks',
          period: '2015 - 2018',
          current: false,
          description: 'Workflow design',
          achievements: ['Created SOPs'],
          classification: 'VERIFIED',
        },
      ],
    };

    it('correctly qualifies a highly aligned role', () => {
      const job = {
        id: 'job-1',
        title: 'Senior Operations Lead',
        company: 'Vanguard Systems',
        location: 'Remote',
        salary: '$160,000 - $185,000',
        description: 'Lead operational scaling and business process automation with Workday and SQL.',
        requiredSkills: ['Operations Management', 'Process Automation', 'Workday'],
      };

      const result = evaluateJobAgainstCandidate(job, candidate);

      assert.equal(result.hardConstraintsPassed, true);
      assert.ok(result.fitScore >= 80, `Expected score >= 80, got ${result.fitScore}`);
      assert.ok(result.scoreBreakdown.skillsMatch >= 80);
      assert.ok(result.scoreBreakdown.experienceMatch >= 80);
      assert.ok(result.scoreBreakdown.locationMatch >= 80);
      assert.equal(result.status, 'SCHEDULED');
    });

    it('hard-blocks a job from an excluded/blacklisted company', () => {
      const job = {
        id: 'job-2',
        title: 'Senior Operations Lead',
        company: 'Blocked Corp Inc',
        location: 'Remote',
        salary: '$170,000',
        description: 'Operations lead role.',
        requiredSkills: ['Operations Management'],
      };

      const result = evaluateJobAgainstCandidate(job, candidate);

      assert.equal(result.hardConstraintsPassed, false);
      assert.equal(result.status, 'BLOCKED');
      assert.ok(result.hardConstraintDetails.failureReasons.some((f) => f.includes('Blocked Corp')));
    });

    it('hard-blocks a job that fails minimum compensation rules', () => {
      const job = {
        id: 'job-3',
        title: 'Senior Operations Lead',
        company: 'Frugal Inc',
        location: 'Remote',
        salary: '$80,000 - $95,000',
        description: 'Operations role.',
        requiredSkills: ['Operations Management'],
      };

      const result = evaluateJobAgainstCandidate(job, candidate);

      assert.equal(result.hardConstraintsPassed, false);
      assert.equal(result.status, 'BLOCKED');
      assert.ok(result.hardConstraintDetails.failureReasons.some((f) => f.includes('salary') || f.includes('compensation') || f.includes('floor')));
    });

    it('hard-blocks a job containing excluded title keywords in blacklist', () => {
      const job = {
        id: 'job-4',
        title: 'Junior Operations Assistant',
        company: 'Growth Co',
        location: 'Remote',
        salary: '$150,000',
        description: 'Junior assistant role.',
        requiredSkills: ['Operations Management'],
      };

      const result = evaluateJobAgainstCandidate(job, candidate);

      assert.equal(result.hardConstraintsPassed, false);
      assert.equal(result.status, 'BLOCKED');
      assert.ok(result.hardConstraintDetails.failureReasons.some((f) => f.includes('Junior')));
    });
  });
});
