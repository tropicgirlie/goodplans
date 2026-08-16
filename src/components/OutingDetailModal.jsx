import React, { useState } from 'react';
import { X, Calendar, MapPin, Heart, Users, CheckCircle2, MessageSquare, Send, Sparkles, Clock, ShieldCheck, Download, Share2 } from 'lucide-react';

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

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(outing.title);
    const location = encodeURIComponent(outing.location);
    const details = encodeURIComponent(`${outing.description}\n\nMeetFriends Planner Dublin • ${outing.connectionBadge || 'Outing'}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`;
  };

  // Download iCal (.ics) file
  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MeetFriends Planner//Dublin Edition//EN
BEGIN:VEVENT
SUMMARY:${outing.title}
LOCATION:${outing.location}
DESCRIPTION:${outing.description}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${outing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl p-0 overflow-hidden">
        
        {/* Banner Header */}
        <div className="relative aspect-[16/9] w-full bg-[#2C221E] overflow-hidden">
          <img 
            src={outing.image} 
            alt={outing.title}
            className="w-full h-full object-cover opacity-90" 
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="tape-strip tape-top-center"></div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
            <div>
              {outing.handwrittenTag && (
                <div className="inline-block bg-[#F9E076] text-[#4A3E00] text-sm font-bold px-3 py-1 rounded-full shadow-md font-handwriting text-lg border border-white mb-2 transform -rotate-1">
                  {outing.handwrittenTag}
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white drop-shadow-md leading-tight">
                {outing.title}
              </h2>
            </div>

            <div className="bg-[#C85A65] text-white text-sm font-black px-3.5 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1 font-display shrink-0">
              <Heart className="w-4 h-4 fill-white" />
              {outing.affinityScore}% Match
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Connection Tier & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF6F0] border border-[#E0D4C5]">
            <div className="space-y-1">
              {outing.connectionBadge && (
                <div className="inline-block bg-[#F3ECE0] text-[#2C221E] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E0D4C5] mb-1">
                  {outing.connectionBadge}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm font-bold text-[#2C221E]">
                <Calendar className="w-4 h-4 text-[#C85A65]" />
                <span>{outing.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#6C5E58]">
                <MapPin className="w-4 h-4 text-[#7B9E87]" />
                <span>{outing.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-[#9E8E87] block font-bold">Cost</span>
                <span className="text-sm font-black text-[#2C221E]">{outing.price}</span>
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

          {/* 1-Click Calendar Integration Bar (Reduces Invisible Labor) */}
          <div className="p-3.5 rounded-xl bg-white border-2 border-[#E0D4C5] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-[#C85A65]" />
              <div>
                <span className="text-xs font-extrabold text-[#2C221E] block">
                  Zero Invisible Labor: Sync to Calendar
                </span>
                <span className="text-[11px] text-[#6C5E58]">
                  Auto-populates map venue, time & reminder alerts
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-[#F9E076] text-[#4A3E00] hover:bg-[#F0D55D] py-1.5 px-3 text-xs font-bold shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                Google Calendar
              </a>

              <button
                onClick={handleDownloadIcs}
                className="btn btn-secondary py-1.5 px-3 text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                iCal (.ics)
              </button>
            </div>
          </div>

          {/* Dublin Closing Hours Guarantee */}
          <div className="p-3.5 rounded-xl bg-[#F9E076]/30 border border-[#F9E076] flex items-center gap-2.5 text-xs text-[#4A3E00] font-medium">
            <ShieldCheck className="w-4.5 h-4.5 text-[#C85A65] shrink-0" />
            <div>
              <strong className="font-bold text-[#2C221E]">Dublin Closing Hours Guarantee: </strong>
              <span>This outing is timed for prime open hours (early lunch or finishing by 8:30 PM before shops & cafes close). Zero late-night dining rush!</span>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9E8E87] mb-1.5">
              About This Outing
            </h4>
            <p className="text-sm text-[#2C221E] leading-relaxed font-medium">
              {outing.description}
            </p>
          </div>

          {/* Social Battery & Familiarity Breakdown */}
          {outing.familiarityBreakdown && (
            <div className="bg-[#F3ECE0] p-4 rounded-xl border border-[#E0D4C5] space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#4A3E00] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C85A65]" />
                Cohort & Timing Compatibility Analysis
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#2C221E]">
                <div className="bg-white p-2.5 rounded-lg border border-[#E0D4C5]">
                  <span className="font-bold block text-[#6C5E58]">Schedule Fit:</span>
                  <span className="font-semibold text-[#C85A65]">{outing.familiarityBreakdown.timingFit || outing.familiarityBreakdown.squadType}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#E0D4C5]">
                  <span className="font-bold block text-[#6C5E58]">Comfort Level:</span>
                  <span className="font-semibold text-[#2C221E]">{outing.familiarityBreakdown.comfortLevel}</span>
                </div>
              </div>
            </div>
          )}

          {/* Attendees List */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9E8E87] mb-3">
              Attending Friends ({outing.attendees.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outing.attendees.map((friend, idx) => (
                <div key={friend.id || idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E0D4C5]">
                  <div className="flex items-center gap-2.5">
                    <img src={friend.avatar} alt={friend.name} className="w-9 h-9 rounded-full object-cover border border-white" />
                    <div>
                      <h5 className="text-xs font-bold text-[#2C221E] leading-none">{friend.name}</h5>
                      <span className="text-[10px] font-mono text-[#C85A65] font-bold">{friend.mbti} • {friend.lifestyle?.split('/')[0]}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${friend.relationNote?.includes('First') ? 'bg-[#F9E076] text-[#4A3E00]' : 'bg-[#7B9E87] text-white'}`}>
                    {friend.relationNote || 'Attending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          {outing.itinerary && outing.itinerary.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9E8E87] mb-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C85A65]" />
                Outing Itinerary
              </h4>
              <div className="space-y-2 border-l-2 border-[#C85A65] pl-4 ml-2">
                {outing.itinerary.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#C85A65] border-2 border-white"></div>
                    <span className="text-xs font-extrabold text-[#2C221E] font-mono">{item.time}: </span>
                    <span className="text-xs text-[#6C5E58] font-medium">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="pt-4 border-t border-[#F3ECE0]">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9E8E87] mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#C85A65]" />
              Squad Discussion Wall
            </h4>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {outing.comments.length === 0 ? (
                <p className="text-xs text-[#9E8E87] italic">No notes yet. Leave a message for the girls!</p>
              ) : (
                outing.comments.map((comm) => (
                  <div key={comm.id} className="flex gap-2.5 p-3 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5]">
                    <img src={comm.user.avatar} alt={comm.user.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#2C221E]">{comm.user.name}</span>
                        <span className="text-[10px] text-[#9E8E87]">{comm.time}</span>
                      </div>
                      <p className="text-xs text-[#6C5E58] mt-0.5 font-medium">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a note or reaction..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-[#E0D4C5] focus:border-[#C85A65] outline-none text-xs font-medium bg-[#FAF6F0]"
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
