import { Contestant } from '../types';

// RuPaul's Drag Race Main US Season Contestants Database
// Only includes main seasons (1-17), first appearance only for multi-season contestants
// Data includes season, finishing position, age at time of show, hometown, coordinates, and image URLs

// City coordinates lookup for hometown proximity calculations
const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  'Minneapolis, Minnesota': { latitude: 44.9778, longitude: -93.2650 },
  'Bayamón, Puerto Rico': { latitude: 18.3985, longitude: -66.1553 },
  'Fort Lauderdale, Florida': { latitude: 26.1224, longitude: -80.1373 },
  'Las Vegas, Nevada': { latitude: 36.1699, longitude: -115.1398 },
  'Los Angeles, California': { latitude: 34.0522, longitude: -118.2437 },
  'Chicago, Illinois': { latitude: 41.8781, longitude: -87.6298 },
  'Cleveland, Ohio': { latitude: 41.4993, longitude: -81.6944 },
  'Glen Burnie, Maryland': { latitude: 39.1626, longitude: -76.6247 },
  'Raleigh, North Carolina': { latitude: 35.7796, longitude: -78.6382 },
  'Orlando, Florida': { latitude: 28.5383, longitude: -81.3792 },
  'Riverside, California': { latitude: 33.9533, longitude: -117.3962 },
  'Boston, Massachusetts': { latitude: 42.3601, longitude: -71.0589 },
  'Falls Church, Virginia': { latitude: 38.8823, longitude: -77.1711 },
  'Rochester, New York': { latitude: 43.1566, longitude: -77.6088 },
  'San Juan, Puerto Rico': { latitude: 18.4655, longitude: -66.1057 },
  'New York, New York': { latitude: 40.7128, longitude: -74.0060 },
  'Scotland Neck, North Carolina': { latitude: 36.1296, longitude: -77.4203 },
  'Atlanta, Georgia': { latitude: 33.7490, longitude: -84.3880 },
  'Paris, Texas': { latitude: 33.6609, longitude: -95.5555 },
  'St. Petersburg, Florida': { latitude: 27.7676, longitude: -82.6403 },
  'Manati, Puerto Rico': { latitude: 18.4285, longitude: -66.4827 },
  'Elmwood Park, New Jersey': { latitude: 40.9040, longitude: -74.1185 },
  'Norwalk, California': { latitude: 33.9022, longitude: -118.0817 },
  'Back Swamp, North Carolina': { latitude: 35.4585, longitude: -77.1369 },
  'Dayton, Ohio': { latitude: 39.7589, longitude: -84.1916 },
  'Pittsburgh, Pennsylvania': { latitude: 40.4406, longitude: -79.9959 },
  'San Diego, California': { latitude: 32.7157, longitude: -117.1611 },
  'South Beach, Florida': { latitude: 25.7907, longitude: -80.1300 },
  'Dorado, Puerto Rico': { latitude: 18.4588, longitude: -66.2677 },
  'Tampa, Florida': { latitude: 27.9506, longitude: -82.4572 },
  'Seattle, Washington': { latitude: 47.6062, longitude: -122.3321 },
  'Mesquite, Texas': { latitude: 32.7668, longitude: -96.5992 },
  'Gainesville, Florida': { latitude: 29.6516, longitude: -82.3248 },
  'San Francisco, California': { latitude: 37.7749, longitude: -122.4194 },
  'Owensboro, Kentucky': { latitude: 37.7719, longitude: -87.1112 },
  'Tallahassee, Florida': { latitude: 30.4383, longitude: -84.2807 },
  'Cincinnati, Ohio': { latitude: 39.1031, longitude: -84.5120 },
  'Azusa, California': { latitude: 34.1336, longitude: -117.9076 },
  'West Hollywood, California': { latitude: 34.0900, longitude: -118.3617 },
  'Worcester, Massachusetts': { latitude: 42.2626, longitude: -71.8023 },
  'Dallas, Texas': { latitude: 32.7767, longitude: -96.7970 },
  'Milwaukee, Wisconsin': { latitude: 43.0389, longitude: -87.9065 },
  'Hudson, Wisconsin': { latitude: 44.9744, longitude: -92.7569 },
  'Cayey, Puerto Rico': { latitude: 18.1119, longitude: -66.1660 },
  'Iowa City, Iowa': { latitude: 41.6611, longitude: -91.5302 },
  'Tucson, Arizona': { latitude: 32.2226, longitude: -110.9747 },
  'Redlands, California': { latitude: 34.0556, longitude: -117.1825 },
  'Shreveport, Louisiana': { latitude: 32.5252, longitude: -93.7502 },
  'Savannah, Georgia': { latitude: 32.0809, longitude: -81.0912 },
  'Gloucester, Massachusetts': { latitude: 42.6159, longitude: -70.6620 },
  'Riverdale, Georgia': { latitude: 33.5726, longitude: -84.4133 },
  'Echo Park, California': { latitude: 34.0781, longitude: -118.2606 },
  'Austin, Texas': { latitude: 30.2672, longitude: -97.7431 },
  'Johnson City, Tennessee': { latitude: 36.3134, longitude: -82.3535 },
  'London, United Kingdom': { latitude: 51.5074, longitude: -0.1278 },
  'Nashville, Tennessee': { latitude: 36.1627, longitude: -86.7816 },
  'Kansas City, Missouri': { latitude: 39.0997, longitude: -94.5786 },
  'Indianapolis, Indiana': { latitude: 39.7684, longitude: -86.1581 },
  'Albuquerque, New Mexico': { latitude: 35.0844, longitude: -106.6504 },
  'Denver, Colorado': { latitude: 39.7392, longitude: -104.9903 },
  'Cherry Hill, New Jersey': { latitude: 39.9346, longitude: -75.0307 },
  'Springfield, Missouri': { latitude: 37.2090, longitude: -93.2923 },
  'Ramseur, North Carolina': { latitude: 35.7332, longitude: -79.6531 },
  'Acworth, Georgia': { latitude: 34.0662, longitude: -84.6769 },
  'Utica, Minnesota': { latitude: 43.9783, longitude: -91.9571 },
  'Phoenix, Arizona': { latitude: 33.4484, longitude: -112.0740 },
  'Sacramento, California': { latitude: 38.5816, longitude: -121.4944 },
  'Fresno, California': { latitude: 36.7378, longitude: -119.7871 },
  'Fayetteville, Arkansas': { latitude: 36.0626, longitude: -94.1574 },
  'Grand Rapids, Michigan': { latitude: 42.9634, longitude: -85.6681 },
  'Cataño, Puerto Rico': { latitude: 18.4413, longitude: -66.1307 },
  'East Orange, New Jersey': { latitude: 40.7673, longitude: -74.2049 },
  'Houston, Texas': { latitude: 29.7604, longitude: -95.3698 },
  'Ansonia, Connecticut': { latitude: 41.3462, longitude: -73.0790 },
  'Miami, Florida': { latitude: 25.7617, longitude: -80.1918 },
  'Darien, Connecticut': { latitude: 41.0787, longitude: -73.4693 },
  'Hartford, Connecticut': { latitude: 41.7658, longitude: -72.6734 },
  'West Hartford, Connecticut': { latitude: 41.7620, longitude: -72.7420 },
  'Philadelphia, Pennsylvania': { latitude: 39.9526, longitude: -75.1652 },
  'Brownsville, Texas': { latitude: 25.9017, longitude: -97.4975 },
  'Guaynabo, Puerto Rico': { latitude: 18.3575, longitude: -66.1108 },
  'Carolina, Puerto Rico': { latitude: 18.3808, longitude: -65.9574 },
  'Louisville, Kentucky': { latitude: 38.2527, longitude: -85.7585 },
  'Leeds, Alabama': { latitude: 33.5484, longitude: -86.5444 },
  'Asbury Park, New Jersey': { latitude: 40.2204, longitude: -74.0121 },
  'Chattanooga, Tennessee': { latitude: 35.0456, longitude: -85.3097 },
  'Columbus, Ohio': { latitude: 39.9612, longitude: -82.9988 },
};

export const contestants: Contestant[] = [
  // Season 1
  {
    id: 'bebe-zahara-benet',
    name: 'BeBe Zahara Benet',
    season: 1,
    finishingPosition: 1,
    ageAtShow: 28,
    hometown: 'Minneapolis, Minnesota',
    hometownCoordinates: cityCoordinates['Minneapolis, Minnesota'],
    headshotUrl: '/images/headshots/bebe-zahara-benet.jpg',
    silhouetteUrl: '/images/silhouettes/bebe-zahara-benet.jpg'
  },
  {
    id: 'nina-flowers',
    name: 'Nina Flowers',
    season: 1,
    finishingPosition: 2,
    ageAtShow: 34,
    hometown: 'Bayamón, Puerto Rico',
    hometownCoordinates: cityCoordinates['Bayamón, Puerto Rico'],
    headshotUrl: '/images/headshots/nina-flowers.jpg',
    silhouetteUrl: '/images/silhouettes/nina-flowers.jpg'
  },
  {
    id: 'rebecca-glasscock',
    name: 'Rebecca Glasscock',
    season: 1,
    finishingPosition: 3,
    ageAtShow: 26,
    hometown: 'Fort Lauderdale, Florida',
    hometownCoordinates: cityCoordinates['Fort Lauderdale, Florida'],
    headshotUrl: '/images/headshots/rebecca-glasscock.jpg',
    silhouetteUrl: '/images/silhouettes/rebecca-glasscock.jpg'
  },
  {
    id: 'shannel',
    name: 'Shannel',
    season: 1,
    finishingPosition: 4,
    ageAtShow: 29,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/shannel.jpg',
    silhouetteUrl: '/images/silhouettes/shannel.jpg'
  },
  {
    id: 'ongina',
    name: 'Ongina',
    season: 1,
    finishingPosition: 5,
    ageAtShow: 26,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/ongina.jpg',
    silhouetteUrl: '/images/silhouettes/ongina.jpg'
  },
  {
    id: 'jade-s1',
    name: 'Jade',
    season: 1,
    finishingPosition: 6,
    ageAtShow: 25,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/jade-s1.jpg',
    silhouetteUrl: '/images/silhouettes/jade-s1.jpg'
  },
  {
    id: 'akashia',
    name: 'Akashia',
    season: 1,
    finishingPosition: 7,
    ageAtShow: 23,
    hometown: 'Cleveland, Ohio',
    hometownCoordinates: cityCoordinates['Cleveland, Ohio'],
    headshotUrl: '/images/headshots/akashia.jpg',
    silhouetteUrl: '/images/silhouettes/akashia.jpg'
  },
  {
    id: 'tammie-brown',
    name: 'Tammie Brown',
    season: 1,
    finishingPosition: 8,
    ageAtShow: 28,
    hometown: 'Glen Burnie, Maryland',
    hometownCoordinates: cityCoordinates['Glen Burnie, Maryland'],
    headshotUrl: '/images/headshots/tammie-brown.jpg',
    silhouetteUrl: '/images/silhouettes/tammie-brown.jpg'
  },
  {
    id: 'victoria-porkchop-parker',
    name: 'Victoria "Porkchop" Parker',
    season: 1,
    finishingPosition: 9,
    ageAtShow: 39,
    hometown: 'Raleigh, North Carolina',
    hometownCoordinates: cityCoordinates['Raleigh, North Carolina'],
    headshotUrl: '/images/headshots/victoria-porkchop-parker.jpg',
    silhouetteUrl: '/images/silhouettes/victoria-porkchop-parker.jpg'
  },

  // Season 2
  {
    id: 'tyra-sanchez',
    name: 'Tyra Sanchez',
    season: 2,
    finishingPosition: 1,
    ageAtShow: 21,
    hometown: 'Orlando, Florida',
    hometownCoordinates: cityCoordinates['Orlando, Florida'],
    headshotUrl: '/images/headshots/tyra-sanchez.jpg',
    silhouetteUrl: '/images/silhouettes/tyra-sanchez.jpg'
  },
  {
    id: 'raven',
    name: 'Raven',
    season: 2,
    finishingPosition: 2,
    ageAtShow: 30,
    hometown: 'Riverside, California',
    hometownCoordinates: cityCoordinates['Riverside, California'],
    headshotUrl: '/images/headshots/raven.jpg',
    silhouetteUrl: '/images/silhouettes/raven.jpg'
  },
  {
    id: 'jujubee',
    name: 'Jujubee',
    season: 2,
    finishingPosition: 3,
    ageAtShow: 25,
    hometown: 'Boston, Massachusetts',
    hometownCoordinates: cityCoordinates['Boston, Massachusetts'],
    headshotUrl: '/images/headshots/jujubee.jpg',
    silhouetteUrl: '/images/silhouettes/jujubee.jpg'
  },
  {
    id: 'tatianna',
    name: 'Tatianna',
    season: 2,
    finishingPosition: 4,
    ageAtShow: 21,
    hometown: 'Falls Church, Virginia',
    hometownCoordinates: cityCoordinates['Falls Church, Virginia'],
    headshotUrl: '/images/headshots/tatianna.jpg',
    silhouetteUrl: '/images/silhouettes/tatianna.jpg'
  },
  {
    id: 'pandora-boxx',
    name: 'Pandora Boxx',
    season: 2,
    finishingPosition: 5,
    ageAtShow: 37,
    hometown: 'Rochester, New York',
    hometownCoordinates: cityCoordinates['Rochester, New York'],
    headshotUrl: '/images/headshots/pandora-boxx.jpg',
    silhouetteUrl: '/images/silhouettes/pandora-boxx.jpg'
  },
  {
    id: 'jessica-wild',
    name: 'Jessica Wild',
    season: 2,
    finishingPosition: 6,
    ageAtShow: 29,
    hometown: 'San Juan, Puerto Rico',
    hometownCoordinates: cityCoordinates['San Juan, Puerto Rico'],
    headshotUrl: '/images/headshots/jessica-wild.jpg',
    silhouetteUrl: '/images/silhouettes/jessica-wild.jpg'
  },
  {
    id: 'sahara-davenport',
    name: 'Sahara Davenport',
    season: 2,
    finishingPosition: 7,
    ageAtShow: 25,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/sahara-davenport.jpg',
    silhouetteUrl: '/images/silhouettes/sahara-davenport.jpg'
  },
  {
    id: 'morgan-mcmichaels',
    name: 'Morgan McMichaels',
    season: 2,
    finishingPosition: 8,
    ageAtShow: 28,
    hometown: 'Scotland Neck, North Carolina',
    hometownCoordinates: cityCoordinates['Scotland Neck, North Carolina'],
    headshotUrl: '/images/headshots/morgan-mcmichaels.jpg',
    silhouetteUrl: '/images/silhouettes/morgan-mcmichaels.jpg'
  },
  {
    id: 'sonique',
    name: 'Sonique',
    season: 2,
    finishingPosition: 9,
    ageAtShow: 26,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/sonique.jpg',
    silhouetteUrl: '/images/silhouettes/sonique.jpg'
  },
  {
    id: 'mystique-summers-madison',
    name: 'Mystique Summers Madison',
    season: 2,
    finishingPosition: 10,
    ageAtShow: 25,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/mystique-summers-madison.jpg',
    silhouetteUrl: '/images/silhouettes/mystique-summers-madison.jpg'
  },
  {
    id: 'nicole-paige-brooks',
    name: 'Nicole Paige Brooks',
    season: 2,
    finishingPosition: 11,
    ageAtShow: 36,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/nicole-paige-brooks.jpg',
    silhouetteUrl: '/images/silhouettes/nicole-paige-brooks.jpg'
  },
  {
    id: 'shangela',
    name: 'Shangela',
    season: 2,
    finishingPosition: 12,
    ageAtShow: 28,
    hometown: 'Paris, Texas',
    hometownCoordinates: cityCoordinates['Paris, Texas'],
    headshotUrl: '/images/headshots/shangela.jpg',
    silhouetteUrl: '/images/silhouettes/shangela.jpg'
  },

  // Season 3
  {
    id: 'raja',
    name: 'Raja',
    season: 3,
    finishingPosition: 1,
    ageAtShow: 36,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/raja.jpg',
    silhouetteUrl: '/images/silhouettes/raja.jpg'
  },
  {
    id: 'manila-luzon',
    name: 'Manila Luzon',
    season: 3,
    finishingPosition: 2,
    ageAtShow: 28,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/manila-luzon.jpg',
    silhouetteUrl: '/images/silhouettes/manila-luzon.jpg'
  },
  {
    id: 'alexis-mateo',
    name: 'Alexis Mateo',
    season: 3,
    finishingPosition: 3,
    ageAtShow: 30,
    hometown: 'St. Petersburg, Florida',
    hometownCoordinates: cityCoordinates['St. Petersburg, Florida'],
    headshotUrl: '/images/headshots/alexis-mateo.jpg',
    silhouetteUrl: '/images/silhouettes/alexis-mateo.jpg'
  },
  {
    id: 'yara-sofia',
    name: 'Yara Sofia',
    season: 3,
    finishingPosition: 4,
    ageAtShow: 26,
    hometown: 'Manati, Puerto Rico',
    hometownCoordinates: cityCoordinates['Manati, Puerto Rico'],
    headshotUrl: '/images/headshots/yara-sofia.jpg',
    silhouetteUrl: '/images/silhouettes/yara-sofia.jpg'
  },
  {
    id: 'carmen-carrera',
    name: 'Carmen Carrera',
    season: 3,
    finishingPosition: 5,
    ageAtShow: 25,
    hometown: 'Elmwood Park, New Jersey',
    hometownCoordinates: cityCoordinates['Elmwood Park, New Jersey'],
    headshotUrl: '/images/headshots/carmen-carrera.jpg',
    silhouetteUrl: '/images/silhouettes/carmen-carrera.jpg'
  },
  {
    id: 'delta-work',
    name: 'Delta Work',
    season: 3,
    finishingPosition: 7,
    ageAtShow: 34,
    hometown: 'Norwalk, California',
    hometownCoordinates: cityCoordinates['Norwalk, California'],
    headshotUrl: '/images/headshots/delta-work.jpg',
    silhouetteUrl: '/images/silhouettes/delta-work.jpg'
  },
  {
    id: 'stacy-layne-matthews',
    name: 'Stacy Layne Matthews',
    season: 3,
    finishingPosition: 8,
    ageAtShow: 25,
    hometown: 'Back Swamp, North Carolina',
    hometownCoordinates: cityCoordinates['Back Swamp, North Carolina'],
    headshotUrl: '/images/headshots/stacy-layne-matthews.jpg',
    silhouetteUrl: '/images/silhouettes/stacy-layne-matthews.jpg'
  },
  {
    id: 'mariah',
    name: 'Mariah',
    season: 3,
    finishingPosition: 9,
    ageAtShow: 29,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/mariah.jpg',
    silhouetteUrl: '/images/silhouettes/mariah.jpg'
  },
  {
    id: 'india-ferrah',
    name: 'India Ferrah',
    season: 3,
    finishingPosition: 10,
    ageAtShow: 23,
    hometown: 'Dayton, Ohio',
    hometownCoordinates: cityCoordinates['Dayton, Ohio'],
    headshotUrl: '/images/headshots/india-ferrah.jpg',
    silhouetteUrl: '/images/silhouettes/india-ferrah.jpg'
  },
  {
    id: 'mimi-imfurst',
    name: 'Mimi Imfurst',
    season: 3,
    finishingPosition: 11,
    ageAtShow: 27,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/mimi-imfurst.jpg',
    silhouetteUrl: '/images/silhouettes/mimi-imfurst.jpg'
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    season: 3,
    finishingPosition: 12,
    ageAtShow: 29,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/phoenix.jpg',
    silhouetteUrl: '/images/silhouettes/phoenix.jpg'
  },
  {
    id: 'venus-d-lite',
    name: 'Venus D-Lite',
    season: 3,
    finishingPosition: 13,
    ageAtShow: 26,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/venus-d-lite.jpg',
    silhouetteUrl: '/images/silhouettes/venus-d-lite.jpg'
  },

  // Season 4
  {
    id: 'sharon-needles',
    name: 'Sharon Needles',
    season: 4,
    finishingPosition: 1,
    ageAtShow: 29,
    hometown: 'Pittsburgh, Pennsylvania',
    hometownCoordinates: cityCoordinates['Pittsburgh, Pennsylvania'],
    headshotUrl: '/images/headshots/sharon-needles.jpg',
    silhouetteUrl: '/images/silhouettes/sharon-needles.jpg'
  },
  {
    id: 'chad-michaels',
    name: 'Chad Michaels',
    season: 4,
    finishingPosition: 2,
    ageAtShow: 40,
    hometown: 'San Diego, California',
    hometownCoordinates: cityCoordinates['San Diego, California'],
    headshotUrl: '/images/headshots/chad-michaels.jpg',
    silhouetteUrl: '/images/silhouettes/chad-michaels.jpg'
  },
  {
    id: 'phi-phi-ohara',
    name: 'Phi Phi O\'Hara',
    season: 4,
    finishingPosition: 2,
    ageAtShow: 25,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/phi-phi-ohara.jpg',
    silhouetteUrl: '/images/silhouettes/phi-phi-ohara.jpg'
  },
  {
    id: 'latrice-royale',
    name: 'Latrice Royale',
    season: 4,
    finishingPosition: 4,
    ageAtShow: 39,
    hometown: 'South Beach, Florida',
    hometownCoordinates: cityCoordinates['South Beach, Florida'],
    headshotUrl: '/images/headshots/latrice-royale.jpg',
    silhouetteUrl: '/images/silhouettes/latrice-royale.jpg'
  },
  {
    id: 'kenya-michaels',
    name: 'Kenya Michaels',
    season: 4,
    finishingPosition: 5,
    ageAtShow: 21,
    hometown: 'Dorado, Puerto Rico',
    hometownCoordinates: cityCoordinates['Dorado, Puerto Rico'],
    headshotUrl: '/images/headshots/kenya-michaels.jpg',
    silhouetteUrl: '/images/silhouettes/kenya-michaels.jpg'
  },
  {
    id: 'dida-ritz',
    name: 'DiDa Ritz',
    season: 4,
    finishingPosition: 6,
    ageAtShow: 25,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/dida-ritz.jpg',
    silhouetteUrl: '/images/silhouettes/dida-ritz.jpg'
  },
  {
    id: 'willam',
    name: 'Willam',
    season: 4,
    finishingPosition: 7,
    ageAtShow: 29,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/willam.jpg',
    silhouetteUrl: '/images/silhouettes/willam.jpg'
  },
  {
    id: 'jiggly-caliente',
    name: 'Jiggly Caliente',
    season: 4,
    finishingPosition: 8,
    ageAtShow: 30,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/jiggly-caliente.jpg',
    silhouetteUrl: '/images/silhouettes/jiggly-caliente.jpg'
  },
  {
    id: 'milan',
    name: 'Milan',
    season: 4,
    finishingPosition: 9,
    ageAtShow: 36,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/milan.jpg',
    silhouetteUrl: '/images/silhouettes/milan.jpg'
  },
  {
    id: 'madame-laqueer',
    name: 'Madame LaQueer',
    season: 4,
    finishingPosition: 10,
    ageAtShow: 29,
    hometown: 'Carolina, Puerto Rico',
    hometownCoordinates: cityCoordinates['Carolina, Puerto Rico'],
    headshotUrl: '/images/headshots/madame-laqueer.jpg',
    silhouetteUrl: '/images/silhouettes/madame-laqueer.jpg'
  },
  {
    id: 'the-princess',
    name: 'The Princess',
    season: 4,
    finishingPosition: 11,
    ageAtShow: 32,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/the-princess.jpg',
    silhouetteUrl: '/images/silhouettes/the-princess.jpg'
  },
  {
    id: 'lashauwn-beyond',
    name: 'Lashauwn Beyond',
    season: 4,
    finishingPosition: 12,
    ageAtShow: 21,
    hometown: 'Fort Lauderdale, Florida',
    hometownCoordinates: cityCoordinates['Fort Lauderdale, Florida'],
    headshotUrl: '/images/headshots/lashauwn-beyond.jpg',
    silhouetteUrl: '/images/silhouettes/lashauwn-beyond.jpg'
  },
  {
    id: 'alisa-summers',
    name: 'Alisa Summers',
    season: 4,
    finishingPosition: 13,
    ageAtShow: 23,
    hometown: 'Tampa, Florida',
    hometownCoordinates: cityCoordinates['Tampa, Florida'],
    headshotUrl: '/images/headshots/alisa-summers.jpg',
    silhouetteUrl: '/images/silhouettes/alisa-summers.jpg'
  },

  // Season 5
  {
    id: 'jinkx-monsoon',
    name: 'Jinkx Monsoon',
    season: 5,
    finishingPosition: 1,
    ageAtShow: 24,
    hometown: 'Seattle, Washington',
    hometownCoordinates: cityCoordinates['Seattle, Washington'],
    headshotUrl: '/images/headshots/jinkx-monsoon.jpg',
    silhouetteUrl: '/images/silhouettes/jinkx-monsoon.jpg'
  },
  {
    id: 'alaska',
    name: 'Alaska',
    season: 5,
    finishingPosition: 2,
    ageAtShow: 27,
    hometown: 'Pittsburgh, Pennsylvania',
    hometownCoordinates: cityCoordinates['Pittsburgh, Pennsylvania'],
    headshotUrl: '/images/headshots/alaska.jpg',
    silhouetteUrl: '/images/silhouettes/alaska.jpg'
  },
  {
    id: 'roxxxy-andrews',
    name: 'Roxxxy Andrews',
    season: 5,
    finishingPosition: 2,
    ageAtShow: 28,
    hometown: 'Orlando, Florida',
    hometownCoordinates: cityCoordinates['Orlando, Florida'],
    headshotUrl: '/images/headshots/roxxxy-andrews.jpg',
    silhouetteUrl: '/images/silhouettes/roxxxy-andrews.jpg'
  },
  {
    id: 'detox',
    name: 'Detox',
    season: 5,
    finishingPosition: 4,
    ageAtShow: 27,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/detox.jpg',
    silhouetteUrl: '/images/silhouettes/detox.jpg'
  },
  {
    id: 'coco-montrese',
    name: 'Coco Montrese',
    season: 5,
    finishingPosition: 5,
    ageAtShow: 37,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/coco-montrese.jpg',
    silhouetteUrl: '/images/silhouettes/coco-montrese.jpg'
  },
  {
    id: 'alyssa-edwards',
    name: 'Alyssa Edwards',
    season: 5,
    finishingPosition: 6,
    ageAtShow: 32,
    hometown: 'Mesquite, Texas',
    hometownCoordinates: cityCoordinates['Mesquite, Texas'],
    headshotUrl: '/images/headshots/alyssa-edwards.jpg',
    silhouetteUrl: '/images/silhouettes/alyssa-edwards.jpg'
  },
  {
    id: 'ivy-winters',
    name: 'Ivy Winters',
    season: 5,
    finishingPosition: 7,
    ageAtShow: 26,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/ivy-winters.jpg',
    silhouetteUrl: '/images/silhouettes/ivy-winters.jpg'
  },
  {
    id: 'jade-jolie',
    name: 'Jade Jolie',
    season: 5,
    finishingPosition: 8,
    ageAtShow: 25,
    hometown: 'Gainesville, Florida',
    hometownCoordinates: cityCoordinates['Gainesville, Florida'],
    headshotUrl: '/images/headshots/jade-jolie.jpg',
    silhouetteUrl: '/images/silhouettes/jade-jolie.jpg'
  },
  {
    id: 'lineysha-sparx',
    name: 'Lineysha Sparx',
    season: 5,
    finishingPosition: 9,
    ageAtShow: 24,
    hometown: 'San Juan, Puerto Rico',
    hometownCoordinates: cityCoordinates['San Juan, Puerto Rico'],
    headshotUrl: '/images/headshots/lineysha-sparx.jpg',
    silhouetteUrl: '/images/silhouettes/lineysha-sparx.jpg'
  },
  {
    id: 'honey-mahogany',
    name: 'Honey Mahogany',
    season: 5,
    finishingPosition: 10,
    ageAtShow: 29,
    hometown: 'San Francisco, California',
    hometownCoordinates: cityCoordinates['San Francisco, California'],
    headshotUrl: '/images/headshots/honey-mahogany.jpg',
    silhouetteUrl: '/images/silhouettes/honey-mahogany.jpg'
  },
  {
    id: 'vivienne-pinay',
    name: 'Vivienne Pinay',
    season: 5,
    finishingPosition: 10,
    ageAtShow: 26,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/vivienne-pinay.jpg',
    silhouetteUrl: '/images/silhouettes/vivienne-pinay.jpg'
  },
  {
    id: 'monica-beverly-hillz',
    name: 'Monica Beverly Hillz',
    season: 5,
    finishingPosition: 12,
    ageAtShow: 27,
    hometown: 'Owensboro, Kentucky',
    hometownCoordinates: cityCoordinates['Owensboro, Kentucky'],
    headshotUrl: '/images/headshots/monica-beverly-hillz.jpg',
    silhouetteUrl: '/images/silhouettes/monica-beverly-hillz.jpg'
  },
  {
    id: 'serena-chacha',
    name: 'Serena ChaCha',
    season: 5,
    finishingPosition: 13,
    ageAtShow: 21,
    hometown: 'Tallahassee, Florida',
    hometownCoordinates: cityCoordinates['Tallahassee, Florida'],
    headshotUrl: '/images/headshots/serena-chacha.jpg',
    silhouetteUrl: '/images/silhouettes/serena-chacha.jpg'
  },
  {
    id: 'penny-tration',
    name: 'Penny Tration',
    season: 5,
    finishingPosition: 14,
    ageAtShow: 39,
    hometown: 'Cincinnati, Ohio',
    hometownCoordinates: cityCoordinates['Cincinnati, Ohio'],
    headshotUrl: '/images/headshots/penny-tration.jpg',
    silhouetteUrl: '/images/silhouettes/penny-tration.jpg'
  },

  // Season 6
  {
    id: 'bianca-del-rio',
    name: 'Bianca Del Rio',
    season: 6,
    finishingPosition: 1,
    ageAtShow: 37,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/bianca-del-rio.jpg',
    silhouetteUrl: '/images/silhouettes/bianca-del-rio.jpg'
  },
  {
    id: 'adore-delano',
    name: 'Adore Delano',
    season: 6,
    finishingPosition: 2,
    ageAtShow: 23,
    hometown: 'Azusa, California',
    hometownCoordinates: cityCoordinates['Azusa, California'],
    headshotUrl: '/images/headshots/adore-delano.jpg',
    silhouetteUrl: '/images/silhouettes/adore-delano.jpg'
  },
  {
    id: 'courtney-act',
    name: 'Courtney Act',
    season: 6,
    finishingPosition: 2,
    ageAtShow: 31,
    hometown: 'West Hollywood, California',
    hometownCoordinates: cityCoordinates['West Hollywood, California'],
    headshotUrl: '/images/headshots/courtney-act.jpg',
    silhouetteUrl: '/images/silhouettes/courtney-act.jpg'
  },
  {
    id: 'darienne-lake',
    name: 'Darienne Lake',
    season: 6,
    finishingPosition: 4,
    ageAtShow: 41,
    hometown: 'Rochester, New York',
    hometownCoordinates: cityCoordinates['Rochester, New York'],
    headshotUrl: '/images/headshots/darienne-lake.jpg',
    silhouetteUrl: '/images/silhouettes/darienne-lake.jpg'
  },
  {
    id: 'bendelacreme',
    name: 'BenDeLaCreme',
    season: 6,
    finishingPosition: 5,
    ageAtShow: 31,
    hometown: 'Seattle, Washington',
    hometownCoordinates: cityCoordinates['Seattle, Washington'],
    headshotUrl: '/images/headshots/bendelacreme.jpg',
    silhouetteUrl: '/images/silhouettes/bendelacreme.jpg'
  },
  {
    id: 'joslyn-fox',
    name: 'Joslyn Fox',
    season: 6,
    finishingPosition: 6,
    ageAtShow: 26,
    hometown: 'Worcester, Massachusetts',
    hometownCoordinates: cityCoordinates['Worcester, Massachusetts'],
    headshotUrl: '/images/headshots/joslyn-fox.jpg',
    silhouetteUrl: '/images/silhouettes/joslyn-fox.jpg'
  },
  {
    id: 'trinity-k-bonet',
    name: 'Trinity K. Bonet',
    season: 6,
    finishingPosition: 7,
    ageAtShow: 22,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/trinity-k-bonet.jpg',
    silhouetteUrl: '/images/silhouettes/trinity-k-bonet.jpg'
  },
  {
    id: 'laganja-estranja',
    name: 'Laganja Estranja',
    season: 6,
    finishingPosition: 8,
    ageAtShow: 24,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/laganja-estranja.jpg',
    silhouetteUrl: '/images/silhouettes/laganja-estranja.jpg'
  },
  {
    id: 'milk',
    name: 'Milk',
    season: 6,
    finishingPosition: 9,
    ageAtShow: 25,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/milk.jpg',
    silhouetteUrl: '/images/silhouettes/milk.jpg'
  },
  {
    id: 'gia-gunn',
    name: 'Gia Gunn',
    season: 6,
    finishingPosition: 10,
    ageAtShow: 23,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/gia-gunn.jpg',
    silhouetteUrl: '/images/silhouettes/gia-gunn.jpg'
  },
  {
    id: 'april-carrion',
    name: 'April Carrión',
    season: 6,
    finishingPosition: 11,
    ageAtShow: 24,
    hometown: 'Guaynabo, Puerto Rico',
    hometownCoordinates: cityCoordinates['Guaynabo, Puerto Rico'],
    headshotUrl: '/images/headshots/april-carrion.jpg',
    silhouetteUrl: '/images/silhouettes/april-carrion.jpg'
  },
  {
    id: 'vivacious',
    name: 'Vivacious',
    season: 6,
    finishingPosition: 12,
    ageAtShow: 40,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/vivacious.jpg',
    silhouetteUrl: '/images/silhouettes/vivacious.jpg'
  },
  {
    id: 'kelly-mantle',
    name: 'Kelly Mantle',
    season: 6,
    finishingPosition: 13,
    ageAtShow: 37,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/kelly-mantle.jpg',
    silhouetteUrl: '/images/silhouettes/kelly-mantle.jpg'
  },
  {
    id: 'magnolia-crawford',
    name: 'Magnolia Crawford',
    season: 6,
    finishingPosition: 14,
    ageAtShow: 27,
    hometown: 'Seattle, Washington',
    hometownCoordinates: cityCoordinates['Seattle, Washington'],
    headshotUrl: '/images/headshots/magnolia-crawford.jpg',
    silhouetteUrl: '/images/silhouettes/magnolia-crawford.jpg'
  },

  // Season 7
  {
    id: 'violet-chachki',
    name: 'Violet Chachki',
    season: 7,
    finishingPosition: 1,
    ageAtShow: 22,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/violet-chachki.jpg',
    silhouetteUrl: '/images/silhouettes/violet-chachki.jpg'
  },
  {
    id: 'ginger-minj',
    name: 'Ginger Minj',
    season: 7,
    finishingPosition: 2,
    ageAtShow: 29,
    hometown: 'Orlando, Florida',
    hometownCoordinates: cityCoordinates['Orlando, Florida'],
    headshotUrl: '/images/headshots/ginger-minj.jpg',
    silhouetteUrl: '/images/silhouettes/ginger-minj.jpg'
  },
  {
    id: 'pearl',
    name: 'Pearl',
    season: 7,
    finishingPosition: 2,
    ageAtShow: 23,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/pearl.jpg',
    silhouetteUrl: '/images/silhouettes/pearl.jpg'
  },
  {
    id: 'kennedy-davenport',
    name: 'Kennedy Davenport',
    season: 7,
    finishingPosition: 4,
    ageAtShow: 33,
    hometown: 'Dallas, Texas',
    hometownCoordinates: cityCoordinates['Dallas, Texas'],
    headshotUrl: '/images/headshots/kennedy-davenport.jpg',
    silhouetteUrl: '/images/silhouettes/kennedy-davenport.jpg'
  },
  {
    id: 'katya',
    name: 'Katya',
    season: 7,
    finishingPosition: 5,
    ageAtShow: 32,
    hometown: 'Boston, Massachusetts',
    hometownCoordinates: cityCoordinates['Boston, Massachusetts'],
    headshotUrl: '/images/headshots/katya.jpg',
    silhouetteUrl: '/images/silhouettes/katya.jpg'
  },
  {
    id: 'trixie-mattel',
    name: 'Trixie Mattel',
    season: 7,
    finishingPosition: 6,
    ageAtShow: 26,
    hometown: 'Milwaukee, Wisconsin',
    hometownCoordinates: cityCoordinates['Milwaukee, Wisconsin'],
    headshotUrl: '/images/headshots/trixie-mattel.jpg',
    silhouetteUrl: '/images/silhouettes/trixie-mattel.jpg'
  },
  {
    id: 'miss-fame',
    name: 'Miss Fame',
    season: 7,
    finishingPosition: 7,
    ageAtShow: 29,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/miss-fame.jpg',
    silhouetteUrl: '/images/silhouettes/miss-fame.jpg'
  },
  {
    id: 'jaidynn-diore-fierce',
    name: 'Jaidynn Diore Fierce',
    season: 7,
    finishingPosition: 8,
    ageAtShow: 25,
    hometown: 'Nashville, Tennessee',
    hometownCoordinates: cityCoordinates['Nashville, Tennessee'],
    headshotUrl: '/images/headshots/jaidynn-diore-fierce.jpg',
    silhouetteUrl: '/images/silhouettes/jaidynn-diore-fierce.jpg'
  },
  {
    id: 'max',
    name: 'Max',
    season: 7,
    finishingPosition: 9,
    ageAtShow: 22,
    hometown: 'Hudson, Wisconsin',
    hometownCoordinates: cityCoordinates['Hudson, Wisconsin'],
    headshotUrl: '/images/headshots/max.jpg',
    silhouetteUrl: '/images/silhouettes/max.jpg'
  },
  {
    id: 'kandy-ho',
    name: 'Kandy Ho',
    season: 7,
    finishingPosition: 10,
    ageAtShow: 28,
    hometown: 'Cayey, Puerto Rico',
    hometownCoordinates: cityCoordinates['Cayey, Puerto Rico'],
    headshotUrl: '/images/headshots/kandy-ho.jpg',
    silhouetteUrl: '/images/silhouettes/kandy-ho.jpg'
  },
  {
    id: 'mrs-kasha-davis',
    name: 'Mrs. Kasha Davis',
    season: 7,
    finishingPosition: 11,
    ageAtShow: 43,
    hometown: 'Rochester, New York',
    hometownCoordinates: cityCoordinates['Rochester, New York'],
    headshotUrl: '/images/headshots/mrs-kasha-davis.jpg',
    silhouetteUrl: '/images/silhouettes/mrs-kasha-davis.jpg'
  },
  {
    id: 'jasmine-masters',
    name: 'Jasmine Masters',
    season: 7,
    finishingPosition: 12,
    ageAtShow: 37,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/jasmine-masters.jpg',
    silhouetteUrl: '/images/silhouettes/jasmine-masters.jpg'
  },
  {
    id: 'sasha-belle',
    name: 'Sasha Belle',
    season: 7,
    finishingPosition: 13,
    ageAtShow: 28,
    hometown: 'Iowa City, Iowa',
    hometownCoordinates: cityCoordinates['Iowa City, Iowa'],
    headshotUrl: '/images/headshots/sasha-belle.jpg',
    silhouetteUrl: '/images/silhouettes/sasha-belle.jpg'
  },
  {
    id: 'tempest-dujour',
    name: 'Tempest DuJour',
    season: 7,
    finishingPosition: 14,
    ageAtShow: 46,
    hometown: 'Tucson, Arizona',
    hometownCoordinates: cityCoordinates['Tucson, Arizona'],
    headshotUrl: '/images/headshots/tempest-dujour.jpg',
    silhouetteUrl: '/images/silhouettes/tempest-dujour.jpg'
  },

  // Season 8
  {
    id: 'bob-the-drag-queen',
    name: 'Bob the Drag Queen',
    season: 8,
    finishingPosition: 1,
    ageAtShow: 29,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/bob-the-drag-queen.jpg',
    silhouetteUrl: '/images/silhouettes/bob-the-drag-queen.jpg'
  },
  {
    id: 'kim-chi',
    name: 'Kim Chi',
    season: 8,
    finishingPosition: 2,
    ageAtShow: 27,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/kim-chi.jpg',
    silhouetteUrl: '/images/silhouettes/kim-chi.jpg'
  },
  {
    id: 'naomi-smalls',
    name: 'Naomi Smalls',
    season: 8,
    finishingPosition: 2,
    ageAtShow: 21,
    hometown: 'Redlands, California',
    hometownCoordinates: cityCoordinates['Redlands, California'],
    headshotUrl: '/images/headshots/naomi-smalls.jpg',
    silhouetteUrl: '/images/silhouettes/naomi-smalls.jpg'
  },
  {
    id: 'chi-chi-devayne',
    name: 'Chi Chi DeVayne',
    season: 8,
    finishingPosition: 4,
    ageAtShow: 30,
    hometown: 'Shreveport, Louisiana',
    hometownCoordinates: cityCoordinates['Shreveport, Louisiana'],
    headshotUrl: '/images/headshots/chi-chi-devayne.jpg',
    silhouetteUrl: '/images/silhouettes/chi-chi-devayne.jpg'
  },
  {
    id: 'derrick-barry',
    name: 'Derrick Barry',
    season: 8,
    finishingPosition: 5,
    ageAtShow: 32,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/derrick-barry.jpg',
    silhouetteUrl: '/images/silhouettes/derrick-barry.jpg'
  },
  {
    id: 'thorgy-thor',
    name: 'Thorgy Thor',
    season: 8,
    finishingPosition: 6,
    ageAtShow: 31,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/thorgy-thor.jpg',
    silhouetteUrl: '/images/silhouettes/thorgy-thor.jpg'
  },
  {
    id: 'robbie-turner',
    name: 'Robbie Turner',
    season: 8,
    finishingPosition: 7,
    ageAtShow: 33,
    hometown: 'Seattle, Washington',
    hometownCoordinates: cityCoordinates['Seattle, Washington'],
    headshotUrl: '/images/headshots/robbie-turner.jpg',
    silhouetteUrl: '/images/silhouettes/robbie-turner.jpg'
  },
  {
    id: 'acid-betty',
    name: 'Acid Betty',
    season: 8,
    finishingPosition: 8,
    ageAtShow: 37,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/acid-betty.jpg',
    silhouetteUrl: '/images/silhouettes/acid-betty.jpg'
  },
  {
    id: 'naysha-lopez',
    name: 'Naysha Lopez',
    season: 8,
    finishingPosition: 9,
    ageAtShow: 31,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/naysha-lopez.jpg',
    silhouetteUrl: '/images/silhouettes/naysha-lopez.jpg'
  },
  {
    id: 'cynthia-lee-fontaine',
    name: 'Cynthia Lee Fontaine',
    season: 8,
    finishingPosition: 10,
    ageAtShow: 34,
    hometown: 'Austin, Texas',
    hometownCoordinates: cityCoordinates['Austin, Texas'],
    headshotUrl: '/images/headshots/cynthia-lee-fontaine.jpg',
    silhouetteUrl: '/images/silhouettes/cynthia-lee-fontaine.jpg'
  },
  {
    id: 'dax-exclamationpoint',
    name: 'Dax ExclamationPoint',
    season: 8,
    finishingPosition: 11,
    ageAtShow: 31,
    hometown: 'Savannah, Georgia',
    hometownCoordinates: cityCoordinates['Savannah, Georgia'],
    headshotUrl: '/images/headshots/dax-exclamationpoint.jpg',
    silhouetteUrl: '/images/silhouettes/dax-exclamationpoint.jpg'
  },
  {
    id: 'laila-mcqueen',
    name: 'Laila McQueen',
    season: 8,
    finishingPosition: 11,
    ageAtShow: 22,
    hometown: 'Gloucester, Massachusetts',
    hometownCoordinates: cityCoordinates['Gloucester, Massachusetts'],
    headshotUrl: '/images/headshots/laila-mcqueen.jpg',
    silhouetteUrl: '/images/silhouettes/laila-mcqueen.jpg'
  },

  // Season 9
  {
    id: 'sasha-velour',
    name: 'Sasha Velour',
    season: 9,
    finishingPosition: 1,
    ageAtShow: 29,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/sasha-velour.jpg',
    silhouetteUrl: '/images/silhouettes/sasha-velour.jpg'
  },
  {
    id: 'peppermint',
    name: 'Peppermint',
    season: 9,
    finishingPosition: 2,
    ageAtShow: 37,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/peppermint.jpg',
    silhouetteUrl: '/images/silhouettes/peppermint.jpg'
  },
  {
    id: 'shea-coulee',
    name: 'Shea Couleé',
    season: 9,
    finishingPosition: 3,
    ageAtShow: 27,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/shea-coulee.jpg',
    silhouetteUrl: '/images/silhouettes/shea-coulee.jpg'
  },
  {
    id: 'trinity-taylor',
    name: 'Trinity Taylor',
    season: 9,
    finishingPosition: 3,
    ageAtShow: 31,
    hometown: 'Orlando, Florida',
    hometownCoordinates: cityCoordinates['Orlando, Florida'],
    headshotUrl: '/images/headshots/trinity-taylor.jpg',
    silhouetteUrl: '/images/silhouettes/trinity-taylor.jpg'
  },
  {
    id: 'alexis-michelle',
    name: 'Alexis Michelle',
    season: 9,
    finishingPosition: 5,
    ageAtShow: 33,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/alexis-michelle.jpg',
    silhouetteUrl: '/images/silhouettes/alexis-michelle.jpg'
  },
  {
    id: 'nina-bonina-brown',
    name: 'Nina Bo\'nina Brown',
    season: 9,
    finishingPosition: 6,
    ageAtShow: 34,
    hometown: 'Riverdale, Georgia',
    hometownCoordinates: cityCoordinates['Riverdale, Georgia'],
    headshotUrl: '/images/headshots/nina-bonina-brown.jpg',
    silhouetteUrl: '/images/silhouettes/nina-bonina-brown.jpg'
  },
  {
    id: 'valentina',
    name: 'Valentina',
    season: 9,
    finishingPosition: 7,
    ageAtShow: 25,
    hometown: 'Echo Park, California',
    hometownCoordinates: cityCoordinates['Echo Park, California'],
    headshotUrl: '/images/headshots/valentina.jpg',
    silhouetteUrl: '/images/silhouettes/valentina.jpg'
  },
  {
    id: 'farrah-moan',
    name: 'Farrah Moan',
    season: 9,
    finishingPosition: 8,
    ageAtShow: 23,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/farrah-moan.jpg',
    silhouetteUrl: '/images/silhouettes/farrah-moan.jpg'
  },
  {
    id: 'aja',
    name: 'Aja',
    season: 9,
    finishingPosition: 9,
    ageAtShow: 22,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/aja.jpg',
    silhouetteUrl: '/images/silhouettes/aja.jpg'
  },
  {
    id: 'eureka',
    name: 'Eureka',
    season: 9,
    finishingPosition: 11,
    ageAtShow: 25,
    hometown: 'Johnson City, Tennessee',
    hometownCoordinates: cityCoordinates['Johnson City, Tennessee'],
    headshotUrl: '/images/headshots/eureka.jpg',
    silhouetteUrl: '/images/silhouettes/eureka.jpg'
  },
  {
    id: 'charlie-hides',
    name: 'Charlie Hides',
    season: 9,
    finishingPosition: 12,
    ageAtShow: 52,
    hometown: 'London, United Kingdom',
    hometownCoordinates: cityCoordinates['London, United Kingdom'],
    headshotUrl: '/images/headshots/charlie-hides.jpg',
    silhouetteUrl: '/images/silhouettes/charlie-hides.jpg'
  },
  {
    id: 'kimora-blac',
    name: 'Kimora Blac',
    season: 9,
    finishingPosition: 13,
    ageAtShow: 28,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/kimora-blac.jpg',
    silhouetteUrl: '/images/silhouettes/kimora-blac.jpg'
  },
  {
    id: 'jaymes-mansfield',
    name: 'Jaymes Mansfield',
    season: 9,
    finishingPosition: 14,
    ageAtShow: 26,
    hometown: 'Milwaukee, Wisconsin',
    hometownCoordinates: cityCoordinates['Milwaukee, Wisconsin'],
    headshotUrl: '/images/headshots/jaymes-mansfield.jpg',
    silhouetteUrl: '/images/silhouettes/jaymes-mansfield.jpg'
  },

  // Season 10
  {
    id: 'aquaria',
    name: 'Aquaria',
    season: 10,
    finishingPosition: 1,
    ageAtShow: 21,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/aquaria.jpg',
    silhouetteUrl: '/images/silhouettes/aquaria.jpg'
  },
  {
    id: 'kameron-michaels',
    name: 'Kameron Michaels',
    season: 10,
    finishingPosition: 2,
    ageAtShow: 31,
    hometown: 'Nashville, Tennessee',
    hometownCoordinates: cityCoordinates['Nashville, Tennessee'],
    headshotUrl: '/images/headshots/kameron-michaels.jpg',
    silhouetteUrl: '/images/silhouettes/kameron-michaels.jpg'
  },
  {
    id: 'asia-ohara',
    name: 'Asia O\'Hara',
    season: 10,
    finishingPosition: 4,
    ageAtShow: 35,
    hometown: 'Dallas, Texas',
    hometownCoordinates: cityCoordinates['Dallas, Texas'],
    headshotUrl: '/images/headshots/asia-ohara.jpg',
    silhouetteUrl: '/images/silhouettes/asia-ohara.jpg'
  },
  {
    id: 'miz-cracker',
    name: 'Miz Cracker',
    season: 10,
    finishingPosition: 5,
    ageAtShow: 33,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/miz-cracker.jpg',
    silhouetteUrl: '/images/silhouettes/miz-cracker.jpg'
  },
  {
    id: 'monet-x-change',
    name: 'Monét X Change',
    season: 10,
    finishingPosition: 6,
    ageAtShow: 27,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/monet-x-change.jpg',
    silhouetteUrl: '/images/silhouettes/monet-x-change.jpg'
  },
  {
    id: 'the-vixen',
    name: 'The Vixen',
    season: 10,
    finishingPosition: 7,
    ageAtShow: 26,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/the-vixen.jpg',
    silhouetteUrl: '/images/silhouettes/the-vixen.jpg'
  },
  {
    id: 'monique-heart',
    name: 'Monique Heart',
    season: 10,
    finishingPosition: 8,
    ageAtShow: 31,
    hometown: 'Kansas City, Missouri',
    hometownCoordinates: cityCoordinates['Kansas City, Missouri'],
    headshotUrl: '/images/headshots/monique-heart.jpg',
    silhouetteUrl: '/images/silhouettes/monique-heart.jpg'
  },
  {
    id: 'blair-st-clair',
    name: 'Blair St. Clair',
    season: 10,
    finishingPosition: 9,
    ageAtShow: 22,
    hometown: 'Indianapolis, Indiana',
    hometownCoordinates: cityCoordinates['Indianapolis, Indiana'],
    headshotUrl: '/images/headshots/blair-st-clair.jpg',
    silhouetteUrl: '/images/silhouettes/blair-st-clair.jpg'
  },
  {
    id: 'mayhem-miller',
    name: 'Mayhem Miller',
    season: 10,
    finishingPosition: 10,
    ageAtShow: 35,
    hometown: 'Riverside, California',
    hometownCoordinates: cityCoordinates['Riverside, California'],
    headshotUrl: '/images/headshots/mayhem-miller.jpg',
    silhouetteUrl: '/images/silhouettes/mayhem-miller.jpg'
  },
  {
    id: 'dusty-ray-bottoms',
    name: 'Dusty Ray Bottoms',
    season: 10,
    finishingPosition: 11,
    ageAtShow: 29,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/dusty-ray-bottoms.jpg',
    silhouetteUrl: '/images/silhouettes/dusty-ray-bottoms.jpg'
  },
  {
    id: 'yuhua-hamasaki',
    name: 'Yuhua Hamasaki',
    season: 10,
    finishingPosition: 12,
    ageAtShow: 27,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/yuhua-hamasaki.jpg',
    silhouetteUrl: '/images/silhouettes/yuhua-hamasaki.jpg'
  },
  {
    id: 'kalorie-karbdashian-williams',
    name: 'Kalorie Karbdashian-Williams',
    season: 10,
    finishingPosition: 13,
    ageAtShow: 27,
    hometown: 'Albuquerque, New Mexico',
    hometownCoordinates: cityCoordinates['Albuquerque, New Mexico'],
    headshotUrl: '/images/headshots/kalorie-karbdashian-williams.jpg',
    silhouetteUrl: '/images/silhouettes/kalorie-karbdashian-williams.jpg'
  },
  {
    id: 'vanessa-vanjie-mateo',
    name: 'Vanessa Vanjie Mateo',
    season: 10,
    finishingPosition: 14,
    ageAtShow: 25,
    hometown: 'Tampa, Florida',
    hometownCoordinates: cityCoordinates['Tampa, Florida'],
    headshotUrl: '/images/headshots/vanessa-vanjie-mateo.jpg',
    silhouetteUrl: '/images/silhouettes/vanessa-vanjie-mateo.jpg'
  },

  // Season 11
  {
    id: 'yvie-oddly',
    name: 'Yvie Oddly',
    season: 11,
    finishingPosition: 1,
    ageAtShow: 24,
    hometown: 'Denver, Colorado',
    hometownCoordinates: cityCoordinates['Denver, Colorado'],
    headshotUrl: '/images/headshots/yvie-oddly.jpg',
    silhouetteUrl: '/images/silhouettes/yvie-oddly.jpg'
  },
  {
    id: 'brooke-lynn-hytes',
    name: 'Brooke Lynn Hytes',
    season: 11,
    finishingPosition: 2,
    ageAtShow: 32,
    hometown: 'Nashville, Tennessee',
    hometownCoordinates: cityCoordinates['Nashville, Tennessee'],
    headshotUrl: '/images/headshots/brooke-lynn-hytes.jpg',
    silhouetteUrl: '/images/silhouettes/brooke-lynn-hytes.jpg'
  },
  {
    id: 'akeria-c-davenport',
    name: 'A\'keria C. Davenport',
    season: 11,
    finishingPosition: 3,
    ageAtShow: 30,
    hometown: 'Dallas, Texas',
    hometownCoordinates: cityCoordinates['Dallas, Texas'],
    headshotUrl: '/images/headshots/akeria-c-davenport.jpg',
    silhouetteUrl: '/images/silhouettes/akeria-c-davenport.jpg'
  },
  {
    id: 'silky-nutmeg-ganache',
    name: 'Silky Nutmeg Ganache',
    season: 11,
    finishingPosition: 3,
    ageAtShow: 28,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/silky-nutmeg-ganache.jpg',
    silhouetteUrl: '/images/silhouettes/silky-nutmeg-ganache.jpg'
  },
  {
    id: 'nina-west',
    name: 'Nina West',
    season: 11,
    finishingPosition: 6,
    ageAtShow: 39,
    hometown: 'Columbus, Ohio',
    hometownCoordinates: cityCoordinates['Columbus, Ohio'],
    headshotUrl: '/images/headshots/nina-west.jpg',
    silhouetteUrl: '/images/silhouettes/nina-west.jpg'
  },
  {
    id: 'shuga-cain',
    name: 'Shuga Cain',
    season: 11,
    finishingPosition: 7,
    ageAtShow: 40,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/shuga-cain.jpg',
    silhouetteUrl: '/images/silhouettes/shuga-cain.jpg'
  },
  {
    id: 'plastique-tiara',
    name: 'Plastique Tiara',
    season: 11,
    finishingPosition: 8,
    ageAtShow: 21,
    hometown: 'Dallas, Texas',
    hometownCoordinates: cityCoordinates['Dallas, Texas'],
    headshotUrl: '/images/headshots/plastique-tiara.jpg',
    silhouetteUrl: '/images/silhouettes/plastique-tiara.jpg'
  },
  {
    id: 'rajah-ohara',
    name: 'Ra\'Jah O\'Hara',
    season: 11,
    finishingPosition: 9,
    ageAtShow: 33,
    hometown: 'Dallas, Texas',
    hometownCoordinates: cityCoordinates['Dallas, Texas'],
    headshotUrl: '/images/headshots/rajah-ohara.jpg',
    silhouetteUrl: '/images/silhouettes/rajah-ohara.jpg'
  },
  {
    id: 'scarlet-envy',
    name: 'Scarlet Envy',
    season: 11,
    finishingPosition: 10,
    ageAtShow: 26,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/scarlet-envy.jpg',
    silhouetteUrl: '/images/silhouettes/scarlet-envy.jpg'
  },
  {
    id: 'ariel-versace',
    name: 'Ariel Versace',
    season: 11,
    finishingPosition: 11,
    ageAtShow: 26,
    hometown: 'Cherry Hill, New Jersey',
    hometownCoordinates: cityCoordinates['Cherry Hill, New Jersey'],
    headshotUrl: '/images/headshots/ariel-versace.jpg',
    silhouetteUrl: '/images/silhouettes/ariel-versace.jpg'
  },
  {
    id: 'mercedes-iman-diamond',
    name: 'Mercedes Iman Diamond',
    season: 11,
    finishingPosition: 12,
    ageAtShow: 31,
    hometown: 'Minneapolis, Minnesota',
    hometownCoordinates: cityCoordinates['Minneapolis, Minnesota'],
    headshotUrl: '/images/headshots/mercedes-iman-diamond.jpg',
    silhouetteUrl: '/images/silhouettes/mercedes-iman-diamond.jpg'
  },
  {
    id: 'honey-davenport',
    name: 'Honey Davenport',
    season: 11,
    finishingPosition: 13,
    ageAtShow: 32,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/honey-davenport.jpg',
    silhouetteUrl: '/images/silhouettes/honey-davenport.jpg'
  },
  {
    id: 'kahanna-montrese',
    name: 'Kahanna Montrese',
    season: 11,
    finishingPosition: 14,
    ageAtShow: 25,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/kahanna-montrese.jpg',
    silhouetteUrl: '/images/silhouettes/kahanna-montrese.jpg'
  },
  {
    id: 'soju',
    name: 'Soju',
    season: 11,
    finishingPosition: 15,
    ageAtShow: 27,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/soju.jpg',
    silhouetteUrl: '/images/silhouettes/soju.jpg'
  },

  // Season 12
  {
    id: 'jaida-essence-hall',
    name: 'Jaida Essence Hall',
    season: 12,
    finishingPosition: 1,
    ageAtShow: 32,
    hometown: 'Milwaukee, Wisconsin',
    hometownCoordinates: cityCoordinates['Milwaukee, Wisconsin'],
    headshotUrl: '/images/headshots/jaida-essence-hall.jpg',
    silhouetteUrl: '/images/silhouettes/jaida-essence-hall.jpg'
  },
  {
    id: 'crystal-methyd',
    name: 'Crystal Methyd',
    season: 12,
    finishingPosition: 2,
    ageAtShow: 28,
    hometown: 'Springfield, Missouri',
    hometownCoordinates: cityCoordinates['Springfield, Missouri'],
    headshotUrl: '/images/headshots/crystal-methyd.jpg',
    silhouetteUrl: '/images/silhouettes/crystal-methyd.jpg'
  },
  {
    id: 'gigi-goode',
    name: 'Gigi Goode',
    season: 12,
    finishingPosition: 2,
    ageAtShow: 21,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/gigi-goode.jpg',
    silhouetteUrl: '/images/silhouettes/gigi-goode.jpg'
  },
  {
    id: 'jackie-cox',
    name: 'Jackie Cox',
    season: 12,
    finishingPosition: 5,
    ageAtShow: 34,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/jackie-cox.jpg',
    silhouetteUrl: '/images/silhouettes/jackie-cox.jpg'
  },
  {
    id: 'heidi-n-closet',
    name: 'Heidi N Closet',
    season: 12,
    finishingPosition: 6,
    ageAtShow: 24,
    hometown: 'Ramseur, North Carolina',
    hometownCoordinates: cityCoordinates['Ramseur, North Carolina'],
    headshotUrl: '/images/headshots/heidi-n-closet.jpg',
    silhouetteUrl: '/images/silhouettes/heidi-n-closet.jpg'
  },
  {
    id: 'widow-vondu',
    name: 'Widow Von\'Du',
    season: 12,
    finishingPosition: 7,
    ageAtShow: 30,
    hometown: 'Kansas City, Missouri',
    hometownCoordinates: cityCoordinates['Kansas City, Missouri'],
    headshotUrl: '/images/headshots/widow-vondu.jpg',
    silhouetteUrl: '/images/silhouettes/widow-vondu.jpg'
  },
  {
    id: 'jan',
    name: 'Jan',
    season: 12,
    finishingPosition: 8,
    ageAtShow: 26,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/jan.jpg',
    silhouetteUrl: '/images/silhouettes/jan.jpg'
  },
  {
    id: 'brita',
    name: 'Brita',
    season: 12,
    finishingPosition: 9,
    ageAtShow: 34,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/brita.jpg',
    silhouetteUrl: '/images/silhouettes/brita.jpg'
  },
  {
    id: 'aiden-zhane',
    name: 'Aiden Zhane',
    season: 12,
    finishingPosition: 10,
    ageAtShow: 29,
    hometown: 'Acworth, Georgia',
    hometownCoordinates: cityCoordinates['Acworth, Georgia'],
    headshotUrl: '/images/headshots/aiden-zhane.jpg',
    silhouetteUrl: '/images/silhouettes/aiden-zhane.jpg'
  },
  {
    id: 'nicky-doll',
    name: 'Nicky Doll',
    season: 12,
    finishingPosition: 11,
    ageAtShow: 28,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/nicky-doll.jpg',
    silhouetteUrl: '/images/silhouettes/nicky-doll.jpg'
  },
  {
    id: 'rock-m-sakura',
    name: 'Rock M. Sakura',
    season: 12,
    finishingPosition: 12,
    ageAtShow: 28,
    hometown: 'San Francisco, California',
    hometownCoordinates: cityCoordinates['San Francisco, California'],
    headshotUrl: '/images/headshots/rock-m-sakura.jpg',
    silhouetteUrl: '/images/silhouettes/rock-m-sakura.jpg'
  },
  {
    id: 'dahlia-sin',
    name: 'Dahlia Sin',
    season: 12,
    finishingPosition: 13,
    ageAtShow: 28,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/dahlia-sin.jpg',
    silhouetteUrl: '/images/silhouettes/dahlia-sin.jpg'
  },

  // Season 13
  {
    id: 'symone',
    name: 'Symone',
    season: 13,
    finishingPosition: 1,
    ageAtShow: 25,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/symone.jpg',
    silhouetteUrl: '/images/silhouettes/symone.jpg'
  },
  {
    id: 'kandy-muse',
    name: 'Kandy Muse',
    season: 13,
    finishingPosition: 2,
    ageAtShow: 25,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/kandy-muse.jpg',
    silhouetteUrl: '/images/silhouettes/kandy-muse.jpg'
  },
  {
    id: 'gottmik',
    name: 'Gottmik',
    season: 13,
    finishingPosition: 3,
    ageAtShow: 23,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/gottmik.jpg',
    silhouetteUrl: '/images/silhouettes/gottmik.jpg'
  },
  {
    id: 'rose',
    name: 'Rosé',
    season: 13,
    finishingPosition: 3,
    ageAtShow: 31,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/rose.jpg',
    silhouetteUrl: '/images/silhouettes/rose.jpg'
  },
  {
    id: 'olivia-lux',
    name: 'Olivia Lux',
    season: 13,
    finishingPosition: 5,
    ageAtShow: 26,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/olivia-lux.jpg',
    silhouetteUrl: '/images/silhouettes/olivia-lux.jpg'
  },
  {
    id: 'utica-queen',
    name: 'Utica Queen',
    season: 13,
    finishingPosition: 6,
    ageAtShow: 25,
    hometown: 'Utica, Minnesota',
    hometownCoordinates: cityCoordinates['Utica, Minnesota'],
    headshotUrl: '/images/headshots/utica-queen.jpg',
    silhouetteUrl: '/images/silhouettes/utica-queen.jpg'
  },
  {
    id: 'tina-burner',
    name: 'Tina Burner',
    season: 13,
    finishingPosition: 7,
    ageAtShow: 39,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/tina-burner.jpg',
    silhouetteUrl: '/images/silhouettes/tina-burner.jpg'
  },
  {
    id: 'denali',
    name: 'Denali',
    season: 13,
    finishingPosition: 8,
    ageAtShow: 28,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/denali.jpg',
    silhouetteUrl: '/images/silhouettes/denali.jpg'
  },
  {
    id: 'elliott-with-2-ts',
    name: 'Elliott with 2 Ts',
    season: 13,
    finishingPosition: 9,
    ageAtShow: 26,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/elliott-with-2-ts.jpg',
    silhouetteUrl: '/images/silhouettes/elliott-with-2-ts.jpg'
  },
  {
    id: 'lala-ri',
    name: 'LaLa Ri',
    season: 13,
    finishingPosition: 10,
    ageAtShow: 30,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/lala-ri.jpg',
    silhouetteUrl: '/images/silhouettes/lala-ri.jpg'
  },
  {
    id: 'tamisha-iman',
    name: 'Tamisha Iman',
    season: 13,
    finishingPosition: 11,
    ageAtShow: 49,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/tamisha-iman.jpg',
    silhouetteUrl: '/images/silhouettes/tamisha-iman.jpg'
  },
  {
    id: 'joey-jay',
    name: 'Joey Jay',
    season: 13,
    finishingPosition: 12,
    ageAtShow: 30,
    hometown: 'Phoenix, Arizona',
    hometownCoordinates: cityCoordinates['Phoenix, Arizona'],
    headshotUrl: '/images/headshots/joey-jay.jpg',
    silhouetteUrl: '/images/silhouettes/joey-jay.jpg'
  },
  {
    id: 'kahmora-hall',
    name: 'Kahmora Hall',
    season: 13,
    finishingPosition: 13,
    ageAtShow: 28,
    hometown: 'Chicago, Illinois',
    hometownCoordinates: cityCoordinates['Chicago, Illinois'],
    headshotUrl: '/images/headshots/kahmora-hall.jpg',
    silhouetteUrl: '/images/silhouettes/kahmora-hall.jpg'
  },

  // Season 14
  {
    id: 'willow-pill',
    name: 'Willow Pill',
    season: 14,
    finishingPosition: 1,
    ageAtShow: 26,
    hometown: 'Denver, Colorado',
    hometownCoordinates: cityCoordinates['Denver, Colorado'],
    headshotUrl: '/images/headshots/willow-pill.jpg',
    silhouetteUrl: '/images/silhouettes/willow-pill.jpg'
  },
  {
    id: 'lady-camden',
    name: 'Lady Camden',
    season: 14,
    finishingPosition: 2,
    ageAtShow: 31,
    hometown: 'Sacramento, California',
    hometownCoordinates: cityCoordinates['Sacramento, California'],
    headshotUrl: '/images/headshots/lady-camden.jpg',
    silhouetteUrl: '/images/silhouettes/lady-camden.jpg'
  },
  {
    id: 'angeria-paris-vanmicheals',
    name: 'Angeria Paris VanMicheals',
    season: 14,
    finishingPosition: 3,
    ageAtShow: 27,
    hometown: 'Atlanta, Georgia',
    hometownCoordinates: cityCoordinates['Atlanta, Georgia'],
    headshotUrl: '/images/headshots/angeria-paris-vanmicheals.jpg',
    silhouetteUrl: '/images/silhouettes/angeria-paris-vanmicheals.jpg'
  },
  {
    id: 'bosco',
    name: 'Bosco',
    season: 14,
    finishingPosition: 3,
    ageAtShow: 28,
    hometown: 'Seattle, Washington',
    hometownCoordinates: cityCoordinates['Seattle, Washington'],
    headshotUrl: '/images/headshots/bosco.jpg',
    silhouetteUrl: '/images/silhouettes/bosco.jpg'
  },
  {
    id: 'daya-betty',
    name: 'Daya Betty',
    season: 14,
    finishingPosition: 3,
    ageAtShow: 25,
    hometown: 'Springfield, Missouri',
    hometownCoordinates: cityCoordinates['Springfield, Missouri'],
    headshotUrl: '/images/headshots/daya-betty.jpg',
    silhouetteUrl: '/images/silhouettes/daya-betty.jpg'
  },
  {
    id: 'deja-skye',
    name: 'DeJa Skye',
    season: 14,
    finishingPosition: 6,
    ageAtShow: 31,
    hometown: 'Fresno, California',
    hometownCoordinates: cityCoordinates['Fresno, California'],
    headshotUrl: '/images/headshots/deja-skye.jpg',
    silhouetteUrl: '/images/silhouettes/deja-skye.jpg'
  },
  {
    id: 'jorgeous',
    name: 'Jorgeous',
    season: 14,
    finishingPosition: 7,
    ageAtShow: 21,
    hometown: 'Nashville, Tennessee',
    hometownCoordinates: cityCoordinates['Nashville, Tennessee'],
    headshotUrl: '/images/headshots/jorgeous.jpg',
    silhouetteUrl: '/images/silhouettes/jorgeous.jpg'
  },
  {
    id: 'jasmine-kennedie',
    name: 'Jasmine Kennedie',
    season: 14,
    finishingPosition: 8,
    ageAtShow: 22,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/jasmine-kennedie.jpg',
    silhouetteUrl: '/images/silhouettes/jasmine-kennedie.jpg'
  },
  {
    id: 'kerri-colby',
    name: 'Kerri Colby',
    season: 14,
    finishingPosition: 9,
    ageAtShow: 24,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/kerri-colby.jpg',
    silhouetteUrl: '/images/silhouettes/kerri-colby.jpg'
  },
  {
    id: 'maddy-morphosis',
    name: 'Maddy Morphosis',
    season: 14,
    finishingPosition: 10,
    ageAtShow: 26,
    hometown: 'Fayetteville, Arkansas',
    hometownCoordinates: cityCoordinates['Fayetteville, Arkansas'],
    headshotUrl: '/images/headshots/maddy-morphosis.jpg',
    silhouetteUrl: '/images/silhouettes/maddy-morphosis.jpg'
  },
  {
    id: 'orion-story',
    name: 'Orion Story',
    season: 14,
    finishingPosition: 11,
    ageAtShow: 25,
    hometown: 'Grand Rapids, Michigan',
    hometownCoordinates: cityCoordinates['Grand Rapids, Michigan'],
    headshotUrl: '/images/headshots/orion-story.jpg',
    silhouetteUrl: '/images/silhouettes/orion-story.jpg'
  },
  {
    id: 'kornbread-jete',
    name: 'Kornbread "The Snack" Jeté',
    season: 14,
    finishingPosition: 12,
    ageAtShow: 29,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/kornbread-jete.jpg',
    silhouetteUrl: '/images/silhouettes/kornbread-jete.jpg'
  },
  {
    id: 'alyssa-hunter',
    name: 'Alyssa Hunter',
    season: 14,
    finishingPosition: 13,
    ageAtShow: 26,
    hometown: 'Cataño, Puerto Rico',
    hometownCoordinates: cityCoordinates['Cataño, Puerto Rico'],
    headshotUrl: '/images/headshots/alyssa-hunter.jpg',
    silhouetteUrl: '/images/silhouettes/alyssa-hunter.jpg'
  },
  {
    id: 'june-jambalaya',
    name: 'June Jambalaya',
    season: 14,
    finishingPosition: 14,
    ageAtShow: 29,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/june-jambalaya.jpg',
    silhouetteUrl: '/images/silhouettes/june-jambalaya.jpg'
  },

  // Season 15
  {
    id: 'sasha-colby',
    name: 'Sasha Colby',
    season: 15,
    finishingPosition: 1,
    ageAtShow: 37,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/sasha-colby.jpg',
    silhouetteUrl: '/images/silhouettes/sasha-colby.jpg'
  },
  {
    id: 'anetra',
    name: 'Anetra',
    season: 15,
    finishingPosition: 2,
    ageAtShow: 25,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/anetra.jpg',
    silhouetteUrl: '/images/silhouettes/anetra.jpg'
  },
  {
    id: 'luxx-noir-london',
    name: 'Luxx Noir London',
    season: 15,
    finishingPosition: 3,
    ageAtShow: 22,
    hometown: 'East Orange, New Jersey',
    hometownCoordinates: cityCoordinates['East Orange, New Jersey'],
    headshotUrl: '/images/headshots/luxx-noir-london.jpg',
    silhouetteUrl: '/images/silhouettes/luxx-noir-london.jpg'
  },
  {
    id: 'mistress-isabelle-brooks',
    name: 'Mistress Isabelle Brooks',
    season: 15,
    finishingPosition: 3,
    ageAtShow: 24,
    hometown: 'Houston, Texas',
    hometownCoordinates: cityCoordinates['Houston, Texas'],
    headshotUrl: '/images/headshots/mistress-isabelle-brooks.jpg',
    silhouetteUrl: '/images/silhouettes/mistress-isabelle-brooks.jpg'
  },
  {
    id: 'loosey-laduca',
    name: 'Loosey LaDuca',
    season: 15,
    finishingPosition: 5,
    ageAtShow: 32,
    hometown: 'Ansonia, Connecticut',
    hometownCoordinates: cityCoordinates['Ansonia, Connecticut'],
    headshotUrl: '/images/headshots/loosey-laduca.jpg',
    silhouetteUrl: '/images/silhouettes/loosey-laduca.jpg'
  },
  {
    id: 'salina-estitties',
    name: 'Salina EsTitties',
    season: 15,
    finishingPosition: 6,
    ageAtShow: 31,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/salina-estitties.jpg',
    silhouetteUrl: '/images/silhouettes/salina-estitties.jpg'
  },
  {
    id: 'marcia-marcia-marcia',
    name: 'Marcia Marcia Marcia',
    season: 15,
    finishingPosition: 7,
    ageAtShow: 25,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/marcia-marcia-marcia.jpg',
    silhouetteUrl: '/images/silhouettes/marcia-marcia-marcia.jpg'
  },
  {
    id: 'malaysia-babydoll-foxx',
    name: 'Malaysia Babydoll Foxx',
    season: 15,
    finishingPosition: 8,
    ageAtShow: 32,
    hometown: 'Miami, Florida',
    hometownCoordinates: cityCoordinates['Miami, Florida'],
    headshotUrl: '/images/headshots/malaysia-babydoll-foxx.jpg',
    silhouetteUrl: '/images/silhouettes/malaysia-babydoll-foxx.jpg'
  },
  {
    id: 'spice',
    name: 'Spice',
    season: 15,
    finishingPosition: 9,
    ageAtShow: 23,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/spice.jpg',
    silhouetteUrl: '/images/silhouettes/spice.jpg'
  },
  {
    id: 'jax',
    name: 'Jax',
    season: 15,
    finishingPosition: 10,
    ageAtShow: 25,
    hometown: 'Darien, Connecticut',
    hometownCoordinates: cityCoordinates['Darien, Connecticut'],
    headshotUrl: '/images/headshots/jax.jpg',
    silhouetteUrl: '/images/silhouettes/jax.jpg'
  },
  {
    id: 'aura-mayari',
    name: 'Aura Mayari',
    season: 15,
    finishingPosition: 11,
    ageAtShow: 30,
    hometown: 'Nashville, Tennessee',
    hometownCoordinates: cityCoordinates['Nashville, Tennessee'],
    headshotUrl: '/images/headshots/aura-mayari.jpg',
    silhouetteUrl: '/images/silhouettes/aura-mayari.jpg'
  },
  {
    id: 'robin-fierce',
    name: 'Robin Fierce',
    season: 15,
    finishingPosition: 12,
    ageAtShow: 26,
    hometown: 'Hartford, Connecticut',
    hometownCoordinates: cityCoordinates['Hartford, Connecticut'],
    headshotUrl: '/images/headshots/robin-fierce.jpg',
    silhouetteUrl: '/images/silhouettes/robin-fierce.jpg'
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    season: 15,
    finishingPosition: 13,
    ageAtShow: 27,
    hometown: 'West Hartford, Connecticut',
    hometownCoordinates: cityCoordinates['West Hartford, Connecticut'],
    headshotUrl: '/images/headshots/amethyst.jpg',
    silhouetteUrl: '/images/silhouettes/amethyst.jpg'
  },
  {
    id: 'sugar',
    name: 'Sugar',
    season: 15,
    finishingPosition: 14,
    ageAtShow: 23,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/sugar.jpg',
    silhouetteUrl: '/images/silhouettes/sugar.jpg'
  },
  {
    id: 'princess-poppy',
    name: 'Princess Poppy',
    season: 15,
    finishingPosition: 15,
    ageAtShow: 26,
    hometown: 'San Francisco, California',
    hometownCoordinates: cityCoordinates['San Francisco, California'],
    headshotUrl: '/images/headshots/princess-poppy.jpg',
    silhouetteUrl: '/images/silhouettes/princess-poppy.jpg'
  },
  {
    id: 'irene-dubois',
    name: 'Irene Dubois',
    season: 15,
    finishingPosition: 16,
    ageAtShow: 29,
    hometown: 'Seattle, Washington',
    hometownCoordinates: cityCoordinates['Seattle, Washington'],
    headshotUrl: '/images/headshots/irene-dubois.jpg',
    silhouetteUrl: '/images/silhouettes/irene-dubois.jpg'
  },

  // Season 16
  {
    id: 'nymphia-wind',
    name: 'Nymphia Wind',
    season: 16,
    finishingPosition: 1,
    ageAtShow: 27,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/nymphia-wind.jpg',
    silhouetteUrl: '/images/silhouettes/nymphia-wind.jpg'
  },
  {
    id: 'sapphira-cristal',
    name: 'Sapphira Cristál',
    season: 16,
    finishingPosition: 2,
    ageAtShow: 34,
    hometown: 'Philadelphia, Pennsylvania',
    hometownCoordinates: cityCoordinates['Philadelphia, Pennsylvania'],
    headshotUrl: '/images/headshots/sapphira-cristal.jpg',
    silhouetteUrl: '/images/silhouettes/sapphira-cristal.jpg'
  },
  {
    id: 'plane-jane',
    name: 'Plane Jane',
    season: 16,
    finishingPosition: 3,
    ageAtShow: 24,
    hometown: 'Boston, Massachusetts',
    hometownCoordinates: cityCoordinates['Boston, Massachusetts'],
    headshotUrl: '/images/headshots/plane-jane.jpg',
    silhouetteUrl: '/images/silhouettes/plane-jane.jpg'
  },
  {
    id: 'q',
    name: 'Q',
    season: 16,
    finishingPosition: 4,
    ageAtShow: 26,
    hometown: 'Kansas City, Missouri',
    hometownCoordinates: cityCoordinates['Kansas City, Missouri'],
    headshotUrl: '/images/headshots/q.jpg',
    silhouetteUrl: '/images/silhouettes/q.jpg'
  },
  {
    id: 'morphine-love-dion',
    name: 'Morphine Love Dion',
    season: 16,
    finishingPosition: 5,
    ageAtShow: 25,
    hometown: 'Miami, Florida',
    hometownCoordinates: cityCoordinates['Miami, Florida'],
    headshotUrl: '/images/headshots/morphine-love-dion.jpg',
    silhouetteUrl: '/images/silhouettes/morphine-love-dion.jpg'
  },
  {
    id: 'dawn',
    name: 'Dawn',
    season: 16,
    finishingPosition: 6,
    ageAtShow: 24,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/dawn.jpg',
    silhouetteUrl: '/images/silhouettes/dawn.jpg'
  },
  {
    id: 'mhiya-iman-lepaige',
    name: 'Mhi\'ya Iman Le\'Paige',
    season: 16,
    finishingPosition: 7,
    ageAtShow: 34,
    hometown: 'Miami, Florida',
    hometownCoordinates: cityCoordinates['Miami, Florida'],
    headshotUrl: '/images/headshots/mhiya-iman-lepaige.jpg',
    silhouetteUrl: '/images/silhouettes/mhiya-iman-lepaige.jpg'
  },
  {
    id: 'plasma',
    name: 'Plasma',
    season: 16,
    finishingPosition: 8,
    ageAtShow: 24,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/plasma.jpg',
    silhouetteUrl: '/images/silhouettes/plasma.jpg'
  },
  {
    id: 'xunami-muse',
    name: 'Xunami Muse',
    season: 16,
    finishingPosition: 9,
    ageAtShow: 33,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/xunami-muse.jpg',
    silhouetteUrl: '/images/silhouettes/xunami-muse.jpg'
  },
  {
    id: 'megami',
    name: 'Megami',
    season: 16,
    finishingPosition: 10,
    ageAtShow: 33,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/megami.jpg',
    silhouetteUrl: '/images/silhouettes/megami.jpg'
  },
  {
    id: 'geneva-karr',
    name: 'Geneva Karr',
    season: 16,
    finishingPosition: 11,
    ageAtShow: 30,
    hometown: 'Brownsville, Texas',
    hometownCoordinates: cityCoordinates['Brownsville, Texas'],
    headshotUrl: '/images/headshots/geneva-karr.jpg',
    silhouetteUrl: '/images/silhouettes/geneva-karr.jpg'
  },
  {
    id: 'amanda-tori-meating',
    name: 'Amanda Tori Meating',
    season: 16,
    finishingPosition: 12,
    ageAtShow: 26,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/amanda-tori-meating.jpg',
    silhouetteUrl: '/images/silhouettes/amanda-tori-meating.jpg'
  },
  {
    id: 'mirage',
    name: 'Mirage',
    season: 16,
    finishingPosition: 13,
    ageAtShow: 29,
    hometown: 'Las Vegas, Nevada',
    hometownCoordinates: cityCoordinates['Las Vegas, Nevada'],
    headshotUrl: '/images/headshots/mirage.jpg',
    silhouetteUrl: '/images/silhouettes/mirage.jpg'
  },
  {
    id: 'hershii-liqcour-jete',
    name: 'Hershii LiqCour-Jeté',
    season: 16,
    finishingPosition: 14,
    ageAtShow: 31,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/hershii-liqcour-jete.jpg',
    silhouetteUrl: '/images/silhouettes/hershii-liqcour-jete.jpg'
  },

  // Season 17
  {
    id: 'onya-nurve',
    name: 'Onya Nurve',
    season: 17,
    finishingPosition: 1,
    ageAtShow: 31,
    hometown: 'Cleveland, Ohio',
    hometownCoordinates: cityCoordinates['Cleveland, Ohio'],
    headshotUrl: '/images/headshots/onya-nurve.jpg',
    silhouetteUrl: '/images/silhouettes/onya-nurve.jpg'
  },
  {
    id: 'jewels-sparkles',
    name: 'Jewels Sparkles',
    season: 17,
    finishingPosition: 2,
    ageAtShow: 23,
    hometown: 'Tampa, Florida',
    hometownCoordinates: cityCoordinates['Tampa, Florida'],
    headshotUrl: '/images/headshots/jewels-sparkles.jpg',
    silhouetteUrl: '/images/silhouettes/jewels-sparkles.jpg'
  },
  {
    id: 'lexi-love',
    name: 'Lexi Love',
    season: 17,
    finishingPosition: 3,
    ageAtShow: 34,
    hometown: 'Louisville, Kentucky',
    hometownCoordinates: cityCoordinates['Louisville, Kentucky'],
    headshotUrl: '/images/headshots/lexi-love.jpg',
    silhouetteUrl: '/images/silhouettes/lexi-love.jpg'
  },
  {
    id: 'sam-star',
    name: 'Sam Star',
    season: 17,
    finishingPosition: 3,
    ageAtShow: 24,
    hometown: 'Leeds, Alabama',
    hometownCoordinates: cityCoordinates['Leeds, Alabama'],
    headshotUrl: '/images/headshots/sam-star.jpg',
    silhouetteUrl: '/images/silhouettes/sam-star.jpg'
  },
  {
    id: 'suzie-toot',
    name: 'Suzie Toot',
    season: 17,
    finishingPosition: 5,
    ageAtShow: 24,
    hometown: 'Fort Lauderdale, Florida',
    hometownCoordinates: cityCoordinates['Fort Lauderdale, Florida'],
    headshotUrl: '/images/headshots/suzie-toot.jpg',
    silhouetteUrl: '/images/silhouettes/suzie-toot.jpg'
  },
  {
    id: 'lana-jarae',
    name: 'Lana Ja\'Rae',
    season: 17,
    finishingPosition: 6,
    ageAtShow: 22,
    hometown: 'New York, New York',
    hometownCoordinates: cityCoordinates['New York, New York'],
    headshotUrl: '/images/headshots/lana-jarae.jpg',
    silhouetteUrl: '/images/silhouettes/lana-jarae.jpg'
  },
  {
    id: 'lydia-b-kollins',
    name: 'Lydia B Kollins',
    season: 17,
    finishingPosition: 7,
    ageAtShow: 23,
    hometown: 'Pittsburgh, Pennsylvania',
    hometownCoordinates: cityCoordinates['Pittsburgh, Pennsylvania'],
    headshotUrl: '/images/headshots/lydia-b-kollins.jpg',
    silhouetteUrl: '/images/silhouettes/lydia-b-kollins.jpg'
  },
  {
    id: 'arrietty',
    name: 'Arrietty',
    season: 17,
    finishingPosition: 8,
    ageAtShow: 28,
    hometown: 'Seattle, Washington',
    hometownCoordinates: cityCoordinates['Seattle, Washington'],
    headshotUrl: '/images/headshots/arrietty.jpg',
    silhouetteUrl: '/images/silhouettes/arrietty.jpg'
  },
  {
    id: 'kori-king',
    name: 'Kori King',
    season: 17,
    finishingPosition: 9,
    ageAtShow: 24,
    hometown: 'Boston, Massachusetts',
    hometownCoordinates: cityCoordinates['Boston, Massachusetts'],
    headshotUrl: '/images/headshots/kori-king.jpg',
    silhouetteUrl: '/images/silhouettes/kori-king.jpg'
  },
  {
    id: 'acacia-forgot',
    name: 'Acacia Forgot',
    season: 17,
    finishingPosition: 10,
    ageAtShow: 28,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/acacia-forgot.jpg',
    silhouetteUrl: '/images/silhouettes/acacia-forgot.jpg'
  },
  {
    id: 'crystal-envy',
    name: 'Crystal Envy',
    season: 17,
    finishingPosition: 11,
    ageAtShow: 27,
    hometown: 'Asbury Park, New Jersey',
    hometownCoordinates: cityCoordinates['Asbury Park, New Jersey'],
    headshotUrl: '/images/headshots/crystal-envy.jpg',
    silhouetteUrl: '/images/silhouettes/crystal-envy.jpg'
  },
  {
    id: 'hormona-lisa',
    name: 'Hormona Lisa',
    season: 17,
    finishingPosition: 12,
    ageAtShow: 30,
    hometown: 'Chattanooga, Tennessee',
    hometownCoordinates: cityCoordinates['Chattanooga, Tennessee'],
    headshotUrl: '/images/headshots/hormona-lisa.jpg',
    silhouetteUrl: '/images/silhouettes/hormona-lisa.jpg'
  },
  {
    id: 'joella',
    name: 'Joella',
    season: 17,
    finishingPosition: 13,
    ageAtShow: 25,
    hometown: 'Los Angeles, California',
    hometownCoordinates: cityCoordinates['Los Angeles, California'],
    headshotUrl: '/images/headshots/joella.jpg',
    silhouetteUrl: '/images/silhouettes/joella.jpg'
  },
  {
    id: 'lucky-starzzz',
    name: 'Lucky Starzzz',
    season: 17,
    finishingPosition: 14,
    ageAtShow: 26,
    hometown: 'Miami, Florida',
    hometownCoordinates: cityCoordinates['Miami, Florida'],
    headshotUrl: '/images/headshots/lucky-starzzz.jpg',
    silhouetteUrl: '/images/silhouettes/lucky-starzzz.jpg'
  }
];

// Utility functions for contestant database
export const getContestantById = (id: string): Contestant | undefined => {
  return contestants.find(contestant => contestant.id === id);
};

export const getContestantsByName = (name: string): Contestant[] => {
  const searchTerm = name.toLowerCase();
  return contestants.filter(contestant => 
    contestant.name.toLowerCase().includes(searchTerm)
  );
};

export const getContestantsBySeason = (season: number): Contestant[] => {
  return contestants.filter(contestant => contestant.season === season);
};

export const getAllContestantNames = (): string[] => {
  return contestants.map(contestant => contestant.name);
};

export const getRandomContestant = (): Contestant => {
  const randomIndex = Math.floor(Math.random() * contestants.length);
  return contestants[randomIndex];
};

// Validation function to ensure database integrity
export const validateContestantDatabase = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const contestant of contestants) {
    // Check for duplicate IDs
    if (seenIds.has(contestant.id)) {
      errors.push(`Duplicate contestant ID: ${contestant.id}`);
    }
    seenIds.add(contestant.id);

    // Check required fields
    if (!contestant.name) errors.push(`Missing name for ID: ${contestant.id}`);
    if (!contestant.hometown) errors.push(`Missing hometown for ID: ${contestant.id}`);
    if (!contestant.hometownCoordinates) {
      errors.push(`Missing hometown coordinates for ID: ${contestant.id}`);
    } else {
      if (typeof contestant.hometownCoordinates.latitude !== 'number') {
        errors.push(`Invalid latitude for ID: ${contestant.id}`);
      }
      if (typeof contestant.hometownCoordinates.longitude !== 'number') {
        errors.push(`Invalid longitude for ID: ${contestant.id}`);
      }
    }
    if (contestant.season < 1 || contestant.season > 17) {
      errors.push(`Invalid season for ID: ${contestant.id}`);
    }
    if (contestant.finishingPosition < 1) {
      errors.push(`Invalid finishing position for ID: ${contestant.id}`);
    }
    if (contestant.ageAtShow < 18 || contestant.ageAtShow > 60) {
      errors.push(`Suspicious age for ID: ${contestant.id}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
