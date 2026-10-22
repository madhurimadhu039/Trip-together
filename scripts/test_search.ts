import { getRecommendedDestinations } from '../src/data/popularDestinations';

const all28States = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

console.log('--- TEST 1: Empty & Whitespace Queries ---');
const emptyRes = getRecommendedDestinations('');
const spaceRes = getRecommendedDestinations('   ');
console.log('Empty query count:', emptyRes.length, '(expected 0)');
console.log('Space query count:', spaceRes.length, '(expected 0)');

console.log('\n--- TEST 2: Assam Search ---');
console.log('Query "Ass":', getRecommendedDestinations('Ass').map(d => d.name));
console.log('Query "assam":', getRecommendedDestinations('assam').map(d => d.name));
console.log('Query "Assam":', getRecommendedDestinations('Assam').map(d => d.name));

console.log('\n--- TEST 3: Gujarat Search ---');
console.log('Query "Guj":', getRecommendedDestinations('Guj').map(d => d.name));
console.log('Query "gujarat":', getRecommendedDestinations('gujarat').map(d => d.name));
console.log('Query "Gujarat":', getRecommendedDestinations('Gujarat').map(d => d.name));

console.log('\n--- TEST 4: Single Letter "K" ---');
const kResults = getRecommendedDestinations('K').map(d => d.name);
console.log('Query "K":', kResults);
const kAllStartWithK = kResults.every(n => n.startsWith('K'));
console.log('Do all K results start with K?', kAllStartWithK);

console.log('\n--- TEST 5: West Bengal Search ---');
console.log('Query "West Bengal":', getRecommendedDestinations('West Bengal').map(d => d.name));
console.log('Query "West":', getRecommendedDestinations('West').map(d => d.name));
console.log('Query "Bengal":', getRecommendedDestinations('Bengal').map(d => d.name));

console.log('\n--- TEST 6: Discoverability of all 28 Indian States ---');
let missing: string[] = [];
for (const state of all28States) {
  const matches = getRecommendedDestinations(state);
  const found = matches.some(m => m.name.toLowerCase() === state.toLowerCase());
  if (!found) {
    missing.push(state);
  }
}
if (missing.length === 0) {
  console.log('SUCCESS: All 28 Indian states are completely discoverable!');
} else {
  console.error('FAILED: Missing states:', missing);
}
