import React, { useState } from 'react';
import { X, Sparkles, Calendar, MapPin, DollarSign, Image, Heart, Users, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FRIENDS_DATA } from '../data/mockData';

export default function PlanOutingModal({ isOpen, onClose, onCreateOuting, selectedFriends }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Coffee & Chill');
  const [date, setDate] = useState('Sat, Aug 30 • 11:00 AM');
  const [location, setLocation] = useState('Soma Roastery & Bakery, SF');
  const [price, setPrice] = useState('Free');
  const [handwrittenTag, setHandwrittenTag] = useState('weekend vibes');
  const [invitedFriends, setInvitedFriends] = useState(selectedFriends);
  const [selectedImage, setSelectedImage] = useState('/images/scrapbook_coffee_walk.jpg');
  const [description, setDescription] = useState('A chill gathering for pour-overs, fresh pastries, and great conversations with the squad!');

  if (!isOpen) return null;

  const toggleFriendInvite = (fId) => {
    if (invitedFriends.includes(fId)) {
      if (invitedFriends.length > 1) {
        setInvitedFriends(invitedFriends.filter(id => id !== fId));
      }
    } else {
      setInvitedFriends([...invitedFriends, fId]);
    }
  };

  const calculateDynamicScore = () => {
    return Math.min(99, 87 + invitedFriends.length * 2.5);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newOuting = {
      id: 'o_' + Date.now(),
      title: title.trim(),
      category,
      image: selectedImage,
      date,
      location,
      host: FRIENDS_DATA[0],
      affinityScore: Math.round(calculateDynamicScore()),
      affinityBreakdown: {
        socialEnergyMatch: 'High Squad Harmony (95%)',
        interestSynergy: `${category} (100%), Social Chat (90%)`,
        stressLevel: 'Zero Pressure Comfort'
      },
      handwrittenTag,
      stickerType: 'custom',
      price: price || 'Free',
      attendees: FRIENDS_DATA.filter(f => invitedFriends.includes(f.id)),
      maxAttendees: 8,
      description,
      itinerary: [
        { time: 'Start Time', detail: 'Meet up at designated venue' },
        { time: '+45 mins', detail: 'Main group activity & photos' },
        { time: '+1.5 hours', detail: 'Casual wrap up & coffee chat' }
      ],
      comments: []
    };

    onCreateOuting(newOuting);

    // Confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClose();
  };

  const imageOptions = [
    { label: '☕ Coffee & Walk', src: '/images/scrapbook_coffee_walk.jpg' },
    { label: '🎨 Craft & Pottery', src: '/images/scrapbook_pottery.jpg' },
    { label: '🌲 Sunset Hike', src: '/images/scrapbook_sunset_hike.jpg' },
    { label: '🍕 Pizza & Games', src: '/images/scrapbook_pizza_games.jpg' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 sm:p-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE9DF] mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F64060] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold font-display text-[#1E2022]">
                Plan a Squad Outing
              </h2>
              <p className="text-xs text-[#5F646D]">
                Design your scrapbook event card & invite friends
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#5F646D] flex items-center justify-center border border-[#E2DACB] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Outing Title */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1E2022] mb-1.5">
              Outing Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Saturday Brunch & Botanical Gardens Walk"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E2DACB] focus:border-[#F64060] outline-none text-sm font-medium text-[#1E2022] bg-[#FAF7F2]"
            />
          </div>

          {/* Category & Handwritten Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1E2022] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E2DACB] focus:border-[#F64060] outline-none text-sm font-medium text-[#1E2022] bg-[#FAF7F2]"
              >
                <option value="Coffee & Chill">☕ Coffee & Chill</option>
                <option value="Creative Workshops">🎨 Creative & Art</option>
                <option value="Outdoors">🌲 Outdoors & Hikes</option>
                <option value="Games & Food">🍕 Games & Foodie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1E2022] mb-1.5">
                Handwritten Scrapbook Tag
              </label>
              <input
                type="text"
                placeholder="e.g. cozy morning, game night"
                value={handwrittenTag}
                onChange={(e) => setHandwrittenTag(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E2DACB] focus:border-[#F64060] outline-none text-sm font-handwriting text-base font-bold text-[#D82D4B] bg-[#FAF7F2]"
              />
            </div>
          </div>

          {/* Date, Location, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1E2022] mb-1.5">
                Date & Time
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#E2DACB] focus:border-[#F64060] outline-none text-xs font-medium text-[#1E2022] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1E2022] mb-1.5">
                Location / Venue
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#E2DACB] focus:border-[#F64060] outline-none text-xs font-medium text-[#1E2022] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1E2022] mb-1.5">
                Price / Cost
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#E2DACB] focus:border-[#F64060] outline-none text-xs font-medium text-[#1E2022] bg-[#FAF7F2]"
              />
            </div>
          </div>

          {/* Select Scrapbook Collage Artwork */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1E2022] mb-2">
              Select Scrapbook Image Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {imageOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(opt.src)}
                  className={`p-1.5 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    selectedImage === opt.src
                      ? 'border-[#F64060] bg-[#FFF0F3]'
                      : 'border-[#E2DACB] hover:border-[#1E2022]'
                  }`}
                >
                  <img src={opt.src} alt={opt.label} className="w-full h-16 object-cover rounded mb-1" />
                  <span className="text-[11px] font-bold text-[#1E2022]">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Friends & Live Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1E2022]">
                Invite Squad Members ({invitedFriends.length})
              </label>
              <span className="bg-[#F64060] text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-display">
                <Heart className="w-3 h-3 fill-white" />
                {Math.round(calculateDynamicScore())}% Squad Synergy
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {FRIENDS_DATA.map((friend) => {
                const isInvited = invitedFriends.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleFriendInvite(friend.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                      isInvited
                        ? 'bg-[#1E2022] text-white border-[#1E2022]'
                        : 'bg-[#FAF7F2] text-[#5F646D] border-[#E2DACB]'
                    }`}
                  >
                    <img src={friend.avatar} alt={friend.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{friend.name.split(' ')[0]}</span>
                    {isInvited && <Check className="w-3.5 h-3.5 text-[#FFE66D]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-[#EFE9DF] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-6 py-3 shadow-md"
            >
              <Sparkles className="w-4.5 h-4.5" />
              Publish Outing Card ✨
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
