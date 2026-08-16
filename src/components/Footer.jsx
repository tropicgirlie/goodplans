import React from 'react';
import { Heart, Sparkles, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t-3 border-[#09090B] py-10 mt-16 text-[#09090B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b-2 border-[#09090B]/15">
          
          {/* Brand */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-extrabold text-2xl font-display uppercase tracking-tight text-[#09090B]">
                  Amiga
                </span>
                <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border-2 border-[#09090B] tracking-widest uppercase">
                  Dublin
                </span>
              </div>
              <p className="text-xs text-[#52525B] font-semibold mt-0.5">
                Pop-Art Editorial Outings, MBTI Matching &amp; Routine Synergy
              </p>
            </div>
          </div>

          {/* Core UX Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#09090B]">
            <span className="flex items-center gap-1 bg-[#FAFAFA] px-3 py-1.5 rounded-full border-2 border-[#09090B] shadow-2xs">
              <span className="material-symbols-outlined text-sm text-[#2563EB]">schedule</span>
              Dublin Hours Protection
            </span>
            <span className="flex items-center gap-1 bg-[#FAFAFA] px-3 py-1.5 rounded-full border-2 border-[#09090B] shadow-2xs">
              <span className="material-symbols-outlined text-sm text-[#059669]">groups</span>
              Met Before Tagging
            </span>
            <span className="flex items-center gap-1 bg-[#FAFAFA] px-3 py-1.5 rounded-full border-2 border-[#09090B] shadow-2xs">
              <span className="material-symbols-outlined text-sm text-[#F59E0B]">payments</span>
              Revolut Split Bill Ready
            </span>
          </div>

        </div>

        {/* Bottom Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#52525B]">
          <p>© {new Date().getFullYear()} Amiga Europe. Designed for connected women in Dublin, Ireland.</p>
          
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#09090B]">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-[#E11D48] fill-[#E11D48] animate-pulse" />
            <span>by</span>
            <a
              href="https://luana.systems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] hover:underline font-extrabold underline-offset-4 tracking-tight"
            >
              luana.systems
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
