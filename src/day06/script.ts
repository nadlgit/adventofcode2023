import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 288 }],
    solveFn: (filename) => getWinningWaysProduct(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 71503 }],
    solveFn: (filename) => getWinningWaysCount(filename),
  }
);

function parseInput(filename: string) {
  const parseLine = (line: string) => {
    const digits = line.match(/\d+/g)!;
    return {
      splitValues: digits.map((n) => parseInt(n)),
      joinedValue: parseInt(digits.join('')),
    };
  };
  const lines = getInputLines(filename);
  return { time: parseLine(lines[0]), distance: parseLine(lines[1]) };
}

function countWinningWays({ time, record }: { time: number; record: number }) {
  // given r is race time, r is record and x is hold time
  // equation is x² - tx + r < 0, with 0 < x < t
  const discriminant = time ** 2 - 4 * record;
  const solutions = [(time - Math.sqrt(discriminant)) / 2, (time + Math.sqrt(discriminant)) / 2];
  const holdTimeMin = Math.floor(Math.min(...solutions)) + 1;
  const holdTimeMax = Math.ceil(Math.max(...solutions)) - 1;
  return holdTimeMax >= holdTimeMin ? holdTimeMax - holdTimeMin + 1 : 0;
}

function getWinningWaysProduct(filename: string) {
  const {
    time: { splitValues: times },
    distance: { splitValues: distances },
  } = parseInput(filename);
  const counts = times.map((time, idx) => countWinningWays({ time, record: distances[idx] }));
  return counts.reduce((acc, n) => acc * n, 1);
}

function getWinningWaysCount(filename: string) {
  const {
    time: { joinedValue: time },
    distance: { joinedValue: record },
  } = parseInput(filename);
  return countWinningWays({ time, record });
}
