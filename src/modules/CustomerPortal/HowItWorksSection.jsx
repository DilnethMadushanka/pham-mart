import React from 'react';
import { Upload, Stethoscope, ShoppingCart, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function HowItWorksSection({ onUploadRx, onShop }) {
  const steps = [
    {
      num: "01",
      title: "Upload Doctor Prescription",
      desc: "Upload a photograph or PDF scan of your valid doctor prescription with patient details.",
      icon: Upload,
      color: "bg-emerald-100 text-emerald-800 border-emerald-300"
    },
    {
      num: "02",
      title: "Pharmacist Review & Clearance (Epic 3)",
      desc: "Registered SLMC pharmacists verify doctor SLMC credentials, dosage limits, and drug interaction safety.",
      icon: Stethoscope,
      color: "bg-emerald-100 text-emerald-800 border-emerald-300"
    },
    {
      num: "03",
      title: "Automated Stock Reserve & Billing (Epic 4)",
      desc: "Approved items are reserved from inventory and an accurate digital price quotation is generated.",
      icon: ShoppingCart,
      color: "bg-emerald-100 text-emerald-800 border-emerald-300"
    },
    {
      num: "04",
      title: "Home Delivery / Express Counter Pickup",
      desc: "Pay securely online or upon delivery, and receive your medication safely packaged at home.",
      icon: Truck,
      color: "bg-emerald-600 text-white shadow-lg"
    }
  ];

  return (
    <section className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm space-y-8">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 inline-block">
          Prescription Fulfillment Workflow
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          How Prescription Ordering Works<span className="text-emerald-600">.</span>
        </h2>
        <p className="text-xs text-slate-500">
          In accordance with pharmacy health regulations, all medication orders require a valid doctor prescription.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black font-mono text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                    Step {step.num}
                  </span>
                  <div className={`p-3 rounded-2xl ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 text-[11px] font-bold text-emerald-700 flex items-center">
                <span>Verified System Step</span>
                <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-emerald-600" />
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-emerald-gradient p-6 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="text-base font-black">Need to order your prescribed medication?</h4>
          <p className="text-xs text-emerald-100 mt-0.5">Upload your doctor prescription now for instant Pharmacist verification.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onUploadRx}
            className="px-6 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs rounded-xl shadow-md transition-colors"
          >
            Upload Prescription Now
          </button>
          <button
            onClick={onShop}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl border border-emerald-500 transition-colors"
          >
            View Catalogue
          </button>
        </div>
      </div>

    </section>
  );
}
