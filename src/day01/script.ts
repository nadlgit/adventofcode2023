import { getInputLines, runDay } from '../utils';

const exampleFilename = { part1: 'example-input1.txt', part2: 'example-input2.txt' };

runDay(
  {
    example: { filename: exampleFilename.part1, expected: 142 },
    solveFn: (filename) => sumCalibrationValues(getInputLines(filename)),
  },
  {
    example: { filename: exampleFilename.part2, expected: 281 },
    solveFn: (filename) => sumCalibrationValues(translateSpelledValues(getInputLines(filename))),
  }
);

function sumCalibrationValues(input: string[]): number {
  return input
    .map((line) => {
      const digits = line.replaceAll(/[a-zA-Z]/g, '');
      return digits.length ? parseInt(digits[0] + digits[digits.length - 1]) : 0;
    })
    .reduce((acc, n) => acc + n, 0);
}

function translateSpelledValues(input: string[]): string[] {
  // Reddit tip: 'eighthree' is 83 and 'sevenine' is 79
  // Additional string to test: 'oneighthree' => 13
  const mapping = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
  };
  const regex = new RegExp(Object.keys(mapping).join('|'), 'g');
  return input.map((line) => {
    let translated = line;
    while (regex.test(translated)) {
      translated = translated.replaceAll(
        regex,
        (match) =>
          match[0] + mapping[match as keyof typeof mapping].toString() + match[match.length - 1]
      );
    }
    return translated;
  });
}
