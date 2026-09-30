import React, { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { artForCategory } from './illustrations';

// Plain-language line under each shelf, keyed by what the category name sounds like.
function blurb(category) {
  const c = category.toLowerCase();
  if (/analges|pain/.test(c)) return "Headache, fever and everyday aches";
  if (/cough|cold|flu/.test(c)) return "Syrups and lozenges for cough and cold";
  if (/cardio|heart/.test(c)) return "Blood pressure and cholesterol care";
  if (/diabet/.test(c)) return "Tablets and monitoring for diabetes";
  if (/antibiot/.test(c)) return "Dispensed against a doctor's prescription";
  if (/vitamin|supplement/.test(c)) return "Daily vitamins and supplements";
  return "Ask the pharmacist what suits you";
}

const TONES = [
  "bg-[#EFF6FF]",
  "bg-white ring-1 ring-slate-200/80",
  "bg-[#F1F5F9]",
  "bg-white ring-1 ring-slate-200/80",
  "bg-[#EFF6FF]",
  "bg-[#F1F5F9]"
];

// Shelves customers can browse, built from the live catalogue. Picking one fills
// the stock search below with that category.
export default function ShopByNeed({ medicines = [], onPick }) {
  const shelves = useMemo(() => {
    const counts = {};
    medicines
      .filter(m => !m.controlledDrug && m.category)
      .forEach(m => { counts[m.category] = (counts[m.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [medicines]);

  if (shelves.length < 3) return null;

  return (
    <section aria-labelledby="shelves-title" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <h2 id="shelves-title" className="text-3xl sm:text-4xl font-semibold text-[#0B2545] leading-[1.08]">
          Browse by what you need
        </h2>
        <p className="text-slate-600 max-w-[40ch] sm:text-right">
          Pick a shelf to see what's in stock today.
        </p>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {shelves.map(([category, count], i) => {
          const Art = artForCategory(category);
          const featured = i === 0;
          return (
            <li key={category} className={featured ? "col-span-2 lg:row-span-2" : ""}>
              <button
                onClick={() => onPick(category)}
                className={`group relative w-full h-full text-left rounded-3xl overflow-hidden ${TONES[i % TONES.length]} p-5 sm:p-6 flex flex-col justify-between gap-4 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0B2545]/5 transition-[transform,box-shadow] duration-300 ${featured ? "min-h-[230px] sm:min-h-[260px] lg:min-h-[360px]" : "min-h-[190px]"}`}
              >
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="min-w-0">
                    <h3 className={`font-semibold text-[#0B2545] break-words ${featured ? "text-2xl" : "text-base sm:text-lg"}`}>{category}</h3>
                    <p className={`text-slate-600 mt-1 ${featured ? "text-sm sm:text-base max-w-[28ch]" : "text-xs sm:text-sm"}`}>{blurb(category)}</p>
                  </div>
                  <span className={`shrink-0 w-9 h-9 rounded-full ${featured ? "flex" : "hidden sm:flex"} bg-white ring-1 ring-slate-200 items-center justify-center text-[#0B2545] group-hover:bg-[#0B2545] group-hover:text-white group-hover:ring-[#0B2545] transition-colors`}>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <Art className={`self-end transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-2 ${featured ? "w-3/4 max-w-[340px]" : "w-28 sm:w-32"}`} />
                <span className="text-xs font-medium text-slate-500 relative z-10">
                  {count} item{count === 1 ? "" : "s"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
