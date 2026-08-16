import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import OutingCard from './components/OutingCard';
import AffinityMatchMatrix from './components/AffinityMatchMatrix';
import PlanOutingModal from './components/PlanOutingModal';
import OutingDetailModal from './components/OutingDetailModal';
import MobileAppFrame from './components/MobileAppFrame';
import GoogleMapsExplorer from './components/GoogleMapsExplorer';
import OnboardingModal from './components/OnboardingModal';
import SettingsView from './components/SettingsView';
import Footer from './components/Footer';
import { INITIAL_OUTINGS, FRIENDS_DATA } from './data/mockData';
import { Sparkles, Calendar, Heart, Users, MapPin, Plus, Database, RotateCcw } from 'lucide-react';

export default function App() {
  const [appMode, setAppMode] = useState('demo'); // 'demo' or 'empty'
  const [outings, setOutings] = useState(INITIAL_OUTINGS);
  const [customFriends, setCustomFriends] = useState(FRIENDS_DATA);
  const [selectedFriends, setSelectedFriends] = useState(['f1', 'f2', 'f3', 'f4', 'f5']);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [batteryFilter, setBatteryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Dublin, Ireland');
  const [activeView, setActiveView] = useState('explore'); // 'explore', 'affinity', 'outings', 'squad', 'settings'
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);

  // Modals state
  const [selectedOutingModal, setSelectedOutingModal] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState({ o_dinner_out: true, o_concert_music: true, o_wellness_retreat: true, o_trip_abroad: true, o_coffee_stroll: true, o_afternoon_tea: true });

  const handleToggleRsvp = (outingId) => {
    setRsvpStatus(prev => ({
      ...prev,
      [outingId]: !prev[outingId]
    }));
  };

  const handleCreateOuting = (newOuting) => {
    setOutings([newOuting, ...outings]);
    setRsvpStatus(prev => ({ ...prev, [newOuting.id]: true }));
  };

  const handleAddComment = (outingId, text) => {
    setOutings(outings.map(o => {
      if (o.id === outingId) {
        return {
          ...o,
          comments: [
            ...o.comments,
            {
              id: 'c_' + Date.now(),
              user: customFriends[0] || FRIENDS_DATA[0],
              text,
              time: 'Just now'
            }
          ]
        };
      }
      return o;
    }));
  };

  const handleResetDemoData = () => {
    setOutings(INITIAL_OUTINGS);
    setCustomFriends(FRIENDS_DATA);
    setAppMode('demo');
    setSelectedCategory('all');
    setBatteryFilter('all');
  };

  const handleSelectVenueForPlan = (venueLoc) => {
    setIsPlanModalOpen(true);
  };

  // Determine active outings based on appMode (Demo vs Empty State)
  const activeOutingsList = appMode === 'demo' ? outings : outings.filter(o => o.id.startsWith('o_custom_'));

  // Lifestyle Routine, Social Battery & Category filter logic
  const filteredOutings = activeOutingsList.filter(outing => {
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      matchesCategory = outing.category === selectedCategory;
    }

    let matchesBattery = true;
    if (batteryFilter !== 'all') {
      matchesBattery = outing.socialBattery === batteryFilter;
    }

    const matchesSearch = searchQuery === '' || 
      outing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outing.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesBattery && matchesSearch;
  });

  return (
    <MobileAppFrame
      isMobileFrameView={isMobileFrameView}
      activeTab={activeView}
      setActiveTab={setActiveView}
      onOpenPlanModal={() => setIsPlanModalOpen(true)}
    >
      <div className="min-h-screen bg-[#FAF6F0] text-[#2C221E] flex flex-col justify-between">
        
        <div>
          {/* Navigation Bar */}
          <Navbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            batteryFilter={batteryFilter}
            setBatteryFilter={setBatteryFilter}
            onOpenPlanModal={() => setIsPlanModalOpen(true)}
            activeView={activeView}
            setActiveView={setActiveView}
            isMobileFrameView={isMobileFrameView}
            setIsMobileFrameView={setIsMobileFrameView}
            location={location}
            setLocation={setLocation}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />

          {/* Mode Banner Indicator */}
          {appMode === 'empty' && (
            <div className="bg-[#E8F5E9] border-b border-[#A5D6A7] px-4 py-2 text-center text-xs font-bold text-[#2E7D32] flex items-center justify-center gap-2">
              <span>🍃 Empty State Mode Active — You are viewing your custom clean state.</span>
              <button
                onClick={() => setAppMode('demo')}
                className="underline font-black hover:text-[#1B5E20] cursor-pointer"
              >
                Switch to Demo Mode 🌟
              </button>
            </div>
          )}

          {/* Main View Switcher */}
          {activeView === 'explore' && (
            <main className="space-y-10 pb-16">
              {/* Hero Section */}
              <HeroSection
                selectedFriends={selectedFriends}
                setSelectedFriends={setSelectedFriends}
                onOpenPlanModal={() => setIsPlanModalOpen(true)}
                onSelectAffinityTab={() => setActiveView('affinity')}
                batteryFilter={batteryFilter}
                setBatteryFilter={setBatteryFilter}
              />

              {/* Outings Grid Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#F3ECE0]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#2C221E]">
                        {appMode === 'demo' ? 'Featured Outings in Dublin' : 'My Outings'}
                      </h2>
                      <span className="bg-[#F9E076] text-[#4A3E00] text-xs font-extrabold px-2.5 py-0.5 rounded-full font-handwriting text-base">
                        {filteredOutings.length} Available
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6C5E58] font-medium mt-1">
                      Matched for <strong className="text-[#2C221E]">Early Dinner (6:30 PM)</strong>, <strong className="text-[#2C221E]">Concerts</strong>, <strong className="text-[#2C221E]">Retreats</strong> & <strong className="text-[#2C221E]">Trips Abroad</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlanModalOpen(true)}
                      className="btn btn-primary text-xs font-bold shadow-md hover:scale-105 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                      Create Custom Outing
                    </button>
                  </div>
                </div>

                {/* Grid vs Empty State */}
                {filteredOutings.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E0D4C5] p-8 space-y-4">
                    <div className="text-4xl">🍃</div>
                    <h3 className="text-lg sm:text-xl font-bold font-display text-[#2C221E]">
                      {appMode === 'empty' ? 'Your Social Circle is Ready for Its First Outing!' : 'No outings match this filter'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6C5E58] max-w-md mx-auto">
                      {appMode === 'empty'
                        ? 'You are in clean empty state mode. Tap "Plan Outing" to create your first custom outing, or load pre-built demo outings.'
                        : 'Try selecting another category or resetting social battery filters!'}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setIsPlanModalOpen(true)}
                        className="btn btn-primary text-xs font-bold shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Plan First Outing
                      </button>

                      {appMode === 'empty' ? (
                        <button
                          onClick={() => setAppMode('demo')}
                          className="btn bg-[#F9E076] text-[#4A3E00] hover:bg-[#F0D55D] text-xs font-bold shadow-xs"
                        >
                          🌟 Load Demo Outings
                        </button>
                      ) : (
                        <button
                          onClick={() => { setSelectedCategory('all'); setBatteryFilter('all'); setSearchQuery(''); }}
                          className="btn btn-secondary text-xs font-bold"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOutings.map((outing) => (
                      <OutingCard
                        key={outing.id}
                        outing={outing}
                        onSelectOuting={(o) => setSelectedOutingModal(o)}
                        rsvpStatus={rsvpStatus}
                        onToggleRsvp={handleToggleRsvp}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Google Maps Venue Explorer Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <GoogleMapsExplorer onSelectVenueForPlan={handleSelectVenueForPlan} />
              </section>
            </main>
          )}

          {/* Squad Vibe Matrix View */}
          {activeView === 'affinity' && (
            <AffinityMatchMatrix
              selectedFriends={selectedFriends}
              setSelectedFriends={setSelectedFriends}
              onOpenPlanModal={() => setIsPlanModalOpen(true)}
            />
          )}

          {/* Settings View (Saved Friends, Data Mode, Preferences) */}
          {activeView === 'settings' && (
            <SettingsView
              appMode={appMode}
              setAppMode={setAppMode}
              customFriends={customFriends}
              setCustomFriends={setCustomFriends}
              onResetDemoData={handleResetDemoData}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {/* My Outings View */}
          {activeView === 'outings' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <h2 className="text-2xl font-black font-display mb-6 text-[#2C221E] flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#C85A65]" />
                My Upcoming Dublin RSVPs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {outings.filter(o => rsvpStatus[o.id]).map(outing => (
                  <OutingCard
                    key={outing.id}
                    outing={outing}
                    onSelectOuting={(o) => setSelectedOutingModal(o)}
                    rsvpStatus={rsvpStatus}
                    onToggleRsvp={handleToggleRsvp}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Squad Friends List View */}
          {activeView === 'squad' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <h2 className="text-2xl font-black font-display mb-2 text-[#2C221E]">Saved Squad & Friend Profiles</h2>
              <p className="text-xs text-[#6C5E58] mb-6">Generational cohorts & preferred time windows (Dinner Out, Concerts, Retreats, Trips Abroad)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customFriends.map(friend => (
                  <div key={friend.id} className="p-4 rounded-2xl bg-white border-2 border-[#F3ECE0] shadow-xs flex items-center gap-3">
                    <img src={friend.avatar} alt={friend.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#2C221E]">{friend.name}</h3>
                        <span className="text-[10px] font-bold text-[#C85A65] bg-[#FFF0F2] px-1.5 py-0.5 rounded font-mono">{friend.mbti}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#7B9E87]">{friend.lifestyle}</p>
                      <p className="text-[11px] text-[#6C5E58] font-medium mt-0.5">⚡ Battery: {friend.socialBatteryLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />

        {/* Modals */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onSwitchToDemo={() => setAppMode('demo')}
        />

        <PlanOutingModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onCreateOuting={handleCreateOuting}
          selectedFriends={selectedFriends}
        />

        <OutingDetailModal
          outing={selectedOutingModal}
          onClose={() => setSelectedOutingModal(null)}
          rsvpStatus={rsvpStatus}
          onToggleRsvp={handleToggleRsvp}
          onAddComment={handleAddComment}
        />

      </div>
    </MobileAppFrame>
  );
}
