import React, { useState } from 'react';
import { X, Calendar, MapPin, Heart, Users, CheckCircle2, MessageSquare, Send, Sparkles, Clock, ShieldCheck, Download, Share2, Camera, Gift } from 'lucide-react';

export default function OutingDetailModal({ outing, onClose, rsvpStatus, onToggleRsvp, onAddComment }) {
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

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

  // 1-Click WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Hey girls! 💖 Check out this outing: "${outing.title}" on ${outing.date} at ${outing.location}.\n\nRSVP & view details here: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
                  #{outing.handwrittenTag}
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
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                {outing.connectionBadge && (
                  <span className="bg-[#F3ECE0] text-[#2C221E] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E0D4C5]">
                    {outing.connectionBadge}
                  </span>
                )}
                {outing.accessibilityTag && (
                  <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#A5D6A7]">
                    {outing.accessibilityTag}
                  </span>
                )}
              </div>
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

          {/* Squad Perk Badge (UX Feature) */}
          {outing.squadPerk && (
            <div className="p-3.5 rounded-xl bg-[#F9E076]/40 border-2 border-[#E0C855] flex items-center justify-between gap-3 text-xs text-[#4A3E00] font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#C85A65]" />
                <span>{outing.squadPerk}</span>
              </div>
              <span className="bg-[#C85A65] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono uppercase">
                Perk Unlocked
              </span>
            </div>
          )}

          {/* Share to WhatsApp & Calendar Integration Bar (UX Finding Applied) */}
          <div className="p-3.5 rounded-xl bg-white border-2 border-[#E0D4C5] space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#C85A65]" />
                <span className="text-xs font-extrabold text-[#2C221E]">
                  Share Outing Card with Squad
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] py-1.5 px-3 text-xs font-bold shadow-xs border-none"
                >
                  💬 Share on WhatsApp
                </button>

                <button
                  onClick={handleCopyLink}
                  className="btn btn-secondary py-1.5 px-3 text-xs font-bold"
                >
                  {copiedLink ? 'Copied ✓' : 'Copy Link'}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F3ECE0] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7B9E87]" />
                <span className="text-xs font-bold text-[#6C5E58]">
                  Zero Invisible Labor: Sync to Calendar
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-[#F9E076] text-[#4A3E00] hover:bg-[#F0D55D] py-1 px-2.5 text-[11px] font-bold shadow-xs"
                >
                  Google Calendar
                </a>

                <button
                  onClick={handleDownloadIcs}
                  className="btn btn-secondary py-1 px-2.5 text-[11px] font-bold"
                >
                  <Download className="w-3 h-3" />
                  iCal (.ics)
                </button>
              </div>
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

          {/* Digital Polaroid Souvenir Memory Wall (UX Feature) */}
          <div className="p-4 rounded-xl bg-[#FAF6F0] border-2 border-[#E0D4C5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2C221E] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#C85A65]" />
                Post-Outing Polaroid Souvenir Reel
              </span>
              <button
                onClick={() => alert("Upload photo feature unlocked for squad attendees!")}
                className="text-[11px] font-bold text-[#C85A65] hover:underline"
              >
                + Add Photo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {outing.souvenirPhotos && outing.souvenirPhotos.map((photo, i) => (
                <div key={i} className="polaroid-frame p-2 shadow-xs">
                  <img src={photo} alt="Souvenir Memory" className="w-full h-24 object-cover rounded-md" />
                  <div className="text-[10px] font-handwriting text-center mt-1 text-[#2C221E]">
                    memory #{i+1} 💕
                  </div>
                </div>
              ))}
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

          {/* Comments Wall */}
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
