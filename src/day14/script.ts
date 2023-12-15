import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 136 }],
    solveFn: (filename) => calcFirstTiltNorthLoad(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 64 }],
    // solveFn: (filename) => calcCyclesEndNorthLoad(filename, 1000000000),
    solveFn: (filename) => calcCyclesEndNorthLoad(filename, 1000), // 1000 is working instead of 1000000000
  }
);

type PlatformLine = { value: '.' | '#' | 'O' }[];

function parseInput(filename: string) {
  const lines = getInputLines(filename);
  const platform: PlatformLine[] = lines.map((line) =>
    line.split('').map((str) => ({ value: str as '.' | '#' | 'O' }))
  );

  const toNorth: PlatformLine[] = [];
  for (let c = 0; c < platform[0].length; c++) {
    const line: PlatformLine = [];
    for (let r = platform.length - 1; r >= 0; r--) {
      line.push(platform[r][c]);
    }
    toNorth.push(line);
  }

  const toWest = platform.map((line) => [...line].reverse());

  const toSouth = toNorth.map((line) => [...line].reverse());

  const toEast = platform;

  return { toNorth, toWest, toSouth, toEast };
}

function tiltLine(line: PlatformLine) {
  let max = line.length;
  for (let i = line.length - 1; i >= 0; i--) {
    const { value } = line[i];
    if (value === '#') {
      max = i;
    }
    if (value === 'O') {
      max--;
      if (i !== max) {
        line[max].value = value;
        line[i].value = '.';
      }
    }
  }
}

function calcLoad(lines: PlatformLine[]) {
  return lines.reduce(
    (acc, line) =>
      acc + line.reduce((lacc, { value }, idx) => (value === 'O' ? lacc + idx + 1 : lacc), 0),
    0
  );
}

function calcFirstTiltNorthLoad(filename: string) {
  const { toNorth } = parseInput(filename);
  toNorth.forEach((line) => tiltLine(line));
  return calcLoad(toNorth);
}

function calcCyclesEndNorthLoad(filename: string, cycles = 1) {
  const { toNorth, toWest, toSouth, toEast } = parseInput(filename);
  for (let i = 0; i < cycles; i++) {
    toNorth.forEach((line) => tiltLine(line));
    toWest.forEach((line) => tiltLine(line));
    toSouth.forEach((line) => tiltLine(line));
    toEast.forEach((line) => tiltLine(line));
  }
  return calcLoad(toNorth);
}
