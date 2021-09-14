import fs from 'fs';

export function existsAsync(input: string) {
  return new Promise((resolve) => {
    fs.exists(input, (exists) => {
      resolve(exists);
    });
  });
}
