import { getInputLines } from '../utils';

const inputs = {
  real: 'puzzle-input.txt',
  example1: 'example-input1.txt',
  example2: 'example-input2.txt',
};

function readInputs(namePart1: string, namePart2?: string) {
  const getFilePath = (filename: string) => `${__dirname}/${filename}`;
  const inputDataPart1 = getInputLines(getFilePath(namePart1));
  const inputDataPart2 =
    namePart2 === undefined
      ? []
      : namePart2 === namePart1
      ? inputDataPart1
      : getInputLines(getFilePath(namePart2));
  return { inputDataPart1, inputDataPart2 };
}

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

// MAIN

const inputPart1 = inputs.real;
const inputPart2 = inputs.real;
const { inputDataPart1, inputDataPart2 } = readInputs(inputPart1, inputPart2);

const result1 = sumCalibrationValues(inputDataPart1);
console.log(`Part1 (${inputPart1}):`, result1);

const result2 = sumCalibrationValues(translateSpelledValues(inputDataPart2));
console.log(`Part2 (${inputPart2}):`, result2);
