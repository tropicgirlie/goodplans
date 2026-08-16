import React from 'react';

export default function ThemeCollageCard({ className = '' }) {
  return (
    <div className={`relative w-full max-w-sm transition-all duration-300 ${className}`}>
      
      {/* Paper Washi Tape Strip */}
      <div className="tape-strip tape-top-center z-20"></div>

      {/* Hero Card Frame */}
      <div className="p-4 bg-[#FFF0F2] rounded-3xl border-3 border-[#09090B] shadow-[6px_6px_0px_#09090B] transform hover:rotate-0 transition-all duration-300 relative overflow-hidden">
        
        {/* Main Original Girl Club Moodboard Collage */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#09090B] shadow-sm bg-white aspect-[4/3]">
          <img
            src="/images/girl_club_moodboard.png"
            alt="The Girl Club Moodboard"
            className="w-full h-full object-cover object-center shadow-inner"
          />
        </div>
        
        {/* Card Caption */}
        <div className="mt-3 px-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl font-handwriting text-[#09090B] block font-bold">
              The Girl Club • Dublin 💕
            </span>
            <span className="text-xs font-mono font-black bg-[#FEF3C7] text-[#09090B] px-2.5 py-0.5 rounded-full border-2 border-[#09090B] shadow-2xs">
              99% Match
            </span>
          </div>

          <p className="text-[11px] font-bold text-[#52525B] tracking-wide">
            Curated Dublin Outings &amp; Friend Matches
          </p>
        </div>

        {/* Product Badges Row */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t-2 border-[#09090B]/15">
          <span className="text-[10px] font-bold bg-white text-[#09090B] px-2.5 py-0.5 rounded-full border-2 border-[#09090B] shadow-2xs">
            ☕ Coffee Walks
          </span>
          <span className="text-[10px] font-bold bg-white text-[#09090B] px-2.5 py-0.5 rounded-full border-2 border-[#09090B] shadow-2xs">
            🥂 Afternoon Tea
          </span>
          <span className="text-[10px] font-bold bg-white text-[#09090B] px-2.5 py-0.5 rounded-full border-2 border-[#09090B] shadow-2xs">
            🌿 Spa Retreats
          </span>
          <span className="text-[10px] font-bold bg-white text-[#09090B] px-2.5 py-0.5 rounded-full border-2 border-[#09090B] shadow-2xs">
            ✈️ Weekend Trips
          </span>
        </div>

      </div>

      {/* Floating Top Badge */}
      <div className="absolute -top-3 -right-3 bg-[#2563EB] text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-[4px_4px_0px_#09090B] border-2 border-[#09090B] transform rotate-6 font-handwriting text-base z-30">
        🎀 Connected Vibes
      </div>

      {/* Floating Bottom Badge */}
      <div className="absolute -bottom-4 -left-3 bg-[#E11D48] text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-[4px_4px_0px_#09090B] border-2 border-[#09090B] transform -rotate-4 z-30">
        ✨ Girls Night Out
      </div>

    </div>
  );
}
