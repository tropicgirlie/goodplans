import React from 'react';

export default function ThemeCollageCard({ themeId = 'girl_club', className = '' }) {
  const themes = {
    girl_club: {
      title: 'The Girl Club • Amiga Dublin 💕',
      subtitle: 'Feminine Style & Routine Synergy',
      badgeText: '🎀 Flawless Vibes',
      stickerText: '✨ Girls Don’t Cry',
      imgSrc: '/images/girl_club_moodboard.png',
      matchScore: '99%',
      bgGradient: 'from-[#FFF0F2] via-[#FCE4EC] to-[#FFF0F2]',
      borderColor: 'border-[#C85A65]',
      accentBadgeBg: 'bg-[#C85A65] text-white',
      tagline: 'Rotary phone • Red handbag • Velvet bows • Pink sneakers',
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
      borderColor: 'border-[#7B9E87]',
      accentBadgeBg: 'bg-[#7B9E87] text-white',
      tagline: 'Paintbrushes • Waterfall dip • Mountain art • Wildflowers',
      stickers: ['🎨 Paintbrushes', '🦋 Monarch Butterfly', '📚 Stacked Books', '🌊 Thermal Dip']
    },
    afternoon_tea: {
      title: 'Shelbourne Tea & Pamper 💕',
      subtitle: 'Lord Mayor’s Lounge Champagne',
      badgeText: '🥂 Champagne Toast',
      stickerText: '✨ Warm Scones & Cream',
      imgSrc: '/images/scrapbook_afternoon_tea.jpg',
      matchScore: '98%',
      bgGradient: 'from-[#FFFDE7] via-[#FFF9C4] to-[#FFFDE7]',
      borderColor: 'border-[#F9E076]',
      accentBadgeBg: 'bg-[#F9E076] text-[#4A3E00]',
      tagline: 'Stacked teacups • Laurent-Perrier • Clotted cream • Finger sandwiches',
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
      borderColor: 'border-[#E65100]',
      accentBadgeBg: 'bg-[#2C221E] text-[#F9E076]',
      tagline: 'Live indie acoustic • Craft cider • Balcony seats • Post-show chat',
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
      borderColor: 'border-[#FB8C00]',
      accentBadgeBg: 'bg-[#E65100] text-white',
      tagline: 'Direct Aer Lingus • Rooftop sunset wine • Alfama tiles • Pastéis de Belém',
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
      borderColor: 'border-[#9E8E87]',
      accentBadgeBg: 'bg-[#6C5E58] text-white',
      tagline: 'Pour-over coffee • Cardamom buns • Stroller walk • Bench chat',
      stickers: ['☕ Pour-over Latte', '🥐 Cardamom Bun', '👶 Stroller Badge', '🌳 Park Green']
    }
  };

  const theme = themes[themeId] || themes.girl_club;

  return (
    <div className={`relative w-full max-w-sm transition-all duration-500 ${className}`}>
      
      {/* Paper Washi Tape Strip */}
      <div className="tape-strip tape-top-center z-20"></div>

      {/* Girl Club Cutout Scrapbook Frame with Dynamic Theme Background */}
      <div className={`p-4 bg-gradient-to-br ${theme.bgGradient} rounded-3xl border-4 ${theme.borderColor} shadow-2xl ring-1 ring-black/5 transform rotate-2 hover:rotate-0 transition-all duration-300 relative overflow-hidden`}>
        
        {/* Main Theme Image */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-white shadow-md">
          <img
            src={theme.imgSrc}
            alt={theme.title}
            className="w-full object-cover aspect-[4/3] shadow-inner transition-opacity duration-300"
          />
        </div>
        
        {/* Handwritten Cutout Sticker Caption */}
        <div className="mt-3 px-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl font-handwriting text-[#2C221E] block">
              {theme.title}
            </span>
            <span className="text-xs font-mono font-bold bg-white text-[#2C221E] px-2.5 py-0.5 rounded-full border border-[#E0D4C5] shadow-2xs">
              {theme.matchScore} Match
            </span>
          </div>

          <p className="text-[10px] font-mono uppercase tracking-widest text-[#6C5E58]">
            {theme.subtitle}
          </p>

          <p className="text-[11px] text-[#2C221E] font-medium italic pt-1">
            "{theme.tagline}"
          </p>
        </div>

        {/* Paper Cutout Sticker Badges Row */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-black/10">
          {theme.stickers.map((st, i) => (
            <span key={i} className="text-[10px] font-bold bg-white/90 backdrop-blur-xs text-[#2C221E] px-2 py-0.5 rounded-full border border-black/10 shadow-2xs">
              {st}
            </span>
          ))}
        </div>

      </div>

      {/* Floating Paper Cutout Top Badge */}
      <div className={`absolute -top-3 -right-3 ${theme.accentBadgeBg} px-3.5 py-1.5 rounded-full text-xs font-black shadow-xl border-2 border-white transform rotate-12 font-handwriting text-base z-30 transition-all`}>
        {theme.badgeText}
      </div>

      {/* Floating Paper Cutout Bottom Badge */}
      <div className="absolute -bottom-5 -left-3 bg-[#C85A65] text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-xl border-2 border-white transform -rotate-6 z-30">
        {theme.stickerText}
      </div>

    </div>
  );
}
