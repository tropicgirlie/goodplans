import React from 'react';
import { Sparkles, Users, Heart, Target, ArrowRight } from 'lucide-react';
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

  // Calculate dynamic squad match percentage based on selected friends count
  const squadMatchPercent = Math.min(99, 88 + selectedFriends.length * 2);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] py-10 lg:py-14 border-b border-[#EFE9DF]">
      {/* Decorative Scrapbook Elements in Background */}
      <div className="absolute top-4 left-6 text-2xl animate-bounce pointer-events-none hidden sm:block">🌟</div>
      <div className="absolute top-12 right-12 text-3xl pointer-events-none hidden md:block rotate-12">🍁</div>
      <div className="absolute bottom-6 left-1/3 text-2xl pointer-events-none hidden lg:block -rotate-12">✨</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading & Squad Selector */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE66D] border border-[#E2DACB] shadow-xs transform -rotate-1">
              <Sparkles className="w-4 h-4 text-[#4A3E00]" />
              <span className="text-xs font-extrabold text-[#4A3E00] uppercase tracking-wider font-display">
                Meetup Meets Scrapbook Magic
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black font-display text-[#1E2022] leading-tight tracking-tight">
              Plan Outings Your Squad Will <span className="wavy-underline text-[#F64060]">Actually Love</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#5F646D] max-w-xl font-medium">
              No more vague group texts or planning fatigue. We match outings to your friends’ <strong className="text-[#1E2022]">MBTI personalities, energy levels, and shared affinities</strong>.
            </p>

            {/* Interactive Squad Selector & Live Affinity Score Card */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#EFE9DF] shadow-md relative">
              <div className="absolute -top-3 right-6 bg-[#4ECDC4] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm font-handwriting text-sm rotate-2">
                Live Squad Synergy!
              </div>

              <p className="text-xs font-extrabold uppercase tracking-wider text-[#8E939D] mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#F64060]" />
                Select Your Outing Squad:
              </p>

              {/* Friend Avatar Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {FRIENDS_DATA.map((friend) => {
                  const isSelected = selectedFriends.includes(friend.id);
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1E2022] text-white border-[#1E2022] shadow-sm scale-105'
                          : 'bg-[#FAF7F2] text-[#5F646D] border-[#E2DACB] hover:bg-[#EFE9DF]'
                      }`}
                    >
                      <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        className="w-5 h-5 rounded-full object-cover border border-white"
                      />
                      <span>{friend.name.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-75 font-mono">({friend.mbti})</span>
                    </button>
                  );
                })}
              </div>

              {/* Live Affinity Score Result Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E2DACB]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F64060] text-white flex items-center justify-center font-extrabold text-sm shadow-sm font-display">
                    {squadMatchPercent}%
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1E2022] font-display">
                      Group Affinity Match
                    </h4>
                    <p className="text-[11px] text-[#5F646D] font-medium">
                      High Coffee, Outdoor & Strategy Alignment
                    </p>
                  </div>
                </div>

                <button
                  onClick={onSelectAffinityTab}
                  className="text-xs font-bold text-[#F64060] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  View Breakdown <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPlanModal}
                className="btn btn-primary text-base px-6 py-3 shadow-lg hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5" />
                Plan Outing With Squad
              </button>
              <button
                onClick={onSelectAffinityTab}
                className="btn btn-secondary text-base px-5 py-3"
              >
                <Target className="w-5 h-5 text-[#F64060]" />
                Explore Affinity Matrix
              </button>
            </div>
          </div>

          {/* Right Column: Hero Scrapbook Collage Photo */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Main Polaroid Frame */}
            <div className="polaroid-frame max-w-md w-full transform rotate-1 hover:rotate-0 transition-transform">
              
              {/* Tape Strips */}
              <div className="tape-strip tape-top-left"></div>
              <div className="tape-strip tape-top-right"></div>

              {/* Photo Image */}
              <div className="relative overflow-hidden rounded">
                <img 
                  src="/images/scrapbook_coffee_walk.jpg" 
                  alt="Scrapbook Outing"
                  className="w-full aspect-[4/3] object-cover rounded"
                />

                {/* Overlaid Sticker Badges */}
                <div className="absolute top-3 left-3 bg-[#FFE66D] text-[#4A3E00] text-xs font-extrabold px-3 py-1 rounded-full shadow-md border-2 border-white font-handwriting text-base">
                  monday coffee ☕
                </div>

                <div className="absolute bottom-3 right-3 bg-[#F64060] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1 font-display">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  98% Squad Synergy
                </div>
              </div>

              {/* Handwritten Scrapbook Caption */}
              <div className="pt-3 px-1 flex items-center justify-between">
                <div>
                  <p className="font-handwriting text-xl text-[#1E2022] font-bold leading-none">
                    "best morning walk & coffee with squad"
                  </p>
                  <p className="text-[11px] text-[#8E939D] font-medium mt-0.5">
                    San Francisco • 4 Friends Going
                  </p>
                </div>
                <div className="text-xl">✨</div>
              </div>
            </div>

            {/* Floating Mini Polaroid Badge */}
            <div className="absolute -bottom-4 -left-2 bg-white p-2 rounded shadow-xl border border-[#EFE9DF] transform -rotate-6 hidden sm:block w-36">
              <img 
                src="/images/scrapbook_pottery.jpg" 
                alt="Mini Outing" 
                className="w-full h-20 object-cover rounded"
              />
              <p className="font-handwriting text-xs text-[#D82D4B] font-bold text-center mt-1">
                craft & wine 🍷
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
