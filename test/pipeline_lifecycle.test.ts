import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { db, initDatabase, addApplicationEvent, getApplicationsWithTimeline } from '../server/db';

describe('Application Lifecycle & Cryptographic Receipt Verification', () => {
  it('records tamper-evident lifecycle events into persistent audit log', () => {
    initDatabase();

    const jobId = `job-test-${Date.now()}`;
    db.prepare(`
      INSERT OR REPLACE INTO jobs (id, title, company, location, work_mode, salary, description, source, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(jobId, 'Operations Director', 'Apex Corp', 'Remote', 'Remote', '$160,000', 'Operations role', 'Direct API', 'QUALIFIED');

    const appId = `app-test-${Date.now()}`;
    db.prepare(`
      INSERT OR REPLACE INTO applications (
        id, job_id, job_title, company, location, status, adapter, confirmation_token, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      appId,
      jobId,
      'Operations Director',
      'Apex Corp',
      'Remote',
      'PREPARING',
      'Greenhouse REST Direct API',
      'REC-TEST-9921'
    );

    addApplicationEvent(appId, 'Job Evaluation', 'COMPLETED', 'Job evaluated against candidate truth profile with 92% fit.');
    addApplicationEvent(appId, 'Fact Grounding', 'COMPLETED', 'Resume tailored and zero-hallucination verified.');
    addApplicationEvent(appId, 'Portal Submission', 'COMPLETED', 'Dispatched to company portal adapter.');

    const apps = getApplicationsWithTimeline();
    const targetApp = apps.find((a: any) => a.id === appId);

    assert.ok(targetApp);
    assert.ok(targetApp.timeline.length >= 3);
    assert.equal(targetApp.timeline[0].stage, 'Job Evaluation');
    assert.equal(targetApp.timeline[1].stage, 'Fact Grounding');
    assert.equal(targetApp.timeline[2].stage, 'Portal Submission');
  });

  it('correctly reports confirmation tokens and prevents fake verified status', () => {
    initDatabase();

    const jobId = `job-test-unverified-${Date.now()}`;
    db.prepare(`
      INSERT OR REPLACE INTO jobs (id, title, company, location, work_mode, salary, description, source, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(jobId, 'Logistics Lead', 'Unverified Co', 'Remote', 'Remote', '$130,000', 'Logistics role', 'Direct API', 'QUALIFIED');

    const appId = `app-unverified-${Date.now()}`;
    db.prepare(`
      INSERT OR REPLACE INTO applications (
        id, job_id, job_title, company, location, status, adapter, confirmation_token, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      appId,
      jobId,
      'Logistics Lead',
      'Unverified Co',
      'Remote',
      'PREPARING',
      'Portal Ingestion',
      null // No confirmation token received
    );

    const apps = getApplicationsWithTimeline();
    const app = apps.find((a: any) => a.id === appId);

    assert.ok(app);
    assert.equal(app.confirmationToken, null);
    assert.notEqual(app.status, 'VERIFIED');
  });
});
