export interface PopularDestination {
  id: string;
  name: string;
  fullName: string;
  state: string;
  country: string;
  category: 'Pilgrimage' | 'Hill Station' | 'Coastal & Beach' | 'Heritage & Culture' | 'Nature & Wildlife';
  badge?: string;
  popularAttractions: string;
  bestSeason: string;
  approxNightBudget: string;
  aliases: string[];
}

const RAW_DESTINATIONS: Omit<PopularDestination, 'country'>[] = [
  {
    id: 'dest-tirupati',
    name: 'Tirupati',
    fullName: 'Tirupati, Andhra Pradesh',
    state: 'Andhra Pradesh',
    category: 'Pilgrimage',
    badge: 'Top Sacred Pilgrimage',
    popularAttractions: 'Tirumala Venkateswara Temple, Padmavathi Temple, Seshachalam Hills, Kapila Theertham',
    bestSeason: 'Sep – Mar',
    approxNightBudget: '₹800 – ₹2,500',
    aliases: [
      'tiru',
      'tirupathi',
      'tirupati',
      'tirumala',
      'tpty',
      'balaji',
      'venkateswara',
      'alipiri',
      'seshadri',
      'renigunta',
    ],
  },
  {
    id: 'dest-thiruvananthapuram',
    name: 'Thiruvananthapuram',
    fullName: 'Thiruvananthapuram (Trivandrum), Kerala',
    state: 'Kerala',
    category: 'Heritage & Culture',
    badge: 'Popular Coastal Capital',
    popularAttractions: 'Sree Padmanabhaswamy Temple, Kovalam Beach, Napier Museum, Shangumugham Beach',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,500 – ₹4,000',
    aliases: [
      'tiru',
      'tiruvanandhapuram',
      'thiruvananthapuram',
      'trivandrum',
      'trivendrum',
      'padmanabhaswamy',
      'kovalam',
      'kerala',
    ],
  },
  {
    id: 'dest-tiruchirappalli',
    name: 'Tiruchirappalli',
    fullName: 'Tiruchirappalli (Trichy), Tamil Nadu',
    state: 'Tamil Nadu',
    category: 'Pilgrimage',
    badge: 'Historic Temple City',
    popularAttractions: 'Sri Ranganathaswamy Temple (Srirangam), Rockfort Ucchi Pillayar Temple, Jambukeswarar Temple',
    bestSeason: 'Nov – Feb',
    approxNightBudget: '₹1,200 – ₹3,000',
    aliases: [
      'tiru',
      'trichy',
      'tiruchy',
      'tiruchi',
      'tiruchirapalli',
      'thiruchirapalli',
      'srirangam',
      'rockfort',
    ],
  },
  {
    id: 'dest-tiruvannamalai',
    name: 'Tiruvannamalai',
    fullName: 'Tiruvannamalai, Tamil Nadu',
    state: 'Tamil Nadu',
    category: 'Pilgrimage',
    badge: 'Spiritual Fire Shrine',
    popularAttractions: 'Arulmigu Annamalaiyar Temple, Arunachala Sacred Hill, Sri Ramana Maharshi Ashram',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹900 – ₹2,200',
    aliases: [
      'tiru',
      'thiruvannamalai',
      'tiruvannamalai',
      'arunachala',
      'ramana maharshi',
      'girivalam',
    ],
  },
  {
    id: 'dest-tiruchendur',
    name: 'Tiruchendur',
    fullName: 'Tiruchendur, Tamil Nadu',
    state: 'Tamil Nadu',
    category: 'Pilgrimage',
    badge: 'Seashore Sacred Shrine',
    popularAttractions: 'Lord Subramanya Swamy Shore Temple, Gulf of Mannar Beach, Valli Cave',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹800 – ₹2,000',
    aliases: [
      'tiru',
      'thiruchendur',
      'tiruchendur',
      'murugan temple',
      'sea shore temple',
    ],
  },
  {
    id: 'dest-tirunelveli',
    name: 'Tirunelveli',
    fullName: 'Tirunelveli, Tamil Nadu',
    state: 'Tamil Nadu',
    category: 'Heritage & Culture',
    badge: 'Temple & Heritage Gem',
    popularAttractions: 'Nellaiappar Temple, Courtallam Waterfalls, Manimuthar Dam, Thamirabarani River',
    bestSeason: 'Oct – Feb',
    approxNightBudget: '₹1,000 – ₹2,500',
    aliases: [
      'tiru',
      'thirunelveli',
      'tirunelveli',
      'nellai',
      'nellaiappar',
      'courtallam',
    ],
  },
  {
    id: 'dest-tirumala',
    name: 'Tirumala Hills',
    fullName: 'Tirumala (Upper Tirupati), Andhra Pradesh',
    state: 'Andhra Pradesh',
    category: 'Pilgrimage',
    badge: 'Sacred Seven Hills',
    popularAttractions: 'Ananda Nilayam, Silathoranam, Akasa Ganga, Papavinasam, Srivari Padalu',
    bestSeason: 'All Year Round',
    approxNightBudget: '₹500 – ₹2,000 (TTD Stays)',
    aliases: [
      'tiru',
      'tirumala',
      'seven hills',
      'venkateswara temple',
      'srivari',
    ],
  },
  {
    id: 'dest-kakinada',
    name: 'Kakinada',
    fullName: 'Kakinada, Andhra Pradesh',
    state: 'Andhra Pradesh',
    category: 'Coastal & Beach',
    badge: 'Smart Coastal Hub',
    popularAttractions: 'Coringa Wildlife Sanctuary & Mangroves, Hope Island, Uppada Beach, Annavaram Temple nearby',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,200 – ₹3,000',
    aliases: [
      'kakinada',
      'cct',
      'kakinada port',
      'kakinada town',
      'coringa',
      'uppada',
      'andhra pradesh',
    ],
  },
  {
    id: 'dest-rajahmundry',
    name: 'Rajahmundry',
    fullName: 'Rajahmundry, Andhra Pradesh',
    state: 'Andhra Pradesh',
    category: 'Heritage & Culture',
    badge: 'Cultural Capital of Andhra',
    popularAttractions: 'Godavari River Pushkar Ghat, Papi Kondalu Boat Cruise, ISKCON Temple, Havelock Bridge',
    bestSeason: 'Oct – Feb',
    approxNightBudget: '₹1,100 – ₹2,800',
    aliases: [
      'rajahmundry',
      'rjy',
      'rajamahendravaram',
      'godavari',
      'papikondalu',
    ],
  },
  {
    id: 'dest-visakhapatnam',
    name: 'Visakhapatnam',
    fullName: 'Visakhapatnam (Vizag), Andhra Pradesh',
    state: 'Andhra Pradesh',
    category: 'Coastal & Beach',
    badge: 'City of Destiny',
    popularAttractions: 'RK Beach, Kailasagiri, INS Kursura Submarine Museum, Araku Valley, Borra Caves',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,500 – ₹4,500',
    aliases: [
      'visakhapatnam',
      'vizag',
      'vtz',
      'araku',
      'borra caves',
      'rushikonda',
    ],
  },
  {
    id: 'dest-srisailam',
    name: 'Srisailam',
    fullName: 'Srisailam, Andhra Pradesh',
    state: 'Andhra Pradesh',
    category: 'Pilgrimage',
    badge: 'Sacred Jyotirlinga Shrine',
    popularAttractions: 'Mallikarjuna Swamy Jyotirlinga, Bhramaramba Devi Shakti Peeth, Srisailam Dam, Patala Ganga',
    bestSeason: 'Sep – Mar',
    approxNightBudget: '₹800 – ₹2,200',
    aliases: [
      'srisailam',
      'mallikarjuna',
      'jyotirlinga',
      'nallamala',
    ],
  },
  {
    id: 'dest-rameshwaram',
    name: 'Rameshwaram',
    fullName: 'Rameshwaram, Tamil Nadu',
    state: 'Tamil Nadu',
    category: 'Pilgrimage',
    badge: 'Char Dham Coastal Pilgrimage',
    popularAttractions: 'Ramanathaswamy Temple Corridors, 22 Teerthams, Agni Theertham, Dhanushkodi Ghost Town, Pamban Bridge',
    bestSeason: 'Oct – Apr',
    approxNightBudget: '₹1,200 – ₹3,500',
    aliases: [
      'rameshwaram',
      'rameswaram',
      'dhanushkodi',
      'pamban',
      'char dham',
      'ramanathaswamy',
    ],
  },
  {
    id: 'dest-madurai',
    name: 'Madurai',
    fullName: 'Madurai, Tamil Nadu',
    state: 'Tamil Nadu',
    category: 'Pilgrimage',
    badge: 'Temple City of South',
    popularAttractions: 'Meenakshi Amman Temple, Thirumalai Nayakkar Mahal, Gandhi Memorial Museum, Alagar Koyil',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,200 – ₹3,200',
    aliases: [
      'madurai',
      'meenakshi',
      'meenakshi amman',
      'thirumalai',
      'tamil nadu',
    ],
  },
  {
    id: 'dest-kochi',
    name: 'Kochi',
    fullName: 'Kochi (Cochin), Kerala',
    state: 'Kerala',
    category: 'Coastal & Beach',
    badge: 'Queen of Arabian Sea',
    popularAttractions: 'Fort Kochi, Chinese Fishing Nets, Mattancherry Palace, Marine Drive, Cherai Beach',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,800 – ₹5,000',
    aliases: [
      'kochi',
      'cochin',
      'fort kochi',
      'mattancherry',
      'kerala',
    ],
  },
  {
    id: 'dest-munnar',
    name: 'Munnar',
    fullName: 'Munnar, Kerala',
    state: 'Kerala',
    category: 'Hill Station',
    badge: 'Premier Tea Hill Resort',
    popularAttractions: 'Tea Gardens & Museum, Eravikulam National Park, Mattupetty Dam, Anamudi Peak',
    bestSeason: 'Sep – May',
    approxNightBudget: '₹2,000 – ₹5,500',
    aliases: [
      'munnar',
      'kerala hill station',
      'tea garden',
      'eravikulam',
    ],
  },
  {
    id: 'dest-alleppey',
    name: 'Alleppey',
    fullName: 'Alleppey (Alappuzha), Kerala',
    state: 'Kerala',
    category: 'Coastal & Beach',
    badge: 'Venice of the East',
    popularAttractions: 'Vembanad Lake Houseboat Cruise, Alappuzha Beach & Lighthouse, Marari Beach Backwaters',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹2,500 – ₹7,000',
    aliases: [
      'alleppey',
      'alappuzha',
      'houseboat',
      'backwaters',
      'vembanad',
      'kerala',
    ],
  },
  {
    id: 'dest-ooty',
    name: 'Ooty',
    fullName: 'Ooty (Udhagamandalam), Tamil Nadu',
    state: 'Tamil Nadu',
    category: 'Hill Station',
    badge: 'Queen of Hill Stations',
    popularAttractions: 'Nilgiri Mountain Railway (Toy Train), Ooty Lake, Botanical Garden, Doddabetta Peak, Rose Garden',
    bestSeason: 'Oct – Jun',
    approxNightBudget: '₹1,800 – ₹4,500',
    aliases: [
      'ooty',
      'udhagamandalam',
      'nilgiris',
      'doddabetta',
      'toy train',
    ],
  },
  {
    id: 'dest-varanasi',
    name: 'Varanasi',
    fullName: 'Varanasi (Kashi / Banaras), Uttar Pradesh',
    state: 'Uttar Pradesh',
    category: 'Pilgrimage',
    badge: 'Spiritual Heart of India',
    popularAttractions: 'Kashi Vishwanath Corridor, Dashashwamedh Ghat Evening Aarti, Manikarnika Ghat, Sarnath',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,000 – ₹3,500',
    aliases: [
      'varanasi',
      'kashi',
      'banaras',
      'benares',
      'vishwanath',
      'ganga aarti',
      'sarnath',
    ],
  },
  {
    id: 'dest-goa',
    name: 'Goa',
    fullName: 'Goa (North & South Beaches)',
    state: 'Goa',
    category: 'Coastal & Beach',
    badge: 'Tropical Beach Paradise',
    popularAttractions: 'Baga & Calangute Beaches, Basilica of Bom Jesus, Dudhsagar Waterfalls, Fort Aguada, Palolem',
    bestSeason: 'Nov – Mar',
    approxNightBudget: '₹2,000 – ₹6,000',
    aliases: [
      'goa',
      'calangute',
      'baga',
      'panaji',
      'dudhsagar',
      'candolim',
      'anjuna',
    ],
  },
  {
    id: 'dest-jaipur',
    name: 'Jaipur',
    fullName: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    category: 'Heritage & Culture',
    badge: 'The Pink City',
    popularAttractions: 'Amber Fort, Hawa Mahal, City Palace, Jantar Mantar, Nahargarh Fort, Chokhi Dhani',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,500 – ₹4,500',
    aliases: [
      'jaipur',
      'pink city',
      'amber fort',
      'hawa mahal',
      'rajasthan',
    ],
  },
  {
    id: 'dest-rishikesh',
    name: 'Rishikesh',
    fullName: 'Rishikesh, Uttarakhand',
    state: 'Uttarakhand',
    category: 'Pilgrimage',
    badge: 'Yoga & Adventure Capital',
    popularAttractions: 'Triveni Ghat Evening Aarti, Lakshman Jhula, Ram Jhula, River Rafting on Ganga, Beatles Ashram',
    bestSeason: 'Sep – Apr',
    approxNightBudget: '₹1,200 – ₹3,500',
    aliases: [
      'rishikesh',
      'haridwar',
      'ganga',
      'yoga capital',
      'uttarakhand',
    ],
  },
  {
    id: 'dest-mysuru',
    name: 'Mysuru',
    fullName: 'Mysuru (Mysore), Karnataka',
    state: 'Karnataka',
    category: 'Heritage & Culture',
    badge: 'City of Palaces',
    popularAttractions: 'Mysore Palace illumination, Chamundi Hill Temple, Brindavan Gardens, Sri Chamarajendra Zoo',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,400 – ₹3,800',
    aliases: [
      'mysore',
      'mysuru',
      'chamundi',
      'brindavan gardens',
      'karnataka',
    ],
  },
  {
    id: 'dest-hyderabad',
    name: 'Hyderabad',
    fullName: 'Hyderabad, Telangana',
    state: 'Telangana',
    category: 'Heritage & Culture',
    badge: 'City of Pearls',
    popularAttractions: 'Charminar, Golconda Fort, Ramoji Film City, Salar Jung Museum, Hussain Sagar Buddha Statue',
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,600 – ₹4,500',
    aliases: [
      'hyderabad',
      'secunderabad',
      'charminar',
      'golconda',
      'ramoji',
      'telangana',
    ],
  },
];

export const POPULAR_DESTINATIONS: PopularDestination[] = RAW_DESTINATIONS.map((d) => ({
  country: 'India',
  ...d,
}));

/**
 * Filter destinations based on user input query.
 * Matches by name, full name, state, country, category, popular attractions, and aliases.
 * Returns empty array when query is empty.
 */
export function getRecommendedDestinations(query: string, maxResults = 8): PopularDestination[] {
  const clean = query.trim().toLowerCase();

  // If query is empty, do not display any destination suggestions
  if (!clean) {
    return [];
  }

  // Exact prefix matches on name or aliases get the highest priority
  const scored = POPULAR_DESTINATIONS.map((dest) => {
    let score = 0;
    const nameLower = dest.name.toLowerCase();
    const fullNameLower = dest.fullName.toLowerCase();
    const stateLower = dest.state.toLowerCase();
    const countryLower = (dest.country || 'India').toLowerCase();
    const catLower = dest.category.toLowerCase();
    const attractionsLower = dest.popularAttractions.toLowerCase();

    // 1. Direct name match gets highest priority
    if (nameLower === clean) {
      score += 350;
    } else if (nameLower.startsWith(clean)) {
      // Prefix match on name: shorter names rank higher (e.g. "Ti" -> "Tirupati" before "Tiruchirappalli")
      score += 220 + Math.max(0, 30 - (nameLower.length - clean.length));
    } else if (nameLower.includes(clean)) {
      score += 70;
    }

    // Top primary destination priority boost (e.g. Tirupati)
    if (dest.id === 'dest-tirupati' && (nameLower.includes(clean) || dest.aliases.some(a => a.startsWith(clean)))) {
      score += 35;
    }

    // 2. Prefix or inclusion in aliases (if not already exact name match)
    for (const alias of dest.aliases) {
      if (alias === clean) {
        score += 120;
        break;
      } else if (alias.startsWith(clean)) {
        score += 80;
        break;
      } else if (alias.includes(clean)) {
        score += 30;
        break;
      }
    }

    // 3. Match on full name
    if (fullNameLower.startsWith(clean)) {
      score += 50;
    } else if (fullNameLower.includes(clean)) {
      score += 25;
    }

    // 4. Match on state (only adds secondary weight when city name doesn't already start with query)
    if (!nameLower.startsWith(clean)) {
      if (stateLower.startsWith(clean)) {
        score += 45;
      } else if (stateLower.includes(clean)) {
        score += 20;
      }
    }

    // 5. Match on country (e.g. "india")
    if (countryLower.startsWith(clean)) {
      score += 15;
    }

    // 6. Match on category
    if (catLower.includes(clean)) {
      score += 15;
    }

    // 7. Match on attractions
    if (attractionsLower.includes(clean)) {
      score += 10;
    }

    return { dest, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((item) => item.dest);
}
