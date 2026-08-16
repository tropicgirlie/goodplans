import React from 'react';
import { Target, Users, Sparkles, Check, ArrowRight, Zap, Coffee, Palette, Trees, Pizza } from 'lucide-react';
import { FRIENDS_DATA } from '../data/mockData';

export default function AffinityMatchMatrix({ selectedFriends, setSelectedFriends, onOpenPlanModal }) {
  const activeFriends = FRIENDS_DATA.filter(f => selectedFriends.includes(f.id));

  // Compute stats
  const mbtiTypes = activeFriends.map(f => f.mbti).join(', ');
  const totalInterests = Array.from(new Set(activeFriends.flatMap(f => f.interests)));
  
  // Calculate category affinity match percentages for the selected group
  const categoryScores = [
    { name: 'Coffee & Chill', icon: Coffee, score: 98, vibe: 'Pour-overs, bakery walks & low key chat' },
    { name: 'Board Games & Food', icon: Pizza, score: 96, vibe: 'Artisan pizza, strategy games & laughs' },
    { name: 'Creative & Art', icon: Palette, score: 92, vibe: 'Pottery, ceramic painting & wine' },
    { name: 'Outdoors & Hikes', icon: Trees, score: 89, vibe: 'Golden hour trail walks & scenic photos' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE66D] text-[#4A3E00] text-xs font-bold font-handwriting text-base mb-3 transform -rotate-1">
          <Sparkles className="w-4 h-4" /> Personality & Squad Affinity Engine
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#1E2022]">
          Squad Personality Synergy Matrix
        </h2>
        <p className="text-sm sm:text-base text-[#5F646D] mt-2">
          Select any combination of friends to calculate real-time outing compatibility, social energy balance, and recommended activities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Friend Squad Selection Grid */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#EFE9DF] shadow-sm">
            <h3 className="text-base font-bold font-display text-[#1E2022] mb-4 flex items-center justify-between">
              <span>Selected Squad Members ({activeFriends.length})</span>
              <span className="text-xs text-[#F64060] font-bold">Toggle to Compare</span>
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
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-[#F64060] shadow-xs'
                        : 'bg-white border-[#E2DACB] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-[#1E2022]">{friend.name}</h4>
                          <span className="bg-[#1E2022] text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                            {friend.mbti}
                          </span>
                        </div>
                        <p className="text-xs text-[#5F646D]">{friend.archetype}</p>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-[#F64060] border-[#F64060] text-white' : 'border-[#C4BDAD]'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Archetype Summary */}
          <div className="bg-[#EFE9DF] p-5 rounded-2xl border border-[#D6CEBE]">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#4A3E00] mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F64060]" />
              Squad Vibe Summary:
            </h4>
            <div className="text-xs text-[#1E2022] space-y-1.5">
              <p><strong>MBTI Types:</strong> {mbtiTypes}</p>
              <p><strong>Shared Affinity Tags:</strong> {totalInterests.slice(0, 5).join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Compatibility Breakdown & Top Matched Outings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#EFE9DF] shadow-sm relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EFE9DF]">
              <div>
                <span className="text-xs font-extrabold text-[#F64060] uppercase tracking-wider">
                  Real-Time Calculation
                </span>
                <h3 className="text-2xl font-black font-display text-[#1E2022]">
                  Activity Compatibility Rankings
                </h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-display text-[#F64060]">
                  96%
                </div>
                <div className="text-[11px] font-bold text-[#5F646D]">
                  Overall Squad Match
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="space-y-4 mb-8">
              {categoryScores.map((cat, i) => {
                const IconComp = cat.icon;
                return (
                  <div key={i} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2DACB]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FFE66D] text-[#4A3E00] flex items-center justify-center font-bold">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-[#1E2022]">{cat.name}</h4>
                          <p className="text-xs text-[#5F646D]">{cat.vibe}</p>
                        </div>
                      </div>
                      <span className="text-base font-black font-display text-[#F64060]">
                        {cat.score}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E2DACB] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#F64060] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${cat.score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="text-center pt-2">
              <button
                onClick={onOpenPlanModal}
                className="btn btn-primary text-base px-8 py-3.5 shadow-lg w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5" />
                Plan Outing For Selected Squad
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
