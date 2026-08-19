import React from 'react';
import { Star } from 'lucide-react';

export default function PatientTestimonialsSection() {
  const reviews = [
    {
      name: "Peter Clark",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      text: "Exceptional service every visit! The pharmacists at PHARMART Pharmacy are knowledgeable and truly care about my health and wellbeing."
    },
    {
      name: "Thalia Winterson",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      text: "Fast, friendly, and professional — PHARMART Pharmacy has consistently exceeded my expectations with their personalized dermocosmetics advice and quick service."
    },
    {
      name: "Jarvis Quillen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      text: "Highly recommend PHARMART Pharmacy! They always have the exact prescription medications and homeopathic remedies I need in stock."
    }
  ];

  return (
    <section className="bg-[#F8F9FA] rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8">
      
      {/* Section Title & Subheading */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="flex justify-center items-center space-x-1 text-amber-400 pb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 stroke-amber-400" />
          ))}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          The Patient Comes First<span className="text-[#00875A]">.</span>
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Rated 4.8 Stars on Google by our patients and community.
        </p>
      </div>

      {/* 3-Column Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div 
            key={idx} 
            className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              {/* 5 Yellow Stars at the top of each card */}
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic font-medium">
                "{rev.text}"
              </p>
            </div>

            {/* Author Info & Google Logo */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <img 
                  src={rev.avatar} 
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                />
                <span className="font-extrabold text-slate-900 text-sm">{rev.name}</span>
              </div>

              {/* Google Badge SVG */}
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
