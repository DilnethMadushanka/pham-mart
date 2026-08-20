import React, { useState } from 'react';
import { X, Star, CheckCircle2, MessageSquare, Send, Sparkles, User, ThumbsUp } from 'lucide-react';
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
      comment: "Fast hotline support and friendly pharmacists. Highly recommended for baby care supplies and prescription drugs.",
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden flex flex-col my-6">
        
        {/* Google Themed Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            {/* Google Multicolor G Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg p-2.5 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">Google Patient Reviews</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Official 4.8 ★
                </span>
              </div>
              <p className="text-xs text-slate-300">PHARMART Pharmacy Patient Feedback & Ratings</p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
          
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">Thank You for Your Feedback!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Your 5-star Google review has been published and shared with our licensed Pharmacist team.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Write Another Review
              </button>
            </div>
          ) : (
            /* Write Review Form */
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                <span className="font-bold text-slate-700 block">Select Star Rating</span>
                
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transform hover:scale-125 transition-all cursor-pointer"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 stroke-amber-400"
                            : "stroke-slate-300 fill-slate-100"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-amber-600 font-bold block">
                  {rating === 5 ? "Excellent (5 Stars)" : rating === 4 ? "Very Good (4 Stars)" : `${rating} Stars`}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. K. A. Sunil Shantha"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                <input 
                  type="email"
                  placeholder="sunil.s@gmail.com"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Write Patient Feedback & Experience *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your experience with PHARMART Pharmacy's medicines, prescription clearance, or fast home delivery..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback to Google Reviews</span>
              </button>
            </form>
          )}

          {/* Recent Reviews List */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
              <span>Verified Google Patient Reviews ({reviewsList.length})</span>
              <span className="text-amber-500 font-bold">4.8 / 5.0</span>
            </h4>

            <div className="space-y-2.5">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                        {rev.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{rev.name}</span>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 font-medium block">{rev.date} • Verified Patient</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
