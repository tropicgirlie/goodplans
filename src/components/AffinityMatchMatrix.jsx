import React, { useState, useEffect } from 'react';
import { Target, Users, Sparkles, Check, Coffee, Palette, Trees, Pizza, UserCheck, ShieldCheck, HeartHandshake } from 'lucide-react';
import VibeDoodle from './VibeDoodle';
import { findVenues } from '../lib/goodPlansApi';
import { FRIENDS_DATA } from '../data/mockData';

export default function AffinityMatchMatrix({ selectedFriends, setSelectedFriends, onOpenPlanModal }) {
  const [categoryScores, setCategoryScores] = useState([]);
  const [harmonyScore, setHarmonyScore] = useState(95);
  const [loading, setLoading] = useState(false);

  const activeFriends = FRIENDS_DATA.filter(f => selectedFriends.includes(f.id));

  // Compute stats
  const mbtiTypes = activeFriends.map(f => f.mbti).join(', ');
  const introverts = activeFriends.filter(f => /^[I]/i.test(f.mbti || '')).length;
  
  useEffect(() => {
    const loadRecs = async () => {
      setLoading(true);
      try {
        const res = await findVenues({ friends: activeFriends });
        if (res.venues) {
          setCategoryScores(res.venues);
          const avg = res.venues.length
            ? Math.round(res.venues.reduce((sum, item) => sum + item.score, 0) / res.venues.length)
            : 90;
          setHarmonyScore(avg);
        }
      } catch (err) {
        console.error('Recommendations failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRecs();
  }, [selectedFriends]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#09090B] text-xs font-extrabold border-2 border-[#09090B] mb-3 shadow-2xs font-display">
          <Sparkles className="w-4 h-4 text-[#2563EB]" /> Women's Social Cohorts &amp; Vibe Matrix
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#09090B]">
          Circle Vibe &amp; Familiarity Matrix
        </h2>
        <p className="text-sm sm:text-base text-[#52525B] font-semibold mt-2">
          Study and balance social battery cost, familiarity (met before vs introductions), and MBTI energy for 1:1, Core Squad, or Mixed Circle outings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Friend Squad Selection Grid */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border-3 border-[#09090B] shadow-[5px_5px_0px_#09090B]">
            <h3 className="text-base font-extrabold font-display text-[#09090B] mb-4 flex items-center justify-between">
              <span>Participating Friends ({activeFriends.length})</span>
              <span className="text-xs text-[#2563EB] font-bold">Toggle Circle</span>
            </h3>

            <div className="space-y-3">
              {FRIENDS_DATA.map((friend) => {
                const isSelected = selectedFriends.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    onClick={() => {
                      if (isSelected && selectedFriends.length > 1) {
                        setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                      } else if (!isSelected) {
                        setSelectedFriends([...selectedFriends, friend.id]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border-2 border-[#09090B] cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EFF6FF] text-[#09090B] shadow-2xs'
                        : 'bg-white text-[#52525B] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#09090B]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-[#09090B]">{friend.name}</h4>
                          <span className="bg-[#FEF3C7] text-[#09090B] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#09090B] font-mono">
                            {friend.mbti}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#52525B] font-semibold mt-0.5">
                          <span>{friend.archetype}</span>
                          <span className="text-[10px] font-bold text-[#2563EB]">• {friend.ageGroup}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#09090B] ${
                      isSelected ? 'bg-[#2563EB] text-white' : 'bg-white'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Battery & Familiarity Tag */}
          <div className="bg-[#FAFAFA] p-5 rounded-2xl border-3 border-[#09090B] shadow-[5px_5px_0px_#09090B] space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#09090B] flex items-center gap-1.5 font-display">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              Familiarity &amp; Comfort Breakdown:
            </h4>
            <div className="text-xs text-[#09090B] space-y-1 font-semibold">
              <p><strong>Circle Type:</strong> {activeFriends.length === 1 ? '☕ 1:1 Solo/Catchup' : activeFriends.length === 2 ? '☕ 1:1 Catchup Duo' : activeFriends.length <= 4 ? '👯 Core Squad Circle' : '🔀 Mixed Intro Circle'}</p>
              <p><strong>MBTI Alignment:</strong> {mbtiTypes}</p>
              <p><strong>Social Battery Cost:</strong> {introverts > activeFriends.length / 2 ? 'Cozy Low-Key Sync' : 'Lively Energized Sync'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Rankings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-3 border-[#09090B] shadow-[5px_5px_0px_#09090B] relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#09090B]/10">
              <div>
                <span className="text-xs font-black text-[#2563EB] uppercase tracking-wider font-mono">
                  Squad Match Calculation
                </span>
                <h3 className="text-2xl font-black font-display text-[#09090B]">
                  Recommended Dublin Activities
                </h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-display text-[#2563EB]">
                  {loading ? '...' : `${harmonyScore}%`}
                </div>
                <div className="text-[11px] font-bold text-[#52525B]">
                  Vibe Harmony
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="space-y-4 mb-8">
              {loading ? (
                <div className="p-12 text-center text-xs font-bold text-[#6c5e58]">
                  Calculating vibe matches...
                </div>
              ) : categoryScores.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-[#6c5e58]">
                  No curated matches found for this city.
                </div>
              ) : (
                categoryScores.map((cat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#FAFAFA] border-2 border-[#09090B] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <VibeDoodle type={cat.iconName} size={42} />
                        <div>
                          <h4 className="text-sm font-extrabold text-[#09090B]">{cat.name}</h4>
                          <p className="text-xs text-[#52525B] font-medium">{cat.vibe}</p>
                        </div>
                      </div>
                      <span className="text-base font-black font-display text-[#2563EB]">
                        {cat.score}%
                      </span>
                    </div>

                    <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#09090B] mt-1">
                      <div 
                        className="bg-[#2563EB] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${cat.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  if (categoryScores.length > 0) {
                    onOpenPlanModal(categoryScores[0]);
                  }
                }}
                disabled={categoryScores.length === 0 || loading}
                className="btn-pop-primary text-base px-8 py-3.5 shadow-md w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5 text-[#FEF3C7]" />
                Plan Outing for Selected Friends
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
