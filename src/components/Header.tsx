import React, { useState } from 'react';
import { Search, Bell, Sparkles, CheckCircle, Clock, AlertTriangle, User, Brain, Linkedin } from 'lucide-react';
import { NavPath, CandidateProfile, MissionLogItem } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cycleNumber: number;
  isAgentActive: boolean;
  onNavigate: (path: NavPath) => void;
  onTriggerCycle: () => void;
  candidateProfile?: CandidateProfile;
  logs?: MissionLogItem[];
  onOpenLinkedInAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  cycleNumber,
  isAgentActive,
  onNavigate,
  onTriggerCycle,
  candidateProfile,
  logs = [],
  onOpenLinkedInAuth,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = candidateProfile?.name?.trim() || 'Candidate';
  const displayInitials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'C';

  const recentLogs = logs.slice(0, 5);

  return (
    <header className="fixed top-0 left-[240px] right-0 h-16 bg-[#131314]/85 backdrop-blur-xl border-b border-[#524535]/20 z-40 flex items-center justify-between px-8 select-none">
      {/* Search Bar */}
      <div className="flex-1 flex justify-center max-w-2xl mx-auto">
        <div className="w-full flex items-center bg-[#2a2a2b] px-4 py-2 rounded-full border border-[#524535]/30 focus-within:border-[#ffd7a9]/60 transition-all shadow-inner">
          <Search className="text-[#d6c3b0]/70 w-4 h-4 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roles, companies, pipeline..."
            className="bg-transparent border-none outline-none text-[#F8F9FA] text-xs md:text-sm w-full px-3 placeholder:text-[#A1A1AA]/60"
          />
          {searchQuery && (
            <button
              id="btn-search-clear"
              onClick={() => onSearchChange('')}
              className="text-[10px] text-[#A1A1AA] hover:text-[#F8F9FA] px-1.5 py-0.5 rounded bg-[#201f20]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 relative">
        {/* LinkedIn OAuth Integration Chip */}
        <button
          id="btn-header-linkedin-sync"
          onClick={onOpenLinkedInAuth}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-mono transition-all cursor-pointer ${
            candidateProfile?.linkedInAuth
              ? 'bg-[#0077b5]/15 border-[#0077b5]/40 text-[#60a5fa] hover:bg-[#0077b5]/25'
              : 'bg-[#2a2a2b]/80 border-[#524535]/30 text-[#ffd7a9] hover:bg-[#353436]'
          }`}
          title={
            candidateProfile?.linkedInAuth
              ? `LinkedIn Authenticated: ${candidateProfile.linkedInAuth.name}`
              : 'Connect Authentic LinkedIn Profile via OAuth 2.0'
          }
        >
          <Linkedin className={`w-3.5 h-3.5 ${candidateProfile?.linkedInAuth ? 'text-[#0077b5]' : 'text-[#A1A1AA]'}`} />
          <span>
            {candidateProfile?.linkedInAuth ? 'LINKEDIN LIVE' : 'CONNECT LINKEDIN'}
          </span>
        </button>

        {/* Cycle Cadence Badge */}
        <button
          id="btn-trigger-cycle"
          onClick={onTriggerCycle}
          title="Click to trigger immediate autonomous evaluation cycle"
          className="flex items-center gap-2 text-[#d6c3b0] bg-[#2a2a2b]/80 hover:bg-[#353436] px-3.5 py-1.5 rounded-full border border-[#524535]/30 transition-all cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ffd7a9] group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-mono text-[#F8F9FA] tracking-wide">
            CYCLE #{cycleNumber} · {isAgentActive ? 'OK' : 'PAUSED'}
          </span>
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative text-[#A1A1AA] hover:text-[#F8F9FA] transition-colors p-1.5 rounded-lg hover:bg-[#201f20]"
            title="Agent notifications"
          >
            <Bell className="w-5 h-5" />
            {recentLogs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffd7a9] rounded-full ring-2 ring-[#131314]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-[#201f20] border border-[#524535]/30 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#524535]/20">
                <span className="text-xs font-semibold text-[#F8F9FA] uppercase tracking-wider">
                  Live Agent Audit Log
                </span>
                <span className="text-[10px] font-mono text-[#ffd7a9] bg-[#ffd7a9]/10 px-1.5 py-0.5 rounded">
                  {recentLogs.length} events
                </span>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {recentLogs.length > 0 ? (
                  recentLogs.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg bg-[#2a2a2b]/60 border border-[#524535]/15 hover:border-[#ffd7a9]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#F8F9FA]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                          {n.headline}
                        </span>
                        <span className="text-[10px] text-[#A1A1AA] font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] mt-1 leading-snug">{n.subDetail}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[#A1A1AA]">
                    No agent activity recorded yet.
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  onNavigate('applications');
                }}
                className="w-full mt-3 py-1.5 text-center text-xs font-medium text-[#ffd7a9] bg-[#2a2a2b] hover:bg-[#353436] rounded-lg transition-colors border border-[#524535]/20"
              >
                Inspect All Pipeline Logs →
              </button>
            </div>
          )}
        </div>

        {/* User Profile Button */}
        <div className="relative">
          <button
            id="btn-profile-toggle"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="w-8 h-8 rounded-full bg-[#ffd7a9] text-[#462a00] flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity ring-2 ring-[#ffd7a9]/20 font-semibold text-xs"
            title={displayName}
          >
            {displayInitials}
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-64 bg-[#201f20] border border-[#524535]/30 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-[#524535]/20">
                <div className="w-10 h-10 rounded-full bg-[#ffd7a9] text-[#462a00] flex items-center justify-center font-bold text-sm">
                  {displayInitials}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F8F9FA]">{displayName}</h4>
                  <p className="text-[11px] text-[#A1A1AA]">
                    {candidateProfile?.title || 'Profile Incomplete'}
                  </p>
                  <span className="text-[9px] text-[#ffd7a9] font-mono">Candidate Brain</span>
                </div>
              </div>
              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('candidate-brain');
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-[#F8F9FA] hover:bg-[#2a2a2b] rounded-md transition-colors flex items-center justify-between"
                >
                  <span>Candidate Truth Layer</span>
                  <Brain className="w-3.5 h-3.5 text-[#ffd7a9]" />
                </button>
                {onOpenLinkedInAuth && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenLinkedInAuth();
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-[#ffd7a9] hover:bg-[#2a2a2b] rounded-md transition-colors flex items-center justify-between"
                  >
                    <span>{candidateProfile?.linkedInAuth ? 'LinkedIn Verified' : 'Connect LinkedIn OAuth'}</span>
                    <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-[#F8F9FA] hover:bg-[#2a2a2b] rounded-md transition-colors"
                >
                  Candidate Rules &amp; Safeguards
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
