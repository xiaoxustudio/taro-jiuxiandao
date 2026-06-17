import { monsterSurnames, monsterNames, surnames, nameParts } from '@/config';

export function generateRandomMonsterName() {
  const surname =
    monsterSurnames[Math.floor(Math.random() * monsterSurnames.length)];
  const nameLength = Math.floor(Math.random() * 3) + 1;
  let name = surname;
  for (let i = 0; i < nameLength; i++) {
    name += monsterNames[Math.floor(Math.random() * monsterNames.length)];
  }
  return name;
}

export function generateRandomName() {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const nameLength = Math.floor(Math.random() * 3) + 1;
  let name = surname;
  for (let i = 0; i < nameLength; i++) {
    name += nameParts[Math.floor(Math.random() * nameParts.length)];
  }
  return name;
}

export function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) return array?.[0];
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
