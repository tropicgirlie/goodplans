import React from 'react';
import { Sparkles, Users, Heart, Target, ArrowRight, UserCheck } from 'lucide-react';
import { FRIENDS_DATA } from '../data/mockData';

export default function HeroSection({ selectedFriends, setSelectedFriends, onOpenPlanModal, onSelectAffinityTab }) {
  const toggleFriend = (id) => {
    if (selectedFriends.includes(id)) {
      if (selectedFriends.length > 1) {
        setSelectedFriends(selectedFriends.filter(fId => fId !== id));
      }
    } else {
      setSelectedFriends([...selectedFriends, id]);
    }
  };

  const squadMatchPercent = Math.min(99, 88 + selectedFriends.length * 2);

  // Dynamic Relationship Type Tag based on selection
  const getRelationshipType = () => {
    if (selectedFriends.length === 2) return '☕ 1:1 Catchup Duo';
    if (selectedFriends.length <= 4) return '👯 Core Squad Circle';
    return '🔀 Mixed Friend Circle (Introductions & Group Sync)';
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-[#F3ECE0]/50 to-[#FAF6F0] py-10 lg:py-14 border-b border-[#F3ECE0]">
      {/* Background Decorative Accents */}
      <div className="absolute top-4 left-6 text-2xl animate-bounce pointer-events-none hidden sm:block">🌟</div>
      <div className="absolute top-12 right-12 text-3xl pointer-events-none hidden md:block rotate-12">🌸</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading & Relationship Tier Selector */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F9E076] border border-[#E0D4C5] shadow-xs transform -rotate-1">
              <Sparkles className="w-4 h-4 text-[#4A3E00]" />
              <span className="text-xs font-extrabold text-[#4A3E00] uppercase tracking-wider font-display">
                Dublin Women's Social & Connection Planner
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black font-display text-[#2C221E] leading-tight tracking-tight">
              Plan Outings Your Friends Will <span className="wavy-underline text-[#C85A65]">Truly Enjoy</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#6C5E58] max-w-xl font-medium">
              Designed for female friend circles, 1:1 catchups, and mixed group introductions in Dublin. Match outings by <strong className="text-[#2C221E]">personality energy, familiarity, and shared interests</strong>.
            </p>

            {/* Friend Circle & Familiarity Selector */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#F3ECE0] shadow-sm relative">
              <div className="absolute -top-3 right-6 bg-[#7B9E87] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs font-handwriting text-base rotate-2">
                {getRelationshipType()}
              </div>

              <p className="text-xs font-extrabold uppercase tracking-wider text-[#9E8E87] mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#C85A65]" />
                Select Participating Friends (Tag Familiarity & Met Before):
              </p>

              {/* Friend Avatar Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {FRIENDS_DATA.map((friend, idx) => {
                  const isSelected = selectedFriends.includes(friend.id);
                  const hasMetOthers = idx < 3; // UX research tag
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-sm scale-105'
                          : 'bg-[#FAF6F0] text-[#6C5E58] border-[#E0D4C5] hover:bg-[#F3ECE0]'
                      }`}
                    >
                      <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        className="w-5 h-5 rounded-full object-cover border border-white"
                      />
                      <span>{friend.name.split(' ')[0]}</span>
                      <span className="text-[10px] font-mono opacity-80">({friend.mbti})</span>
                      {isSelected && (
                        <span className={`text-[9px] px-1 rounded font-normal ${hasMetOthers ? 'bg-[#7B9E87] text-white' : 'bg-[#F9E076] text-[#4A3E00]'}`}>
                          {hasMetOthers ? 'Met Before ✓' : 'New Intro 👋'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Live Synergy Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#C85A65] text-white flex items-center justify-center font-extrabold text-sm shadow-xs font-display">
                    {squadMatchPercent}%
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#2C221E] font-display">
                      Group Vibe & Comfort Match
                    </h4>
                    <p className="text-[11px] text-[#6C5E58] font-medium">
                      Matched for Ranelagh, Grafton St & Howth Outings
                    </p>
                  </div>
                </div>

                <button
                  onClick={onSelectAffinityTab}
                  className="text-xs font-bold text-[#C85A65] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  Vibe Matrix <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPlanModal}
                className="btn btn-primary text-base px-6 py-3 shadow-md hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5" />
                Plan Outing in Dublin
              </button>
              <button
                onClick={onSelectAffinityTab}
                className="btn btn-secondary text-base px-5 py-3"
              >
                <Target className="w-5 h-5 text-[#C85A65]" />
                Explore Circle Vibe Matrix
              </button>
            </div>

          </div>

          {/* Right Column: Scrapbook Collage Photo */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            <div className="polaroid-frame max-w-md w-full transform rotate-1 hover:rotate-0 transition-transform">
              <div className="tape-strip tape-top-left"></div>
              <div className="tape-strip tape-top-right"></div>

              <div className="relative overflow-hidden rounded">
                <img 
                  src="/images/scrapbook_coffee_walk.jpg" 
                  alt="Ranelagh Coffee Walk"
                  className="w-full aspect-[4/3] object-cover rounded"
                />

                <div className="absolute top-3 left-3 bg-[#F9E076] text-[#4A3E00] text-xs font-extrabold px-3 py-1 rounded-full shadow-xs font-handwriting text-base border border-white">
                  monday coffee stroll ☕
                </div>

                <div className="absolute bottom-3 right-3 bg-[#C85A65] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md border-2 border-white flex items-center gap-1 font-display">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  98% Circle Synergy
                </div>
              </div>

              <div className="pt-3 px-1 flex items-center justify-between">
                <div>
                  <p className="font-handwriting text-xl text-[#2C221E] font-bold leading-none">
                    "st stephen’s green coffee stroll"
                  </p>
                  <p className="text-[11px] text-[#9E8E87] font-medium mt-0.5">
                    Ranelagh & Dublin 2 • Core Squad & Intros
                  </p>
                </div>
                <div className="text-xl">🌸</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
