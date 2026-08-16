import React from 'react';
import { UX_COHORT_RESEARCH_DATA } from '../data/mockData';
import { Sparkles, Clock, AlertCircle, Heart, Users, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function UXResearchDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F9E076] text-[#4A3E00] text-xs font-bold font-handwriting text-base mb-3 transform -rotate-1 shadow-xs">
          <Sparkles className="w-4 h-4" /> UX Research Study: Women’s Behaviors & Age Cohorts in Dublin
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2C221E]">
          Generational Routines & Dublin Timing Preferences
        </h2>
        <p className="text-sm sm:text-base text-[#6C5E58] mt-2 leading-relaxed font-medium">
          Insights on how Millennial working women, Gen Z, and Moms on maternity leave structure outings around Dublin store closing hours, work shifts, and social energy limits.
        </p>
      </div>

      {/* Critical UX Finding Card */}
      <div className="bg-[#FFF0F2] border-2 border-[#C85A65] p-5 sm:p-6 rounded-2xl mb-8 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C85A65] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#2C221E] font-display">
                Key UX Insight: Early Dublin Closures & Dinner Preferences
              </h3>
              <span className="bg-[#C85A65] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                Verified Behavioral Pattern
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6C5E58] mt-1 leading-relaxed font-medium">
              Unlike cities with 24/7 night economies, Dublin cafes and boutiques close early (often by 6-7 PM), and many restaurants wrap up hot food kitchens early. 
              <strong> Millennial working women strongly prefer Early Lunches (11:30 AM - 1:30 PM) or Post-Work Evenings that finish by 8:30 PM</strong> over late dinners after 9 PM.
            </p>
          </div>
        </div>
      </div>

      {/* Cohort Behavioral Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {UX_COHORT_RESEARCH_DATA.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border-2 border-[#F3ECE0] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C85A65] bg-[#FFF0F2] px-2.5 py-0.5 rounded-full">
                  {item.cohort}
                </span>
                <span className="text-xs font-bold text-[#7B9E87]">
                  {item.persona}
                </span>
              </div>

              <h4 className="text-lg font-bold font-display text-[#2C221E] mb-3">
                {item.cohort.split(' ')[0]} Social Behavioral Model
              </h4>

              <p className="text-xs text-[#6C5E58] font-medium leading-relaxed mb-4">
                "{item.keyBehavior}"
              </p>

              {/* Preferred Windows */}
              <div className="space-y-2 mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A3E00] block">
                  🟢 Optimal Time Windows:
                </span>
                {item.preferredTimeWindows.map((win, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-[#2C221E] bg-[#FAF6F0] p-2 rounded-lg border border-[#E0D4C5] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7B9E87]" />
                    <span>{win}</span>
                  </div>
                ))}
              </div>

              {/* Avoided Times */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C85A65] block">
                  🔴 Avoided / High Friction:
                </span>
                {item.avoidedTimes.map((av, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-[#C85A65] bg-[#FFF0F2] p-2 rounded-lg border border-[#F7B7A3] font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{av}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Outings */}
            <div className="pt-3 border-t border-[#F3ECE0]">
              <span className="text-[10px] font-extrabold text-[#9E8E87] uppercase block mb-1">
                Top Matched Activities:
              </span>
              <p className="text-xs text-[#2C221E] font-bold">
                {item.topOutings.join(' • ')}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
