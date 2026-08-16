import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import OutingCard from './components/OutingCard';
import AffinityMatchMatrix from './components/AffinityMatchMatrix';
import PlanOutingModal from './components/PlanOutingModal';
import OutingDetailModal from './components/OutingDetailModal';
import MobileAppFrame from './components/MobileAppFrame';
import { INITIAL_OUTINGS, FRIENDS_DATA } from './data/mockData';
import { Sparkles, Calendar, Heart, Users, MapPin, Plus, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [outings, setOutings] = useState(INITIAL_OUTINGS);
  const [selectedFriends, setSelectedFriends] = useState(['f1', 'f2', 'f3', 'f4', 'f5']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [activeView, setActiveView] = useState('explore');
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);

  // Modals state
  const [selectedOutingModal, setSelectedOutingModal] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState({ o1: true, o4: true });

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

  // Filter logic
  const filteredOutings = outings.filter(outing => {
    const matchesCategory = 
      selectedCategory === 'all' ? true :
      selectedCategory === 'match' ? outing.affinityScore >= 90 :
      outing.category === selectedCategory;

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
      <div className="min-h-screen bg-[#FAF7F2] text-[#1E2022]">
        
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

        {/* View Switcher */}
        {activeView === 'explore' && (
          <main>
            {/* Hero Section */}
            <HeroSection
              selectedFriends={selectedFriends}
              setSelectedFriends={setSelectedFriends}
              onOpenPlanModal={() => setIsPlanModalOpen(true)}
              onSelectAffinityTab={() => setActiveView('affinity')}
            />

            {/* Outings Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#EFE9DF]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#1E2022]">
                      Matched Outings for Your Squad
                    </h2>
                    <span className="bg-[#FFE66D] text-[#4A3E00] text-xs font-extrabold px-2.5 py-0.5 rounded-full font-handwriting text-base">
                      {filteredOutings.length} Ideas
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5F646D] font-medium mt-1">
                    Showing outings near <strong className="text-[#1E2022]">{location}</strong> • Ranked by squad affinity
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlanModalOpen(true)}
                    className="btn btn-primary text-xs font-bold shadow-md hover:scale-105 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                    Create Custom Outing Card
                  </button>
                </div>
              </div>

              {/* Grid */}
              {filteredOutings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E2DACB]">
                  <div className="text-4xl mb-2">☕</div>
                  <h3 className="text-lg font-bold font-display text-[#1E2022]">No matching outings found</h3>
                  <p className="text-xs text-[#5F646D] mt-1 mb-4">Try searching for a different activity or category!</p>
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
          </main>
        )}

        {/* Squad Affinity View */}
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
            <h2 className="text-2xl font-black font-display mb-6 text-[#1E2022] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#F64060]" />
              My Upcoming RSVPs & Outings
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
            <h2 className="text-2xl font-black font-display mb-2 text-[#1E2022]">Your Outing Squad</h2>
            <p className="text-xs text-[#5F646D] mb-6">Friends synced with your personality affinity engine</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRIENDS_DATA.map(friend => (
                <div key={friend.id} className="p-4 rounded-2xl bg-white border-2 border-[#EFE9DF] shadow-xs flex items-center gap-3">
                  <img src={friend.avatar} alt={friend.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs" />
                  <div>
                    <h3 className="text-base font-bold text-[#1E2022]">{friend.name}</h3>
                    <span className="text-xs font-mono font-bold text-[#F64060] bg-[#FFF0F3] px-2 py-0.5 rounded">{friend.mbti} • {friend.archetype}</span>
                    <p className="text-xs text-[#8E939D] mt-1">Interests: {friend.interests.join(', ')}</p>
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
