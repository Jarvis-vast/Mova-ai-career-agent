import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  DollarSign,
  Briefcase,
  Sparkles,
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Building2,
  MapPin,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { JobOpportunity, NavPath } from '../types';
import {
  calculatePipelineSalaryDistribution,
  formatSalaryUsd,
  SalaryRangeBucket,
} from '../utils/salary';

interface SalaryDistributionChartProps {
  jobs: JobOpportunity[];
  onNavigate?: (path: NavPath) => void;
  onSelectJob?: (job: JobOpportunity) => void;
}

export const SalaryDistributionChart: React.FC<SalaryDistributionChartProps> = ({
  jobs,
  onNavigate,
  onSelectJob,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'qualified' | 'remote'>('all');
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);

  // Filter jobs according to user selection
  const filteredJobs = useMemo(() => {
    if (filterMode === 'qualified') {
      return jobs.filter((j) => j.fitScore >= 80 && j.hardConstraintsPassed);
    }
    if (filterMode === 'remote') {
      return jobs.filter(
        (j) =>
          j.workMode === 'Remote' ||
          j.location.toLowerCase().includes('remote')
      );
    }
    return jobs;
  }, [jobs, filterMode]);

  // Compute salary distribution stats
  const stats = useMemo(() => {
    return calculatePipelineSalaryDistribution(filteredJobs);
  }, [filteredJobs]);

  const activeBucket = useMemo(() => {
    if (!selectedBucketId) return null;
    return stats.buckets.find((b) => b.id === selectedBucketId) || null;
  }, [selectedBucketId, stats.buckets]);

  // Prepare data for recharts
  const chartData = useMemo(() => {
    return stats.buckets.map((bucket) => ({
      id: bucket.id,
      name: bucket.shortLabel,
      fullName: bucket.label,
      count: bucket.count,
      percentage: bucket.percentage,
      avgFitScore: bucket.avgFitScore,
      color: bucket.color,
      jobs: bucket.jobs,
    }));
  }, [stats.buckets]);

  // Max count to scale Y-axis smoothly
  const maxJobCount = useMemo(() => {
    const counts = chartData.map((d) => d.count);
    return Math.max(3, ...counts) + 1;
  }, [chartData]);

  return (
    <section
      id="salary-distribution-section"
      className="bg-[#2a2a2b] rounded-2xl border border-[#524535]/25 p-6 md:p-8 space-y-6 shadow-sm"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#524535]/20 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffd7a9]/10 border border-[#ffd7a9]/30 flex items-center justify-center text-[#ffd7a9]">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-['Playfair_Display'] text-[#F8F9FA]">
              Pipeline Compensation Distribution
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ffd7a9]/15 text-[#ffd7a9] border border-[#ffd7a9]/30 font-semibold">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'Role' : 'Roles'}
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Distribution of base salary bands across all opportunities currently tracked in the pipeline.
          </p>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#201f20] border border-[#524535]/30 rounded-lg text-xs font-mono">
          <button
            id="filter-salary-all"
            type="button"
            onClick={() => {
              setFilterMode('all');
              setSelectedBucketId(null);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterMode === 'all'
                ? 'bg-[#ffd7a9] text-[#462a00] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#e5e2e3]'
            }`}
          >
            All Roles ({jobs.length})
          </button>
          <button
            id="filter-salary-qualified"
            type="button"
            onClick={() => {
              setFilterMode('qualified');
              setSelectedBucketId(null);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterMode === 'qualified'
                ? 'bg-[#ffd7a9] text-[#462a00] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#e5e2e3]'
            }`}
          >
            Qualified (Fit ≥ 80%)
          </button>
          <button
            id="filter-salary-remote"
            type="button"
            onClick={() => {
              setFilterMode('remote');
              setSelectedBucketId(null);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterMode === 'remote'
                ? 'bg-[#ffd7a9] text-[#462a00] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#e5e2e3]'
            }`}
          >
            Remote Roles
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#201f20] border border-[#524535]/30 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            Median Stated Salary
          </span>
          <div className="text-2xl font-bold font-['Playfair_Display'] text-[#ffd7a9]">
            {stats.medianSalary ? formatSalaryUsd(stats.medianSalary) : 'N/A'}
          </div>
          <p className="text-[11px] text-[#A1A1AA] font-mono">
            {stats.disclosedCount} disclosed of {stats.totalJobs} total
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#201f20] border border-[#524535]/30 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            Active Pipeline Range
          </span>
          <div className="text-2xl font-bold font-['Playfair_Display'] text-[#F8F9FA]">
            {stats.minSalary && stats.maxSalary
              ? `${formatSalaryUsd(stats.minSalary, true)} – ${formatSalaryUsd(stats.maxSalary, true)}`
              : 'N/A'}
          </div>
          <p className="text-[11px] text-[#22C55E] font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3 inline" /> Stated annual compensation
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#201f20] border border-[#524535]/30 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            Disclosure Ratio
          </span>
          <div className="text-2xl font-bold font-['Playfair_Display'] text-[#22C55E]">
            {stats.totalJobs > 0
              ? `${Math.round((stats.disclosedCount / stats.totalJobs) * 100)}%`
              : '0%'}
          </div>
          <p className="text-[11px] text-[#A1A1AA] font-mono">
            {stats.undisclosedCount} undisclosed / competitive
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#201f20] border border-[#524535]/30 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            Highest Pipeline Anchor
          </span>
          <div className="text-2xl font-bold font-['Playfair_Display'] text-[#ffd7a9] truncate">
            {stats.highestRole ? formatSalaryUsd(stats.maxSalary) : 'N/A'}
          </div>
          <p className="text-[11px] text-[#A1A1AA] font-mono truncate" title={stats.highestRole ? `${stats.highestRole.company} · ${stats.highestRole.title}` : ''}>
            {stats.highestRole ? `${stats.highestRole.company}` : 'No anchored roles'}
          </p>
        </div>
      </div>

      {/* Main Chart Area */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd7a9]" />
              Click any column bar to view roles within that salary bracket.
            </span>
            {selectedBucketId && (
              <button
                type="button"
                onClick={() => setSelectedBucketId(null)}
                className="text-[11px] font-mono text-[#ffd7a9] hover:underline flex items-center gap-1"
              >
                <span>Clear Selection</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div
            id="recharts-salary-distribution-container"
            className="w-full h-72 md:h-80 bg-[#201f20] rounded-xl p-4 border border-[#524535]/20"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const payload = e.activePayload[0].payload;
                    if (payload && payload.id) {
                      setSelectedBucketId((prev) => (prev === payload.id ? null : payload.id));
                    }
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#353436" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#A1A1AA"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#524535', strokeOpacity: 0.4 }}
                  tick={{ fill: '#A1A1AA' }}
                  dy={10}
                />
                <YAxis
                  stroke="#A1A1AA"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#524535', strokeOpacity: 0.4 }}
                  tick={{ fill: '#A1A1AA' }}
                  allowDecimals={false}
                  domain={[0, maxJobCount]}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 215, 169, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload as (typeof chartData)[0];
                      return (
                        <div className="bg-[#181819] border border-[#ffd7a9]/40 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 max-w-xs z-50">
                          <div className="flex items-center justify-between gap-3 border-b border-[#524535]/30 pb-2">
                            <span className="font-bold text-[#F8F9FA] text-sm">
                              {data.fullName}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                              style={{
                                backgroundColor: `${data.color}20`,
                                color: data.color,
                                border: `1px solid ${data.color}40`,
                              }}
                            >
                              {data.count} {data.count === 1 ? 'Job' : 'Jobs'} ({data.percentage}%)
                            </span>
                          </div>

                          {data.avgFitScore > 0 && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[#A1A1AA]">Average Fit Score:</span>
                              <span className="font-mono font-semibold text-[#22C55E]">
                                {data.avgFitScore}%
                              </span>
                            </div>
                          )}

                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                              Opportunities Preview:
                            </span>
                            {data.jobs.length > 0 ? (
                              <div className="space-y-1 max-h-36 overflow-y-auto">
                                {data.jobs.slice(0, 3).map((job) => (
                                  <div
                                    key={job.id}
                                    className="p-1.5 rounded bg-[#201f20] border border-[#524535]/20 text-[11px]"
                                  >
                                    <div className="font-semibold text-[#ffd7a9] truncate">
                                      {job.title}
                                    </div>
                                    <div className="text-[10px] text-[#A1A1AA] flex justify-between">
                                      <span className="truncate">{job.company}</span>
                                      <span className="font-mono text-[#e5e2e3] shrink-0 ml-2">
                                        {job.salary}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {data.jobs.length > 3 && (
                                  <p className="text-[10px] text-[#A1A1AA] italic pt-0.5">
                                    +{data.jobs.length - 3} more (click bar to view all)
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[10px] text-[#A1A1AA] italic">
                                No active opportunities in this band
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  animationDuration={800}
                >
                  {chartData.map((entry) => {
                    const isSelected = selectedBucketId === entry.id;
                    const isDimmed = selectedBucketId !== null && !isSelected;
                    return (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.color}
                        fillOpacity={isSelected ? 1 : isDimmed ? 0.25 : 0.85}
                        stroke={isSelected ? '#F8F9FA' : entry.color}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Selected Bracket Detailed Breakdown */}
          {activeBucket && (
            <div className="p-5 rounded-xl bg-[#201f20] border border-[#ffd7a9]/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#524535]/30 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeBucket.color }}
                  />
                  <h3 className="font-semibold text-sm text-[#F8F9FA]">
                    Roles in {activeBucket.label}
                  </h3>
                  <span className="text-xs font-mono text-[#ffd7a9]">
                    ({activeBucket.count} {activeBucket.count === 1 ? 'Role' : 'Roles'} ·{' '}
                    {activeBucket.percentage}% of pipeline)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBucketId(null)}
                  className="text-xs text-[#A1A1AA] hover:text-[#e5e2e3] px-2 py-1 rounded bg-[#2a2a2b]"
                >
                  Close
                </button>
              </div>

              {activeBucket.jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {activeBucket.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3.5 rounded-lg bg-[#2a2a2b] border border-[#524535]/30 hover:border-[#ffd7a9]/50 transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-xs text-[#F8F9FA] leading-tight">
                            {job.title}
                          </h4>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              job.fitScore >= 85
                                ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                : job.fitScore >= 70
                                ? 'bg-[#ffd7a9]/15 text-[#ffd7a9]'
                                : 'bg-[#EF4444]/15 text-[#EF4444]'
                            }`}
                          >
                            {job.fitScore}% Fit
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
                          <span className="flex items-center gap-1 font-medium text-[#e5e2e3]">
                            <Building2 className="w-3 h-3 text-[#ffd7a9]" />
                            {job.company}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#A1A1AA]" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#201f20] text-[9px] font-mono border border-[#524535]/30 text-[#A1A1AA]">
                            {job.workMode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#524535]/20 text-xs">
                        <span className="font-mono font-bold text-[#ffd7a9]">
                          {job.salary}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {job.hardConstraintsPassed ? (
                            <span className="text-[10px] font-mono text-[#22C55E] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Constraints Met
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-[#F59E0B] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Policy Flagged
                            </span>
                          )}
                          {onSelectJob && (
                            <button
                              type="button"
                              onClick={() => onSelectJob(job)}
                              className="ml-2 px-2 py-1 rounded bg-[#ffd7a9]/15 hover:bg-[#ffd7a9]/25 text-[#ffd7a9] text-[10px] font-semibold transition-colors"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A1A1AA] italic py-2">
                  No roles match this specific compensation tier.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 text-center space-y-4 bg-[#201f20] rounded-xl border border-[#524535]/20 p-6">
          <div className="w-12 h-12 rounded-xl bg-[#2a2a2b] border border-[#524535]/30 flex items-center justify-center mx-auto text-[#ffd7a9]">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-[#F8F9FA]">
              No Pipeline Roles Found
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              {filterMode !== 'all'
                ? 'No roles match the selected filter. Try switching back to All Roles.'
                : 'Add roles in the Jobs view or run a discovery cycle to analyze salary distribution.'}
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('jobs')}
              className="px-4 py-2 rounded-lg bg-[#ffd7a9] text-[#462a00] text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
            >
              <span>Go to Jobs Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </section>
  );
};
