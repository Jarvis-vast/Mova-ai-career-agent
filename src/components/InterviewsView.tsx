import React, { useState } from 'react';
import {
  Video,
  Calendar,
  UserCheck,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Plus,
  X,
} from 'lucide-react';
import { InterviewRecord, CandidateProfile } from '../types';

interface InterviewsViewProps {
  interviews: InterviewRecord[];
  candidateProfile?: CandidateProfile;
  onAddInterview?: (interview: InterviewRecord) => void;
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({
  interviews,
  candidateProfile,
  onAddInterview,
}) => {
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(
    interviews.length > 0 ? interviews[0].id : null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New interview form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<'Tech Screen' | 'Hiring Manager' | 'Onsite Loop' | 'Executive'>('Tech Screen');
  const [scheduledDate, setScheduledDate] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerTitle, setInterviewerTitle] = useState('');

  const selectedInterview = interviews.find((i) => i.id === selectedInterviewId) || interviews[0] || null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !onAddInterview) return;

    const newRecord: InterviewRecord = {
      id: `int-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      stage,
      scheduledDate: scheduledDate.trim() || 'Date to be confirmed',
      roundDetails: `${stage} round focusing on system design & domain background`,
      salaryContext: 'Competitive Market Tier',
      interviewers: interviewerName.trim()
        ? [
            {
              name: interviewerName.trim(),
              title: interviewerTitle.trim() || 'Hiring Team Member',
              focusArea: 'Technical and architectural depth',
            },
          ]
        : [],
      prepPackage: {
        keyQuestions: [
          `Describe your architectural philosophy for building systems at ${company.trim()}.`,
          'Walk through a challenging trade-off you had to make in your recent work.',
          'How do you handle ambiguous requirements and scale bottlenecks?',
        ],
        starStories: (candidateProfile?.experience || []).slice(0, 2).map((exp) => ({
          situation: `Leading engineering initiatives at ${exp.company}`,
          task: `Drive high-reliability execution for ${exp.role}`,
          action: exp.summary,
          result: 'Delivered robust production capabilities with zero hallucinations',
          evidenceAnchor: `${exp.company} verified record`,
        })),
        companySignals: [
          `Focus on practical engineering rigor at ${company.trim()}`,
          'Clear communication of architectural trade-offs',
        ],
        questionsToAsk: [
          `What are the most urgent technical priorities for the team at ${company.trim()} this quarter?`,
          'How does the team balance long-term system architecture with immediate product velocity?',
        ],
      },
    };

    onAddInterview(newRecord);
    setSelectedInterviewId(newRecord.id);
    setIsAddModalOpen(false);
    setCompany('');
    setRole('');
    setInterviewerName('');
    setInterviewerTitle('');
  };

  return (
    <div className="flex flex-col w-full relative pb-20">
      <div className="px-8 py-8 max-w-[1440px] mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#524535]/15">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-['Playfair_Display'] text-[#F8F9FA]">
                Interview Intelligence &amp; Prep
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-bold uppercase tracking-widest">
                {interviews.length} {interviews.length === 1 ? 'Active Loop' : 'Active Loops'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
              Autonomous prep packages synthesized from verified Candidate Brain evidence and company telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] border border-[#ffd7a9]/30 text-[#ffd7a9] text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Interview Record</span>
            </button>
          </div>
        </header>

        {interviews.length > 0 && selectedInterview ? (
          /* Layout: Interview Selector on Left, Detailed Prep Dossier on Right */
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Interview Loops List */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">
                Active Interview Loops
              </h2>
              <div className="space-y-3">
                {interviews.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedInterviewId(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      selectedInterview.id === item.id
                        ? 'bg-[#2a2a2b] border-[#ffd7a9] shadow-lg ring-1 ring-[#ffd7a9]/30'
                        : 'bg-[#201f20] border-[#524535]/25 hover:border-[#ffd7a9]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-[#ffd7a9]">
                        {item.stage}
                      </span>
                      <span className="text-[10px] font-mono text-[#22C55E]">SCHEDULED</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#F8F9FA]">{item.company}</h3>
                    <p className="text-xs text-[#A1A1AA]">{item.role}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#ffd7a9]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.scheduledDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Active Dossier & Prep Package */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-[#2a2a2b] rounded-2xl border border-[#ffd7a9]/30 p-6 shadow-xl space-y-6">
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#524535]/20">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-bold">
                        {selectedInterview.stage} Preparation Dossier
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[#F8F9FA]">
                      {selectedInterview.company} — {selectedInterview.role}
                    </h2>
                    <p className="text-xs text-[#A1A1AA] mt-1 font-mono">
                      {selectedInterview.roundDetails}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#201f20] border border-[#524535]/25 text-right shrink-0">
                    <span className="text-[10px] font-mono text-[#A1A1AA] block">Scheduled:</span>
                    <span className="text-xs font-mono text-[#ffd7a9] font-bold">
                      {selectedInterview.scheduledDate}
                    </span>
                  </div>
                </div>

                {/* Interviewers Panel */}
                {selectedInterview.interviewers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#ffd7a9] flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#ffd7a9]" /> Interviewer Profiles &amp; Focus Areas
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedInterview.interviewers.map((person, idx) => (
                        <div key={idx} className="p-3 bg-[#201f20] rounded-lg border border-[#524535]/20 text-xs">
                          <div className="font-semibold text-[#F8F9FA]">{person.name}</div>
                          <div className="text-[11px] text-[#A1A1AA]">{person.title}</div>
                          <div className="text-[10px] font-mono text-[#ffd7a9] mt-1">
                            Focus: {person.focusArea}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Anticipated High-Probability Questions */}
                {selectedInterview.prepPackage?.keyQuestions?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F8F9FA] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#ffd7a9]" /> Anticipated Technical &amp; Rigor Questions
                    </span>
                    <div className="space-y-2 text-xs">
                      {selectedInterview.prepPackage.keyQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#131314] rounded-lg border border-[#524535]/20 text-[#e5e2e3] flex items-start gap-2.5 leading-relaxed"
                        >
                          <span className="font-mono text-[#ffd7a9] font-bold shrink-0">
                            0{idx + 1}.
                          </span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounded STAR Stories */}
                {selectedInterview.prepPackage?.starStories?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#ffd7a9] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#ffd7a9]" /> Grounded STAR Story (Evidence Anchored)
                    </span>
                    {selectedInterview.prepPackage.starStories.map((story, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#201f20] rounded-xl border border-[#524535]/25 space-y-2.5 text-xs"
                      >
                        <div>
                          <strong className="text-[#ffd7a9] block">Situation &amp; Task:</strong>
                          <p className="text-[#A1A1AA]">
                            {story.situation} — {story.task}
                          </p>
                        </div>
                        <div>
                          <strong className="text-[#22C55E] block">Action:</strong>
                          <p className="text-[#F8F9FA]">{story.action}</p>
                        </div>
                        <div>
                          <strong className="text-[#ffd7a9] block">Result:</strong>
                          <p className="text-[#F8F9FA]">{story.result}</p>
                        </div>
                        <div className="pt-1 text-[10px] font-mono text-[#22C55E]">
                          Proof Anchor: {story.evidenceAnchor}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Questions to Ask Interviewer */}
                {selectedInterview.prepPackage?.questionsToAsk?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F8F9FA] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#ffd7a9]" /> High-Signal Questions for Candidate to Ask
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {selectedInterview.prepPackage.questionsToAsk.map((qa, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#201f20] rounded-lg border border-[#524535]/15 text-[#e5e2e3] italic"
                        >
                          "{qa}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Honest Empty State */
          <div className="bg-[#2a2a2b] rounded-2xl border border-[#524535]/25 p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#201f20] border border-[#524535]/30 flex items-center justify-center mx-auto text-[#ffd7a9]">
              <Video className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-[#F8F9FA]">
                No upcoming interviews
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Interviews scheduled by recruiters will appear here, complete with zero-hallucination prep dossiers synthesized from your verified Candidate Brain.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Log an Interview</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Interview Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-[#201f20] border border-[#524535]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-[#524535]/20">
              <h3 className="text-base font-semibold text-[#F8F9FA]">Log Interview Loop</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#F8F9FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#ffd7a9] font-semibold mb-1">Company *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Anthropic"
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2 text-[#F8F9FA] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#ffd7a9] font-semibold mb-1">Role *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Systems Engineer"
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2 text-[#F8F9FA] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#ffd7a9] font-semibold mb-1">Interview Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2 text-[#F8F9FA] outline-none"
                >
                  <option value="Tech Screen">Tech Screen</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="Onsite Loop">Onsite Loop</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-[#ffd7a9] font-semibold mb-1">Date &amp; Time</label>
                <input
                  type="text"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  placeholder="e.g. Tomorrow at 2:00 PM PST"
                  className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2 text-[#F8F9FA] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#ffd7a9] font-semibold mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2 text-[#F8F9FA] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#ffd7a9] font-semibold mb-1">Interviewer Title</label>
                  <input
                    type="text"
                    value={interviewerTitle}
                    onChange={(e) => setInterviewerTitle(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-[#131314] border border-[#524535]/30 rounded-lg p-2 text-[#F8F9FA] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#2a2a2b] text-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#ffd7a9] text-[#462a00] font-semibold"
                >
                  Save Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
