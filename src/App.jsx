import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import OutingCard from './components/OutingCard';
import AffinityMatchMatrix from './components/AffinityMatchMatrix';
import PlanOutingModal from './components/PlanOutingModal';
import OutingDetailModal from './components/OutingDetailModal';
import MobileAppFrame from './components/MobileAppFrame';
import GoogleMapsExplorer from './components/GoogleMapsExplorer';
import UXResearchDashboard from './components/UXResearchDashboard';
import { INITIAL_OUTINGS, FRIENDS_DATA } from './data/mockData';
import { Sparkles, Calendar, Heart, Users, MapPin, Plus } from 'lucide-react';

export default function App() {
  const [outings, setOutings] = useState(INITIAL_OUTINGS);
  const [selectedFriends, setSelectedFriends] = useState(['f1', 'f2', 'f3', 'f4', 'f5']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Dublin, Ireland');
  const [activeView, setActiveView] = useState('explore');
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);

  // Modals state
  const [selectedOutingModal, setSelectedOutingModal] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState({ o_early_lunch: true, o_dance_wednesday: true, o_sunday_salon: true, o_maternity_coffee: true });

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
              user: FRIENDS_DATA[0],
              text,
              time: 'Just now'
            }
          ]
        };
      }
      return o;
    }));
  };

  const handleSelectVenueForPlan = (venueLoc) => {
    setIsPlanModalOpen(true);
  };

  // Lifestyle Routine & Early Lunch Category filter logic
  const filteredOutings = outings.filter(outing => {
    let matchesCategory = true;
    if (selectedCategory === 'early_lunch') {
      matchesCategory = outing.category === 'Early Lunch & Brunch' || outing.lifestyleTag?.includes('Early Lunch');
    } else if (selectedCategory === 'wed_dance') {
      matchesCategory = outing.lifestyleTag?.includes('Wed Post-Work');
    } else if (selectedCategory === 'sun_salon') {
      matchesCategory = outing.lifestyleTag?.includes('Sun Salon');
    } else if (selectedCategory === 'maternity') {
      matchesCategory = outing.lifestyleTag?.includes('Maternity');
    } else if (selectedCategory !== 'all') {
      matchesCategory = outing.category === selectedCategory;
    }

    const matchesSearch = searchQuery === '' || 
      outing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outing.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <MobileAppFrame
      isMobileFrameView={isMobileFrameView}
      activeTab={activeView}
      setActiveTab={setActiveView}
      onOpenPlanModal={() => setIsPlanModalOpen(true)}
    >
      <div className="min-h-screen bg-[#FAF6F0] text-[#2C221E]">
        
        {/* Navigation Bar */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onOpenPlanModal={() => setIsPlanModalOpen(true)}
          activeView={activeView}
          setActiveView={setActiveView}
          isMobileFrameView={isMobileFrameView}
          setIsMobileFrameView={setIsMobileFrameView}
          location={location}
          setLocation={setLocation}
        />

        {/* Main View Switcher */}
        {activeView === 'explore' && (
          <main className="space-y-10 pb-16">
            {/* Hero Section */}
            <HeroSection
              selectedFriends={selectedFriends}
              setSelectedFriends={setSelectedFriends}
              onOpenPlanModal={() => setIsPlanModalOpen(true)}
              onSelectAffinityTab={() => setActiveView('affinity')}
            />

            {/* Outings Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#F3ECE0]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#2C221E]">
                      Early Lunch & Dublin Hours Matched Outings
                    </h2>
                    <span className="bg-[#F9E076] text-[#4A3E00] text-xs font-extrabold px-2.5 py-0.5 rounded-full font-handwriting text-base">
                      {filteredOutings.length} Featured
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6C5E58] font-medium mt-1">
                    Matched for <strong className="text-[#2C221E]">Early Lunch (12:00 PM)</strong> & <strong className="text-[#2C221E]">Post-Office (Wrapping by 8:30 PM before closing)</strong>
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

              {/* Grid */}
              {filteredOutings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E0D4C5]">
                  <div className="text-4xl mb-2">☀️</div>
                  <h3 className="text-lg font-bold font-display text-[#2C221E]">No outings match this filter</h3>
                  <p className="text-xs text-[#6C5E58] mt-1 mb-4">Try selecting Early Lunch or resetting filters!</p>
                  <button
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    className="btn btn-secondary text-xs font-bold"
                  >
                    Reset Filters
                  </button>
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

        {/* UX Research Dashboard View */}
        {activeView === 'research' && (
          <UXResearchDashboard />
        )}

        {/* Squad Vibe Matrix View */}
        {activeView === 'affinity' && (
          <AffinityMatchMatrix
            selectedFriends={selectedFriends}
            setSelectedFriends={setSelectedFriends}
            onOpenPlanModal={() => setIsPlanModalOpen(true)}
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
            <h2 className="text-2xl font-black font-display mb-2 text-[#2C221E]">Friend Profiles & Timing Preferences</h2>
            <p className="text-xs text-[#6C5E58] mb-6">Generational cohorts & preferred time windows (Early Lunch vs Post-Work vs Mat Leave)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRIENDS_DATA.map(friend => (
                <div key={friend.id} className="p-4 rounded-2xl bg-white border-2 border-[#F3ECE0] shadow-xs flex items-center gap-3">
                  <img src={friend.avatar} alt={friend.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#2C221E]">{friend.name}</h3>
                      <span className="text-[10px] font-bold text-[#C85A65] bg-[#FFF0F2] px-1.5 py-0.5 rounded font-mono">{friend.mbti}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#7B9E87]">{friend.lifestyle}</p>
                    <p className="text-[11px] text-[#6C5E58] font-medium mt-0.5">⏱️ {friend.preferredTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
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
