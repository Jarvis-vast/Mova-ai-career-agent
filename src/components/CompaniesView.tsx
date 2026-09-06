import React, { useState } from 'react';
import { Building2, ArrowUpRight, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { CompanyRadarItem, NavPath } from '../types';

interface CompaniesViewProps {
  companies: CompanyRadarItem[];
  onNavigate: (path: NavPath) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({ companies, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.techStack.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col w-full relative pb-20">
      <div className="px-8 py-8 max-w-[1440px] mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#524535]/15">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-['Playfair_Display'] text-[#F8F9FA]">
                Company Intelligence &amp; Radar
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20 font-bold uppercase tracking-widest">
                Direct Portal Radar
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
              Deterministic tracking of employer career portals, ATS adapters, and real hiring activity.
            </p>
          </div>

          {companies.length > 0 && (
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search companies, tech stack..."
                className="w-full bg-[#2a2a2b] border border-[#524535]/30 rounded-lg px-3.5 py-2 text-xs text-[#F8F9FA] placeholder:text-[#A1A1AA]/60 outline-none focus:border-[#ffd7a9]/60"
              />
            </div>
          )}
        </header>

        {/* Company Cards Grid or Honest Empty State */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((comp) => (
              <div
                key={comp.id}
                className="bg-[#2a2a2b] rounded-xl border border-[#524535]/25 p-6 shadow-sm space-y-4 hover:border-[#ffd7a9]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#F8F9FA]">{comp.name}</h3>
                      <p className="text-xs text-[#A1A1AA]">{comp.industry}</p>
                    </div>
                    {comp.directPortalRoiMultiplier && (
                      <span className="text-xs font-mono text-[#ffd7a9] bg-[#ffd7a9]/10 px-2.5 py-1 rounded border border-[#ffd7a9]/20 font-bold">
                        {comp.directPortalRoiMultiplier}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-[#131314] rounded-lg border border-[#524535]/20 space-y-2 text-xs">
                    {comp.verifiedResponseRate && (
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Observed Response:</span>
                        <span className="font-mono text-[#22C55E] font-bold">{comp.verifiedResponseRate}</span>
                      </div>
                    )}
                    {comp.hiringVelocity && (
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Hiring Velocity:</span>
                        <span className="font-mono text-[#F8F9FA] font-semibold">{comp.hiringVelocity}</span>
                      </div>
                    )}
                    {comp.adapterSupport && (
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">ATS Adapter:</span>
                        <span className="font-mono text-[#ffd7a9]">{comp.adapterSupport}</span>
                      </div>
                    )}
                    {comp.headquarters && (
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Headquarters:</span>
                        <span className="text-[#F8F9FA]">{comp.headquarters}</span>
                      </div>
                    )}
                  </div>

                  {comp.techStack && comp.techStack.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider block">
                        Observed Stack
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {comp.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-[#201f20] text-[#e5e2e3] text-[11px] font-mono border border-[#524535]/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#524535]/20 flex items-center justify-between">
                  <span className="text-xs text-[#A1A1AA]">
                    <strong className="text-[#ffd7a9] font-mono">{comp.activeOpportunities}</strong> active roles
                  </span>
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="text-xs font-semibold text-[#ffd7a9] hover:text-[#fff] flex items-center gap-1 transition-colors"
                  >
                    <span>View Roles</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#2a2a2b] rounded-2xl border border-[#524535]/25 p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#201f20] border border-[#524535]/30 flex items-center justify-center mx-auto text-[#ffd7a9]">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-[#F8F9FA]">
                No company intelligence records yet
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                MOVA builds company intelligence records as opportunities are researched and application adapters are exercised.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('jobs')}
                className="px-5 py-2.5 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <span>Discover Target Roles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
