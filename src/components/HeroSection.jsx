import React, { useState } from 'react';
import { Sparkles, Heart, Users, Calendar, ArrowRight, CheckCircle2, BatteryCharging, Zap } from 'lucide-react';
import { FRIENDS_DATA } from '../data/mockData';
import confetti from 'canvas-confetti';

export default function HeroSection({
  selectedFriends,
  setSelectedFriends,
  onOpenPlanModal,
  onSelectAffinityTab,
  batteryFilter,
  setBatteryFilter
}) {
  const [availabilityPolled, setAvailabilityPolled] = useState(false);

  const toggleFriend = (id) => {
    if (selectedFriends.includes(id)) {
      if (selectedFriends.length > 1) {
        setSelectedFriends(selectedFriends.filter(fId => fId !== id));
      }
    } else {
      setSelectedFriends([...selectedFriends, id]);
    }
  };

  const handlePollAvailability = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 }
    });
    setAvailabilityPolled(true);
  };

  // Calculate live squad synergy score
  const activeFriends = FRIENDS_DATA.filter(f => selectedFriends.includes(f.id));
  const avgScore = Math.round(92 + (activeFriends.length * 1.5) % 8);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F2]/50 via-[#FAF6F0] to-[#FAF6F0] pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Scrapbook Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Personality Engine */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Cute Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F9E076] text-[#4A3E00] text-xs font-extrabold shadow-xs font-handwriting text-base border border-white transform -rotate-1">
              <Sparkles className="w-4 h-4 text-[#C85A65]" />
              Dublin Outing Planner for Female Friendships
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#2C221E] leading-[1.15]">
              Plan Outings Matched to Your <span className="underline decoration-[#C85A65] decoration-wavy decoration-2">Squad’s Routine & Vibe</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6C5E58] font-medium leading-relaxed max-w-2xl">
              From <strong className="text-[#2C221E]">Early Lunch in Coppinger Row</strong> to <strong className="text-[#2C221E]">Wednesday Post-Work Dance</strong>, <strong className="text-[#2C221E]">Wicklow Spa Retreats</strong>, and <strong className="text-[#2C221E]">Lisbon Trips</strong>. Zero invisible planning labor!
            </p>

            {/* Interactive Social Battery Level Filter */}
            <div className="p-4 rounded-2xl bg-white border-2 border-[#F3ECE0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#9E8E87] flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-[#C85A65]" />
                  Match Outings to Social Battery Level
                </span>
                <span className="text-[11px] font-bold text-[#7B9E87]">
                  Filter Feed Live
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBatteryFilter('all')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    batteryFilter === 'all'
                      ? 'bg-[#C85A65] text-white border-[#C85A65] shadow-xs'
                      : 'bg-[#FAF6F0] text-[#6C5E58] border-[#E0D4C5] hover:bg-[#F3ECE0]'
                  }`}
                >
                  ⚡ All Batteries
                </button>

                <button
                  onClick={() => setBatteryFilter('high')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    batteryFilter === 'high'
                      ? 'bg-[#C85A65] text-white border-[#C85A65] shadow-xs'
                      : 'bg-[#FAF6F0] text-[#6C5E58] border-[#E0D4C5] hover:bg-[#F3ECE0]'
                  }`}
                >
                  🔋 High Energy (100%)
                </button>

                <button
                  onClick={() => setBatteryFilter('cozy')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    batteryFilter === 'cozy'
                      ? 'bg-[#C85A65] text-white border-[#C85A65] shadow-xs'
                      : 'bg-[#FAF6F0] text-[#6C5E58] border-[#E0D4C5] hover:bg-[#F3ECE0]'
                  }`}
                >
                  🪫 Cozy Low-Key (30%)
                </button>
              </div>
            </div>

            {/* Friend Selector & Vibe Match Card */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[#E0D4C5] shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2C221E] font-display">
                    Select Friends to Compute Squad Match
                  </h3>
                  <p className="text-xs text-[#6C5E58]">Calculates routine compatibility & social battery sync</p>
                </div>
                <div className="bg-[#FFF0F2] text-[#C85A65] px-3 py-1 rounded-full text-xs font-extrabold border border-[#F7B7A3] font-mono">
                  {avgScore}% Squad Synergy
                </div>
              </div>

              {/* Friend Avatars Toggle List */}
              <div className="flex flex-wrap items-center gap-3">
                {FRIENDS_DATA.map((friend) => {
                  const isSelected = selectedFriends.includes(friend.id);
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF6F0] text-[#2C221E] border-[#C85A65] ring-2 ring-[#C85A65]/30 shadow-xs'
                          : 'bg-white text-[#9E8E87] border-[#E0D4C5] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={friend.avatar} alt={friend.name} className="w-5 h-5 rounded-full object-cover" />
                      <span>{friend.name}</span>
                      <span className="text-[10px] font-mono font-bold text-[#C85A65]">({friend.mbti})</span>
                    </button>
                  );
                })}
              </div>

              {/* 1-Tap Squad Availability Poller (UX Feature) */}
              <div className="pt-3 border-t border-[#F3ECE0] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#6C5E58] font-medium">
                  {availabilityPolled ? (
                    <span className="text-[#2E7D32] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      #1 Overlapping Slot Found: Friday Early Dinner 6:30 PM!
                    </span>
                  ) : (
                    <span>No-Chat Date Polling: Auto-find free time for selected friends</span>
                  )}
                </div>

                <button
                  onClick={handlePollAvailability}
                  className="btn bg-[#F9E076] text-[#4A3E00] hover:bg-[#F0D55D] py-1.5 px-3 text-xs font-extrabold shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Find Squad Availability
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPlanModal}
                className="btn btn-primary text-sm font-bold shadow-lg hover:scale-105 transition-transform"
              >
                <Sparkles className="w-4 h-4" />
                Plan Outing Now
              </button>

              <button
                onClick={onSelectAffinityTab}
                className="btn btn-secondary text-sm font-bold"
              >
                <Users className="w-4 h-4 text-[#7B9E87]" />
                View Vibe Matrix
              </button>
            </div>

          </div>

          {/* Right Column: Polaroid Scrapbook Collage */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Main Polaroid Frame */}
            <div className="relative w-full max-w-sm">
              
              {/* Tape */}
              <div className="tape-strip tape-top-center"></div>

              {/* Hero Image Card */}
              <div className="polaroid-frame transform rotate-2 hover:rotate-0 transition-transform duration-300 shadow-xl">
                <img
                  src="/images/scrapbook_afternoon_tea.jpg"
                  alt="Afternoon Tea in Dublin"
                  className="polaroid-img aspect-[4/3]"
                />
                
                <div className="handwritten-caption mt-2 flex items-center justify-between">
                  <span className="text-xl">shelbourne tea & pamper 💕</span>
                  <span className="text-xs font-mono font-bold bg-[#C85A65] text-white px-2 py-0.5 rounded-full">
                    99% Match
                  </span>
                </div>
              </div>

              {/* Floating Sticker 1 */}
              <div className="absolute -top-4 -right-4 bg-[#F9E076] text-[#4A3E00] px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg border-2 border-white transform rotate-12 font-handwriting text-base">
                ✨ Zero Chat Fatigue!
              </div>

              {/* Floating Sticker 2 */}
              <div className="absolute -bottom-6 -left-4 bg-[#7B9E87] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white transform -rotate-6">
                👯 Met Before ✓ Tagging
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
