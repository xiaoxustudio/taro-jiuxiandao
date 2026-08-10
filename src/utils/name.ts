import { surnames, nameParts } from '@/config';

// eslint-disable-next-line import/prefer-default-export
export function generateRandomName() {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const nameLength = Math.floor(Math.random() * 3) + 1;
  let name = surname;
  for (let i = 0; i < nameLength; i++) {
    name += nameParts[Math.floor(Math.random() * nameParts.length)];
  }
  return name;
}
