import React, { useState } from 'react';
import { Settings, Users, Database, Sparkles, Plus, Trash2, Edit3, CheckCircle2, RotateCcw, HelpCircle, Heart } from 'lucide-react';
import { FRIENDS_DATA } from '../data/mockData';

export default function SettingsView({
  appMode,
  setAppMode,
  customFriends,
  setCustomFriends,
  onResetDemoData,
  onOpenOnboarding
}) {
  const [newFriend, setNewFriend] = useState({
    name: '',
    mbti: 'ENFP',
    lifestyle: 'Corporate 9-5',
    preferredTime: 'Early Dinner (6:30 PM)',
    socialBatteryLevel: 'balanced'
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddFriendSubmit = (e) => {
    e.preventDefault();
    if (!newFriend.name.trim()) return;

    const newFriendObj = {
      id: 'f_custom_' + Date.now(),
      name: newFriend.name.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      mbti: newFriend.mbti,
      archetype: 'The Connected Friend',
      lifestyle: newFriend.lifestyle,
      preferredTime: newFriend.preferredTime,
      ageGroup: '28 (Millennial)',
      socialBatteryLevel: newFriend.socialBatteryLevel,
      interests: ['Early Dinner', 'Afternoon Tea', 'Concerts'],
      color: '#C85A65'
    };

    setCustomFriends([...customFriends, newFriendObj]);
    setNewFriend({ name: '', mbti: 'ENFP', lifestyle: 'Corporate 9-5', preferredTime: 'Early Dinner (6:30 PM)', socialBatteryLevel: 'balanced' });
    setShowAddForm(false);
  };

  const handleDeleteFriend = (id) => {
    setCustomFriends(customFriends.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Settings Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#F3ECE0]">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#C85A65]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#2C221E]">
              Amiga Settings & Saved Squad Center
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6C5E58] font-medium mt-1">
            Manage your saved friends, app mode (Demo Mode vs Empty Live Mode), and app preferences.
          </p>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="btn bg-[#FAF6F0] text-[#6C5E58] hover:text-[#2C221E] border border-[#E0D4C5] text-xs font-bold"
        >
          <HelpCircle className="w-4 h-4 text-[#C85A65]" />
          How Amiga Works
        </button>
      </div>

      {/* 1. App Data Mode Switcher (Demo Data vs Empty Mode) */}
      <div className="p-6 rounded-2xl bg-white border-2 border-[#E0D4C5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#C85A65]" />
            <div>
              <h3 className="text-base font-bold text-[#2C221E] font-display">
                App Data Mode Switcher
              </h3>
              <p className="text-xs text-[#6C5E58]">
                Switch between pre-loaded Dublin demo information or a clean empty state.
              </p>
            </div>
          </div>

          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${appMode === 'demo' ? 'bg-[#F9E076] text-[#4A3E00]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
            {appMode === 'demo' ? '🌟 Demo Mode Active' : '🍃 Empty State Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Demo Mode Button */}
          <button
            onClick={() => setAppMode('demo')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              appMode === 'demo'
                ? 'bg-[#FFF0F2] border-[#C85A65] shadow-sm'
                : 'bg-[#FAF6F0] border-[#E0D4C5] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-[#2C221E]">🌟 Interactive Demo Mode</span>
              {appMode === 'demo' && <CheckCircle2 className="w-4 h-4 text-[#C85A65]" />}
            </div>
            <p className="text-xs text-[#6C5E58]">
              Pre-loaded with Dublin outings (Coppinger Row, Whelan’s, Powerscourt), sample friend profiles, and MBTI match engines.
            </p>
          </button>

          {/* Empty State Mode Button */}
          <button
            onClick={() => setAppMode('empty')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              appMode === 'empty'
                ? 'bg-[#E8F5E9] border-[#A5D6A7] shadow-sm'
                : 'bg-[#FAF6F0] border-[#E0D4C5] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-[#2C221E]">🍃 Fresh Empty State Mode</span>
              {appMode === 'empty' && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
            </div>
            <p className="text-xs text-[#6C5E58]">
              Clean slate for new users to add their own custom friend roster and create custom outings from scratch.
            </p>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onResetDemoData}
            className="text-xs font-bold text-[#9E8E87] hover:text-[#C85A65] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Data to Default Demo State
          </button>
        </div>
      </div>

      {/* 2. Manage Saved Friends & Squad Roster */}
      <div className="p-6 rounded-2xl bg-white border-2 border-[#E0D4C5] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#7B9E87]" />
            <div>
              <h3 className="text-base font-bold text-[#2C221E] font-display">
                Saved Squad & Friends Roster ({customFriends.length})
              </h3>
              <p className="text-xs text-[#6C5E58]">
                Add and manage saved friend profiles, MBTI types, and schedule preferences.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary text-xs font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Friend
          </button>
        </div>

        {/* Add Friend Form */}
        {showAddForm && (
          <form onSubmit={handleAddFriendSubmit} className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5] space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C85A65]">
              Add New Friend Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#9E8E87] mb-1">
                  Friend Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siobhán"
                  value={newFriend.name}
                  onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D4C5] outline-none text-xs font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#9E8E87] mb-1">
                  MBTI Type
                </label>
                <select
                  value={newFriend.mbti}
                  onChange={(e) => setNewFriend({ ...newFriend, mbti: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D4C5] outline-none text-xs font-medium bg-white"
                >
                  {['ENFP', 'INFJ', 'INTJ', 'ESFP', 'ENFJ', 'INFP', 'ENTP', 'ISFJ'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#9E8E87] mb-1">
                  Lifestyle Cohort
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corporate 9-5 / Mat Leave"
                  value={newFriend.lifestyle}
                  onChange={(e) => setNewFriend({ ...newFriend, lifestyle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D4C5] outline-none text-xs font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#9E8E87] mb-1">
                  Social Battery Level
                </label>
                <select
                  value={newFriend.socialBatteryLevel}
                  onChange={(e) => setNewFriend({ ...newFriend, socialBatteryLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D4C5] outline-none text-xs font-medium bg-white"
                >
                  <option value="high">High Energy (100%)</option>
                  <option value="balanced">Balanced (60%)</option>
                  <option value="cozy">Cozy Low-Key (30%)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary text-xs py-1.5 px-3 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs py-1.5 px-4 font-bold shadow-xs"
              >
                Save Friend
              </button>
            </div>
          </form>
        )}

        {/* Saved Friends List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customFriends.map(friend => (
            <div key={friend.id} className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E0D4C5] flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover border border-white" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#2C221E]">{friend.name}</h4>
                    <span className="text-[10px] font-mono font-bold text-[#C85A65] bg-white px-1.5 py-0.5 rounded border border-[#E0D4C5]">
                      {friend.mbti}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6C5E58] font-medium">{friend.lifestyle}</p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteFriend(friend.id)}
                className="p-1.5 text-[#9E8E87] hover:text-[#C85A65] transition-colors cursor-pointer"
                title="Remove Friend"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
