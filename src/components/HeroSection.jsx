import React, { useState } from 'react';
import { Sparkles, Heart, Users, Calendar, ArrowRight, CheckCircle2, BatteryCharging, Zap, Image as ImageIcon } from 'lucide-react';
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
  const [selectedThemeId, setSelectedThemeId] = useState('girl_club');

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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F2]/50 via-[#FAF6F0] to-[#FAF6F0] pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Personality Engine */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Brand Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#2C221E] text-xs font-bold shadow-xs border border-[#E0D4C5]">
              <span className="w-2 h-2 rounded-full bg-[#C85A65] animate-pulse"></span>
              <span className="font-mono tracking-widest uppercase text-[11px]">AMIGA • DUBLIN EDITION</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-[#2C221E] leading-[1.1]">
              A Life Curated. <br />
              <span className="font-serif italic font-normal text-[#C85A65]">Elevating Every Outing</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6C5E58] font-medium leading-relaxed max-w-2xl">
              From <strong className="text-[#2C221E]">Early Dinner at Coppinger Row</strong> to <strong className="text-[#2C221E]">Wicklow Mountain Spa Retreats</strong> and <strong className="text-[#2C221E]">Girls Long Weekends in Lisbon</strong>. Curated for connected women with zero planning friction.
            </p>

            {/* Interactive Social Battery Level Filter */}
            <div className="p-4 rounded-2xl bg-white border border-[#E0D4C5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#9E8E87] flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-[#C85A65]" />
                  Filter Outings by Social Energy Status
                </span>
                <span className="text-[11px] font-bold text-[#7B9E87] font-mono">
                  LIVE SYNC
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
                  ⚡ All Energy
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

            {/* Friend Selector & Synergy Calculator */}
            <div className="p-5 rounded-2xl bg-white border border-[#E0D4C5] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2C221E] font-display">
                    {appMode === 'empty' && friendsList.length === 0 ? 'Squad Roster (Empty State)' : 'Select Friends to Compute Squad Match'}
                  </h3>
                  <p className="text-xs text-[#6C5E58]">
                    {appMode === 'empty' && friendsList.length === 0 ? 'No friends added yet to personal roster.' : 'Routine compatibility & social battery alignment'}
                  </p>
                </div>
                {friendsList.length > 0 && (
                  <div className="bg-[#FFF0F2] text-[#C85A65] px-3 py-1 rounded-full text-xs font-extrabold border border-[#F7B7A3] font-mono">
                    {avgScore}% Synergy Score
                  </div>
                )}
              </div>

              {/* Friend Avatars Toggle List */}
              {friendsList.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-dashed border-[#E0D4C5] text-center space-y-2">
                  <p className="text-xs font-bold text-[#2C221E]">Your personal squad roster is clean.</p>
                  <p className="text-[11px] text-[#6C5E58]">Tap "Load Demo Outings & Squad" below or go to Settings to add your friends!</p>
                  <button
                    onClick={() => setAppMode('demo')}
                    className="btn bg-[#F9E076] text-[#4A3E00] hover:bg-[#F0D55D] text-xs font-bold py-1 px-3 mt-1 shadow-xs"
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
              )}

              {/* 1-Tap Squad Availability Poller */}
              {friendsList.length > 0 && (
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
              )}
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

          {/* Right Column: Aesthetic Theme Dropdown & Cutout Moodboard */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            
            {/* Aesthetic Theme Dropdown Select */}
            <div className="w-full max-w-sm mb-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#E0D4C5] shadow-xs">
                <ImageIcon className="w-4 h-4 text-[#C85A65]" />
                <span className="text-xs font-bold text-[#9E8E87] uppercase tracking-wider whitespace-nowrap">
                  Collage Theme:
                </span>
                <select
                  value={selectedThemeId}
                  onChange={(e) => setSelectedThemeId(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-[#2C221E] outline-none cursor-pointer"
                >
                  <option value="girl_club">🎀 Girl Club Classic (Red & Pink Cutouts)</option>
                  <option value="nature">🌿 Wicklow Spa & Nature Retreat</option>
                  <option value="afternoon_tea">🥂 Shelbourne Afternoon Tea</option>
                  <option value="concert">🎸 Whelan’s Acoustic Live Gig</option>
                  <option value="trip">✈️ Lisbon Long Weekend Getaway</option>
                  <option value="coffee">☕ Ranelagh Maternity Coffee Walk</option>
                </select>
              </div>
            </div>

            {/* Theme Collage Card */}
            <ThemeCollageCard themeId={selectedThemeId} />

          </div>

        </div>

      </div>
    </section>
  );
}
