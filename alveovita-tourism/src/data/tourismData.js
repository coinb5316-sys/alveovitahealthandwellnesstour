// src/data/tourismData.js
// src/data/tourismData.js
// Remove the icon property from regions or use icon names as strings
export const regions = [
  { id: 'greater-accra', name: 'Greater Accra', color: 'from-blue-500 to-cyan-500' },
  { id: 'ashanti', name: 'Ashanti', color: 'from-amber-500 to-orange-500' },
  { id: 'western', name: 'Western', color: 'from-teal-500 to-emerald-500' },
  { id: 'eastern', name: 'Eastern', color: 'from-green-500 to-emerald-500' },
  { id: 'central', name: 'Central', color: 'from-purple-500 to-indigo-500' },
  { id: 'volta', name: 'Volta', color: 'from-emerald-500 to-green-500' },
  { id: 'northern', name: 'Northern', color: 'from-orange-500 to-red-500' },
  { id: 'upper-east', name: 'Upper East', color: 'from-yellow-500 to-amber-500' },
  { id: 'upper-west', name: 'Upper West', color: 'from-lime-500 to-green-500' },
  { id: 'bono', name: 'Bono', color: 'from-rose-500 to-pink-500' },
  { id: 'ahafo', name: 'Ahafo', color: 'from-emerald-500 to-teal-500' },
  { id: 'savannah', name: 'Savannah', color: 'from-amber-500 to-yellow-500' },
  { id: 'north-east', name: 'North East', color: 'from-orange-500 to-amber-500' },
  { id: 'oti', name: 'Oti', color: 'from-green-500 to-lime-500' },
  { id: 'western-north', name: 'Western North', color: 'from-teal-500 to-cyan-500' },
]

// ... rest of your data remains the same

export const hotels = [
  {
    id: 1,
    name: 'Kempinski Hotel Gold Coast City',
    region: 'greater-accra',
    location: 'Accra, Ghana',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    rating: 4.9,
    reviews: 342,
    price: '$350',
    amenities: ['Spa', 'Pool', 'Gym', 'Restaurant', 'Free WiFi'],
    description: 'Luxury 5-star hotel in the heart of Accra with world-class amenities and service.',
    phone: '+233 30 221 2345',
    email: 'reservations@kempinski.com.gh',
    website: 'www.kempinski.com/accra',
    badge: '5-Star Luxury'
  },
  // ... more hotels
]

export const tours = [
  {
    id: 1,
    title: 'Accra City & Culture Tour',
    region: 'greater-accra',
    location: 'Accra, Ghana',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
    duration: '4 Hours',
    price: '$85',
    rating: 4.8,
    reviews: 234,
    description: 'Explore the vibrant capital city with visits to historical sites, markets, and cultural landmarks.',
    includes: ['Guide', 'Transport', 'Entry Fees', 'Water'],
    type: 'Cultural',
    difficulty: 'Easy'
  },
  // ... more tours
]

export const userExperiences = [
  {
    id: 1,
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=80',
      location: 'London, UK'
    },
    type: 'video',
    title: 'My Amazing Safari Experience at Mole Park',
    description: 'Our family safari at Mole National Park was absolutely incredible. We saw elephants, antelopes, and even a lion! The guide was very knowledgeable and made the experience unforgettable. Highly recommend this adventure!',
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    date: '2 days ago',
    likes: 45,
    comments: 12,
    region: 'northern',
    tourName: 'Mole National Park Safari'
  },
  // ... more experiences
]