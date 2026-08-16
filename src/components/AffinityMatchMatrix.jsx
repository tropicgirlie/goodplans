import React from 'react';
import { Target, Users, Sparkles, Check, Coffee, Palette, Trees, Pizza, UserCheck, ShieldCheck, HeartHandshake } from 'lucide-react';
import { FRIENDS_DATA } from '../data/mockData';

export default function AffinityMatchMatrix({ selectedFriends, setSelectedFriends, onOpenPlanModal }) {
  const activeFriends = FRIENDS_DATA.filter(f => selectedFriends.includes(f.id));

  // Compute stats
  const mbtiTypes = activeFriends.map(f => f.mbti).join(', ');
  const totalInterests = Array.from(new Set(activeFriends.flatMap(f => f.interests)));
  
  const categoryScores = [
    { name: 'Coffee & Strolls in Dublin', icon: Coffee, score: 98, vibe: 'Clement & Pekoe, St Stephen’s Green & low key chat' },
    { name: 'Matcha & Board Game Duo', icon: Pizza, score: 96, vibe: 'Temple Bar board game cafe & sourdough pizza' },
    { name: 'Pottery & Wine Workshop', icon: Palette, score: 94, vibe: 'Ranelagh clay sculpting & organic wine' },
    { name: 'Howth Cliff Walk & Sea', icon: Trees, score: 91, vibe: 'Coastal hike, fresh sea breeze & fish & chips' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9E076] text-[#4A3E00] text-xs font-bold font-handwriting text-base mb-3 transform -rotate-1">
          <Sparkles className="w-4 h-4" /> Women's Social Cohorts & Vibe Matrix
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2C221E]">
          Circle Vibe & Familiarity Matrix
        </h2>
        <p className="text-sm sm:text-base text-[#6C5E58] mt-2">
          Study and balance social battery cost, familiarity (met before vs introductions), and MBTI energy for 1:1, Core Squad, or Mixed Circle outings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Friend Squad Selection Grid */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#F3ECE0] shadow-xs">
            <h3 className="text-base font-bold font-display text-[#2C221E] mb-4 flex items-center justify-between">
              <span>Participating Friends ({activeFriends.length})</span>
              <span className="text-xs text-[#C85A65] font-bold">Toggle Circle</span>
            </h3>

            <div className="space-y-3">
              {FRIENDS_DATA.map((friend, idx) => {
                const isSelected = selectedFriends.includes(friend.id);
                const hasMetBefore = idx < 3;
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
                        ? 'bg-[#FAF6F0] border-[#C85A65] shadow-xs'
                        : 'bg-white border-[#E0D4C5] opacity-60 hover:opacity-100'
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
                          <h4 className="text-sm font-extrabold text-[#2C221E]">{friend.name}</h4>
                          <span className="bg-[#2C221E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                            {friend.mbti}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6C5E58] mt-0.5">
                          <span>{friend.archetype}</span>
                          <span className="text-[10px] font-semibold text-[#C85A65]">• {friend.ageGroup}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-[#C85A65] border-[#C85A65] text-white' : 'border-[#D8CCC0]'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Battery & Familiarity Tag */}
          <div className="bg-[#F3ECE0] p-5 rounded-2xl border border-[#E0D4C5] space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#4A3E00] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C85A65]" />
              Familiarity & Comfort Breakdown:
            </h4>
            <div className="text-xs text-[#2C221E] space-y-1">
              <p><strong>Circle Type:</strong> {activeFriends.length === 2 ? '☕ 1:1 Catchup Duo' : activeFriends.length <= 4 ? '👯 Core Squad Circle' : '🔀 Mixed Intro Circle'}</p>
              <p><strong>MBTI Synergy:</strong> {mbtiTypes}</p>
              <p><strong>Social Battery Cost:</strong> Low • High Comfort Sync</p>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Rankings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#F3ECE0] shadow-xs relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F3ECE0]">
              <div>
                <span className="text-xs font-extrabold text-[#C85A65] uppercase tracking-wider">
                  UX Research Synergy Calculation
                </span>
                <h3 className="text-2xl font-black font-display text-[#2C221E]">
                  Recommended Dublin Activities
                </h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-display text-[#C85A65]">
                  96%
                </div>
                <div className="text-[11px] font-bold text-[#6C5E58]">
                  Vibe Harmony
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="space-y-4 mb-8">
              {categoryScores.map((cat, i) => {
                const IconComp = cat.icon;
                return (
                  <div key={i} className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#F9E076] text-[#4A3E00] flex items-center justify-center font-bold">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-[#2C221E]">{cat.name}</h4>
                          <p className="text-xs text-[#6C5E58]">{cat.vibe}</p>
                        </div>
                      </div>
                      <span className="text-base font-black font-display text-[#C85A65]">
                        {cat.score}%
                      </span>
                    </div>

                    <div className="w-full bg-[#E0D4C5] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#C85A65] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${cat.score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onOpenPlanModal}
                className="btn btn-primary text-base px-8 py-3.5 shadow-md w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5" />
                Plan Outing for Selected Friends
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
