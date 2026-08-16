import React, { useState } from 'react';
import { MapPin, Star, Navigation, Sparkles, Heart, ExternalLink, Calendar } from 'lucide-react';

export const DUBLIN_MAP_LOCATIONS = [
  {
    id: 'loc_shelbourne',
    name: 'The Shelbourne Hotel Afternoon Tea',
    category: 'Afternoon Tea & Treats',
    address: 'St Stephen\'s Green, Dublin 2, D02 K288',
    lat: 53.3389,
    lng: -6.2575,
    rating: 4.9,
    reviewsCount: 3420,
    price: '€65 / person',
    vibe: 'Luxurious tiered sandwiches, fresh scones & live harpist',
    image: '/images/scrapbook_afternoon_tea.jpg'
  },
  {
    id: 'loc_sauna',
    name: 'Forty Foot Thermal Sauna & Sea Dip',
    category: 'Wellness & Spa Days',
    address: 'Sandycove Point, Sandycove, Co. Dublin',
    lat: 53.2878,
    lng: -6.1158,
    rating: 4.9,
    reviewsCount: 1890,
    price: '€15 / session',
    vibe: 'Wood-fired coastal sauna & invigorating Irish sea dip',
    image: '/images/scrapbook_spa_sauna.jpg'
  },
  {
    id: 'loc_pottery',
    name: 'Temple Bar Pottery & Wine Studio',
    category: 'Creative Workshops',
    address: 'Eustace St, Temple Bar, Dublin 2',
    lat: 53.3445,
    lng: -6.2642,
    rating: 4.8,
    reviewsCount: 940,
    price: '€28 / person',
    vibe: 'Hands-on clay sculpting, wheel throwing & natural wine',
    image: '/images/scrapbook_pottery.jpg'
  },
  {
    id: 'loc_clement',
    name: 'Clement & Pekoe Pour-Overs',
    category: 'Coffee & Strolls',
    address: '50 South William St, Dublin 2',
    lat: 53.3421,
    lng: -6.2625,
    rating: 4.8,
    reviewsCount: 1250,
    price: '€4 - €8',
    vibe: 'Specialty teas, oat lattes & St Stephen’s Green walk',
    image: '/images/scrapbook_coffee_walk.jpg'
  },
  {
    id: 'loc_howth',
    name: 'Howth Cliff Trail & Harbor Seafood',
    category: 'Dublin Hikes & Tours',
    address: 'Howth Harbor & Cliff Walk, Co. Dublin',
    lat: 53.3881,
    lng: -6.0664,
    rating: 4.9,
    reviewsCount: 4120,
    price: 'Free',
    vibe: '6km scenic coastal loop, seals & fresh fish and chips',
    image: '/images/scrapbook_sunset_hike.jpg'
  },
  {
    id: 'loc_games',
    name: 'Clockwork Door Board Game Cafe',
    category: 'Games & Pizza',
    address: '5 Wellington Quay, Temple Bar, Dublin 2',
    lat: 53.3458,
    lng: -6.2645,
    rating: 4.7,
    reviewsCount: 880,
    price: '€10 / person',
    vibe: 'Unlimited tea, tabletop games & sourdough pizza',
    image: '/images/scrapbook_pizza_games.jpg'
  }
];

export default function GoogleMapsExplorer({ onSelectVenueForPlan }) {
  const [selectedLoc, setSelectedLoc] = useState(DUBLIN_MAP_LOCATIONS[0]);

  // Construct dynamic Google Maps embed URL for Dublin venue
  const getGoogleEmbedUrl = (loc) => {
    const query = encodeURIComponent(`${loc.name}, ${loc.address}`);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-TEST_DEMO_KEY&q=${query}&center=53.3498,-6.2603&zoom=13`;
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#F3ECE0] shadow-xs p-6 sm:p-8 space-y-6">
      
      {/* Explorer Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F3ECE0]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#7B9E87] text-white flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-extrabold font-display text-[#2C221E]">
              Dublin Top-Rated Venue Explorer
            </h3>
          </div>
          <p className="text-xs text-[#6C5E58] mt-0.5">
            Google Maps Platform Integration • Top-Rated Outings for Women in Ireland
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9E076] text-[#4A3E00] text-xs font-bold font-handwriting text-base">
          <Sparkles className="w-4 h-4" /> Top-Rated 4.8+ Stars
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List of Top-Rated Dublin Venues */}
        <div className="lg:col-span-5 space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {DUBLIN_MAP_LOCATIONS.map((loc) => {
            const isSelected = selectedLoc.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLoc(loc)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#FAF6F0] border-[#C85A65] shadow-xs'
                    : 'bg-white border-[#E0D4C5] hover:border-[#2C221E]'
                }`}
              >
                <img 
                  src={loc.image} 
                  alt={loc.name} 
                  className="w-16 h-16 rounded-lg object-cover border border-white shrink-0 shadow-xs"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C85A65]">
                      {loc.category}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-[#4A3E00] bg-[#F9E076] px-1.5 py-0.2 rounded font-mono">
                      <Star className="w-3 h-3 fill-[#4A3E00]" /> {loc.rating}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-[#2C221E] truncate mt-0.5">
                    {loc.name}
                  </h4>

                  <p className="text-xs text-[#6C5E58] line-clamp-1 mt-0.5 font-medium">
                    {loc.address}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#9E8E87] mt-1">
                    <span>{loc.price}</span>
                    <span className="font-bold text-[#7B9E87]">Map Pin Ready📍</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Map Preview & Direct Outing Creator CTA */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Interactive Google Map Mockup & Venue Details */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#E0D4C5] bg-[#FAF6F0] aspect-[16/10] shadow-inner">
            
            {/* Embedded Google Map iframe / Map Canvas */}
            <iframe
              title={`Google Map - ${selectedLoc.name}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedLoc.name + ', ' + selectedLoc.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full filter saturate-90"
            ></iframe>

            {/* Overlaid Venue Info Card */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#E0D4C5] shadow-lg flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black font-display text-[#2C221E]">
                    {selectedLoc.name}
                  </h4>
                  <span className="bg-[#7B9E87] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ⭐ {selectedLoc.rating}
                  </span>
                </div>
                <p className="text-xs text-[#6C5E58] font-medium line-clamp-1 mt-0.5">
                  {selectedLoc.vibe}
                </p>
              </div>

              <button
                onClick={() => onSelectVenueForPlan(selectedLoc)}
                className="btn btn-primary py-1.5 px-3 text-xs font-bold shrink-0 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                Plan Outing Here
              </button>
            </div>

          </div>

          {/* Quick Info Bar */}
          <div className="p-3 rounded-xl bg-[#F3ECE0] border border-[#E0D4C5] flex items-center justify-between text-xs text-[#2C221E]">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#C85A65]" />
              <span className="font-bold">Google Maps Geocoding & Route Ready:</span>
              <span className="text-[#6C5E58] hidden sm:inline">{selectedLoc.address}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLoc.name + ' ' + selectedLoc.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C85A65] font-bold flex items-center gap-1 hover:underline"
            >
              Open in Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
