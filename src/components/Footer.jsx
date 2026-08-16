import React from 'react';
import { Heart, Sparkles, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#F3ECE0] py-10 mt-16 text-[#2C221E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#F3ECE0]">
          
          {/* Brand */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#C85A65] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-extrabold text-xl font-display uppercase tracking-tight text-[#2C221E]">
                  Affinita
                </span>
                <span className="bg-[#FAF6F0] text-[#C85A65] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#E0D4C5] tracking-widest uppercase">
                  Dublin
                </span>
              </div>
              <p className="text-xs text-[#6C5E58] font-medium mt-0.5">
                Curated Female Friendship Outings, MBTI Matching & Routine Synergy
              </p>
            </div>
          </div>

          {/* Core UX Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#6C5E58]">
            <span className="flex items-center gap-1 bg-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#E0D4C5]">
              <span className="material-symbols-outlined text-sm text-[#C85A65]">schedule</span>
              Dublin Hours Protection
            </span>
            <span className="flex items-center gap-1 bg-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#E0D4C5]">
              <span className="material-symbols-outlined text-sm text-[#7B9E87]">groups</span>
              Met Before Tagging
            </span>
            <span className="flex items-center gap-1 bg-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#E0D4C5]">
              <span className="material-symbols-outlined text-sm text-[#F9E076]">payments</span>
              Revolut Split Bill Ready
            </span>
          </div>

        </div>

        {/* Bottom Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#6C5E58]">
          <p>© {new Date().getFullYear()} Affinita Europe. Designed for connected women in Dublin, Ireland.</p>
          
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#2C221E]">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-[#C85A65] fill-[#C85A65] animate-pulse" />
            <span>by</span>
            <a
              href="https://luana.systems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C85A65] hover:underline font-extrabold underline-offset-4 tracking-tight"
            >
              luana.systems
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
