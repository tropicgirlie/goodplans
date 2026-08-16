import React from 'react';
import { Search, MapPin, Plus, Users, Smartphone, Sparkles, SlidersHorizontal } from 'lucide-react';
import { CATEGORY_PILLS } from '../data/mockData';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenPlanModal,
  activeView,
  setActiveView,
  isMobileFrameView,
  setIsMobileFrameView,
  location,
  setLocation
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#EFE9DF] shadow-sm">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Scrapbook Badge */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('explore')}
            className="flex items-center gap-2 text-left bg-transparent border-none cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F64060] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              MF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl font-display tracking-tight text-[#1E2022]">
                  MeetFriends
                </span>
                <span className="bg-[#FFE66D] text-[#4A3E00] text-xs font-bold px-2 py-0.5 rounded-full border border-white shadow-xs font-handwriting">
                  Planner
                </span>
              </div>
              <p className="text-[11px] text-[#5F646D] font-medium hidden sm:block">
                Personality & Affinity Outings
              </p>
            </div>
          </button>
        </div>

        {/* Meetup-Style Search & Location Inputs */}
        <div className="hidden md:flex items-center flex-1 max-w-xl bg-[#FAF7F2] border border-[#E2DACB] rounded-full p-1.5 shadow-inner">
          <div className="flex items-center gap-2 px-3 flex-1 border-r border-[#D8D0C0]">
            <Search className="w-4 h-4 text-[#F64060]" />
            <input
              type="text"
              placeholder="Search coffee walks, hikes, game nights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-[#1E2022] placeholder:text-[#8E939D] font-medium"
            />
          </div>
          <div className="flex items-center gap-2 px-3 w-48">
            <MapPin className="w-4 h-4 text-[#4ECDC4]" />
            <input
              type="text"
              placeholder="City or neighborhood..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-[#1E2022] font-medium placeholder:text-[#8E939D]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Squad Affinity View Toggle */}
          <button
            onClick={() => setActiveView(activeView === 'affinity' ? 'explore' : 'affinity')}
            className={`btn sm:px-4 text-xs sm:text-sm font-semibold ${
              activeView === 'affinity' 
                ? 'bg-[#1E2022] text-white' 
                : 'btn-secondary'
            }`}
            title="Squad Affinity Matrix"
          >
            <Users className="w-4 h-4 text-[#FFE66D]" />
            <span className="hidden sm:inline">Squad Affinity</span>
          </button>

          {/* Create Outing CTA */}
          <button
            onClick={onOpenPlanModal}
            className="btn btn-primary text-xs sm:text-sm shadow-md hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Outing</span>
          </button>

          {/* Mobile Simulator Toggle */}
          <button
            onClick={() => setIsMobileFrameView(!isMobileFrameView)}
            className={`p-2.5 rounded-full border transition-all ${
              isMobileFrameView
                ? 'bg-[#F64060] text-white border-[#F64060] shadow-sm'
                : 'bg-[#FAF7F2] text-[#5F646D] border-[#E2DACB] hover:text-[#1E2022]'
            }`}
            title={isMobileFrameView ? "Switch to Full Desktop View" : "Preview Mobile App Shell"}
          >
            <Smartphone className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Visible on mobile screens) */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E2DACB] rounded-full p-2 shadow-inner">
          <Search className="w-4 h-4 text-[#F64060] ml-1" />
          <input
            type="text"
            placeholder="Search outings or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-[#1E2022] font-medium"
          />
        </div>
      </div>

      {/* Category Pills Bar (Meetup Style) */}
      <div className="bg-[#FAF7F2] border-t border-b border-[#EFE9DF] px-4 sm:px-8 py-2.5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedCategory(pill.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === pill.id
                  ? 'bg-[#F64060] text-white shadow-sm scale-105'
                  : 'bg-white text-[#5F646D] hover:bg-[#EFE9DF] hover:text-[#1E2022] border border-[#E2DACB]'
              }`}
            >
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
