import React, { useState } from 'react';
import { TrendingUp, CheckCircle2, ShieldCheck, Filter, ArrowUpRight, Search } from 'lucide-react';
import { REPORT_BASELINE_KPIS } from '../../data/initialData';

export default function BaselineKPITable() {
  const [epicFilter, setEpicFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredKPIs = REPORT_BASELINE_KPIS.filter(item => {
    const matchesEpic = epicFilter === "ALL" || item.epic.includes(epicFilter);
    const matchesSearch = item.kpi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.measurement.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEpic && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
              Report Section 13
            </span>
            <h2 className="text-xl font-black text-slate-900">
              13 Measurable Baseline Indicators (KPI Matrix)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Empirical comparative analysis of manual As-Is baseline metrics vs digital To-Be target indicators.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-sky-50 px-3 py-2 rounded-xl border border-sky-200 text-xs font-bold text-sky-800">
          <CheckCircle2 className="w-4 h-4 text-sky-600" />
          <span>All 13 Metrics Validated & Improved</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            placeholder="Search baseline indicator or KPI name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">Filter Epic:</span>
          <select
            value={epicFilter}
            onChange={(e) => setEpicFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-hidden"
          >
            <option value="ALL">All Epics (1 to 4)</option>
            <option value="Epic 1">Epic 1: User & Auth</option>
            <option value="Epic 2">Epic 2: Inventory</option>
            <option value="Epic 3">Epic 3: Prescriptions</option>
            <option value="Epic 4">Epic 4: POS & Billing</option>
          </select>
        </div>
      </div>

      {/* KPI Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Functional Epic</th>
                <th className="py-3.5 px-4">Key Performance Indicator (KPI)</th>
                <th className="py-3.5 px-4">As-Is Manual Baseline</th>
                <th className="py-3.5 px-4">To-Be Digital Target</th>
                <th className="py-3.5 px-4">How It Is Measured</th>
                <th className="py-3.5 px-4 text-right">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKPIs.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Epic */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 truncate max-w-[160px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                      {item.epic}
                    </span>
                  </td>

                  {/* KPI Name */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {item.kpi}
                  </td>

                  {/* Baseline */}
                  <td className="py-3.5 px-4 text-rose-700 font-bold bg-rose-50/40">
                    {item.baseline}
                  </td>

                  {/* Target */}
                  <td className="py-3.5 px-4 text-sky-700 font-black bg-sky-50/40">
                    {item.target}
                  </td>

                  {/* Measurement */}
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] leading-relaxed max-w-xs">
                    {item.measurement}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-sky-600" />
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
