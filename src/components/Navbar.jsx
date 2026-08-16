import React from 'react';
import { Search, MapPin, Plus, Users, Smartphone, Settings, HelpCircle } from 'lucide-react';
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
  setLocation,
  onOpenOnboarding
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-3 border-[#09090B] shadow-sm">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Amiga Brand Name Wordmark in Syne Trendy Display Font */}
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
                <span className="font-extrabold text-2xl sm:text-3xl font-display tracking-tight text-[#09090B] uppercase group-hover:text-[#2563EB] transition-colors">
                  Amiga
                </span>
                <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border-2 border-[#09090B] tracking-widest uppercase shadow-2xs">
                  Dublin
                </span>
              </div>
              <p className="text-[10px] text-[#52525B] font-bold tracking-wider uppercase hidden sm:block">
                Pop-Art Editorial Outings &amp; Routine Synergy
              </p>
            </div>
          </button>
        </div>

        {/* Location & Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl bg-[#FAFAFA] border-2 border-[#09090B] rounded-full p-1.5 shadow-xs">
          <div className="flex items-center gap-2 px-3 flex-1 border-r-2 border-[#09090B]">
            <Search className="w-4 h-4 text-[#2563EB]" />
            <input
              type="text"
              placeholder="Search early dinner, concerts, retreats, trips abroad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#09090B] placeholder:text-[#A1A1AA] font-semibold"
            />
          </div>
          <div className="flex items-center gap-2 px-3 w-48">
            <MapPin className="w-4 h-4 text-[#E11D48]" />
            <input
              type="text"
              placeholder="Dublin, Ireland"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#09090B] font-semibold placeholder:text-[#A1A1AA]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* How It Works Explainer */}
          <button
            onClick={onOpenOnboarding}
            className="p-2.5 rounded-full bg-[#FAFAFA] text-[#09090B] border-2 border-[#09090B] hover:bg-[#EFF6FF] transition-colors shadow-2xs cursor-pointer"
            title="How Amiga Works (Onboarding Guide)"
          >
            <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          </button>

          {/* Squad Vibe Matrix */}
          <button
            onClick={() => setActiveView(activeView === 'affinity' ? 'explore' : 'affinity')}
            className={`btn-pop-secondary text-xs sm:text-sm ${
              activeView === 'affinity' 
                ? 'bg-[#09090B] text-white' 
                : ''
            }`}
            title="Friend Circle Synergy Matrix"
          >
            <Users className="w-4 h-4 text-[#F59E0B]" />
            <span className="hidden sm:inline">Vibe Matrix</span>
          </button>

          {/* Settings View Button */}
          <button
            onClick={() => setActiveView(activeView === 'settings' ? 'explore' : 'settings')}
            className={`btn-pop-secondary text-xs sm:text-sm ${
              activeView === 'settings' 
                ? 'bg-[#09090B] text-white' 
                : ''
            }`}
            title="Settings & Saved Squad Center"
          >
            <Settings className="w-4 h-4 text-[#E11D48]" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Create Outing CTA */}
          <button
            onClick={onOpenPlanModal}
            className="btn-pop-primary text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Outing</span>
          </button>

          {/* Mobile Simulator Toggle */}
          <button
            onClick={() => setIsMobileFrameView(!isMobileFrameView)}
            className={`p-2.5 rounded-full border-2 border-[#09090B] transition-all cursor-pointer ${
              isMobileFrameView
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#FAFAFA] text-[#09090B] hover:bg-[#EFF6FF]'
            }`}
            title={isMobileFrameView ? "Switch to Full Desktop View" : "Preview Mobile App Experience"}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills Bar (Pop-Art Graphic Outlines) */}
      <div className="bg-[#F4F4F5] border-t-2 border-b-2 border-[#09090B] px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 justify-start">
          {CATEGORY_PILLS.map((pill) => {
            const isSelected = 
              (pill.id === 'all' && selectedCategory === 'all' && batteryFilter === 'all') ||
              (pill.type === 'category' && selectedCategory === pill.id && activeView === 'explore') ||
              (pill.type === 'battery' && batteryFilter === pill.id && activeView === 'explore');

            return (
              <button
                key={pill.id}
                onClick={() => handlePillClick(pill)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-[#09090B] ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-xs scale-105'
                    : 'bg-white text-[#09090B] hover:bg-[#FEF3C7] shadow-2xs'
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
