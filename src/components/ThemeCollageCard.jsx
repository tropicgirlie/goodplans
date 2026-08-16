import React from 'react';

export default function ThemeCollageCard({ themeId = 'girl_club', className = '' }) {
  const themes = {
    girl_club: {
      title: 'The Girl Club • Amiga Dublin 💕',
      subtitle: 'Feminine Style & Routine Synergy',
      badgeText: '🎀 Flawless Vibes',
      stickerText: '✨ Girls Don’t Cry',
      imgSrc: '/images/girl_club_moodboard.png',
      matchScore: '99%'
    },
    nature: {
      title: 'Wicklow Spa & Nature Retreat 🌿',
      subtitle: 'Thermal Baths & Mountain Flow',
      badgeText: '🧘‍♀️ Deep Relaxation',
      stickerText: '✨ You’re It, My Person',
      imgSrc: '/images/nature_waterfall_moodboard.png',
      matchScore: '99%'
    },
    afternoon_tea: {
      title: 'Shelbourne Tea & Pamper 💕',
      subtitle: 'Lord Mayor’s Lounge Champagne',
      badgeText: '🥂 Champagne Toast',
      stickerText: '✨ Warm Scones & Cream',
      imgSrc: '/images/scrapbook_afternoon_tea.jpg',
      matchScore: '98%'
    },
    concert: {
      title: 'Whelan’s Acoustic Live Gig 🎸',
      subtitle: 'Candlelit Indie Music Night',
      badgeText: '🎟️ Ticket to Club',
      stickerText: '✨ Front Balcony Vibe',
      imgSrc: '/images/scrapbook_sunset_hike.jpg',
      matchScore: '98%'
    },
    trip: {
      title: 'Lisbon Girls Trip Getaway ✈️',
      subtitle: 'Pastéis de Belém & Sunset Drinks',
      badgeText: '✈️ The Next Big Thing',
      stickerText: '✨ Lisbon Sun & Tarts',
      imgSrc: '/images/scrapbook_pottery.jpg',
      matchScore: '97%'
    },
    coffee: {
      title: 'Ranelagh Maternity Morning Walk ☕',
      subtitle: 'Clement & Pekoe Lattes & Buns',
      badgeText: '👶 Stroller Friendly',
      stickerText: '✨ Cardamom Buns',
      imgSrc: '/images/scrapbook_coffee_walk.jpg',
      matchScore: '98%'
    }
  };

  const theme = themes[themeId] || themes.girl_club;

  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      
      {/* Paper Washi Tape Strip */}
      <div className="tape-strip tape-top-center z-20"></div>

      {/* Girl Club Cutout Scrapbook Frame */}
      <div className="p-3.5 bg-white rounded-3xl border-4 border-white shadow-2xl ring-1 ring-black/5 transform rotate-2 hover:rotate-0 transition-transform duration-300 relative overflow-hidden">
        <img
          src={theme.imgSrc}
          alt={theme.title}
          className="w-full rounded-2xl object-cover aspect-[4/3] shadow-inner"
        />
        
        {/* Handwritten Cutout Sticker Caption */}
        <div className="mt-3 px-1 flex items-center justify-between">
          <div>
            <span className="text-xl font-handwriting text-[#2C221E] block">
              {theme.title}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6C5E58]">
              {theme.subtitle}
            </span>
          </div>

          <span className="text-xs font-mono font-bold bg-[#FAF6F0] text-[#C85A65] px-2.5 py-1 rounded-full border border-[#E0D4C5]">
            {theme.matchScore} Match
          </span>
        </div>
      </div>

      {/* Floating Paper Cutout Badges */}
      <div className="absolute -top-3 -right-3 bg-[#F9E076] text-[#4A3E00] px-3.5 py-1.5 rounded-full text-xs font-black shadow-xl border-2 border-white transform rotate-12 font-handwriting text-base z-30">
        {theme.badgeText}
      </div>

      <div className="absolute -bottom-5 -left-3 bg-[#C85A65] text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-xl border-2 border-white transform -rotate-6 z-30">
        {theme.stickerText}
      </div>

    </div>
  );
}
