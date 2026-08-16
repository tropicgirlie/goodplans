import React, { useState } from 'react';
import { Sparkles, Heart, Users, Calendar, ArrowRight, CheckCircle2, BatteryCharging, Zap } from 'lucide-react';
import { FRIENDS_DATA } from '../data/mockData';
import ThemeCollageCard from './ThemeCollageCard';
import confetti from 'canvas-confetti';

export default function HeroSection({
  selectedFriends,
  setSelectedFriends,
  onOpenPlanModal,
  onSelectAffinityTab,
  batteryFilter,
  setBatteryFilter,
  friendsList = FRIENDS_DATA,
  appMode,
  setAppMode
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
  const activeFriends = friendsList.filter(f => selectedFriends.includes(f.id));
  const avgScore = activeFriends.length > 0 ? Math.round(92 + (activeFriends.length * 1.5) % 8) : 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EFF6F0]/60 via-[#FAFAFA] to-[#FAFAFA] pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Personality Engine */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Brand Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#09090B] text-xs font-black shadow-2xs border-2 border-[#09090B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse"></span>
              <span className="font-mono tracking-widest uppercase text-[11px]">AMIGA DUBLIN</span>
            </div>

            {/* Title with Syne Trendy Font */}
            <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-[#09090B] leading-[1.08]">
              A Life Curated. <br />
              <span className="font-serif-editorial italic font-normal text-[#2563EB]">Elevating Every Outing</span>
            </h1>

            <p className="text-sm sm:text-base text-[#52525B] font-semibold leading-relaxed max-w-2xl">
              From <strong className="text-[#09090B]">Early Dinner at Coppinger Row</strong> to <strong className="text-[#09090B]">Wicklow Mountain Spa Retreats</strong> and <strong className="text-[#09090B]">Girls Long Weekends in Lisbon</strong>. Curated for connected women with zero planning friction.
            </p>

            {/* Interactive Social Battery Level Filter */}
            <div className="p-4 rounded-2xl bg-white border-3 border-[#09090B] shadow-[5px_5px_0px_#09090B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#09090B] flex items-center gap-1.5 font-display">
                  <BatteryCharging className="w-4 h-4 text-[#2563EB]" />
                  Filter Outings by Social Energy Status
                </span>
                <span className="text-[11px] font-bold text-[#2563EB] font-mono bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#09090B]">
                  LIVE SYNC
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBatteryFilter('all')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border-2 border-[#09090B] text-center cursor-pointer ${
                    batteryFilter === 'all'
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-[#FAFAFA] text-[#09090B] hover:bg-[#EFF6FF]'
                  }`}
                >
                  ⚡ All Energy
                </button>

                <button
                  onClick={() => setBatteryFilter('high')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border-2 border-[#09090B] text-center cursor-pointer ${
                    batteryFilter === 'high'
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-[#FAFAFA] text-[#09090B] hover:bg-[#EFF6FF]'
                  }`}
                >
                  🔋 High Energy (100%)
                </button>

                <button
                  onClick={() => setBatteryFilter('cozy')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border-2 border-[#09090B] text-center cursor-pointer ${
                    batteryFilter === 'cozy'
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-[#FAFAFA] text-[#09090B] hover:bg-[#EFF6FF]'
                  }`}
                >
                  🪫 Cozy Low-Key (30%)
                </button>
              </div>
            </div>

            {/* Friend Selector & Synergy Calculator */}
            <div className="p-5 rounded-2xl bg-white border-3 border-[#09090B] shadow-[5px_5px_0px_#09090B] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#09090B] font-display">
                    {appMode === 'empty' && friendsList.length === 0 ? 'Squad Roster (Empty State)' : 'Select Friends to Compute Squad Match'}
                  </h3>
                  <p className="text-xs text-[#52525B] font-medium">
                    {appMode === 'empty' && friendsList.length === 0 ? 'No friends added yet to personal roster.' : 'Routine compatibility & social battery alignment'}
                  </p>
                </div>
                {friendsList.length > 0 && (
                  <div className="bg-[#FEF3C7] text-[#09090B] px-3 py-1 rounded-full text-xs font-black border-2 border-[#09090B] font-mono">
                    {avgScore}% Synergy Score
                  </div>
                )}
              </div>

              {/* Friend Avatars Toggle List */}
              {friendsList.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAFAFA] border-2 border-dashed border-[#09090B] text-center space-y-2">
                  <p className="text-xs font-bold text-[#09090B]">Your personal squad roster is clean.</p>
                  <p className="text-[11px] text-[#52525B]">Tap "Load Demo Outings & Squad" below or go to Settings to add your friends!</p>
                  <button
                    onClick={() => setAppMode('demo')}
                    className="btn-pop-primary text-xs py-1 px-3 mt-1"
                  >
                    🌟 Load Demo Squad (5 Friends)
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  {friendsList.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.id);
                    return (
                      <button
                        key={friend.id}
                        onClick={() => toggleFriend(friend.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#09090B] text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2563EB] text-white shadow-2xs'
                            : 'bg-white text-[#52525B] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={friend.avatar} alt={friend.name} className="w-5 h-5 rounded-full object-cover border border-white" />
                        <span>{friend.name}</span>
                        <span className="text-[10px] font-mono font-bold text-[#F59E0B]">({friend.mbti})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 1-Tap Squad Availability Poller */}
              {friendsList.length > 0 && (
                <div className="pt-3 border-t-2 border-[#09090B]/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#52525B] font-semibold">
                    {availabilityPolled ? (
                      <span className="text-[#059669] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        #1 Overlapping Slot Found: Friday Early Dinner 6:30 PM!
                      </span>
                    ) : (
                      <span>No-Chat Date Polling: Auto-find free time for selected friends</span>
                    )}
                  </div>

                  <button
                    onClick={handlePollAvailability}
                    className="btn-pop-primary py-1.5 px-3 text-xs bg-[#F59E0B] text-[#09090B]"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Find Squad Availability
                  </button>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPlanModal}
                className="btn-pop-primary text-sm shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#FEF3C7]" />
                Plan Outing Now
              </button>

              <button
                onClick={onSelectAffinityTab}
                className="btn-pop-secondary text-sm font-bold"
              >
                <Users className="w-4 h-4 text-[#2563EB]" />
                View Vibe Matrix
              </button>
            </div>

          </div>

          {/* Right Column: Clean Premium Hero Card */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <ThemeCollageCard />
          </div>

        </div>

      </div>
    </section>
  );
}
