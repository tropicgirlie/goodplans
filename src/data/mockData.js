// Mock data for MeetFriends Planner

export const FRIENDS_DATA = [
  {
    id: 'f1',
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENFP',
    archetype: 'The Creative Explorer',
    energyLevel: 'High',
    interests: ['Coffee', 'Art', 'Outdoors', 'Photography', 'Live Music'],
    color: '#FF6B6B'
  },
  {
    id: 'f2',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    mbti: 'INTJ',
    archetype: 'The Strategy Thinker',
    energyLevel: 'Chill',
    interests: ['Board Games', 'Specialty Coffee', 'Tech', 'Reading', 'Artisan Pizza'],
    color: '#4ECDC4'
  },
  {
    id: 'f3',
    name: 'Chloe Bennett',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    mbti: 'INFJ',
    archetype: 'The Deep Connector',
    energyLevel: 'Cozy',
    interests: ['Pottery', 'Wine & Paint', 'Hiking', 'Book Clubs', 'Tea Houses'],
    color: '#FFE66D'
  },
  {
    id: 'f4',
    name: 'Sam Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    mbti: 'ESFP',
    archetype: 'The Life of the Outing',
    energyLevel: 'High',
    interests: ['Dog Parks', 'Outdoor Hikes', 'Food Festivals', 'Nightlife', 'Live Music'],
    color: '#FF9F1C'
  },
  {
    id: 'f5',
    name: 'Leo Thorne',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENTP',
    archetype: 'The Idea Catalyst',
    energyLevel: 'Dynamic',
    interests: ['Trivia Nights', 'Escape Rooms', 'Craft Beer', 'Board Games', 'Coffee'],
    color: '#9B5DE5'
  }
];

export const INITIAL_OUTINGS = [
  {
    id: 'o1',
    title: 'Monday Coffee Walk & Dog Park Chill',
    category: 'Coffee & Chill',
    image: '/images/scrapbook_coffee_walk.jpg',
    date: 'Mon, Aug 18 • 10:00 AM',
    location: 'Daily Grind Cafe & Mission Park, SF',
    host: FRIENDS_DATA[0],
    affinityScore: 98,
    affinityBreakdown: {
      socialEnergyMatch: 'Perfect 100% (High + Cozy Balance)',
      interestSynergy: 'Coffee (100%), Dog Lover (90%), Outdoor Walk (85%)',
      stressLevel: 'Ultra Low (Casual & Flexible)'
    },
    handwrittenTag: 'monday coffee',
    stickerType: 'coffee',
    price: 'Free',
    attendees: [FRIENDS_DATA[0], FRIENDS_DATA[1], FRIENDS_DATA[2], FRIENDS_DATA[3]],
    maxAttendees: 6,
    description: 'Kick off the week with specialty pour-overs, fresh air, and a relaxed dog walk around the park. Perfect for both introverts looking for low-pressure vibes and extroverts wanting great chatter!',
    itinerary: [
      { time: '10:00 AM', detail: 'Meet outside Daily Grind Cafe for pour-overs & pastries' },
      { time: '10:45 AM', detail: 'Stroll down Mission Street towards the sunny park lawn' },
      { time: '11:30 AM', detail: 'Puppy playtime & chill squad conversation on picnic blankets' }
    ],
    comments: [
      { id: 'c1', user: FRIENDS_DATA[1], text: 'Count me in! Daily Grind has the best oat milk lattes ☕', time: '2h ago' },
      { id: 'c2', user: FRIENDS_DATA[3], text: 'Bringing my little rescue dog Barnaby! 🐶✨', time: '1h ago' }
    ]
  },
  {
    id: 'o2',
    title: 'Sunset Wine & Artisan Pottery Workshop',
    category: 'Creative Workshops',
    image: '/images/scrapbook_pottery.jpg',
    date: 'Wed, Aug 20 • 6:30 PM',
    location: 'Clay Studio, Hayes Valley',
    host: FRIENDS_DATA[2],
    affinityScore: 94,
    affinityBreakdown: {
      socialEnergyMatch: 'Cozy & Creative Harmony (94%)',
      interestSynergy: 'Pottery & Clay (95%), Wine & Sip (90%)',
      stressLevel: 'Tactile Relaxation & Unwind'
    },
    handwrittenTag: 'craft & wine',
    stickerType: 'art',
    price: '$25 / person',
    attendees: [FRIENDS_DATA[2], FRIENDS_DATA[0], FRIENDS_DATA[4]],
    maxAttendees: 8,
    description: 'Get your hands dirty crafting custom ceramic mugs or small plant pots while sipping natural wine. Guided by local ceramicists with great background music!',
    itinerary: [
      { time: '6:30 PM', detail: 'Welcome glass of Pinot & clay preparation' },
      { time: '7:00 PM', detail: 'Wheel throwing & hand-building demonstration' },
      { time: '8:15 PM', detail: 'Glazing & photo strip memory creation' }
    ],
    comments: [
      { id: 'c3', user: FRIENDS_DATA[0], text: 'I am so excited to make a crooked mug! 🎨🍷', time: '3h ago' }
    ]
  },
  {
    id: 'o3',
    title: 'Golden Hour Mountain Trail Hike & Scenic Picnic',
    category: 'Outdoors',
    image: '/images/scrapbook_sunset_hike.jpg',
    date: 'Sat, Aug 23 • 4:00 PM',
    location: 'Marin Headlands Trailhead',
    host: FRIENDS_DATA[3],
    affinityScore: 96,
    affinityBreakdown: {
      socialEnergyMatch: 'High Outdoor Energy (96%)',
      interestSynergy: 'Hiking (98%), Golden Hour Photos (92%)',
      stressLevel: 'Invigorating & Refreshing'
    },
    handwrittenTag: 'trail vibes',
    stickerType: 'nature',
    price: 'Free',
    attendees: [FRIENDS_DATA[3], FRIENDS_DATA[0], FRIENDS_DATA[1], FRIENDS_DATA[4]],
    maxAttendees: 10,
    description: 'A moderate 3-mile loop with panoramic Golden Gate views. We will reach the lookout summit just in time for sunset photos, sparkling water, and snacks!',
    itinerary: [
      { time: '4:00 PM', detail: 'Gather at Trailhead car park & gear check' },
      { time: '5:15 PM', detail: 'Summit lookout point photo session & sunset picnic' },
      { time: '6:30 PM', detail: 'Gentle dusk descent back to vehicles' }
    ],
    comments: [
      { id: 'c4', user: FRIENDS_DATA[4], text: 'I will pack my polaroid camera for squad shots! 📸', time: '5h ago' }
    ]
  },
  {
    id: 'o4',
    title: 'Wood-Fired Artisan Pizza & Board Game Night',
    category: 'Games & Food',
    image: '/images/scrapbook_pizza_games.jpg',
    date: 'Sun, Aug 24 • 5:30 PM',
    location: 'Alex’s Loft & Kitchen, North Beach',
    host: FRIENDS_DATA[1],
    affinityScore: 99,
    affinityBreakdown: {
      socialEnergyMatch: 'Strategy + Social Peak (99%)',
      interestSynergy: 'Board Games (100%), Pizza (100%), Low Key Hangout (95%)',
      stressLevel: 'Zero Pressure Comfort'
    },
    handwrittenTag: 'pizza & game night',
    stickerType: 'games',
    price: 'Bring a topping!',
    attendees: [FRIENDS_DATA[1], FRIENDS_DATA[0], FRIENDS_DATA[2], FRIENDS_DATA[3], FRIENDS_DATA[4]],
    maxAttendees: 6,
    description: 'Crispy sourdough pizzas straight from the stone oven paired with strategy tabletop games like Catan, Wingspan, and Codenames. Guaranteed high-laugh night!',
    itinerary: [
      { time: '5:30 PM', detail: 'Dough kneading & pizza topping bar' },
      { time: '6:30 PM', detail: 'Pizza feasting & round 1 game warmups' },
      { time: '7:30 PM', detail: 'Tournament showdown & dessert cookies' }
    ],
    comments: [
      { id: 'c5', user: FRIENDS_DATA[2], text: 'DIBS ON THE TRUFFLE MUSHROOM PIZZA! 🍕', time: '1d ago' },
      { id: 'c6', user: FRIENDS_DATA[1], text: 'Settlers of Catan is ready on the table 😏', time: '1d ago' }
    ]
  }
];

export const CATEGORY_PILLS = [
  { id: 'all', label: '🌟 All Outings', icon: 'Sparkles' },
  { id: 'match', label: '🎯 90%+ Affinity Matches', icon: 'Target' },
  { id: 'Coffee & Chill', label: '☕ Coffee & Chill', icon: 'Coffee' },
  { id: 'Creative Workshops', label: '🎨 Creative & Art', icon: 'Palette' },
  { id: 'Outdoors', label: '🌲 Outdoors & Hikes', icon: 'Trees' },
  { id: 'Games & Food', label: '🍕 Games & Foodie', icon: 'Pizza' }
];
