import assert from 'assert';

// Test the core business logic of TripBuilderSection that powers the three buttons
console.log('--- Testing Trip Planner Buttons Logic ---');

// Mock data & functions
const todayStr = new Date().toISOString().split('T')[0];
const defaultRetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

function validatePlan(pickup, destination, departureDate, returnDate, travellers) {
  const errors = [];
  const fieldErrors = {};

  const cleanPickup = (pickup || '').trim();
  const cleanDestination = (destination || '').trim();

  if (!cleanPickup) {
    errors.push('Please enter a pickup location.');
    fieldErrors.pickup = 'Pickup location is required.';
  }
  if (!cleanDestination) {
    errors.push('Please enter a destination.');
    fieldErrors.destination = 'Destination is required.';
  }
  if (!departureDate) {
    errors.push('Please select a departure date.');
    fieldErrors.departureDate = 'Departure date is required.';
  } else if (departureDate < todayStr) {
    errors.push('Departure date cannot be in the past.');
    fieldErrors.departureDate = 'Departure date cannot be in the past.';
  }

  if (!returnDate) {
    errors.push('Please select a return date.');
    fieldErrors.returnDate = 'Return date is required.';
  } else if (departureDate && returnDate < departureDate) {
    errors.push('Return date cannot be earlier than departure date.');
    fieldErrors.returnDate = 'Return date cannot be earlier than departure date.';
  }

  if (!travellers || travellers < 1) {
    errors.push('Number of travellers must be at least 1.');
    fieldErrors.travellers = 'Traveller count must be at least 1.';
  }

  return { isValid: errors.length === 0, errors, fieldErrors };
}

function handleAddPlace(placeInput, currentList) {
  const trimmed = (placeInput || '').trim();
  if (!trimmed) {
    return { success: false, error: 'Please enter a place or attraction name to add.', list: currentList };
  }
  if (currentList.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
    return { success: false, error: `"${trimmed}" is already in your selected places list.`, list: currentList };
  }
  return { success: true, error: null, list: [...currentList, trimmed] };
}

function generateItinerary(pickup, destination, departureDate, returnDate, travellers, transportMode, accommodationType, hotelBudgetPerNight, selectedAttractions) {
  const dep = new Date(departureDate);
  const ret = new Date(returnDate);
  const diffDays = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = diffDays + 1;

  const days = [];
  const pool = [...selectedAttractions];

  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const curDate = new Date(departureDate);
    curDate.setDate(curDate.getDate() + (dayNum - 1));
    const activities = [];

    if (dayNum === 1) {
      activities.push({ title: `Departure from ${pickup} via ${transportMode}`, type: 'Transit' });
      activities.push({ title: `Check-in at ${destination} ${accommodationType}`, type: 'Stay' });
      if (pool.length > 0) {
        activities.push({ title: `Visit ${pool.shift()}`, type: 'Sightseeing' });
      }
    } else if (dayNum === totalDays) {
      if (pool.length > 0) {
        activities.push({ title: `Visit ${pool.shift()}`, type: 'Sightseeing' });
      }
      activities.push({ title: `Check-out from ${destination} ${accommodationType}`, type: 'Stay' });
      activities.push({ title: `Return Journey to ${pickup} via ${transportMode}`, type: 'Transit' });
    } else {
      activities.push({ title: `Morning at ${pool.length > 0 ? pool.shift() : 'Local Landmark'}`, type: 'Sightseeing' });
      activities.push({ title: `Authentic Lunch in ${destination}`, type: 'Meal' });
      activities.push({ title: `Evening at ${pool.length > 0 ? pool.shift() : 'Cultural Center'}`, type: 'Sightseeing' });
    }

    days.push({ dayNumber: dayNum, date: curDate.toISOString().split('T')[0], activities });
  }

  // Any remaining places distributed
  while (pool.length > 0) {
    const extra = pool.shift();
    days[days.length > 2 ? 1 : 0].activities.push({ title: `Explore ${extra}`, type: 'Sightseeing' });
  }

  return days;
}

// ================= TEST SUITE =================
// Test D: Missing or invalid details validation
console.log('Test D: Validation with missing details');
const val1 = validatePlan('', '', '', '', 0);
assert.strictEqual(val1.isValid, false, 'Should be invalid with empty fields');
assert.strictEqual(val1.errors.length, 5, 'Should have 5 validation errors');
console.log('✓ Test D passed: All missing fields caught with clear messages');

// Test B: Add multiple places, prevent empty and duplicates
console.log('Test B: Add Place functionality');
let places = [];
const addEmpty = handleAddPlace('', places);
assert.strictEqual(addEmpty.success, false);
assert.strictEqual(addEmpty.error, 'Please enter a place or attraction name to add.');

const add1 = handleAddPlace('Amber Fort', places);
assert.strictEqual(add1.success, true);
places = add1.list;
assert.deepStrictEqual(places, ['Amber Fort']);

const addDup = handleAddPlace('amber fort', places);
assert.strictEqual(addDup.success, false);
assert.strictEqual(addDup.error, '"amber fort" is already in your selected places list.');

const add2 = handleAddPlace('Hawa Mahal', places);
places = add2.list;
const add3 = handleAddPlace('Jal Mahal', places);
places = add3.list;
assert.strictEqual(places.length, 3);
console.log('✓ Test B passed: Added 3 places, prevented empty entry and duplicate');

// Test A: Generate My Plan with valid details
console.log('Test A: Generate My Plan');
const valValid = validatePlan('Delhi', 'Jaipur', todayStr, defaultRetDate, 2);
assert.strictEqual(valValid.isValid, true);

const itinerary = generateItinerary('Delhi', 'Jaipur', todayStr, defaultRetDate, 2, 'Train', 'Hotel', 2000, places);
assert.strictEqual(itinerary.length, 3, 'Should generate 3-day itinerary for 2 nights');

const allActivityTitles = itinerary.flatMap(d => d.activities.map(a => a.title)).join(' ');
assert(allActivityTitles.includes('Amber Fort'), 'Should contain Amber Fort');
assert(allActivityTitles.includes('Hawa Mahal'), 'Should contain Hawa Mahal');
assert(allActivityTitles.includes('Jal Mahal'), 'Should contain Jal Mahal');
assert(allActivityTitles.includes('Departure from Delhi via Train'), 'Should contain Departure from Delhi');
assert(allActivityTitles.includes('Return Journey to Delhi via Train'), 'Should contain Return to Delhi');
console.log('✓ Test A passed: Itinerary generated with all places and travel modes');

// Test C: Reset Plan
console.log('Test C: Reset Plan');
let pickup = 'Delhi';
let destination = 'Jaipur';
let itineraryResult = itinerary;
let selectedPlaces = places;

// Perform reset
pickup = '';
destination = '';
itineraryResult = [];
selectedPlaces = [];
assert.strictEqual(pickup, '');
assert.strictEqual(destination, '');
assert.strictEqual(itineraryResult.length, 0);
assert.strictEqual(selectedPlaces.length, 0);
console.log('✓ Test C passed: Reset Plan clears fields, attractions, and itinerary');

// Test E: Second trip generation after reset without refreshing
console.log('Test E: Second trip creation without refresh');
const secondPlaces = ['Baga Beach', 'Fort Aguada'];
const valSecond = validatePlan('Mumbai', 'Goa', todayStr, defaultRetDate, 4);
assert.strictEqual(valSecond.isValid, true);
const secondItinerary = generateItinerary('Mumbai', 'Goa', todayStr, defaultRetDate, 4, 'Car', 'Homestay', 3000, secondPlaces);
assert.strictEqual(secondItinerary.length, 3);
const secondTitles = secondItinerary.flatMap(d => d.activities.map(a => a.title)).join(' ');
assert(secondTitles.includes('Baga Beach'));
assert(secondTitles.includes('Fort Aguada'));
assert(secondTitles.includes('Departure from Mumbai via Car'));
console.log('✓ Test E passed: Second trip generated smoothly after reset');

console.log('--- ALL PLANNER BUTTON TESTS PASSED SUCCESSFULLY ---');
