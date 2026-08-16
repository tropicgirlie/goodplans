// Mock data for MeetFriends Planner - Dublin Edition with Google Material Symbols & UX Validation

export const FRIENDS_DATA = [
  {
    id: 'f1',
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENFP',
    archetype: 'The Creative Connector',
    lifestyle: 'Maternity Leave / New Mom',
    preferredTime: 'Weekday Mornings (10:30 AM)',
    ageGroup: '28 (Millennial)',
    interests: ['Afternoon Tea', 'Trips Abroad', 'Concerts', 'Coffee Walks'],
    color: '#C85A65'
  },
  {
    id: 'f2',
    name: 'Aoife Murphy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    mbti: 'INFJ',
    archetype: 'The Deep Listener',
    lifestyle: 'Working Professional (Office Days Wed)',
    preferredTime: 'Dinner Out & Post-Office (Before 8:30 PM)',
    ageGroup: '29 (Millennial)',
    interests: ['Dinner Out', 'Workshops', 'Trips Abroad', 'Wellness Retreats'],
    color: '#7B9E87'
  },
  {
    id: 'f3',
    name: 'Chloe Walsh',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    mbti: 'INTJ',
    archetype: 'The Thoughtful Planner',
    lifestyle: 'Hybrid Freelance / Consultant',
    preferredTime: 'Early Afternoon (12:00 - 3:00 PM)',
    ageGroup: '32 (Millennial)',
    interests: ['Concerts', 'Retreats', 'Trips Abroad', 'Dinner Out'],
    color: '#9B870C'
  },
  {
    id: 'f4',
    name: 'Saoirse O’Connor',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    mbti: 'ESFP',
    archetype: 'The Social Spark',
    lifestyle: 'Working Professional (Office Days Wed)',
    preferredTime: 'Sunset Hours & Concerts',
    ageGroup: '24 (Gen Z)',
    interests: ['Concerts', 'Trips Abroad', 'Wellness Retreats', 'Dinner Out'],
    color: '#F9E076'
  },
  {
    id: 'f5',
    name: 'Emma Byrne',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENFJ',
    archetype: 'The Warm Host',
    lifestyle: 'Maternity Leave / Part-Time',
    preferredTime: 'Weekend Afternoon Tea (2:00 PM)',
    ageGroup: '29 (Millennial)',
    interests: ['Afternoon Tea', 'Retreats', 'Trips Abroad', 'Workshops'],
    color: '#B388EB'
  }
];

export const CATEGORIES_LIST = [
  { id: 'Dinner Out', label: 'Dinner Out', icon: 'restaurant' },
  { id: 'Concerts & Music', label: 'Concerts & Music', icon: 'music_note' },
  { id: 'Wellness & Retreats', label: 'Wellness & Retreats', icon: 'spa' },
  { id: 'Trips Abroad', label: 'Trips Abroad', icon: 'flight_takeoff' },
  { id: 'Coffee & Strolls', label: 'Coffee & Strolls', icon: 'local_cafe' },
  { id: 'Workshops & Pottery', label: 'Workshops & Pottery', icon: 'brush' },
  { id: 'Afternoon Tea', label: 'Afternoon Tea', icon: 'local_bar' }
];

export const INITIAL_OUTINGS = [
  {
    id: 'o_dinner_out',
    title: 'Early Dinner & Natural Wine at Coppinger Row',
    category: 'Dinner Out',
    lifestyleTag: 'Early Dinner (6:30 PM - Safe Dublin Hours)',
    accessibilityTag: '💳 Revolut / Split Bill Ready',
    connectionType: 'Mixed Circle',
    connectionBadge: 'Dinner Out • Wraps by 8:30 PM',
    iconName: 'restaurant',
    image: '/images/scrapbook_pizza_games.jpg',
    date: 'Fri, Aug 29 • 6:30 PM (Early Dinner)',
    location: 'Coppinger Row & South William St, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 99,
    familiarityBreakdown: {
      timingFit: 'Early Dinner 6:30 PM (Wraps by 8:30 PM before closing)',
      metBeforeCount: 'Aoife & Chloe (Millennial Working Crew)',
      comfortLevel: 'Lively Dublin Atmosphere • Relaxed Dining',
      vibeSync: 'Seasonal tapas, fresh pasta & organic wine'
    },
    handwrittenTag: 'early dinner & wine',
    stickerType: 'dinner',
    price: '€32 / person',
    attendees: [
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Host (Aoife)' },
      { ...FRIENDS_DATA[2], metBefore: true, relationNote: 'Chloe (Foodie Duo)' }
    ],
    maxAttendees: 6,
    description: 'Designed for women who prefer early dinners when Dublin venues are buzzing! Enjoy seasonal tapas, sourdough, and natural wine, wrapping up early for a relaxed evening.',
    itinerary: [
      { time: '6:30 PM', detail: 'Meet at Coppinger Row outdoor terrace for early dinner' },
      { time: '7:45 PM', detail: 'Dessert & espresso martini at South William St' },
      { time: '8:30 PM', detail: 'Home early feeling nourished & refreshed' }
    ],
    comments: [
      { id: 'c_l1', user: FRIENDS_DATA[2], text: 'Early dinner is so much better than late nights! Count me in 🍽️🍷', time: '40m ago' }
    ]
  },
  {
    id: 'o_concert_music',
    title: 'Acoustic Live Concert & Drinks at Whelan’s',
    category: 'Concerts & Music',
    lifestyleTag: 'Live Concert (7:30 PM Doors)',
    accessibilityTag: '💳 Revolut / Split Bill Ready',
    connectionType: 'Mixed Circle',
    connectionBadge: 'Concert Crew • Live Music',
    iconName: 'music_note',
    image: '/images/scrapbook_sunset_hike.jpg',
    date: 'Thu, Sep 4 • 7:30 PM',
    location: 'Whelan’s, Camden St, Dublin 2',
    host: FRIENDS_DATA[3],
    affinityScore: 98,
    familiarityBreakdown: {
      timingFit: 'Evening Concert (7:30 PM Doors Open)',
      metBeforeCount: 'Saoirse & Aoife (Concert Duo)',
      comfortLevel: 'Intimate Candlelit Acoustic Gig',
      vibeSync: 'Indie acoustic vibes & post-show chat'
    },
    handwrittenTag: 'live music night',
    stickerType: 'music',
    price: '€22 / ticket',
    attendees: [
      { ...FRIENDS_DATA[3], metBefore: true, relationNote: 'Host (Saoirse)' },
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Aoife (Indie Fan)' }
    ],
    maxAttendees: 6,
    description: 'Catch an intimate acoustic live concert in Whelan’s iconic upstairs venue! Grab craft cider or wine, soak in great Irish indie music, and chat with the girls.',
    itinerary: [
      { time: '7:30 PM', detail: 'Meet at Whelan’s front bar for pre-show drink' },
      { time: '8:15 PM', detail: 'Acoustic gig upstairs' },
      { time: '9:45 PM', detail: 'Post-gig chat & night wrap-up' }
    ],
    comments: [
      { id: 'c_m1', user: FRIENDS_DATA[1], text: 'Whelan’s acoustic gigs are the best! Super excited 🎸🎶', time: '1h ago' }
    ]
  },
  {
    id: 'o_wellness_retreat',
    title: 'Wicklow Mountain Spa & Yoga Day Retreat',
    category: 'Wellness & Retreats',
    lifestyleTag: 'Day Retreat (Sat 10:00 AM)',
    accessibilityTag: '🧘‍♀️ All Levels & Spa Included',
    connectionType: 'Core Squad',
    connectionBadge: 'Wellness Retreat • Full Day',
    iconName: 'spa',
    image: '/images/scrapbook_spa_sauna.jpg',
    date: 'Sat, Sep 13 • 10:00 AM - 4:00 PM',
    location: 'Powerscourt Estate & Thermal Spa, Enniskerry, Co. Wicklow',
    host: FRIENDS_DATA[4],
    affinityScore: 99,
    familiarityBreakdown: {
      timingFit: 'Saturday Day Retreat (10:00 AM - 4:00 PM)',
      metBeforeCount: 'Emma & Maya (Core Squad)',
      comfortLevel: 'Deep Relaxation & Zero Pressure',
      vibeSync: 'Hot thermal baths, gentle yoga flow & organic lunch'
    },
    handwrittenTag: 'wicklow yoga retreat',
    stickerType: 'retreat',
    price: '€65 / person',
    attendees: [
      { ...FRIENDS_DATA[4], metBefore: true, relationNote: 'Host (Emma)' },
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Maya (Retreat Squad)' }
    ],
    maxAttendees: 8,
    description: 'Escape the city for a restorative day retreat in the Wicklow mountains! Includes a 75-minute gentle yoga flow, thermal hydrotherapy pool access, and an organic garden lunch.',
    itinerary: [
      { time: '10:00 AM', detail: 'Arrive at Powerscourt Spa & herbal tea welcome' },
      { time: '10:30 AM', detail: 'Gentle yoga & sound bath session' },
      { time: '12:30 PM', detail: 'Nourishing farm-to-table lunch' },
      { time: '2:00 PM', detail: 'Thermal spa pools & relaxation room' }
    ],
    comments: [
      { id: 'c_r1', user: FRIENDS_DATA[0], text: 'Exactly what we need! My social battery will be 100% recharged 🧘‍♀️✨', time: '3h ago' }
    ]
  },
  {
    id: 'o_trip_abroad',
    title: 'Girls Long Weekend Getaway: Lisbon Sun & Pastéis',
    category: 'Trips Abroad',
    lifestyleTag: '3-Day Weekend Trip Abroad',
    accessibilityTag: '✈️ Direct Flights & Central Airbnb',
    connectionType: 'Core Squad',
    connectionBadge: 'Trip Abroad • Long Weekend',
    iconName: 'flight_takeoff',
    image: '/images/scrapbook_pottery.jpg',
    date: 'Fri, Oct 10 - Sun, Oct 12',
    location: 'Lisbon, Portugal (Direct Flights from Dublin)',
    host: FRIENDS_DATA[2],
    affinityScore: 97,
    familiarityBreakdown: {
      timingFit: 'Autumn Long Weekend Getaway',
      metBeforeCount: 'Chloe, Aoife & Saoirse (Travel Squad)',
      comfortLevel: 'Sunny Vibe & High Energy Discovery',
      vibeSync: 'Rooftop sunset drinks, ceramic tiles & Lisbon pastries'
    },
    handwrittenTag: 'lisbon girls trip',
    stickerType: 'trip',
    price: '€180 / person (Flight + Airbnb)',
    attendees: [
      { ...FRIENDS_DATA[2], metBefore: true, relationNote: 'Host (Chloe)' },
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Aoife (Travel Duo)' },
      { ...FRIENDS_DATA[3], metBefore: true, relationNote: 'Saoirse (Travel Duo)' }
    ],
    maxAttendees: 5,
    description: 'Fly out Friday morning for a sun-drenched 3-day girlfriends getaway to Lisbon! Stay in an old-town boutique Airbnb, explore Alfama cobbled streets, eat warm Pastéis de Belém, and enjoy rooftop cocktails.',
    itinerary: [
      { time: 'Fri Morning', detail: 'Fly out from Dublin Airport to Lisbon' },
      { time: 'Fri Afternoon', detail: 'Check into Airbnb & sunset rooftop wine' },
      { time: 'Sat Full Day', detail: 'Pastéis de Belém, tram rides & ceramic shopping' },
      { time: 'Sun Evening', detail: 'Fly back to Dublin feeling sun-kissed' }
    ],
    comments: [
      { id: 'c_t1', user: FRIENDS_DATA[3], text: 'Flights booked! Need sunshine and portuguese tarts asap ✈️🇵🇹', time: '5h ago' }
    ]
  },
  {
    id: 'o_coffee_stroll',
    title: 'Monday Morning Coffee & Stroller Walk in Ranelagh',
    category: 'Coffee & Strolls',
    lifestyleTag: 'Maternity Morning (10:30 AM)',
    accessibilityTag: '👶 Stroller & Buggy Accessible',
    connectionType: 'Core Squad',
    connectionBadge: 'Coffee & Strolls • Moms & Flex Hours',
    iconName: 'local_cafe',
    image: '/images/scrapbook_coffee_walk.jpg',
    date: 'Mon, Aug 25 • 10:30 AM (Weekday Morning)',
    location: 'Clement & Pekoe, South William St & Stephen’s Green, Dublin 2',
    host: FRIENDS_DATA[0],
    affinityScore: 98,
    familiarityBreakdown: {
      timingFit: '10:30 AM Morning Walk (Ideal for New Moms)',
      metBeforeCount: 'Maya & Emma (New Mom Squad)',
      comfortLevel: 'Stroller Friendly • Low Pressure',
      vibeSync: 'Warm oat milk lattes, park stroll & baby catchup'
    },
    handwrittenTag: 'maternity coffee walk',
    stickerType: 'coffee',
    price: 'Free',
    attendees: [
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Host (Maya)' },
      { ...FRIENDS_DATA[4], metBefore: true, relationNote: 'Emma (Mat Leave)' }
    ],
    maxAttendees: 6,
    description: 'Designed specifically for moms on maternity leave or flex-hour workers! Start the week with warm pour-overs from Clement & Pekoe, fresh cardamom buns, and a stroller-friendly stroll.',
    itinerary: [
      { time: '10:30 AM', detail: 'Meet outside Clement & Pekoe for lattes & fresh buns' },
      { time: '11:15 AM', detail: 'Stroller walk through St Stephen’s Green gardens' },
      { time: '12:00 PM', detail: 'Park bench chat & relaxed morning wrap-up' }
    ],
    comments: [
      { id: 'c_m1', user: FRIENDS_DATA[4], text: 'So needed this! Monday mornings on maternity leave get lonely ☕👶', time: '2h ago' }
    ]
  },
  {
    id: 'o_afternoon_tea',
    title: 'Classic Afternoon Tea at The Shelbourne Hotel',
    category: 'Afternoon Tea',
    lifestyleTag: 'Afternoon Tea (2:30 PM)',
    accessibilityTag: '💳 Revolut / Split Bill Ready',
    connectionType: '1:1 Outing',
    connectionBadge: 'Afternoon Tea • Pamper Catchup',
    iconName: 'local_bar',
    image: '/images/scrapbook_afternoon_tea.jpg',
    date: 'Sun, Aug 31 • 2:30 PM',
    location: 'Lord Mayor’s Lounge, The Shelbourne Hotel, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 98,
    familiarityBreakdown: {
      timingFit: 'Sunday 2:30 PM (Post-Salon Pamper Routine)',
      metBeforeCount: 'Aoife & Maya (Bestie Catchup)',
      comfortLevel: 'Luxurious & Relaxing Treat',
      vibeSync: 'Champagne, warm scones & clotted cream'
    },
    handwrittenTag: 'shelbourne afternoon tea',
    stickerType: 'tea',
    price: '€55 / person',
    attendees: [
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Host (Aoife)' },
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Maya (Duo Catchup)' }
    ],
    maxAttendees: 4,
    description: 'Treat yourself to Dublin’s most iconic afternoon tea in the elegant Lord Mayor’s Lounge. Finger sandwiches, warm buttermilk scones with clotted cream, fine teas, and a glass of Laurent-Perrier champagne.',
    itinerary: [
      { time: '2:30 PM', detail: 'Seated at Lord Mayor’s Lounge overlooking St Stephen’s Green' },
      { time: '2:45 PM', detail: 'Champagne toast & finger sandwiches' },
      { time: '3:45 PM', detail: 'Warm scones, pastries & tea refill' }
    ],
    comments: [
      { id: 'c_s1', user: FRIENDS_DATA[0], text: 'Can’t wait for warm scones! See you Sunday 💕☕', time: '30m ago' }
    ]
  }
];

export const CATEGORY_PILLS = [
  { id: 'all', label: 'All Outings', icon: 'auto_awesome' },
  { id: 'Dinner Out', label: 'Dinner Out', icon: 'restaurant' },
  { id: 'Concerts & Music', label: 'Concerts & Music', icon: 'music_note' },
  { id: 'Wellness & Retreats', label: 'Wellness & Retreats', icon: 'spa' },
  { id: 'Trips Abroad', label: 'Trips Abroad', icon: 'flight_takeoff' },
  { id: 'Coffee & Strolls', label: 'Coffee & Strolls', icon: 'local_cafe' },
  { id: 'Workshops & Pottery', label: 'Workshops & Pottery', icon: 'brush' },
  { id: 'Afternoon Tea', label: 'Afternoon Tea', icon: 'local_bar' }
];
