import React from 'react';

export default function ThemeCollageCard({ className = '' }) {
  return (
    <div className={`relative w-full max-w-sm transition-all duration-300 ${className}`}>
      
      {/* Mature Editorial Moodboard Frame */}
      <div className="p-3.5 bg-[#FAF5EF] rounded-2xl border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] transform hover:rotate-0 transition-all duration-300 relative overflow-hidden">
        
        {/* Main Kinfolk/Vogue Style Editorial Moodboard Photo */}
        <div className="relative overflow-hidden rounded-xl border border-[#18181B]/20 shadow-xs bg-white aspect-[4/3]">
          <img
            src="/images/mature_hero.jpg"
            alt="The Dublin Women's Social Collective"
            className="w-full h-full object-cover object-center shadow-inner"
          />
        </div>
        
        {/* Card Caption */}
        <div className="mt-3 px-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-lg font-serif-editorial italic text-[#18181B] block font-normal">
              The Dublin Social Collective
            </span>
            <span className="text-xs font-mono font-bold bg-[#FAF5EF] text-[#064E3B] px-2.5 py-0.5 rounded-full border border-[#064E3B]">
              99% Match
            </span>
          </div>

          <p className="text-[11px] font-bold text-[#52525B] tracking-wider uppercase font-mono">
            Kinfolk Editorial Moodboard • Dublin
          </p>
        </div>

        {/* Product Badges Row */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#18181B]/10">
          <span className="text-[10px] font-bold bg-white text-[#18181B] px-2.5 py-1 rounded-full border border-[#18181B]/30">
            ☕ Wilde Cafe Meetings
          </span>
          <span className="text-[10px] font-bold bg-white text-[#18181B] px-2.5 py-1 rounded-full border border-[#18181B]/30">
            🍷 Natural Wine Dinners
          </span>
          <span className="text-[10px] font-bold bg-white text-[#18181B] px-2.5 py-1 rounded-full border border-[#18181B]/30">
            🌿 Thermal Spa Days
          </span>
        </div>

      </div>

      {/* Floating Top Badge */}
      <div className="absolute -top-3 -right-3 bg-[#064E3B] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-[4px_4px_0px_#18181B] border border-[#18181B] transform rotate-3 font-serif-editorial text-sm z-30">
        The Dublin Collective
      </div>

    </div>
  );
}
