import {
  getLocalTodayDateString,
  getLocalTomorrowDateString,
  isPastDate,
  validateTravelDate,
} from '../src/utils/dateUtils';

console.log('=== TEST 1: Dynamic Local Calendar Date ===');
const today = getLocalTodayDateString();
const tomorrow = getLocalTomorrowDateString();
console.log('Today string:', today);
console.log('Tomorrow string:', tomorrow);

const now = new Date();
const expectedToday =
  now.getFullYear() +
  '-' +
  String(now.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(now.getDate()).padStart(2, '0');
console.log('Matches local year/month/date:', today === expectedToday);

console.log('\n=== TEST 2: Past Date Rejection ===');
console.log('Yesterday is past:', isPastDate('2026-10-21'));
console.log('Today is past:', isPastDate(today), '(must be false)');
console.log('Tomorrow is past:', isPastDate(tomorrow), '(must be false)');

const vPast = validateTravelDate('2026-10-20');
console.log('Past date validation:', vPast);

const vToday = validateTravelDate(today);
console.log('Today date validation:', vToday);

console.log('\n=== TEST 3: Budget Calculation Logic ===');
let totalBudget = 5000;
const toAdd1 = 1500;
totalBudget += toAdd1;
console.log('After adding 1500 to 5000:', totalBudget, '(expected 6500)');

const toAdd2 = 2000;
totalBudget += toAdd2;
console.log('After adding 2000 to 6500:', totalBudget, '(expected 8500)');

// Test invalid budget inputs
function validateBudgetInput(raw: any): { valid: boolean; amount?: number; error?: string } {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return { valid: false, error: 'Please enter a budget amount to add.' };
  }
  const num = Number(raw);
  if (isNaN(num) || !isFinite(num) || num <= 0) {
    return { valid: false, error: 'Invalid budget amount. Please enter a valid number greater than 0.' };
  }
  return { valid: true, amount: Math.round(num) };
}

console.log('Validate empty "":', validateBudgetInput(''));
console.log('Validate negative -500:', validateBudgetInput(-500));
console.log('Validate 0:', validateBudgetInput(0));
console.log('Validate abc:', validateBudgetInput('abc'));
console.log('Validate valid 1500:', validateBudgetInput(1500));
