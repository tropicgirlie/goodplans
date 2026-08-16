// Mock data for MeetFriends Planner - Dublin & Real Schedule Routines Edition

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
    interests: ['Afternoon Tea', 'Stroller Walks', 'Dance Classes', 'Book Clubs'],
    color: '#C85A65'
  },
  {
    id: 'f2',
    name: 'Aoife Murphy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    mbti: 'INFJ',
    archetype: 'The Deep Listener',
    lifestyle: 'Working Professional (Office Days Wed)',
    scheduleType: 'Wed Night Dance Class & Sun Salon Town Meetups',
    ageGroup: '29 (Millennial)',
    interests: ['Dance Classes', 'Hair Salon & Pamper', 'Tea & Town Strolls', 'Thermal Saunas'],
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
    lifestyle: 'Working Professional (Office Days Wed)',
    scheduleType: 'Wed Night Dance & Weekend Town Meetups',
    ageGroup: '24 (Gen Z)',
    interests: ['Salsa & Dance', 'Food Markets', 'Coastal Walks', 'Vintage Shopping', 'Brunch'],
    color: '#F9E076'
  },
  {
    id: 'f5',
    name: 'Emma Byrne',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    mbti: 'ENFJ',
    archetype: 'The Warm Host',
    lifestyle: 'Maternity Leave / Part-Time',
    scheduleType: 'Sunday Town Meetups & Weekday Mornings',
    ageGroup: '29 (Millennial)',
    interests: ['Afternoon Tea', 'Hair Salon Day', 'Art Galleries', 'Baking', 'Spa Days'],
    color: '#B388EB'
  }
];

export const INITIAL_OUTINGS = [
  {
    id: 'o_dance_wednesday',
    title: 'Wednesday Office Day: Night Dance Class & Tapas in Town',
    category: 'Dance & Night Outings',
    lifestyleTag: '💃 Wed Office Day + Dance Night',
    connectionType: 'Mixed Circle',
    connectionBadge: '💃 Post-Work Dance Pals',
    image: '/images/scrapbook_pottery.jpg',
    date: 'Wed, Aug 27 • 7:15 PM (Post-Office Routine)',
    location: 'Dublin Dance Studio & Market Bar, South William St, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 99,
    familiarityBreakdown: {
      routineFit: 'Office Day Routine: Dance Class at 7:15 PM + Tapas',
      metBeforeCount: 'Aoife & Saoirse (Dance Class Buddies)',
      comfortLevel: 'Fun Movement & Stress Relief',
      vibeSync: 'Salsa/Contemporary dance session & wine in town'
    },
    handwrittenTag: 'wednesday dance night',
    stickerType: 'dance',
    price: '€12 / class',
    attendees: [
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Host (Aoife - Office Day)' },
      { ...FRIENDS_DATA[3], metBefore: true, relationNote: 'Saoirse (Dance Buddy)' }
    ],
    maxAttendees: 6,
    description: 'The ultimate Wednesday office day routine! Head straight from the office to a fun 1-hour dance class in town, followed by a relaxed glass of wine and tapas on South William Street.',
    itinerary: [
      { time: '7:15 PM', detail: 'Meet at Dublin Dance Studio for 1-hr session' },
      { time: '8:30 PM', detail: 'Walk 2 mins to Market Bar for tapas & post-dance wine' },
      { time: '9:30 PM', detail: 'Head home feeling energized for Thursday' }
    ],
    comments: [
      { id: 'c_d1', user: FRIENDS_DATA[3], text: 'Perfect timing right after office hours! Count me in 💃🍷', time: '1h ago' }
    ]
  },
  {
    id: 'o_sunday_salon',
    title: 'Sunday Salon Pamper & Grafton Street Town Meetup',
    category: 'Afternoon Tea & Treats',
    lifestyleTag: '💇‍♀️ Sunday Salon + Town Catchup',
    connectionType: '1:1 Outing',
    connectionBadge: '☕ Sunday Town Meetup Duo',
    image: '/images/scrapbook_afternoon_tea.jpg',
    date: 'Sun, Aug 31 • 2:00 PM (Post-Salon Routine)',
    location: 'South William St Salon & Clement & Pekoe / Grafton St, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 98,
    familiarityBreakdown: {
      routineFit: 'Post-Salon Routine: Meeting in Town at 2:00 PM',
      metBeforeCount: 'Aoife & Maya (Bestie 1:1 Catchup)',
      comfortLevel: 'Fresh Pamper Vibes & Zero Stress',
      vibeSync: 'Matcha lattes, pastry & town window shopping'
    },
    handwrittenTag: 'sunday salon & town',
    stickerType: 'tea',
    price: 'Free / Coffee',
    attendees: [
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Host (Aoife - Post Salon)' },
      { ...FRIENDS_DATA[0], metBefore: true, relationNote: 'Maya (Town Catchup Duo)' }
    ],
    maxAttendees: 4,
    description: 'Designed around your Sunday salon routine! Finish your hair appointment in town at 2:00 PM, then meet up with a bestie for fresh matcha lattes, sweet treats, and a stroll down Grafton Street.',
    itinerary: [
      { time: '2:00 PM', detail: 'Meet outside hair salon on South William Street' },
      { time: '2:15 PM', detail: 'Matcha lattes & cake at Clement & Pekoe outdoor bench' },
      { time: '3:30 PM', detail: 'Window shopping & slow Sunday walk around town' }
    ],
    comments: [
      { id: 'c_s1', user: FRIENDS_DATA[0], text: 'Can’t wait to see your fresh hair! See you in town at 2pm 💕💇‍♀️', time: '30m ago' }
    ]
  },
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
  { id: 'wed_dance', label: '💃 Wed Office & Dance Night' },
  { id: 'sun_salon', label: '💇‍♀️ Sun Salon & Town Catchup' },
  { id: 'maternity', label: '👶 Maternity Leave & Flex' },
  { id: 'Afternoon Tea & Treats', label: '🫖 Afternoon Tea' },
  { id: 'Wellness & Spa Days', label: '♨️ Coastal Sauna & Spa' }
];
