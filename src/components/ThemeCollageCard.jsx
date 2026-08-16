import React from 'react';

export default function ThemeCollageCard({ themeId = 'girl_club', className = '' }) {
  const themes = {
    girl_club: {
      title: 'The Girl Club • Amiga Dublin 💕',
      subtitle: 'Feminine Cutout Moodboard',
      badgeText: '🎀 Flawless Vibes',
      stickerText: '✨ Girls Don’t Cry',
      imgSrc: '/images/girl_club_moodboard.png',
      matchScore: '99%',
      bgGradient: 'from-[#FFF0F2] via-[#FCE4EC] to-[#FFF0F2]',
      borderColor: 'border-[#09090B]',
      accentBadgeBg: 'bg-[#2563EB] text-white',
      stickers: ['☎️ Vintage Phone', '🧥 Red Fur Coat', '🎀 Velvet Bow', '👟 Pink Sneakers']
    },
    nature: {
      title: 'Wicklow Spa & Nature Retreat 🌿',
      subtitle: 'Thermal Baths & Mountain Flow',
      badgeText: '🧘‍♀️ Deep Relaxation',
      stickerText: '✨ You’re It, My Person',
      imgSrc: '/images/nature_waterfall_moodboard.png',
      matchScore: '99%',
      bgGradient: 'from-[#E8F5E9] via-[#C8E6C9] to-[#E8F5E9]',
      borderColor: 'border-[#09090B]',
      accentBadgeBg: 'bg-[#059669] text-white',
      stickers: ['🎨 Paintbrushes', '🦋 Monarch Butterfly', '📚 Stacked Books', '🌊 Thermal Dip']
    },
    afternoon_tea: {
      title: 'Shelbourne Tea & Pamper 💕',
      subtitle: 'Lord Mayor’s Lounge Champagne',
      badgeText: '🥂 Champagne Toast',
      stickerText: '✨ Warm Scones & Cream',
      imgSrc: '/images/scrapbook_afternoon_tea.jpg',
      matchScore: '98%',
      bgGradient: 'from-[#FFFDE7] via-[#FEF3C7] to-[#FFFDE7]',
      borderColor: 'border-[#09090B]',
      accentBadgeBg: 'bg-[#D97706] text-white',
      stickers: ['🫖 Fine Teapot', '🥂 Champagne Glass', '🧁 Fresh Scones', '🎀 Pink Silk Ribbon']
    },
    concert: {
      title: 'Whelan’s Acoustic Live Gig 🎸',
      subtitle: 'Candlelit Indie Music Night',
      badgeText: '🎟️ Ticket to Club',
      stickerText: '✨ Front Balcony Vibe',
      imgSrc: '/images/scrapbook_sunset_hike.jpg',
      matchScore: '98%',
      bgGradient: 'from-[#FFF3E0] via-[#FFE0B2] to-[#FFF3E0]',
      borderColor: 'border-[#09090B]',
      accentBadgeBg: 'bg-[#E11D48] text-white',
      stickers: ['🎟️ Ticket Stub', '🎸 Acoustic Guitar', '📷 Digital Camera', '🎧 Headphones']
    },
    trip: {
      title: 'Lisbon Girls Trip Getaway ✈️',
      subtitle: 'Pastéis de Belém & Sunset Drinks',
      badgeText: '✈️ The Next Big Thing',
      stickerText: '✨ Lisbon Sun & Tarts',
      imgSrc: '/images/scrapbook_pottery.jpg',
      matchScore: '97%',
      bgGradient: 'from-[#FFF3E0] via-[#FFCC80] to-[#FFF3E0]',
      borderColor: 'border-[#09090B]',
      accentBadgeBg: 'bg-[#2563EB] text-white',
      stickers: ['✈️ Boarding Pass', '🕶️ Sunglasses', '🇵🇹 Lisbon Tile', '🍷 Rooftop Wine']
    },
    coffee: {
      title: 'Ranelagh Maternity Morning Walk ☕',
      subtitle: 'Clement & Pekoe Lattes & Buns',
      badgeText: '👶 Stroller Friendly',
      stickerText: '✨ Cardamom Buns',
      imgSrc: '/images/scrapbook_coffee_walk.jpg',
      matchScore: '98%',
      bgGradient: 'from-[#FAF6F0] via-[#F3ECE0] to-[#FAF6F0]',
      borderColor: 'border-[#09090B]',
      accentBadgeBg: 'bg-[#52525B] text-white',
      stickers: ['☕ Pour-over Latte', '🥐 Cardamom Bun', '👶 Stroller Badge', '🌳 Park Green']
    }
  };

  const theme = themes[themeId] || themes.girl_club;

  return (
    <div className={`relative w-full max-w-sm transition-all duration-500 ${className}`}>
      
      {/* Paper Washi Tape Strip */}
      <div className="tape-strip tape-top-center z-20"></div>

      {/* Pop-Art Halo Scrapbook Frame */}
      <div className={`p-4 bg-gradient-to-br ${theme.bgGradient} rounded-3xl border-3 ${theme.borderColor} shadow-[6px_6px_0px_#09090B] hover:shadow-[9px_9px_0px_#09090B] transform rotate-2 hover:rotate-0 transition-all duration-300 relative overflow-hidden`}>
        
        {/* Radiating Graphic Accents */}
        <div className="absolute top-2 left-2 flex gap-1 z-10 opacity-90">
          <span className="w-2.5 h-4 bg-[#2563EB] rounded-full transform -rotate-12"></span>
          <span className="w-2.5 h-4 bg-[#E11D48] rounded-full transform rotate-12"></span>
          <span className="w-2.5 h-4 bg-[#F59E0B] rounded-full transform -rotate-6"></span>
        </div>

        {/* Main Original Photo Image Layer */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#09090B] shadow-sm bg-white aspect-[4/3]">
          <img
            src={theme.imgSrc}
            alt={theme.title}
            className="w-full h-full object-cover shadow-inner transition-opacity duration-300"
          />
        </div>
        
        {/* Handwritten Cutout Sticker Caption */}
        <div className="mt-3 px-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl font-handwriting text-[#09090B] block">
              {theme.title}
            </span>
            <span className="text-xs font-mono font-bold bg-[#FEF3C7] text-[#09090B] px-2.5 py-0.5 rounded-full border-2 border-[#09090B] shadow-2xs">
              {theme.matchScore} Match
            </span>
          </div>

          <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525B] font-bold">
            {theme.subtitle}
          </p>
        </div>

        {/* Paper Cutout Sticker Badges Row */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t-2 border-[#09090B]/15">
          {theme.stickers.map((st, i) => (
            <span key={i} className="text-[10px] font-bold bg-white text-[#09090B] px-2.5 py-0.5 rounded-full border-2 border-[#09090B] shadow-2xs">
              {st}
            </span>
          ))}
        </div>

      </div>

      {/* Floating Paper Cutout Top Badge */}
      <div className={`absolute -top-3 -right-3 ${theme.accentBadgeBg} px-3.5 py-1.5 rounded-full text-xs font-black shadow-[4px_4px_0px_#09090B] border-2 border-[#09090B] transform rotate-12 font-handwriting text-base z-30 transition-all`}>
        {theme.badgeText}
      </div>

      {/* Floating Paper Cutout Bottom Badge */}
      <div className="absolute -bottom-5 -left-3 bg-[#E11D48] text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-[4px_4px_0px_#09090B] border-2 border-[#09090B] transform -rotate-6 z-30">
        {theme.stickerText}
      </div>

    </div>
  );
}
