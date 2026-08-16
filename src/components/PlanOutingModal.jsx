import React, { useState } from 'react';
import { X, Calendar, MapPin, Sparkles, Heart, Users, CheckCircle2 } from 'lucide-react';
import { FRIENDS_DATA, CATEGORIES_LIST } from '../data/mockData';
import confetti from 'canvas-confetti';

export default function PlanOutingModal({ isOpen, onClose, onCreateOuting, selectedFriends }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Dinner Out',
    date: '',
    time: '18:30',
    location: '',
    price: '€25 / person',
    connectionType: 'Mixed Circle',
    description: '',
    invitedFriendIds: ['f1', 'f2'],
    metBeforeTags: { f1: true, f2: true }
  });

  const [createdSuccess, setCreatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFriendToggle = (id) => {
    if (formData.invitedFriendIds.includes(id)) {
      setFormData({
        ...formData,
        invitedFriendIds: formData.invitedFriendIds.filter(fId => fId !== id)
      });
    } else {
      setFormData({
        ...formData,
        invitedFriendIds: [...formData.invitedFriendIds, id]
      });
    }
  };

  const handleMetBeforeToggle = (id) => {
    setFormData({
      ...formData,
      metBeforeTags: {
        ...formData.metBeforeTags,
        [id]: !formData.metBeforeTags[id]
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedCategoryObj = CATEGORIES_LIST.find(c => c.id === formData.category) || CATEGORIES_LIST[0];

    const newOuting = {
      id: 'o_custom_' + Date.now(),
      title: formData.title || 'Special Outing with Friends',
      category: formData.category,
      lifestyleTag: `${formData.category} (Wraps by 8:30 PM)`,
      connectionType: formData.connectionType,
      connectionBadge: `${formData.connectionType} • Outing`,
      iconName: selectedCategoryObj.icon,
      image: '/images/scrapbook_pizza_games.jpg',
      date: formData.date ? `${formData.date} • ${formData.time}` : 'Upcoming Outing',
      location: formData.location || 'Dublin City Center',
      host: FRIENDS_DATA[0],
      affinityScore: Math.floor(Math.random() * 8) + 92,
      price: formData.price || 'Free',
      handwrittenTag: formData.title.toLowerCase() || 'fun outing',
      attendees: formData.invitedFriendIds.map(fId => {
        const friend = FRIENDS_DATA.find(f => f.id === fId);
        return {
          ...friend,
          metBefore: formData.metBeforeTags[fId] ?? true,
          relationNote: formData.metBeforeTags[fId] ? 'Met Before ✓' : 'First Time Intro 👋'
        };
      }),
      description: formData.description || 'Join us for a wonderful outing in Dublin!',
      comments: []
    };

    onCreateOuting(newOuting);

    // Fire Confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setCreatedSuccess(true);
    setTimeout(() => {
      setCreatedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F3ECE0]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C85A65] text-xl">auto_awesome</span>
            <h2 className="text-xl font-bold font-display text-[#2C221E]">
              Plan a New Outing with Friends
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6C5E58] hover:bg-[#F3ECE0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {createdSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h3 className="text-xl font-bold font-display text-[#2C221E]">Outing Created & Invites Sent!</h3>
            <p className="text-xs text-[#6C5E58]">Your friends have been notified with 1-click calendar sync.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9E8E87] mb-1.5">
                Outing Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Friday Early Dinner & Wine, Concert Night, Retreat..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium bg-[#FAF6F0]"
              />
            </div>

            {/* Category Select (Clean labels without emojis, using Material Symbols in UI) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9E8E87] mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium bg-[#FAF6F0] text-[#2C221E]"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9E8E87] mb-1.5">
                  Connection Tier
                </label>
                <select
                  value={formData.connectionType}
                  onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium bg-[#FAF6F0] text-[#2C221E]"
                >
                  <option value="Core Squad">Core Squad (Close Friends)</option>
                  <option value="Mixed Circle">Mixed Circle (Friends + Intros)</option>
                  <option value="1:1 Outing">1:1 Outing (Duo Catchup)</option>
                </select>
              </div>
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9E8E87] mb-1.5">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium bg-[#FAF6F0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9E8E87] mb-1.5">
                  Dublin Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="Coppinger Row, Whelan's, Powerscourt..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium bg-[#FAF6F0]"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9E8E87] mb-1.5">
                Estimated Cost per Person
              </label>
              <input
                type="text"
                placeholder="e.g. €25 / person, Free, €65 / ticket"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E0D4C5] focus:border-[#C85A65] outline-none text-sm font-medium bg-[#FAF6F0]"
              />
            </div>

            {/* Friend Tagging with Met Before Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9E8E87] mb-2">
                Invite Friends & Tag Familiarity
              </label>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {FRIENDS_DATA.map(friend => {
                  const isInvited = formData.invitedFriendIds.includes(friend.id);
                  const isMetBefore = formData.metBeforeTags[friend.id] ?? true;

                  return (
                    <div key={friend.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5]">
                      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleFriendToggle(friend.id)}>
                        <input
                          type="checkbox"
                          checked={isInvited}
                          onChange={() => {}}
                          className="accent-[#C85A65] w-4 h-4"
                        />
                        <img src={friend.avatar} alt={friend.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <span className="text-xs font-bold text-[#2C221E]">{friend.name}</span>
                          <span className="text-[10px] text-[#6C5E58] font-mono block">{friend.mbti} • {friend.lifestyle}</span>
                        </div>
                      </div>

                      {isInvited && (
                        <button
                          type="button"
                          onClick={() => handleMetBeforeToggle(friend.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            isMetBefore
                              ? 'bg-[#7B9E87] text-white border-[#7B9E87]'
                              : 'bg-[#F9E076] text-[#4A3E00] border-[#E0C855]'
                          }`}
                        >
                          {isMetBefore ? 'Met Before ✓' : 'First Time Intro 👋'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9E8E87] mb-1.5">
                Vibe & Activity Notes
              </label>
              <textarea
                rows={2}
                placeholder="What are we doing? Mention schedule notes or what to bring..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-[#E0D4C5] focus:border-[#C85A65] outline-none text-xs font-medium bg-[#FAF6F0]"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary text-xs font-bold px-5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs font-bold px-6 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                Publish Outing
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
