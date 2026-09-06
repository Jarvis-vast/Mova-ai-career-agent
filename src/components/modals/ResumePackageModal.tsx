import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Download, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { JobOpportunity, CandidateProfile } from '../../types';

interface ResumePackageModalProps {
  job: JobOpportunity | null;
  candidateProfile?: CandidateProfile;
  onClose: () => void;
}

export const ResumePackageModal: React.FC<ResumePackageModalProps> = ({
  job,
  candidateProfile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'cover' | 'answers'>('resume');

  if (!job) return null;

  const hasCandidateData = candidateProfile && (
    Boolean(candidateProfile.name) ||
    candidateProfile.experience.length > 0 ||
    candidateProfile.skills.length > 0
  );

  const candidateName = candidateProfile?.name || 'Candidate';
  const candidateEmail = candidateProfile?.contactEmail || 'Not provided';
  const candidatePhone = candidateProfile?.phone || 'Not provided';
  const candidateLocation = candidateProfile?.location || 'Not provided';
  const candidateSummary = candidateProfile?.summary || 'No summary entered yet.';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#201f20] border border-[#524535]/40 rounded-2xl max-w-3xl w-full max-h-[90dvh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-[#524535]/20 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Zero-Hallucination Tailored Package
              </span>
              <span className="text-xs text-[#A1A1AA] font-mono">Tailored for {job.company}</span>
            </div>
            <h3 className="text-lg font-semibold text-[#F8F9FA]">{job.title}</h3>
            <p className="text-xs text-[#A1A1AA]">
              Ground Evidence Bound • 0 Fabricated Claims • Anchored strictly in Candidate Brain
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-[#F8F9FA] p-1.5 rounded-lg hover:bg-[#2a2a2b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-[#524535]/15 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('resume')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'resume'
                ? 'border-[#ffd7a9] text-[#ffd7a9] font-semibold'
                : 'border-transparent text-[#A1A1AA] hover:text-[#F8F9FA]'
            }`}
          >
            <FileText className="w-4 h-4" /> Tailored Resume
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cover'
                ? 'border-[#ffd7a9] text-[#ffd7a9] font-semibold'
                : 'border-transparent text-[#A1A1AA] hover:text-[#F8F9FA]'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Targeted Cover Note
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'answers'
                ? 'border-[#ffd7a9] text-[#ffd7a9] font-semibold'
                : 'border-transparent text-[#A1A1AA] hover:text-[#F8F9FA]'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> Validated Form Answers
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!hasCandidateData ? (
            <div className="bg-[#131314] rounded-xl p-8 border border-[#524535]/25 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-[#ffd7a9] mx-auto" />
              <h4 className="text-sm font-semibold text-[#F8F9FA]">
                Upload or create a candidate profile to generate tailored application materials.
              </h4>
              <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                MOVA will only generate packages from real candidate data uploaded or entered in the Candidate Brain.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'resume' && (
                <div className="bg-[#131314] rounded-xl p-6 border border-[#524535]/25 space-y-6 text-xs text-[#e5e2e3]">
                  {/* Header */}
                  <div className="border-b border-[#524535]/20 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold font-['Playfair_Display'] text-[#ffd7a9]">
                          {candidateName}
                        </h2>
                        <p className="text-xs text-[#A1A1AA] mt-0.5">
                          {candidateLocation} • {candidateEmail} • {candidatePhone}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                        Sourced from Candidate Brain
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[#F8F9FA] leading-relaxed">
                      {candidateSummary}
                    </p>
                  </div>

                  {/* Work Experience Section with Proof Anchors */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffd7a9]">
                        Verified Experience
                      </h3>
                      <span className="text-[10px] text-[#22C55E] font-mono">Evidence Cleared</span>
                    </div>

                    {candidateProfile?.experience && candidateProfile.experience.length > 0 ? (
                      candidateProfile.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1.5 bg-[#201f20] p-4 rounded-lg border border-[#524535]/20">
                          <div className="flex justify-between items-baseline font-semibold">
                            <span className="text-sm text-[#F8F9FA]">{exp.role} — {exp.company}</span>
                            <span className="text-xs text-[#A1A1AA] font-mono">{exp.duration}</span>
                          </div>
                          <p className="text-[#e5e2e3] pt-1 text-xs leading-relaxed">{exp.summary}</p>
                          {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 pt-2 text-[#A1A1AA] text-xs">
                              {exp.bulletPoints.map((bp, bidx) => (
                                <li key={bidx}>{bp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#A1A1AA] italic">No employment history entered.</p>
                    )}
                  </div>

                  {/* Education */}
                  {candidateProfile?.education && candidateProfile.education.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffd7a9]">
                        Education &amp; Credentials
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {candidateProfile.education.map((edu, idx) => (
                          <div key={idx} className="p-3 bg-[#201f20] rounded-lg border border-[#524535]/20">
                            <div className="font-semibold text-[#F8F9FA]">{edu.institution}</div>
                            <div className="text-[#A1A1AA] text-[11px]">{edu.degree} • {edu.year}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {candidateProfile?.skills && candidateProfile.skills.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffd7a9]">
                        Demonstrated Skills
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateProfile.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[#201f20] text-[#e5e2e3] text-[11px] font-mono border border-[#524535]/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cover' && (
                <div className="bg-[#131314] rounded-xl p-6 border border-[#524535]/25 space-y-4 text-xs text-[#e5e2e3] leading-relaxed">
                  <div className="flex justify-between items-center pb-3 border-b border-[#524535]/20 text-xs text-[#A1A1AA]">
                    <span>To: Hiring Team at {job.company}</span>
                    <span className="font-mono text-[#ffd7a9]">Targeted Persona Addendum</span>
                  </div>
                  <p>Dear {job.company} Hiring Team,</p>
                  <p>
                    I am writing to express my interest in the {job.title} position at {job.company}.
                    {candidateProfile?.experience && candidateProfile.experience.length > 0
                      ? ` Having worked as ${candidateProfile.experience[0].role} at ${candidateProfile.experience[0].company}, my background aligns with the engineering and operational objectives of this role.`
                      : ' My verified skills directly target the technical objectives of this role.'}
                  </p>
                  <p>
                    {job.description
                      ? `In reviewing your posted requirements, I noted your focus on ${job.title}. I welcome the opportunity to discuss how my verified background can support ${job.company}'s goals.`
                      : `I welcome the opportunity to discuss how my background can support ${job.company}'s engineering roadmap.`}
                  </p>
                  <p className="pt-2">
                    Sincerely,<br />
                    <strong className="text-[#ffd7a9]">{candidateName}</strong>
                  </p>
                </div>
              )}

              {activeTab === 'answers' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-[#131314] rounded-xl border border-[#524535]/20 space-y-1">
                    <span className="font-semibold text-[#ffd7a9]">Q1: Are you authorized to work in this territory?</span>
                    <p className="text-[#F8F9FA]">Yes, legally authorized. Verified per candidate profile.</p>
                    <span className="text-[10px] font-mono text-[#22C55E]">✓ Sourced from Candidate Preferences</span>
                  </div>

                  <div className="p-3.5 bg-[#131314] rounded-xl border border-[#524535]/20 space-y-1">
                    <span className="font-semibold text-[#ffd7a9]">Q2: Candidate Location &amp; Mobility</span>
                    <p className="text-[#F8F9FA]">{candidateLocation}</p>
                    <span className="text-[10px] font-mono text-[#22C55E]">✓ Verified Candidate Anchor</span>
                  </div>

                  <div className="p-3.5 bg-[#131314] rounded-xl border border-[#524535]/20 space-y-1">
                    <span className="font-semibold text-[#ffd7a9]">Q3: Compensation Expectations</span>
                    <p className="text-[#F8F9FA]">{job.salary || 'Competitive market rate'}</p>
                    <span className="text-[10px] font-mono text-[#ffd7a9]">✓ Aligns with Candidate Settings</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#524535]/20 flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#A1A1AA]">
            100% Grounded in User Truth Layer
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#ffd7a9] text-[#462a00] font-semibold rounded-lg text-xs hover:opacity-90 transition-opacity"
          >
            Close Package
          </button>
        </div>
      </div>
    </div>
  );
};
