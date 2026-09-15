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
      <div className="bg-gradient-to-r from-sky-950 via-blue-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden border border-sky-800/40">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/30">
              {REPORT_INFO.module}
            </span>
            <span className="text-sky-200 text-xs font-semibold">
              Group: {REPORT_INFO.group}
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">{REPORT_INFO.title}</h2>
          <p className="text-xs text-sky-100 max-w-3xl leading-relaxed">
            Client Organization: <strong className="text-white">{REPORT_INFO.client}</strong> • Submitted to: <strong className="text-white">{REPORT_INFO.lecturer}</strong> ({REPORT_INFO.submissionDate})
          </p>

          <div className="pt-3 flex flex-wrap gap-2 text-xs">
            {REPORT_INFO.teamMembers.map(m => (
              <span key={m.id} className="px-3 py-1 bg-white/10 rounded-lg text-[11px] font-semibold border border-white/20">
                {m.id} - {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
        {[
          { id: "overview", label: "Report Executive Summary" },
          { id: "problems", label: "As-Is Business Bottlenecks" },
          { id: "stakeholders", label: "Stakeholder Classification Matrix" },
          { id: "swimlanes", label: "Swimlane Architecture & Handshake Points" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSection === tab.id
                ? "bg-white text-sky-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Views */}
      {activeSection === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-sky-600" />
              Executive Summary & Context
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PHARMART Pharmacy is a leading community pharmacy providing essential healthcare services, including prescription fulfilment, controlled drug dispensing, customer care, inventory management, and POS billing. Core operations previously relied on manual paper records and disconnected spreadsheets.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              This digital assessment establishes the target baseline to transition PHARMART Pharmacy into a unified enterprise platform spanning User Authentication, Inventory Sync, Prescription Safeguards, and Real-time Analytics.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center">
              <Award className="w-5 h-5 mr-2 text-sky-600" />
              Organizational Blueprint
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-500">Client Name:</span>
                <span className="font-bold text-slate-900">PHARMART Pharmacy</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-500">Industry Sector:</span>
                <span className="font-bold text-slate-900">Healthcare & Retail Pharmacy</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-500">Core Epics Covered:</span>
                <span className="font-bold text-sky-700">All 4 Epics Digitized</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "problems" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
            As-Is Manual Operational Inefficiencies & Business Impact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { issue: "Manual Stock Tracking", evidence: "Medicine stock recorded manually & updated rarely in real time.", impact: "Stock-outs, discrepancies between physical shelf & records." },
              { issue: "Expired Medicine Risk", evidence: "Expired drugs identified only during physical periodic checks.", impact: "Financial wastage and severe patient safety risk." },
              { issue: "Slow POS Checkout", evidence: "Cashiers manually search products & calculate discounts by hand.", impact: "High checkout waiting times & pricing calculation errors." },
              { issue: "Controlled Drug Verification", evidence: "Paper doctor credential verification handled inconsistently.", impact: "Regulatory non-compliance risk with dangerous substances." },
              { issue: "Disconnected Data Records", evidence: "Prescriptions, sales & stock kept in physical folders.", impact: "Management compilation of business reports requires 4.5+ hours." }
            ].map((p, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm flex justify-between">
                  <span>{p.issue}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-extrabold">Bottleneck</span>
                </div>
                <p className="text-slate-600 text-[11px]"><strong>As-Is Evidence:</strong> {p.evidence}</p>
                <p className="text-sky-800 text-[11px]"><strong>Business Impact:</strong> {p.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "stakeholders" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-sky-600" />
            Stakeholder Classification & Engagement Strategy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {REPORT_SECTIONS[3].stakeholders.map((s, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.type === "Internal" ? "bg-sky-100 text-sky-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {s.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Interest: <strong className="text-slate-800">{s.interest}</strong> | Influence: <strong className="text-slate-800">{s.influence}</strong>
                </div>
                <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                  {s.strategy}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "swimlanes" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center">
            <GitBranch className="w-5 h-5 mr-2 text-sky-600" />
            Swimlane Responsibilities Across System Epics
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { epic: "Epic 1: User Management & Auth", roles: "Owner/Admin, Pharmacist, Cashier, System Engine" },
              { epic: "Epic 2: Medicine & Inventory Management", roles: "Inventory Manager, Pharmacist, Medicine Suppliers, System Engine" },
              { epic: "Epic 3: Customer & Prescription Management", roles: "Customer, Cashier, Pharmacist, System Engine" },
              { epic: "Epic 4: Sales, Payment & Reporting", roles: "Customer, Cashier, Payment Gateway / Bank, Owner/Admin, System Engine" }
            ].map((sw, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">{sw.epic}</span>
                <span className="text-sky-700 font-semibold">{sw.roles}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
