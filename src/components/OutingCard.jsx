import React from 'react';
import { Calendar, MapPin, Heart, CheckCircle2, ChevronRight, Users, Sparkles } from 'lucide-react';

export default function OutingCard({ outing, onSelectOuting, rsvpStatus, onToggleRsvp }) {
  const isRsvped = rsvpStatus[outing.id];

  return (
    <div className="polaroid-frame group cursor-pointer flex flex-col justify-between h-full transition-all">
      <div className="tape-strip tape-top-center"></div>

      <div>
        {/* Outing Image Header */}
        <div 
          onClick={() => onSelectOuting(outing)}
          className="relative overflow-hidden rounded-md mb-3 bg-[#FAF6F0]"
        >
          <img 
            src={outing.image} 
            alt={outing.title} 
            className="w-full aspect-[4/3] object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlaid Handwritten Script Tag */}
          {outing.handwrittenTag && (
            <div className="absolute top-2.5 left-2.5 bg-[#F9E076] text-[#4A3E00] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs font-handwriting text-base border border-white">
              {outing.handwrittenTag}
            </div>
          )}

          {/* Group Affinity Match Badge */}
          <div className="absolute bottom-2.5 right-2.5 bg-[#C85A65] text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 font-display border border-white">
            <Heart className="w-3 h-3 fill-white" />
            <span>{outing.affinityScore}% Match</span>
          </div>

          {/* Price Badge */}
          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {outing.price}
          </div>
        </div>

        {/* Card Content Details */}
        <div onClick={() => onSelectOuting(outing)} className="space-y-2">
          {/* Relationship Connection Tier Badge */}
          {outing.connectionBadge && (
            <div className="inline-block bg-[#F3ECE0] text-[#2C221E] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#E0D4C5]">
              {outing.connectionBadge}
            </div>
          )}

          {/* Outing Title */}
          <h3 className="text-lg font-bold font-display text-[#2C221E] group-hover:text-[#C85A65] transition-colors leading-snug line-clamp-2">
            {outing.title}
          </h3>

          {/* Date & Location */}
          <div className="space-y-1 text-xs text-[#6C5E58] font-medium pt-1">
            <div className="flex items-center gap-1.5 text-[#2C221E] font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#C85A65]" />
              <span>{outing.date}</span>
            </div>
            <div className="flex items-center gap-1.5 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-[#7B9E87]" />
              <span>{outing.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Attendees & RSVP Action */}
      <div className="pt-4 mt-3 border-t border-[#F3ECE0] flex items-center justify-between gap-2">
        {/* Attendees Avatars Stack */}
        <div className="flex items-center">
          <div className="flex -space-x-2 overflow-hidden">
            {outing.attendees.slice(0, 3).map((friend, idx) => (
              <img
                key={friend.id || idx}
                src={friend.avatar}
                alt={friend.name}
                title={`${friend.name} (${friend.mbti}) • ${friend.relationNote || 'Friend'}`}
                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ))}
          </div>
          <span className="text-xs text-[#9E8E87] font-bold ml-2">
            {outing.attendees.length} Attending
          </span>
        </div>

        {/* RSVP Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRsvp(outing.id);
          }}
          className={`btn py-1.5 px-3 text-xs font-bold transition-all ${
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
              <span>Join</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
