import React, { useState } from 'react';
import { X, Calendar, MapPin, Heart, Users, CheckCircle2, MessageSquare, Send, Sparkles, Clock, Share2 } from 'lucide-react';

export default function OutingDetailModal({ outing, onClose, rsvpStatus, onToggleRsvp, onAddComment }) {
  const [commentText, setCommentText] = useState('');

  if (!outing) return null;

  const isRsvped = rsvpStatus[outing.id];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(outing.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl p-0 overflow-hidden">
        
        {/* Scrapbook Banner Header */}
        <div className="relative aspect-[16/9] w-full bg-[#1E2022] overflow-hidden">
          <img 
            src={outing.image} 
            alt={outing.title}
            className="w-full h-full object-cover opacity-90" 
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tape Accent */}
          <div className="tape-strip tape-top-center"></div>

          {/* Overlaid Handwritten Script Tag & Affinity Badge */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
            <div>
              {outing.handwrittenTag && (
                <div className="inline-block bg-[#FFE66D] text-[#4A3E00] text-sm font-bold px-3 py-1 rounded-full shadow-md font-handwriting text-lg border border-white mb-2 transform -rotate-1">
                  {outing.handwrittenTag}
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white drop-shadow-md leading-tight">
                {outing.title}
              </h2>
            </div>

            <div className="bg-[#F64060] text-white text-sm font-black px-3.5 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1 font-display shrink-0">
              <Heart className="w-4 h-4 fill-white" />
              {outing.affinityScore}% Match
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Key Outing Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E2022]">
                <Calendar className="w-4 h-4 text-[#F64060]" />
                <span>{outing.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#5F646D]">
                <MapPin className="w-4 h-4 text-[#4ECDC4]" />
                <span>{outing.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-[#8E939D] block font-bold">Cost</span>
                <span className="text-sm font-black text-[#1E2022]">{outing.price}</span>
              </div>

              <button
                onClick={() => onToggleRsvp(outing.id)}
                className={`btn py-2 px-5 text-sm font-bold shadow-md transition-all ${
                  isRsvped
                    ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                    : 'btn-primary'
                }`}
              >
                {isRsvped ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Going ✓</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>RSVP Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8E939D] mb-1.5">
              About This Outing
            </h4>
            <p className="text-sm text-[#1E2022] leading-relaxed font-medium">
              {outing.description}
            </p>
          </div>

          {/* Group Personality Affinity Breakdown */}
          <div className="bg-[#EFE9DF] p-4 rounded-xl border border-[#D6CEBE] space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#4A3E00] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F64060]" />
              Group Personality Match Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1E2022]">
              <div className="bg-white p-2.5 rounded-lg border border-[#E2DACB]">
                <span className="font-bold block text-[#5F646D]">Social Energy Match:</span>
                <span className="font-semibold text-[#F64060]">{outing.affinityBreakdown.socialEnergyMatch}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E2DACB]">
                <span className="font-bold block text-[#5F646D]">Interest Synergy:</span>
                <span className="font-semibold text-[#1E2022]">{outing.affinityBreakdown.interestSynergy}</span>
              </div>
            </div>
          </div>

          {/* Who's Going Squad List */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8E939D] mb-3">
              Going Squad ({outing.attendees.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {outing.attendees.map((friend) => (
                <div key={friend.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#E2DACB]">
                  <img src={friend.avatar} alt={friend.name} className="w-9 h-9 rounded-full object-cover border border-white" />
                  <div>
                    <h5 className="text-xs font-bold text-[#1E2022] leading-none">{friend.name}</h5>
                    <span className="text-[10px] font-mono text-[#F64060] font-bold">{friend.mbti}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary Timeline */}
          {outing.itinerary && outing.itinerary.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8E939D] mb-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#F64060]" />
                Outing Itinerary
              </h4>
              <div className="space-y-2 border-l-2 border-[#F64060] pl-4 ml-2">
                {outing.itinerary.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F64060] border-2 border-white"></div>
                    <span className="text-xs font-extrabold text-[#1E2022] font-mono">{item.time}: </span>
                    <span className="text-xs text-[#5F646D] font-medium">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Memory Wall / Discussion & Comments */}
          <div className="pt-4 border-t border-[#EFE9DF]">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8E939D] mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#F64060]" />
              Squad Scrapbook Memory Wall
            </h4>

            {/* Comment List */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {outing.comments.length === 0 ? (
                <p className="text-xs text-[#8E939D] italic">No comments yet. Start the conversation!</p>
              ) : (
                outing.comments.map((comm) => (
                  <div key={comm.id} className="flex gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E2DACB]">
                    <img src={comm.user.avatar} alt={comm.user.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#1E2022]">{comm.user.name}</span>
                        <span className="text-[10px] text-[#8E939D]">{comm.time}</span>
                      </div>
                      <p className="text-xs text-[#5F646D] mt-0.5 font-medium">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a note or sticker reaction..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-[#E2DACB] focus:border-[#F64060] outline-none text-xs font-medium bg-[#FAF7F2]"
              />
              <button
                type="submit"
                className="btn btn-primary px-4 text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
