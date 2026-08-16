// Mock data for MeetFriends Planner - Dublin & Women's Social UX Research Edition

export const FRIENDS_DATA = [
  {
    id: 'f1',
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENFP',
    archetype: 'The Creative Connector',
    energyLevel: 'High Energy',
    ageGroup: '25-29 (Millennial)',
    interests: ['Specialty Coffee', 'Art & Pottery', 'Coastal Walks', 'Book Clubs', 'Live Music'],
    color: '#D9777F'
  },
  {
    id: 'f2',
    name: 'Aoife Murphy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    mbti: 'INFJ',
    archetype: 'The Deep Listener',
    energyLevel: 'Low-Pressure / Cozy',
    ageGroup: '25-29 (Millennial)',
    interests: ['Tea & Pastries', 'Pottery Workshops', 'Nature Hikes', 'Deep Talks', 'Artisan Markets'],
    color: '#7B9E87'
  },
  {
    id: 'f3',
    name: 'Chloe Walsh',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    mbti: 'INTJ',
    archetype: 'The Thoughtful Planner',
    energyLevel: 'Chill & Focused',
    ageGroup: '30-34 (Millennial)',
    interests: ['Board Games', 'Matcha Lattes', 'Bookshops', 'Co-Working', 'Wine & Cheese'],
    color: '#9B870C'
  },
  {
    id: 'f4',
    name: 'Saoirse O’Connor',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    mbti: 'ESFP',
    archetype: 'The Social Spark',
    energyLevel: 'High Energy',
    ageGroup: '22-24 (Gen Z)',
    interests: ['Food Markets', 'Coastal Walks', 'Vintage Shopping', 'Live Music', 'Brunch'],
    color: '#F9E076'
  },
  {
    id: 'f5',
    name: 'Emma Byrne',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENFJ',
    archetype: 'The Warm Host',
    energyLevel: 'Balanced',
    ageGroup: '25-29 (Millennial)',
    interests: ['Picnics', 'Yoga in the Park', 'Art Galleries', 'Baking', 'Coffee Strolls'],
    color: '#B388EB'
  }
];

export const INITIAL_OUTINGS = [
  {
    id: 'o1',
    title: 'Monday Coffee Stroll & Dog Walk in Ranelagh',
    category: 'Coffee & Chill',
    connectionType: 'Core Squad', // Core Squad, Mixed Circle, 1:1 Outing
    connectionBadge: '👯 Core Squad • Long-Time Besties',
    image: '/images/scrapbook_coffee_walk.jpg',
    date: 'Mon, Aug 18 • 10:30 AM',
    location: 'Clement & Pekoe, South William St & Stephen’s Green, Dublin 2',
    host: FRIENDS_DATA[0],
    affinityScore: 98,
    familiarityBreakdown: {
      squadType: 'Core Squad (Long-Time Friends)',
      metBeforeCount: 'All 4 friends know each other well',
      comfortLevel: 'Zero Social Anxiety • High Familiarity',
      vibeSync: 'Casual morning coffee, pour-overs & park stroll'
    },
    handwrittenTag: 'monday coffee stroll',
    stickerType: 'coffee',
    price: 'Free',
    attendees: [
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Host & Best Friend' },
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Best Friend since College' },
      { ...FRIENDS_DATA[2], metBefore: true, relationNote: 'In Same Friendship Circle' },
      { ...FRIENDS_DATA[3], metBefore: true, relationNote: 'Core Squad Member' }
    ],
    maxAttendees: 6,
    description: 'A cozy Dublin morning catchup starting with oat milk lattes and cardamom buns from Clement & Pekoe, followed by a relaxed stroll through St. Stephen’s Green. Low pressure and warm squad vibes!',
    itinerary: [
      { time: '10:30 AM', detail: 'Meet at Clement & Pekoe outdoor bench for coffee & pastries' },
      { time: '11:15 AM', detail: 'Walk down Grafton Street into St. Stephen’s Green park' },
      { time: '12:00 PM', detail: 'Bench catchup & puppy watching near the pond' }
    ],
    comments: [
      { id: 'c1', user: FRIENDS_DATA[1], text: 'Can’t wait for this! Bringing my sketchbook for the park ☕🎨', time: '2h ago' },
      { id: 'c2', user: FRIENDS_DATA[3], text: 'The cinnamon buns there are heavenly! See you girls soon ✨', time: '1h ago' }
    ]
  },
  {
    id: 'o2',
    title: 'Sunset Ceramic Pottery & Natural Wine Evening',
    category: 'Creative Workshops',
    connectionType: 'Mixed Circle',
    connectionBadge: '🔀 Mixed Circle • 2 Have Met • 1 First Time Intro',
    image: '/images/scrapbook_pottery.jpg',
    date: 'Wed, Aug 20 • 6:30 PM',
    location: 'The Pottery Studio, Temple Bar, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 94,
    familiarityBreakdown: {
      squadType: 'Mixed Circle (Friendly Icebreaker Outing)',
      metBeforeCount: 'Maya & Aoife know each other • Chloe is new to group',
      comfortLevel: 'Warm Welcoming • Icebreaker Crafts',
      vibeSync: 'Shared passion for clay, wine & gentle ambient music'
    },
    handwrittenTag: 'pottery & wine',
    stickerType: 'art',
    price: '€28 / person',
    attendees: [
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Host (Aoife)' },
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Met Aoife through Art Group' },
      { ...FRIENDS_DATA[4], metBefore: false, relationNote: 'First Time Meeting the Girls! 👋' }
    ],
    maxAttendees: 8,
    description: 'An intimate evening workshop in Temple Bar. Learn wheel throwing and clay pinch pots while sharing organic wine. Great opportunity to introduce new female friends into a relaxed circle!',
    itinerary: [
      { time: '6:30 PM', detail: 'Welcome wine glass & icebreaker introductions' },
      { time: '7:00 PM', detail: 'Hands-on wheel throwing & ceramic painting' },
      { time: '8:15 PM', detail: 'Polaroid squad memory photos & mug glazing' }
    ],
    comments: [
      { id: 'c3', user: FRIENDS_DATA[4], text: 'So happy to join! Excited to meet everyone 🍷✨', time: '3h ago' }
    ]
  },
  {
    id: 'o3',
    title: 'Howth Cliff Walk & Seaside Seafood Picnic',
    category: 'Outdoors',
    connectionType: 'Core Squad',
    connectionBadge: '👯 Core Squad • Long-Time Besties',
    image: '/images/scrapbook_sunset_hike.jpg',
    date: 'Sat, Aug 23 • 2:00 PM',
    location: 'Howth DART Station & Cliff Trail, Co. Dublin',
    host: FRIENDS_DATA[3],
    affinityScore: 96,
    familiarityBreakdown: {
      squadType: 'Core Squad (Outdoor Adventure)',
      metBeforeCount: 'All 4 friends are long-time hiking pals',
      comfortLevel: 'High Trust & Easy Conversation',
      vibeSync: 'Breezy Irish coastline, fresh air & seafood chips'
    },
    handwrittenTag: 'howth cliff walk',
    stickerType: 'nature',
    price: 'Free',
    attendees: [
      { ...FRIENDS_DATA[3], metBefore: true, relationNote: 'Host (Saoirse)' },
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Core Squad' },
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Core Squad' },
      { ...FRIENDS_DATA[2], metBefore: true, relationNote: 'Core Squad' }
    ],
    maxAttendees: 10,
    description: 'Take the DART out to Howth for a stunning 6km cliff walk along the Irish Sea. We will finish at Beshoffs for fresh fish & chips overlooking the harbor!',
    itinerary: [
      { time: '2:00 PM', detail: 'Meet at Howth DART station & start cliff trail' },
      { time: '3:30 PM', detail: 'Baily Lighthouse lookout point photos & break' },
      { time: '4:45 PM', detail: 'Fish & chips by the harbor pier' }
    ],
    comments: [
      { id: 'c4', user: FRIENDS_DATA[2], text: 'I’ll bring a thermos of hot tea for the cliff summit! ☕🌊', time: '5h ago' }
    ]
  },
  {
    id: 'o4',
    title: 'Matcha Catchup & Tabletop Games 1:1 or Small Group',
    category: 'Games & Food',
    connectionType: '1:1 Outing',
    connectionBadge: '☕ 1:1 Catchup • Deep Conversation & Games',
    image: '/images/scrapbook_pizza_games.jpg',
    date: 'Sun, Aug 24 • 4:00 PM',
    location: 'Clockwork Door & Board Game Cafe, Temple Bar, Dublin',
    host: FRIENDS_DATA[2],
    affinityScore: 99,
    affinityBreakdown: {
      squadType: '1:1 / Small Duo Catchup',
      metBeforeCount: 'Chloe & Maya (Deep 1:1 Connection)',
      comfortLevel: 'Intimate, Low Social Battery Cost',
      vibeSync: 'Matcha lattes, sourdough pizza & Wingspan/Catan'
    },
    handwrittenTag: 'matcha & game sync',
    stickerType: 'games',
    price: '€10 / person',
    attendees: [
      { ...FRIENDS_DATA[2], metBefore: true, relationNote: 'Host (Chloe)' },
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: '1:1 Catchup Duo' }
    ],
    maxAttendees: 4,
    description: 'A cozy 1:1 or small duo session for deep catchups over matcha lattes, sourdough pizza, and relaxed strategy board games. Perfect when you want quality 1:1 time without a big crowd.',
    itinerary: [
      { time: '4:00 PM', detail: 'Matcha pour-overs & catching up on life updates' },
      { time: '4:45 PM', detail: 'Board games (Wingspan / Azul) & pizza slice' },
      { time: '6:00 PM', detail: 'Wrap up feeling recharged' }
    ],
    comments: [
      { id: 'c5', user: FRIENDS_DATA[0], text: 'Really looking forward to our 1:1 catchup Chloe! Needed this 💕', time: '1d ago' }
    ]
  }
];

export const CATEGORY_PILLS = [
  { id: 'all', label: '🌟 All Outings' },
  { id: 'squad_core', label: '👯 Core Squad' },
  { id: 'squad_mixed', label: '🔀 Mixed Circle (Met / Intros)' },
  { id: 'squad_duo', label: '☕ 1:1 Catchups' },
  { id: 'Coffee & Chill', label: '☕ Coffee & Strolls' },
  { id: 'Creative Workshops', label: '🎨 Creative & Pottery' },
  { id: 'Outdoors', label: '🌲 Dublin Hikes & Sea' }
];
