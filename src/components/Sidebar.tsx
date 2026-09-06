import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Building2,
  Repeat,
  Video,
  BrainCircuit,
  BarChart3,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { NavPath } from '../types';

interface SidebarProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  isAgentActive: boolean;
  cycleCadenceMinutes: number;
  jobsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isAgentActive,
  cycleCadenceMinutes,
  jobsCount = 0,
}) => {
  const navItems = [
    { id: 'overview' as NavPath, label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs' as NavPath, label: 'Jobs', icon: Briefcase },
    { id: 'applications' as NavPath, label: 'Applications', icon: CheckSquare },
    { id: 'companies' as NavPath, label: 'Companies', icon: Building2 },
    { id: 'follow-ups' as NavPath, label: 'Follow-ups', icon: Repeat },
    { id: 'interviews' as NavPath, label: 'Interviews', icon: Video },
    { id: 'candidate-brain' as NavPath, label: 'Candidate Brain', icon: BrainCircuit },
    { id: 'analytics' as NavPath, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-[#0e0e0f] border-r border-[#524535]/25 z-50 flex flex-col select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 mb-3">
        <button
          id="btn-brand-home"
          onClick={() => onNavigate('overview')}
          className="group flex items-center gap-2.5 focus:outline-none"
        >
          <div className="px-3 py-1 rounded border border-[#ffd7a9]/40 bg-[#2a2a2b]/60 shadow-[0_0_15px_rgba(255,215,169,0.12)] transition-all group-hover:border-[#ffd7a9]/80">
            <span className="text-[#ffd7a9] font-['Playfair_Display'] text-xl font-bold tracking-widest drop-shadow-[0_0_8px_rgba(255,215,169,0.4)]">
              MOVA
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider bg-[#201f20] px-1.5 py-0.5 rounded border border-[#524535]/20">
            v1.0
          </span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-[#2a2a2b] text-[#ffd7a9] border-l-2 border-[#ffd7a9] font-semibold shadow-sm'
                  : 'text-[#d6c3b0]/80 hover:bg-[#201f20] hover:text-[#F8F9FA]'
              }`}
            >
              <Icon
                className={`mr-3 w-4 h-4 transition-colors ${
                  isActive ? 'text-[#ffd7a9]' : 'text-[#A1A1AA] group-hover:text-[#F8F9FA]'
                }`}
              />
              <span className="font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Area with Settings & Agent Status Pill */}
      <div className="mt-auto px-3 border-t border-[#524535]/15 pt-3 pb-5 space-y-3">
        <button
          id="nav-settings"
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all text-left ${
            currentPath === 'settings'
              ? 'bg-[#2a2a2b] text-[#ffd7a9] border-l-2 border-[#ffd7a9] font-semibold'
              : 'text-[#d6c3b0]/80 hover:bg-[#201f20] hover:text-[#F8F9FA]'
          }`}
        >
          <Settings className="mr-3 w-4 h-4 text-[#A1A1AA]" />
          <span className="font-medium">Settings</span>
        </button>

        {/* Persistent Agent Status Widget */}
        <div className="px-3.5 py-3 bg-[#2a2a2b]/50 rounded-xl border border-[#524535]/25">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAgentActive ? 'bg-[#22C55E] pulse-dot' : 'bg-[#EF4444]'
                }`}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd7a9]">
                {isAgentActive ? 'Agent Active' : 'Agent Paused'}
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#A1A1AA] bg-[#201f20] px-1.5 py-0.5 rounded border border-[#524535]/20">
              {cycleCadenceMinutes}M
            </span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] leading-tight">
            {isAgentActive
              ? jobsCount > 0
                ? `Monitoring ${jobsCount} opportunities`
                : 'Awaiting discovery cycle'
              : 'Execution paused by user'}
          </p>
          <div className="mt-2 pt-2 border-t border-[#524535]/15 flex items-center justify-between text-[10px] text-[#A1A1AA]">
            <span className="flex items-center gap-1 text-[#22C55E]">
              <ShieldCheck className="w-3 h-3" /> Zero Violations
            </span>
            <span className="font-mono">Deterministic</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
