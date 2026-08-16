// Mock data for MeetFriends Planner - Dublin & Generational UX Research Edition

export const UX_COHORT_RESEARCH_DATA = [
  {
    cohort: 'Millennial Working Women (25-34)',
    persona: 'Aoife & Chloe',
    preferredTimeWindows: ['Early Lunch (11:30 AM - 1:30 PM)', 'Post-Office Early Evening (6:00 - 8:30 PM)'],
    avoidedTimes: ['Late Dinners after 9:00 PM (Shops/cafes closing in Dublin)'],
    topOutings: ['Early Lunch & Grafton St Catchup', 'Post-Work Dance & Tapas', 'Sunday Post-Salon Meetup'],
    keyBehavior: 'Avoids late night dining due to early Dublin store closures; prefers post-office unwinds wrapping up by 8:30 PM.'
  },
  {
    cohort: 'Gen Z Social Connectors (21-24)',
    persona: 'Saoirse',
    preferredTimeWindows: ['Sunset Coastal Hikes (4:00 - 7:00 PM)', 'Saturday Brunch (12:00 PM)'],
    avoidedTimes: ['Early Weekday Mornings'],
    topOutings: ['Howth Cliff Walk & Fish Chips', 'Forty Foot Coastal Sauna & Dip', 'Vintage Market Strolls'],
    keyBehavior: 'Loves active outdoor sea/hike outings and early evening social energy; high interest in wellness saunas.'
  },
  {
    cohort: 'Moms on Maternity Leave / Flex Hours',
    persona: 'Maya & Emma',
    preferredTimeWindows: ['Weekday Mornings (10:00 AM - 12:30 PM)', 'Weekend Afternoon Tea (2:00 PM)'],
    avoidedTimes: ['Late Evenings & Post-Work Hours'],
    topOutings: ['Monday Morning Stroller & Coffee Walk', 'Shelbourne Afternoon Tea'],
    keyBehavior: 'Relies on weekday morning coffee walks for social connection during maternity leave; requires stroller-friendly paths.'
  }
];

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
    interests: ['Afternoon Tea', 'Stroller Walks', 'Dance Classes', 'Early Lunch'],
    color: '#C85A65'
  },
  {
    id: 'f2',
    name: 'Aoife Murphy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    mbti: 'INFJ',
    archetype: 'The Deep Listener',
    lifestyle: 'Working Professional (Office Days Wed)',
    preferredTime: 'Early Lunch & Post-Office (Before 8:30 PM)',
    ageGroup: '29 (Millennial)',
    interests: ['Dance Classes', 'Hair Salon & Pamper', 'Early Lunch', 'Thermal Saunas'],
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
    preferredTime: 'Sunset Hikes & Post-Work (6:00 - 8:30 PM)',
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
    preferredTime: 'Weekend Afternoon Tea (2:00 PM)',
    ageGroup: '29 (Millennial)',
    interests: ['Afternoon Tea', 'Hair Salon Day', 'Art Galleries', 'Baking', 'Spa Days'],
    color: '#B388EB'
  }
];

export const INITIAL_OUTINGS = [
  {
    id: 'o_early_lunch',
    title: 'Early Lunch & Grafton Street Catchup in Town',
    category: 'Early Lunch & Brunch',
    lifestyleTag: '☀️ Early Lunch (12:00 PM - Safe Dublin Hours)',
    connectionType: 'Mixed Circle',
    connectionBadge: '☀️ Early Lunch • Wrapping by 2:00 PM',
    image: '/images/scrapbook_afternoon_tea.jpg',
    date: 'Sat, Aug 30 • 12:00 PM (Early Lunch)',
    location: 'Coppinger Row & South William St, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 99,
    familiarityBreakdown: {
      timingFit: 'Early Lunch 12:00 PM (Avoids late closing rush)',
      metBeforeCount: 'Aoife & Chloe (Millennial Working Crew)',
      comfortLevel: 'Lively Dublin Atmosphere • Zero Rush',
      vibeSync: 'Warm sourdough sandwiches, fresh salads & town stroll'
    },
    handwrittenTag: 'early lunch in town',
    stickerType: 'lunch',
    price: '€18 / person',
    attendees: [
      { ...FRIENDS_DATA[1], metBefore: true, relationNote: 'Host (Aoife - Millennial)' },
      { ...FRIENDS_DATA[2], metBefore: true, relationNote: 'Chloe (Early Lunch Fan)' }
    ],
    maxAttendees: 6,
    description: 'Designed for women who prefer early lunch when Dublin cafes are bustling and open! Catch up over delicious sourdough sandwiches, crisp salads, and fresh juices, wrapping up around 2 PM.',
    itinerary: [
      { time: '12:00 PM', detail: 'Meet at Coppinger Row outdoor terrace for early lunch' },
      { time: '1:00 PM', detail: 'Coffee & sweet treat at South William St cafe' },
      { time: '2:00 PM', detail: 'Slow afternoon walk down Grafton Street' }
    ],
    comments: [
      { id: 'c_l1', user: FRIENDS_DATA[2], text: 'Early lunch is so much better than late dinners! Count me in 🥪☕', time: '40m ago' }
    ]
  },
  {
    id: 'o_dance_wednesday',
    title: 'Wednesday Office Day: Night Dance Class & Tapas in Town',
    category: 'Dance & Night Outings',
    lifestyleTag: '💃 Wed Post-Work (Wraps by 8:30 PM)',
    connectionType: 'Mixed Circle',
    connectionBadge: '💃 Post-Work Dance Pals',
    image: '/images/scrapbook_pottery.jpg',
    date: 'Wed, Aug 27 • 7:15 PM (Wraps by 8:30 PM)',
    location: 'Dublin Dance Studio & Market Bar, South William St, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 99,
    familiarityBreakdown: {
      timingFit: 'Post-Office 7:15 PM (Wraps by 8:30 PM before closing)',
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
    description: 'The ultimate Wednesday office day routine! Head straight from the office to a fun 1-hour dance class in town, followed by a relaxed glass of wine and tapas, wrapping up by 8:30 PM before shops close.',
    itinerary: [
      { time: '7:15 PM', detail: 'Meet at Dublin Dance Studio for 1-hr session' },
      { time: '8:15 PM', detail: 'Quick tapas & wine at Market Bar' },
      { time: '8:45 PM', detail: 'Home early for a great night sleep' }
    ],
    comments: [
      { id: 'c_d1', user: FRIENDS_DATA[3], text: 'Love that it finishes early! Perfect timing 💃🍷', time: '1h ago' }
    ]
  },
  {
    id: 'o_sunday_salon',
    title: 'Sunday Salon Pamper & Grafton Street Town Meetup',
    category: 'Afternoon Tea & Treats',
    lifestyleTag: '💇‍♀️ Sun Salon + Town (2:00 PM)',
    connectionType: '1:1 Outing',
    connectionBadge: '☕ Sunday Town Meetup Duo',
    image: '/images/scrapbook_afternoon_tea.jpg',
    date: 'Sun, Aug 31 • 2:00 PM (Post-Salon)',
    location: 'South William St Salon & Clement & Pekoe / Grafton St, Dublin 2',
    host: FRIENDS_DATA[1],
    affinityScore: 98,
    familiarityBreakdown: {
      timingFit: 'Post-Salon 2:00 PM (Prime Sunday Hours)',
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
    lifestyleTag: '👶 Maternity Morning (10:30 AM)',
    connectionType: 'Core Squad',
    connectionBadge: '👯 Core Squad • Moms & Flex Hours',
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
  }
];

export const CATEGORY_PILLS = [
  { id: 'all', label: '🌟 All Outings' },
  { id: 'early_lunch', label: '☀️ Early Lunch (11 AM - 1:30 PM)' },
  { id: 'wed_dance', label: '💃 Wed Post-Work Dance (Before 8:30 PM)' },
  { id: 'sun_salon', label: '💇‍♀️ Sun Salon & Town (2:00 PM)' },
  { id: 'maternity', label: '👶 Maternity Morning Strolls' },
  { id: 'Afternoon Tea & Treats', label: '🫖 Afternoon Tea' },
  { id: 'ux_research', label: '📊 UX Cohorts Research' }
];
