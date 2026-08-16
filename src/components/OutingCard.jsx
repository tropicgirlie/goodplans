import React from 'react';
import { Calendar, MapPin, Heart, Users, CheckCircle2, Sparkles, Clock } from 'lucide-react';

export default function OutingCard({ outing, onSelectOuting, rsvpStatus, onToggleRsvp }) {
  const isRsvped = rsvpStatus[outing.id];

  return (
    <div 
      onClick={() => onSelectOuting(outing)}
      className="scrapbook-card group cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Scrapbook Tape Strip */}
        <div className="tape-strip tape-top-center"></div>

        {/* Polaroid Image Container */}
        <div className="polaroid-frame relative mb-4">
          <img 
            src={outing.image} 
            alt={outing.title} 
            className="polaroid-img group-hover:scale-105 transition-transform duration-500"
          />

          {/* Connection Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#2C221E]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30 shadow-xs flex items-center gap-1 font-display">
              <Users className="w-3 h-3 text-[#F9E076]" />
              {outing.connectionType || 'Group Outing'}
            </span>
          </div>

          {/* Affinity Score Badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-[#C85A65] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1 font-display">
              <Heart className="w-3 h-3 fill-white" />
              {outing.affinityScore}% Match
            </span>
          </div>

          {/* Handwritten Polaroid Caption */}
          {outing.handwrittenTag && (
            <div className="handwritten-caption flex items-center justify-between">
              <span>#{outing.handwrittenTag}</span>
              <span className="text-[10px] text-[#6C5E58] font-mono font-bold">{outing.price}</span>
            </div>
          )}
        </div>

        {/* Category & Routine Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {outing.category && (
            <span className="bg-[#FFF0F2] text-[#C85A65] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#F7B7A3] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-xs leading-none">
                {outing.iconName || 'auto_awesome'}
              </span>
              {outing.category}
            </span>
          )}

          {outing.lifestyleTag && (
            <span className="bg-[#F9E076]/40 text-[#4A3E00] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E0C855]">
              {outing.lifestyleTag}
            </span>
          )}
        </div>

        {/* Outing Title */}
        <h3 className="text-lg font-bold font-display text-[#2C221E] group-hover:text-[#C85A65] transition-colors leading-snug mb-2">
          {outing.title}
        </h3>

        {/* Event Meta Details */}
        <div className="space-y-1 text-xs text-[#6C5E58] font-medium mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#C85A65] shrink-0" />
            <span>{outing.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#7B9E87] shrink-0" />
            <span className="truncate">{outing.location}</span>
          </div>
        </div>

        {/* Met Before / Familiarity Summary */}
        {outing.familiarityBreakdown && (
          <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5] text-[11px] space-y-1 mb-4">
            <div className="flex items-center justify-between text-[#2C221E] font-bold">
              <span className="text-[#6C5E58]">Schedule Fit:</span>
              <span className="text-[#C85A65] truncate max-w-[170px]">{outing.familiarityBreakdown.timingFit || outing.familiarityBreakdown.squadType}</span>
            </div>
            <div className="text-[10px] text-[#6C5E58] font-medium truncate">
              {outing.familiarityBreakdown.metBeforeCount}
            </div>
          </div>
        )}
      </div>

      {/* Attendees Avatars & RSVP Action */}
      <div className="pt-3 border-t border-[#F3ECE0] flex items-center justify-between gap-2">
        <div className="flex items-center -space-x-2">
          {outing.attendees.map((attendee, idx) => (
            <div key={attendee.id || idx} className="relative group/avatar" title={`${attendee.name} (${attendee.relationNote || 'Attending'})`}>
              <img
                src={attendee.avatar}
                alt={attendee.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs"
              />
            </div>
          ))}
          {outing.attendees.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-[#F3ECE0] border-2 border-white text-[10px] font-bold flex items-center justify-center text-[#6C5E58]">
              +{outing.attendees.length - 3}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRsvp(outing.id);
          }}
          className={`btn py-1 px-3 text-xs font-bold transition-all ${
            isRsvped
              ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
              : 'btn-primary'
          }`}
        >
          {isRsvped ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Going ✓</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>RSVP</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
