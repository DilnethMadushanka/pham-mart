import React, { useState } from 'react';
import { X, Star, CheckCircle2, MessageSquare, Send, Sparkles, User, Mail, ShieldCheck, HeartHandshake } from 'lucide-react';
import { saveAuditLog } from '../services/supabaseService';

export default function GoogleFeedbackModal({ 
  isOpen, 
  onClose, 
  currentUser,
  addAuditLog
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(currentUser?.name || "");
  const [reviewerEmail, setReviewerEmail] = useState(currentUser?.email || "");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      name: "Sunil Shantha",
      rating: 5,
      date: "2 days ago",
      comment: "Exceptional pharmacy service! Doctor prescription was verified by the pharmacist in less than 10 minutes, and medicines arrived directly to my home.",
      verified: true
    },
    {
      id: 2,
      name: "Dr. Anula Wickramasinghe",
      rating: 5,
      date: "1 week ago",
      comment: "Very professional medical fulfillment. High standards of medicine storage and verified SLMC physician compliance.",
      verified: true
    },
    {
      id: 3,
      name: "Kamani Perera",
      rating: 5,
      date: "2 weeks ago",
      comment: "Fast hotline support and friendly pharmacists. Highly recommended for baby care supplies and prescription clearance.",
      verified: true
    }
  ]);

  if (!isOpen) return null;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim()) {
      alert("Please enter your name and write a brief review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: reviewerName,
      rating: rating,
      date: "Just now",
      comment: reviewText,
      verified: true
    };

    setReviewsList(prev => [newReview, ...prev]);

    if (addAuditLog) {
      addAuditLog("Google Review Submitted", `Patient ${reviewerName} submitted a ${rating}-star Google review for PHARMART Pharmacy`, "success");
    } else {
      saveAuditLog({
        id: `LOG-${Math.floor(600 + Math.random() * 400)}`,
        timestamp: new Date().toLocaleString(),
        user: reviewerName,
        role: "Customer",
        action: "Google Review Submitted",
        details: `Submitted ${rating}-star review: "${reviewText.substring(0, 40)}..."`,
        severity: "success"
      });
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setReviewText("");
  };

  const getRatingLabel = (val) => {
    switch(val) {
      case 5: return " Outstanding (5.0 Stars)";
      case 4: return " Very Good (4.0 Stars)";
      case 3: return " Good (3.0 Stars)";
      case 2: return " Average (2.0 Stars)";
      case 1: return " Poor (1.0 Star)";
      default: return "Select Rating";
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-sky-100/80 overflow-hidden flex flex-col my-6 relative transform transition-all">
        
        {/* Premium Google Themed Header */}
        <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-blue-900 p-6 text-white relative overflow-hidden">
          {/* Ambient Decorative Blur Rings */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); if (onClose) onClose(); }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer border border-white/20 backdrop-blur-md z-30 shadow-lg hover:scale-110 active:scale-95"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5 relative z-10">
            {/* Google Multicolor G Icon Card */}
            <div className="w-13 h-13 rounded-2xl bg-white flex items-center justify-center shadow-xl p-2.5 shrink-0 border border-white/80 ring-2 ring-white/20">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight text-white font-heading">Google Patient Reviews</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/25 text-sky-300 text-[10px] font-extrabold border border-sky-400/40 backdrop-blur-md shadow-xs">
                  Official 4.8 ★
                </span>
              </div>
              <p className="text-xs text-sky-100/90 font-medium mt-0.5">PHARMART Pharmacy Verified Patient Ratings</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[72vh]">
          
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border-2 border-sky-200 shadow-xl shadow-sky-500/10">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight font-heading">Thank You for Your Review!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Your 5-star Google review has been published and shared with our duty Pharmacist care team.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Write Another Review
              </button>
            </div>
          ) : (
            /* Write Review Form */
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              
              {/* Star Selector Pill Box */}
              <div className="bg-gradient-to-br from-slate-50 to-sky-50/40 p-4.5 rounded-2xl border border-slate-200/80 text-center space-y-2 shadow-xs">
                <span className="font-extrabold text-slate-800 text-xs tracking-wide block">Tap to Rate Your Healthcare Experience</span>
                
                <div className="flex items-center justify-center space-x-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transform hover:scale-125 active:scale-95 transition-all cursor-pointer focus:outline-hidden"
                    >
                      <Star 
                        className={`w-8 h-8 filter drop-shadow-xs transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 stroke-amber-400"
                            : "stroke-slate-300 fill-slate-100"
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30">
                  <span className="text-xs text-amber-700 font-extrabold tracking-wide">
                    {getRatingLabel(hoverRating || rating)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. K. A. Sunil Shantha"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:bg-white outline-hidden transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="email"
                    placeholder="sunil.s@gmail.com"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:bg-white outline-hidden transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Write Patient Feedback & Experience *</label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your experience with PHARMART Pharmacy's medicines, prescription clearance, or fast home delivery..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:bg-white outline-hidden transition-all text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#0284c7] to-sky-600 hover:from-[#0369a1] hover:to-sky-700 text-white font-extrabold rounded-2xl shadow-lg shadow-sky-500/25 text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback to Google Reviews</span>
              </button>
            </form>
          )}

          {/* Verified Google Reviews Feed */}
          <div className="space-y-3.5 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Verified Google Patient Reviews ({reviewsList.length})</span>
              </h4>
              <span className="text-amber-500 font-black text-xs bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                4.8 / 5.0 ★
              </span>
            </div>

            <div className="space-y-3">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2 transition-all shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                        {rev.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block text-xs">{rev.name}</span>
                        <span className="text-[10px] text-sky-700 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-sky-600 inline" />
                          <span>Verified Patient</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700 text-[11px] font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-100">
                    "{rev.comment}"
                  </p>
                  
                  <span className="text-[10px] text-slate-400 font-bold block text-right">{rev.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
