import React from 'react';
import { Search, MapPin, Plus, Users, Smartphone } from 'lucide-react';
import { CATEGORY_PILLS } from '../data/mockData';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  batteryFilter,
  setBatteryFilter,
  onOpenPlanModal,
  activeView,
  setActiveView,
  isMobileFrameView,
  setIsMobileFrameView,
  location,
  setLocation
}) {
  const handlePillClick = (pill) => {
    if (activeView !== 'explore') setActiveView('explore');

    if (pill.id === 'all') {
      setSelectedCategory('all');
      setBatteryFilter('all');
    } else if (pill.type === 'battery') {
      if (batteryFilter === pill.id) {
        setBatteryFilter('all');
      } else {
        setBatteryFilter(pill.id);
        setSelectedCategory('all');
      }
    } else {
      if (selectedCategory === pill.id) {
        setSelectedCategory('all');
      } else {
        setSelectedCategory(pill.id);
        setBatteryFilter('all');
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F3ECE0] shadow-xs">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Affinita Clean Text Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setActiveView('explore');
              setSelectedCategory('all');
              setBatteryFilter('all');
            }}
            className="flex items-center gap-2.5 text-left bg-transparent border-none cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl font-display tracking-wider text-[#2C221E] uppercase group-hover:text-[#C85A65] transition-colors">
                  Affinita
                </span>
                <span className="bg-[#FAF6F0] text-[#C85A65] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#E0D4C5] tracking-widest uppercase">
                  Dublin
                </span>
              </div>
              <p className="text-[10px] text-[#6C5E58] font-medium tracking-wider uppercase hidden sm:block">
                Curated Female Outings & Routine Synergy
              </p>
            </div>
          </button>
        </div>

        {/* Location & Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl bg-[#FAF6F0] border border-[#E0D4C5] rounded-full p-1.5 shadow-inner">
          <div className="flex items-center gap-2 px-3 flex-1 border-r border-[#E0D4C5]">
            <Search className="w-4 h-4 text-[#C85A65]" />
            <input
              type="text"
              placeholder="Search early dinner, concerts, retreats, trips abroad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-[#2C221E] placeholder:text-[#9E8E87] font-medium"
            />
          </div>
          <div className="flex items-center gap-2 px-3 w-52">
            <MapPin className="w-4 h-4 text-[#7B9E87]" />
            <input
              type="text"
              placeholder="Dublin, Ireland"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-[#2C221E] font-medium placeholder:text-[#9E8E87]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Squad Vibe Matrix */}
          <button
            onClick={() => setActiveView(activeView === 'affinity' ? 'explore' : 'affinity')}
            className={`btn sm:px-4 text-xs sm:text-sm font-semibold ${
              activeView === 'affinity' 
                ? 'bg-[#2C221E] text-white' 
                : 'btn-secondary'
            }`}
            title="Friend Circle Synergy Matrix"
          >
            <Users className="w-4 h-4 text-[#F9E076]" />
            <span className="hidden sm:inline">Vibe Matrix</span>
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
                ? 'bg-[#C85A65] text-white border-[#C85A65] shadow-sm'
                : 'bg-[#FAF6F0] text-[#6C5E58] border-[#E0D4C5] hover:text-[#2C221E]'
            }`}
            title={isMobileFrameView ? "Switch to Full Desktop View" : "Preview Mobile App Experience"}
          >
            <Smartphone className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Category & Battery Pills Bar */}
      <div className="bg-[#FAF6F0] border-t border-b border-[#F3ECE0] px-4 sm:px-8 py-2.5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
          {CATEGORY_PILLS.map((pill) => {
            const isSelected = 
              (pill.id === 'all' && selectedCategory === 'all' && batteryFilter === 'all') ||
              (pill.type === 'category' && selectedCategory === pill.id && activeView === 'explore') ||
              (pill.type === 'battery' && batteryFilter === pill.id && activeView === 'explore');

            return (
              <button
                key={pill.id}
                onClick={() => handlePillClick(pill)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C85A65] text-white shadow-sm scale-105'
                    : 'bg-white text-[#6C5E58] hover:bg-[#F3ECE0] hover:text-[#2C221E] border border-[#E0D4C5]'
                }`}
              >
                <span className="material-symbols-outlined text-base leading-none">
                  {pill.icon}
                </span>
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
