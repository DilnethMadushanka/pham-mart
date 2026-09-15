import React, { useState } from 'react';
import { TrendingUp, CheckCircle2, ShieldCheck, Filter, ArrowUpRight, Search } from 'lucide-react';
import { REPORT_BASELINE_KPIS } from '../../data/initialData';

export default function BaselineKPITable() {
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Clean Epic references to system module names
  const getCleanModuleName = (epicStr) => {
    if (!epicStr) return "System Module";
    return epicStr
      .replace(/Epic 1:\s*/i, "")
      .replace(/Epic 2:\s*/i, "")
      .replace(/Epic 3:\s*/i, "")
      .replace(/Epic 4:\s*/i, "");
  };

  const filteredKPIs = REPORT_BASELINE_KPIS.filter(item => {
    const matchesModule = moduleFilter === "ALL" || item.epic.includes(moduleFilter);
    const matchesSearch = item.kpi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.measurement.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 text-xs font-black tracking-wide border border-sky-400/30 uppercase">
              System Audit Matrix
            </span>
            <span className="text-sky-300 text-xs font-bold">
              13 Baseline KPIs
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            System Performance & Baseline KPI Indicators
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-3xl leading-relaxed">
            Empirical comparative analysis of manual As-Is baseline metrics vs digital To-Be target indicators.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-extrabold text-sky-200 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>All 13 Metrics Validated</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search baseline indicator or KPI name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-bold">Filter Module:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-hidden"
          >
            <option value="ALL">All Modules</option>
            <option value="Epic 1">User Management & Security</option>
            <option value="Epic 2">Inventory Management</option>
            <option value="Epic 3">Prescription Station</option>
            <option value="Epic 4">POS & Billing</option>
          </select>
        </div>
      </div>

      {/* KPI Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[10.5px] tracking-wider font-extrabold">
              <tr>
                <th className="py-4 px-5">System Module</th>
                <th className="py-4 px-5">Key Performance Indicator (KPI)</th>
                <th className="py-4 px-5">As-Is Manual Baseline</th>
                <th className="py-4 px-5">To-Be Digital Target</th>
                <th className="py-4 px-5">Measurement Rationale</th>
                <th className="py-4 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKPIs.map((item, idx) => (
                <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                  
                  {/* System Module */}
                  <td className="py-4 px-5 font-bold text-slate-900">
                    <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-extrabold inline-block break-words">
                      {getCleanModuleName(item.epic)}
                    </span>
                  </td>

                  {/* KPI Name */}
                  <td className="py-4 px-5 font-black text-slate-900 leading-snug">
                    {item.kpi}
                  </td>

                  {/* Baseline */}
                  <td className="py-4 px-5 text-rose-700 font-bold bg-rose-50/40">
                    {item.baseline}
                  </td>

                  {/* Target */}
                  <td className="py-4 px-5 text-sky-800 font-black bg-sky-50/40">
                    {item.target}
                  </td>

                  {/* Measurement */}
                  <td className="py-4 px-5 text-slate-600 text-[11.5px] leading-relaxed">
                    {item.measurement}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-5 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-sky-600" />
                      {item.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
