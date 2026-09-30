import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { CapsuleArt, FridgeArt, ClockArt } from './illustrations';

const TIPS = [
  {
    id: "antibiotics",
    title: "Finish the whole antibiotic course",
    lead: "Stopping when you feel better lets the infection come back stronger.",
    art: CapsuleArt,
    tone: "bg-[#EFF6FF]",
    points: [
      "Take every dose, even after the symptoms settle.",
      "Space doses evenly through the day, as written on the label.",
      "Never save leftovers or share them. Bring unused tablets back to us."
    ]
  },
  {
    id: "storage",
    title: "Store medicine the right way",
    lead: "Heat and damp in a Sri Lankan bathroom can spoil tablets before their expiry date.",
    art: FridgeArt,
    tone: "bg-[#F1F5F9]",
    points: [
      "Keep tablets in a cool, dry cupboard, out of the sun.",
      "Insulin and some syrups go in the fridge, never the freezer.",
      "Keep everything in the original box so the batch and expiry stay with it."
    ]
  },
  {
    id: "timing",
    title: "Timing matters as much as the dose",
    lead: "Some medicines work best on an empty stomach, others only with food.",
    art: ClockArt,
    tone: "bg-[#EFF6FF]",
    points: [
      "Metformin is taken with meals to spare your stomach.",
      "Set a phone alarm for medicines you take every day.",
      "Missed a dose? Call us before taking two at once."
    ]
  }
];

// Short, practical advice from the counter. Each card opens in place.
export default function HealthTips() {
  const [open, setOpen] = useState(null);

  return (
    <section aria-labelledby="tips-title" className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <h2 id="tips-title" className="text-3xl sm:text-4xl font-semibold text-[#0B2545] leading-[1.08]">
          Advice from the counter
        </h2>
        <p className="text-slate-600 leading-relaxed">
          The questions our pharmacists answer most, in a minute's reading.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-start">
        {TIPS.map(({ id, title, lead, art: Art, tone, points }) => {
          const isOpen = open === id;
          return (
            <article key={id} className="rounded-3xl bg-white ring-1 ring-slate-200/80 overflow-hidden flex flex-col">
              <div className={`${tone} h-40 flex items-center justify-center`}>
                <Art className="h-32 w-auto" />
              </div>
              <div className="p-6 flex flex-col gap-3 flex-1">
                <h3 className="text-lg font-semibold text-[#0B2545] leading-snug">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{lead}</p>
                {isOpen && (
                  <ul id={`tip-${id}`} className="space-y-2 text-sm text-slate-700 animate-fade-in">
                    {points.map(p => (
                      <li key={p} className="flex gap-2.5">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setOpen(isOpen ? null : id)}
                  aria-expanded={isOpen}
                  aria-controls={`tip-${id}`}
                  className="mt-auto pt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] self-start"
                >
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isOpen ? "Show less" : "Read the tips"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
