import React, { useState } from 'react';
import { 
  GitBranch, 
  Users, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  BookOpen, 
  Award,
  ArrowRight
} from 'lucide-react';
import { REPORT_INFO, REPORT_SECTIONS } from '../../data/reportData';

export default function ArchitectureAssessment() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Report Header Card */}
      <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-sky-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black tracking-wide border border-white/30 uppercase">
              {REPORT_INFO.module}
            </span>
            <span className="text-sky-200 text-xs font-bold">
              Group: {REPORT_INFO.group}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{REPORT_INFO.title}</h2>
          <p className="text-xs sm:text-sm text-sky-100/90 max-w-3xl leading-relaxed">
            Client Organization: <strong className="text-white">{REPORT_INFO.client}</strong> • Submitted to: <strong className="text-white">{REPORT_INFO.lecturer}</strong> ({REPORT_INFO.submissionDate})
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            {REPORT_INFO.teamMembers.map(m => (
              <span key={m.id} className="px-3.5 py-1.5 bg-white/10 rounded-xl text-[11px] font-bold border border-white/20">
                {m.id} - {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-2xl text-xs font-bold border border-slate-200/80">
        {[
          { id: "overview", label: "Report Executive Summary" },
          { id: "problems", label: "As-Is Business Bottlenecks" },
          { id: "stakeholders", label: "Stakeholder Classification Matrix" },
          { id: "swimlanes", label: "Swimlane Architecture & Handshake Points" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer font-extrabold ${
              activeSection === tab.id
                ? "bg-white text-sky-800 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Views */}
      {activeSection === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2.5 text-sky-600" />
              Executive Summary & Context
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              PHARMART Pharmacy is a leading community pharmacy providing essential healthcare services, including prescription fulfilment, controlled drug dispensing, customer care, inventory management, and POS billing. Core operations previously relied on manual paper records and disconnected spreadsheets.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This digital assessment establishes the target baseline to transition PHARMART Pharmacy into a unified enterprise platform spanning User Authentication, Inventory Sync, Prescription Safeguards, and Real-time Analytics.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-lg flex items-center">
              <Award className="w-5 h-5 mr-2.5 text-sky-600" />
              Organizational Blueprint
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex justify-between items-center">
                <span className="font-semibold text-slate-500">Client Name:</span>
                <span className="font-black text-slate-900">PHARMART Pharmacy</span>
              </div>
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex justify-between items-center">
                <span className="font-semibold text-slate-500">Industry Sector:</span>
                <span className="font-black text-slate-900">Healthcare & Retail Pharmacy</span>
              </div>
              <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200/80 flex justify-between items-center">
                <span className="font-semibold text-sky-800">System Modules Covered:</span>
                <span className="font-black text-sky-900">All Modules Fully Digitized</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "problems" && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-sm space-y-5">
          <h3 className="text-lg font-black text-slate-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2.5 text-amber-600" />
            As-Is Manual Operational Inefficiencies & Business Impact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            {[
              { issue: "Manual Stock Tracking", evidence: "Medicine stock recorded manually & updated rarely in real time.", impact: "Stock-outs, discrepancies between physical shelf & records." },
              { issue: "Expired Medicine Risk", evidence: "Expired drugs identified only during physical periodic checks.", impact: "Financial wastage and severe patient safety risk." },
              { issue: "Slow POS Checkout", evidence: "Cashiers manually search products & calculate discounts by hand.", impact: "High checkout waiting times & pricing calculation errors." },
              { issue: "Controlled Drug Verification", evidence: "Paper doctor credential verification handled inconsistently.", impact: "Regulatory non-compliance risk with dangerous substances." },
              { issue: "Disconnected Data Records", evidence: "Prescriptions, sales & stock kept in physical folders.", impact: "Management compilation of business reports requires 4.5+ hours." }
            ].map((p, idx) => (
              <div key={idx} className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="font-black text-slate-900 text-sm flex justify-between items-center">
                  <span>{p.issue}</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black border border-rose-200">Bottleneck</span>
                </div>
                <p className="text-slate-600 text-xs"><strong>As-Is Evidence:</strong> {p.evidence}</p>
                <p className="text-sky-800 text-xs"><strong>Business Impact:</strong> {p.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "stakeholders" && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-sm space-y-5">
          <h3 className="text-lg font-black text-slate-900 flex items-center">
            <Users className="w-5 h-5 mr-2.5 text-sky-600" />
            Stakeholder Classification & Engagement Strategy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {REPORT_SECTIONS[3].stakeholders.map((s, idx) => (
              <div key={idx} className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-900 text-sm">{s.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    s.type === "Internal" ? "bg-sky-100 text-sky-800 border-sky-300" : "bg-blue-100 text-blue-800 border-blue-300"
                  }`}>
                    {s.type}
                  </span>
                </div>
                <div className="text-[11.5px] text-slate-500 font-medium">
                  Interest: <strong className="text-slate-800">{s.interest}</strong> | Influence: <strong className="text-slate-800">{s.influence}</strong>
                </div>
                <p className="text-xs text-slate-600 pt-2 border-t border-slate-200/80 leading-relaxed">
                  {s.strategy}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "swimlanes" && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-sm space-y-5">
          <h3 className="text-lg font-black text-slate-900 flex items-center">
            <GitBranch className="w-5 h-5 mr-2.5 text-sky-600" />
            Swimlane Responsibilities Across System Modules
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            {[
              { module: "User Management & Auth Module", roles: "Owner/Admin, Pharmacist, Cashier, System Engine" },
              { module: "Medicine & Inventory Management Module", roles: "Inventory Manager, Pharmacist, Medicine Suppliers, System Engine" },
              { module: "Customer & Prescription Station", roles: "Customer, Cashier, Pharmacist, System Engine" },
              { module: "Sales, Payment & POS Terminal", roles: "Customer, Cashier, Payment Gateway / Bank, Owner/Admin, System Engine" }
            ].map((sw, idx) => (
              <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="font-black text-slate-900">{sw.module}</span>
                <span className="text-sky-800 font-bold bg-sky-50 px-3 py-1 rounded-xl border border-sky-200/80 w-fit">{sw.roles}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
