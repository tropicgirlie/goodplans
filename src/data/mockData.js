// Mock data for MeetFriends Planner - Dublin & Women's Social UX Research Edition

export const FRIENDS_DATA = [
  {
    id: 'f1',
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENFP',
    archetype: 'The Creative Connector',
    lifestyle: 'Maternity Leave / New Mom',
    scheduleType: 'Flexible Weekdays (Morning Coffee Strolls)',
    ageGroup: '28 (Millennial)',
    interests: ['Afternoon Tea', 'Stroller Walks', 'Pottery Workshops', 'Book Clubs'],
    color: '#C85A65'
  },
  {
    id: 'f2',
    name: 'Aoife Murphy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    mbti: 'INFJ',
    archetype: 'The Deep Listener',
    lifestyle: 'Working Professional (Tech UX)',
    scheduleType: 'Post-Work Evenings & Weekends',
    ageGroup: '29 (Millennial)',
    interests: ['Tea & Pastries', 'Thermal Saunas', 'Pottery', 'Nature Hikes', 'Artisan Cooking'],
    color: '#7B9E87'
  },
  {
    id: 'f3',
    name: 'Chloe Walsh',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    mbti: 'INTJ',
    archetype: 'The Thoughtful Planner',
    lifestyle: 'Hybrid Freelance / Consultant',
    scheduleType: 'Flexible Afternoon & Evenings',
    ageGroup: '32 (Millennial)',
    interests: ['Board Games', 'Castle Gardens', 'Bookshops', 'Co-Working', 'Wine & Cheese'],
    color: '#9B870C'
  },
  {
    id: 'f4',
    name: 'Saoirse O’Connor',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    mbti: 'ESFP',
    archetype: 'The Social Spark',
    lifestyle: 'Working Professional (Marketing)',
    scheduleType: 'Post-Work Evenings & Weekends',
    ageGroup: '24 (Gen Z)',
    interests: ['Coastal Saunas', 'Food Markets', 'Coastal Walks', 'Vintage Shopping', 'Brunch'],
    color: '#F9E076'
  },
  {
    id: 'f5',
    name: 'Emma Byrne',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENFJ',
    archetype: 'The Warm Host',
    lifestyle: 'Maternity Leave / Part-Time',
    scheduleType: 'Weekday Mornings & Weekends',
    ageGroup: '29 (Millennial)',
    interests: ['Afternoon Tea', 'Yoga Retreats', 'Art Galleries', 'Baking', 'Spa Days'],
    color: '#B388EB'
  }
];

export const INITIAL_OUTINGS = [
  {
    id: 'o_maternity_coffee',
    title: 'Monday Mornings Stroller & Coffee Walk in Ranelagh',
    category: 'Coffee & Strolls',
    lifestyleTag: '👶 Maternity Leave & Flex Schedule',
    connectionType: 'Core Squad',
    connectionBadge: '👯 Core Squad • Moms & Flex Hours',
    image: '/images/scrapbook_coffee_walk.jpg',
    date: 'Mon, Aug 25 • 10:30 AM (Weekday Morning)',
    location: 'Clement & Pekoe, South William St & Stephen’s Green, Dublin 2',
    host: FRIENDS_DATA[0],
    affinityScore: 98,
    familiarityBreakdown: {
      lifestyleFit: 'Ideal for Moms on Maternity Leave & Flexible Hours',
      metBeforeCount: 'Maya & Emma (New Mom Squad)',
      comfortLevel: 'Stroller Friendly • Low Pressure',
      vibeSync: 'Warm oat milk lattes, park stroll & baby catchup'
    },
    handwrittenTag: 'maternity coffee walk',
    stickerType: 'coffee',
    price: 'Free',
    attendees: [
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Host (Maya - Mat Leave)' },
      { ...FRIENDS_DATA[4], metBefore: true, relationNote: 'Emma (Mat Leave)' }
    ],
    maxAttendees: 6,
    description: 'Designed specifically for moms on maternity leave or flex-hour workers! Start the week with warm pour-overs from Clement & Pekoe, fresh cardamom buns, and a stroller-friendly stroll through St. Stephen’s Green.',
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
    id: 'o_postwork_pottery',
    title: 'Post-Work Wednesday Clay Pottery & Wine Unwind',
    category: 'Creative Workshops',
    lifestyleTag: '💼 Post-Work Unwind (9-5 Friendly)',
    connectionType: 'Mixed Circle',
    connectionBadge: '🔀 Mixed Circle • 9-5 Evening Unwind',
    image: '/images/scrapbook_pottery.jpg',
    date: 'Wed, Aug 27 • 6:30 PM (After Work)',
    location: 'The Pottery Studio, Temple Bar, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 95,
    familiarityBreakdown: {
      lifestyleFit: 'Perfect for Working Professionals (Post-6PM)',
      metBeforeCount: 'Aoife, Chloe & Saoirse (Tech & Marketing Crew)',
      comfortLevel: 'De-Stress After Screen Time',
      vibeSync: 'Wheel throwing, organic wine & soothing music'
    },
    handwrittenTag: 'post-work pottery & wine',
    stickerType: 'art',
    price: '€28 / person',
    attendees: [
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Host (Aoife - Tech UX)' },
      { ...FRIENDS_DATA[2], metBefore: true, relationNote: 'Chloe (Consultant)' },
      { ...FRIENDS_DATA[3], metBefore: true, relationNote: 'Saoirse (Marketing)' }
    ],
    maxAttendees: 8,
    description: 'Unwind after a busy workday! Designed for 9-to-5 working women looking to get off screens. Learn clay wheel throwing in Temple Bar with natural wine and ambient music.',
    itinerary: [
      { time: '6:30 PM', detail: 'Post-work arrival, wine glass & clay prep' },
      { time: '7:00 PM', detail: 'Hands-on wheel throwing & ceramic painting' },
      { time: '8:15 PM', detail: 'Glazing & photo memory polaroids' }
    ],
    comments: [
      { id: 'c_p1', user: FRIENDS_DATA[3], text: 'Exactly what I need after a 9-hour Zoom day! 🍷🎨', time: '3h ago' }
    ]
  },
  {
    id: 'o_tea',
    title: 'Weekend Traditional Irish Afternoon Tea at The Shelbourne',
    category: 'Afternoon Tea & Treats',
    lifestyleTag: '☕ Weekend Catchup (All Cohorts)',
    connectionType: 'Core Squad',
    connectionBadge: '👯 Core Squad • Weekend Celebration',
    image: '/images/scrapbook_afternoon_tea.jpg',
    date: 'Sat, Aug 30 • 2:30 PM (Weekend)',
    location: 'The Lord Mayor’s Lounge, Shelbourne Hotel, St Stephen’s Green, Dublin',
    host: FRIENDS_DATA[4],
    affinityScore: 99,
    familiarityBreakdown: {
      squadType: 'Core Squad (Celebration Outing)',
      metBeforeCount: 'All 4 friends know each other well',
      comfortLevel: 'Luxurious & Warm Conversation',
      vibeSync: 'Clotted cream scones, silver teapot service & champagne'
    },
    handwrittenTag: 'shelbourne afternoon tea',
    stickerType: 'tea',
    price: '€65 / person',
    attendees: [
      { ...FRIENDS_DATA[4], metBefore: true, relationNote: 'Host (Emma)' },
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Core Squad' },
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Core Squad' },
      { ...FRIENDS_DATA[2], metBefore: true, relationNote: 'Core Squad' }
    ],
    maxAttendees: 6,
    description: 'An elegant weekend tradition in the heart of Dublin. Tiered stands of warm homemade scones, raspberry preserve, delicate cucumber sandwiches, and a glass of champagne accompanied by live harp music.',
    itinerary: [
      { time: '2:30 PM', detail: 'Arrival at Lord Mayor’s Lounge & tea selection' },
      { time: '3:00 PM', detail: 'Scone service, champagne toast & squad catching up' },
      { time: '4:15 PM', detail: 'Stroll around St Stephen’s Green gardens' }
    ],
    comments: [
      { id: 'c_t1', user: FRIENDS_DATA[0], text: 'DIBS ON THE CLOTTED CREAM! Can’t wait for this girls! ☕🍰', time: '1h ago' }
    ]
  },
  {
    id: 'o_sauna',
    title: 'Saturday Coastal Thermal Sauna & Sea Dip',
    category: 'Wellness & Spa Days',
    lifestyleTag: '♨️ Weekend Wellness Dip',
    connectionType: 'Mixed Circle',
    connectionBadge: '🔀 Mixed Circle • Weekend Recharge',
    image: '/images/scrapbook_spa_sauna.jpg',
    date: 'Sat, Aug 30 • 10:00 AM (Weekend)',
    location: 'Forty Foot Sandycove, Co. Dublin',
    host: FRIENDS_DATA[3],
    affinityScore: 97,
    familiarityBreakdown: {
      squadType: 'Mixed Circle (Invigorating Wellness)',
      metBeforeCount: 'Saoirse & Maya know each other • Emma is new intro',
      comfortLevel: 'Refreshing & High Energy Boost',
      vibeSync: 'Hot wood-fired sauna steam & cold Irish Sea dip'
    },
    handwrittenTag: 'sauna & sea dip',
    stickerType: 'spa',
    price: '€15 / person',
    attendees: [
      { ...FRIENDS_DATA[3], metBefore: true, relationNote: 'Host (Saoirse)' },
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Met at Beach Walk' },
      { ...FRIENDS_DATA[4], metBefore: false, relationNote: 'First Time Intro 👋' }
    ],
    maxAttendees: 8,
    description: 'The ultimate Irish coastal wellness trend! Sweat out stress in a mobile wood-fired barrel sauna overlooking the sea at Sandycove, followed by an invigorating sea dip and hot chai tea.',
    itinerary: [
      { time: '10:00 AM', detail: 'Meet at Forty Foot sauna van & change into swimwear' },
      { time: '10:15 AM', detail: '30-min sauna steam cycles & Irish Sea dip' },
      { time: '11:15 AM', detail: 'Hot herbal tea & warm towels on the rocks' }
    ],
    comments: [
      { id: 'c_s1', user: FRIENDS_DATA[4], text: 'Brave enough for the sea dip if hot tea is promised! 🌊♨️', time: '2h ago' }
    ]
  }
];

export const CATEGORY_PILLS = [
  { id: 'all', label: '🌟 All Outings' },
  { id: 'maternity', label: '👶 Maternity Leave & Flex' },
  { id: 'postwork', label: '💼 Post-Work 9-5 Unwind' },
  { id: 'Afternoon Tea & Treats', label: '🫖 Afternoon Tea' },
  { id: 'Wellness & Spa Days', label: '♨️ Coastal Sauna & Spa' },
  { id: 'squad_core', label: '👯 Core Squad' },
  { id: 'Creative Workshops', label: '🎨 Pottery & Workshops' }
];
