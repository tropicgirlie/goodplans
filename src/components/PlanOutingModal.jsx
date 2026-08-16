import React, { useState } from 'react';
import { X, Sparkles, Calendar, MapPin, DollarSign, Heart, Users, Check, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FRIENDS_DATA } from '../data/mockData';

export default function PlanOutingModal({ isOpen, onClose, onCreateOuting, selectedFriends }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Coffee & Chill');
  const [connectionType, setConnectionType] = useState('Core Squad');
  const [date, setDate] = useState('Sat, Aug 30 • 11:30 AM');
  const [location, setLocation] = useState('Grafton Street & Stephen’s Green, Dublin');
  const [price, setPrice] = useState('Free');
  const [handwrittenTag, setHandwrittenTag] = useState('dublin coffee stroll');
  const [invitedFriends, setInvitedFriends] = useState(selectedFriends);
  const [metBeforeMap, setMetBeforeMap] = useState({ f1: true, f2: true, f3: true, f4: false, f5: false });
  const [selectedImage, setSelectedImage] = useState('/images/scrapbook_coffee_walk.jpg');
  const [description, setDescription] = useState('A low-pressure Dublin gathering for specialty pour-overs, fresh pastries, and warm conversations!');

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

  const toggleMetBefore = (fId) => {
    setMetBeforeMap(prev => ({ ...prev, [fId]: !prev[fId] }));
  };

  const calculateDynamicScore = () => {
    return Math.min(99, 88 + invitedFriends.length * 2.2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const badgeLabel = 
      connectionType === 'Core Squad' ? '👯 Core Squad • Long-Time Besties' :
      connectionType === '1:1 Outing' ? '☕ 1:1 Catchup • Deep Conversation' :
      '🔀 Mixed Circle • Intros & Met Before';

    const newOuting = {
      id: 'o_' + Date.now(),
      title: title.trim(),
      category,
      connectionType,
      connectionBadge: badgeLabel,
      image: selectedImage,
      date,
      location,
      host: FRIENDS_DATA[0],
      affinityScore: Math.round(calculateDynamicScore()),
      familiarityBreakdown: {
        squadType: connectionType,
        metBeforeCount: `${invitedFriends.filter(id => metBeforeMap[id]).length} of ${invitedFriends.length} have met before`,
        comfortLevel: 'Warm & Welcoming • Low Pressure',
        vibeSync: `${category} (100%), Friendship Connection (95%)`
      },
      handwrittenTag,
      stickerType: 'custom',
      price: price || 'Free',
      attendees: FRIENDS_DATA.filter(f => invitedFriends.includes(f.id)).map(f => ({
        ...f,
        metBefore: !!metBeforeMap[f.id],
        relationNote: metBeforeMap[f.id] ? 'Met Before ✓' : 'First Time Intro 👋'
      })),
      maxAttendees: 8,
      description,
      itinerary: [
        { time: 'Start Time', detail: 'Meet up at Dublin venue' },
        { time: '+45 mins', detail: 'Activity & photos' },
        { time: '+1.5 hours', detail: 'Casual wrap up & coffee chat' }
      ],
      comments: []
    };

    onCreateOuting(newOuting);

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
    { label: '🌲 Cliff & Sea Hike', src: '/images/scrapbook_sunset_hike.jpg' },
    { label: '🍕 Pizza & Games', src: '/images/scrapbook_pizza_games.jpg' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 sm:p-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE0] mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C85A65] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold font-display text-[#2C221E]">
                Plan a Dublin Outing
              </h2>
              <p className="text-xs text-[#6C5E58]">
                Set circle connection tier & tag whether friends have met before
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#F3ECE0] text-[#6C5E58] flex items-center justify-center border border-[#E0D4C5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Outing Title */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2C221E] mb-1.5">
              Outing Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ranelagh Matcha Catchup & Craft Walk"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium text-[#2C221E] bg-[#FAF6F0]"
            />
          </div>

          {/* Connection Tier & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2C221E] mb-1.5">
                Circle Connection Tier
              </label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium text-[#2C221E] bg-[#FAF6F0]"
              >
                <option value="Core Squad">👯 Core Squad (Long-Time Besties)</option>
                <option value="Mixed Circle">🔀 Mixed Circle (Friends & Intros)</option>
                <option value="1:1 Outing">☕ 1:1 Catchup (Intimate Duo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2C221E] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium text-[#2C221E] bg-[#FAF6F0]"
              >
                <option value="Coffee & Chill">☕ Coffee & Strolls</option>
                <option value="Creative Workshops">🎨 Creative & Pottery</option>
                <option value="Outdoors">🌲 Dublin Hikes & Sea</option>
                <option value="Games & Food">🍕 Board Games & Pizza</option>
              </select>
            </div>
          </div>

          {/* Handwritten Tag & Venue Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2C221E] mb-1.5">
                Handwritten Scrapbook Tag
              </label>
              <input
                type="text"
                placeholder="e.g. ranelagh matcha, howth walk"
                value={handwrittenTag}
                onChange={(e) => setHandwrittenTag(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-handwriting text-base font-bold text-[#C85A65] bg-[#FAF6F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2C221E] mb-1.5">
                Dublin Venue / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#E0D4C5] focus:border-[#C85A65] outline-none text-xs font-medium text-[#2C221E] bg-[#FAF6F0]"
              />
            </div>
          </div>

          {/* Image Style Picker */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2C221E] mb-2">
              Select Scrapbook Image Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {imageOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(opt.src)}
                  className={`p-1.5 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    selectedImage === opt.src
                      ? 'border-[#C85A65] bg-[#FFF0F2]'
                      : 'border-[#E0D4C5] hover:border-[#2C221E]'
                  }`}
                >
                  <img src={opt.src} alt={opt.label} className="w-full h-16 object-cover rounded mb-1" />
                  <span className="text-[11px] font-bold text-[#2C221E]">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Friends Invite & Met-Before Tagging */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2C221E]">
                Invite Friends & Tag "Met Before" Status
              </label>
              <span className="bg-[#C85A65] text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-display">
                <Heart className="w-3 h-3 fill-white" />
                {Math.round(calculateDynamicScore())}% Vibe Synergy
              </span>
            </div>

            <div className="space-y-2">
              {FRIENDS_DATA.map((friend) => {
                const isInvited = invitedFriends.includes(friend.id);
                const hasMet = metBeforeMap[friend.id];
                return (
                  <div key={friend.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5]">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleFriendInvite(friend.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          isInvited
                            ? 'bg-[#2C221E] text-white border-[#2C221E]'
                            : 'bg-white text-[#6C5E58] border-[#E0D4C5]'
                        }`}
                      >
                        <img src={friend.avatar} alt={friend.name} className="w-5 h-5 rounded-full object-cover" />
                        <span>{friend.name}</span>
                        {isInvited && <Check className="w-3.5 h-3.5 text-[#F9E076]" />}
                      </button>
                      <span className="text-[10px] text-[#6C5E58] font-mono">({friend.mbti})</span>
                    </div>

                    {isInvited && (
                      <button
                        type="button"
                        onClick={() => toggleMetBefore(friend.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          hasMet
                            ? 'bg-[#7B9E87] text-white border-[#7B9E87]'
                            : 'bg-[#F9E076] text-[#4A3E00] border-[#E0D4C5]'
                        }`}
                      >
                        {hasMet ? 'Met Before ✓' : 'First Time Intro 👋'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-[#F3ECE0] flex items-center justify-end gap-3">
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
