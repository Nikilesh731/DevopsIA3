/**
 * Indian Regions Database - 28 States + Union Territories
 * Population data based on 2011 Census
 * Coordinates for geo-visualization
 */

export const INDIAN_REGIONS = [
  // Northern India
  {
    name: 'Delhi',
    population: 16753235,
    latitude: 28.7041,
    longitude: 77.1025,
    type: 'UT',
    hubConnectivity: ['Haryana', 'Uttar Pradesh'],
  },
  {
    name: 'Haryana',
    population: 25351462,
    latitude: 29.0588,
    longitude: 77.0745,
    type: 'State',
    hubConnectivity: ['Delhi', 'Punjab', 'Uttar Pradesh'],
  },
  {
    name: 'Punjab',
    population: 27743338,
    latitude: 31.1471,
    longitude: 75.3412,
    type: 'State',
    hubConnectivity: ['Haryana', 'Himachal Pradesh', 'Jammu & Kashmir'],
  },
  {
    name: 'Himachal Pradesh',
    population: 6856509,
    latitude: 31.7433,
    longitude: 77.1205,
    type: 'State',
    hubConnectivity: ['Punjab', 'Jammu & Kashmir'],
  },
  {
    name: 'Jammu & Kashmir',
    population: 12541302,
    latitude: 34.0837,
    longitude: 74.7973,
    type: 'UT',
    hubConnectivity: ['Himachal Pradesh', 'Punjab'],
  },
  // Eastern India
  {
    name: 'West Bengal',
    population: 91276115,
    latitude: 24.8749,
    longitude: 88.2669,
    type: 'State',
    hubConnectivity: ['Bihar', 'Jharkhand', 'Odisha', 'Assam'],
  },
  {
    name: 'Bihar',
    population: 104099701,
    latitude: 25.5941,
    longitude: 85.1376,
    type: 'State',
    hubConnectivity: ['West Bengal', 'Jharkhand', 'Uttar Pradesh'],
  },
  {
    name: 'Jharkhand',
    population: 32988134,
    latitude: 23.6102,
    longitude: 85.2799,
    type: 'State',
    hubConnectivity: ['Bihar', 'West Bengal', 'Odisha', 'Chhattisgarh', 'Madhya Pradesh'],
  },
  {
    name: 'Odisha',
    population: 42011146,
    latitude: 20.9517,
    longitude: 85.0985,
    type: 'State',
    hubConnectivity: ['West Bengal', 'Jharkhand', 'Chhattisgarh', 'Andhra Pradesh'],
  },
  {
    name: 'Assam',
    population: 31205144,
    latitude: 26.2389,
    longitude: 92.5795,
    type: 'State',
    hubConnectivity: ['West Bengal', 'Meghalaya', 'Tripura', 'Mizoram'],
  },
  {
    name: 'Meghalaya',
    population: 2966889,
    latitude: 25.5788,
    longitude: 91.8933,
    type: 'State',
    hubConnectivity: ['Assam'],
  },
  {
    name: 'Tripura',
    population: 3673917,
    latitude: 23.8413,
    longitude: 91.9882,
    type: 'State',
    hubConnectivity: ['Assam', 'Mizoram'],
  },
  {
    name: 'Mizoram',
    population: 1097206,
    latitude: 23.1815,
    longitude: 92.9789,
    type: 'State',
    hubConnectivity: ['Assam', 'Tripura'],
  },
  {
    name: 'Manipur',
    population: 2721756,
    latitude: 24.6637,
    longitude: 93.9063,
    type: 'State',
    hubConnectivity: [],
  },
  {
    name: 'Nagaland',
    population: 1978502,
    latitude: 26.1584,
    longitude: 94.5624,
    type: 'State',
    hubConnectivity: ['Assam'],
  },
  {
    name: 'Sikkim',
    population: 610577,
    latitude: 27.533,
    longitude: 88.5122,
    type: 'State',
    hubConnectivity: [],
  },
  {
    name: 'Arunachal Pradesh',
    population: 1382611,
    latitude: 28.218,
    longitude: 94.7278,
    type: 'State',
    hubConnectivity: ['Assam'],
  },
  // Central India
  {
    name: 'Madhya Pradesh',
    population: 72597565,
    latitude: 22.9375,
    longitude: 78.6553,
    type: 'State',
    hubConnectivity: ['Jharkhand', 'Chhattisgarh', 'Uttar Pradesh', 'Rajasthan', 'Gujarat'],
  },
  {
    name: 'Chhattisgarh',
    population: 25548375,
    latitude: 21.2787,
    longitude: 81.8661,
    type: 'State',
    hubConnectivity: ['Jharkhand', 'Odisha', 'Andhra Pradesh', 'Madhya Pradesh'],
  },
  // Western India
  {
    name: 'Gujarat',
    population: 60439692,
    latitude: 22.2587,
    longitude: 71.1924,
    type: 'State',
    hubConnectivity: ['Madhya Pradesh', 'Rajasthan'],
  },
  {
    name: 'Rajasthan',
    population: 68548437,
    latitude: 27.533,
    longitude: 74.2821,
    type: 'State',
    hubConnectivity: ['Gujarat', 'Madhya Pradesh', 'Uttar Pradesh', 'Haryana', 'Punjab'],
  },
  {
    name: 'Maharashtra',
    population: 112374333,
    latitude: 19.8762,
    longitude: 75.3193,
    type: 'State',
    hubConnectivity: ['Gujarat', 'Madhya Pradesh'],
  },
  {
    name: 'Goa',
    population: 1342239,
    latitude: 15.3667,
    longitude: 73.8333,
    type: 'State',
    hubConnectivity: ['Maharashtra'],
  },
  // Southern India
  {
    name: 'Andhra Pradesh',
    population: 84665533,
    latitude: 15.9129,
    longitude: 78.6675,
    type: 'State',
    hubConnectivity: ['Chhattisgarh', 'Odisha', 'Telangana', 'Karnataka', 'Tamil Nadu'],
  },
  {
    name: 'Telangana',
    population: 35193978,
    latitude: 18.1124,
    longitude: 79.0193,
    type: 'State',
    hubConnectivity: ['Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Odisha', 'Chhattisgarh'],
  },
  {
    name: 'Karnataka',
    population: 61130704,
    latitude: 15.3173,
    longitude: 75.7139,
    type: 'State',
    hubConnectivity: ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Goa', 'Tamil Nadu', 'Kerala'],
  },
  {
    name: 'Tamil Nadu',
    population: 72138958,
    latitude: 11.1271,
    longitude: 78.6569,
    type: 'State',
    hubConnectivity: ['Andhra Pradesh', 'Karnataka', 'Kerala'],
  },
  {
    name: 'Kerala',
    population: 33406061,
    latitude: 10.8505,
    longitude: 76.2711,
    type: 'State',
    hubConnectivity: ['Tamil Nadu', 'Karnataka'],
  },
  // Northern Plains
  {
    name: 'Uttar Pradesh',
    population: 199812341,
    latitude: 26.8467,
    longitude: 80.9462,
    type: 'State',
    hubConnectivity: ['Delhi', 'Haryana', 'Punjab', 'Bihar', 'Madhya Pradesh', 'Rajasthan'],
  },
];

/**
 * Create region seed object
 */
export function createRegionSeed(region) {
  return {
    name: region.name,
    population: region.population,
    susceptible: Math.floor(region.population * 0.999),
    infected: Math.floor(region.population * 0.001),
    recovered: 0,
    deaths: 0,
    risk_level: 'LOW',
    latitude: region.latitude,
    longitude: region.longitude,
    region_type: region.type,
    connected_regions: JSON.stringify(region.hubConnectivity),
  };
}

/**
 * Get all regions as seed data
 */
export function getAllRegionsSeeds() {
  return INDIAN_REGIONS.map(createRegionSeed);
}

/**
 * Get region by name
 */
export function getRegionByName(name) {
  return INDIAN_REGIONS.find(r => r.name === name) || null;
}

/**
 * Get connected/neighboring regions
 */
export function getConnectedRegions(regionName) {
  const region = getRegionByName(regionName);
  return region ? region.hubConnectivity : [];
}

export default INDIAN_REGIONS;
