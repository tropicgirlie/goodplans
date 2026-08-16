import React, { useState } from 'react';
import { Calendar, MapPin, Sparkles, Heart, CheckCircle2, UserCheck, Share2, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OutingCard({ outing, onSelectOuting, rsvpStatus, onToggleRsvp }) {
  const isAttending = rsvpStatus[outing.id];

  const handleRsvpClick = (e) => {
    e.stopPropagation();
    if (!isAttending) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
    onToggleRsvp(outing.id);
  };

  const handleShareWhatsApp = (e) => {
    e.stopPropagation();
    const shareText = `Hey girls! Check out this Dublin outing: ${outing.title} at ${outing.location} on ${outing.date}. Details on Amiga!`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div 
      onClick={() => onSelectOuting(outing)}
      className="group relative bg-white rounded-3xl border-3 border-[#09090B] shadow-[5px_5px_0px_#09090B] hover:shadow-[8px_8px_0px_#09090B] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      
      {/* Top Media & Badge Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F4F5] border-b-3 border-[#09090B]">
        <img
          src={outing.image}
          alt={outing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Washi Tape Strip */}
        <div className="tape-strip tape-top-center"></div>

        {/* Category Pill */}
        <div className="absolute top-3 left-3 max-w-[48%] bg-[#09090B] text-white px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-md flex items-center gap-1 font-display border border-white truncate">
          <span className="material-symbols-outlined text-xs leading-none text-[#F59E0B] shrink-0">
            {outing.iconName || 'auto_awesome'}
          </span>
          <span className="truncate">{outing.category}</span>
        </div>

        {/* Connection Type Badge (Core Squad / Mixed Circle / 1:1) */}
        <div className="absolute top-3 right-3 max-w-[48%] bg-[#2563EB] text-white px-2.5 py-1 rounded-full text-[10px] font-mono font-black shadow-md border border-white truncate">
          <span className="truncate">{outing.connectionBadge || '👯 Outing'}</span>
        </div>

        {/* Social Battery & Match Tag Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="bg-white/95 backdrop-blur-md text-[#09090B] text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border-2 border-[#09090B] shadow-xs truncate max-w-[68%]">
            {outing.lifestyleTag}
          </span>

          <span className="bg-[#FEF3C7] text-[#09090B] text-xs font-mono font-black px-2.5 py-1 rounded-full border-2 border-[#09090B] shadow-xs shrink-0">
            {outing.affinityScore}% Match
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          {/* Title with Syne Display Font */}
          <h3 className="text-lg font-extrabold font-display text-[#09090B] leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-2">
            {outing.title}
          </h3>

          {/* Date & Location */}
          <div className="space-y-1 text-xs text-[#52525B] font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span className="truncate">{outing.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
              <span className="truncate">{outing.location}</span>
            </div>
          </div>

          {/* Squad Perk Badge */}
          {outing.squadPerk && (
            <div className="p-2 rounded-xl bg-[#EFF6FF] border border-[#2563EB] text-[11px] font-bold text-[#1D4ED8]">
              {outing.squadPerk}
            </div>
          )}

          {/* Single Clean Accessibility / Payment Tag */}
          <div className="pt-1">
            <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#09090B] px-2.5 py-1 rounded-md border-2 border-[#09090B] inline-block shadow-2xs">
              {outing.accessibilityTag || '💳 Revolut Ready'}
            </span>
          </div>
        </div>

        {/* Card Footer: Host Avatars, RSVP & 1-Click WhatsApp Share */}
        <div className="pt-3 border-t-2 border-[#09090B]/10 flex items-center justify-between gap-2">
          
          {/* Attendees / Host Avatars */}
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {outing.attendees.map((a, i) => (
                <img
                  key={i}
                  src={a.avatar}
                  alt={a.name}
                  className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-[#09090B]"
                  title={`${a.name} (${a.metBefore ? 'Met Before ✓' : 'First Time Intro'})`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#52525B]">
              {outing.attendees.length}/{outing.maxAttendees} Going
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5">
            {/* 1-Click WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-full bg-[#FAFAFA] hover:bg-[#2563EB] hover:text-white text-[#09090B] border-2 border-[#09090B] transition-colors shadow-2xs"
              title="Share via WhatsApp Group"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* RSVP Button */}
            <button
              onClick={handleRsvpClick}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border-2 border-[#09090B] flex items-center gap-1 cursor-pointer font-display ${
                isAttending
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-[#FAFAFA] text-[#09090B] hover:bg-[#FEF3C7]'
              }`}
            >
              {isAttending ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>RSVP'd</span>
                </>
              ) : (
                <span>Join Outing</span>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
