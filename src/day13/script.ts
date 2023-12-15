import { getInputReadlineInterface, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 405 }],
    solveFn: (filename) => sumReflectionLines(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 400 }],
    solveFn: (filename) => sumReflectionLines(filename, true),
  }
);

async function parseInput(filename: string) {
  const rl = getInputReadlineInterface(filename);
  let currentPattern: string[] = [];
  const patterns = [currentPattern];
  for await (const line of rl) {
    if (!line) {
      currentPattern = [];
      patterns.push(currentPattern);
      continue;
    }
    currentPattern.push(line);
  }
  return patterns;
}

function transposePattern(pattern: string[]) {
  const transposed: string[] = [];
  for (let c = 0; c < pattern[0].length; c++) {
    let line = '';
    for (let r = 0; r < pattern.length; r++) {
      line += pattern[r][c];
    }
    transposed.push(line);
  }
  return transposed;
}

function findVerticalReflectionLines(pattern: string[]) {
  const reverseStr = (str: string) => str.split('').reverse().join('');
  let possibleLeftLines: number[] = [];
  let lineIdx = 0;
  do {
    const line = pattern[lineIdx];
    const linePossibilities: number[] = [];
    for (let i = line.length % 2; i < line.length; i += 2) {
      const substrLength = line.length - i;
      const checks = [
        { substr: line.substring(i), res: substrLength / 2 + i },
        { substr: line.substring(-i, substrLength), res: substrLength / 2 },
      ];
      for (const { substr, res } of checks) {
        if (substr === reverseStr(substr)) {
          linePossibilities.push(res);
        }
      }
    }
    possibleLeftLines =
      lineIdx === 0
        ? linePossibilities
        : linePossibilities.filter((n) => possibleLeftLines.includes(n));
    lineIdx++;
  } while (possibleLeftLines.length > 0 && lineIdx < pattern.length);
  return possibleLeftLines;
}

function findPatternReflectionValue(
  pattern: string[],
  unfixedValue?: { value: number; isHorizontal: boolean }
) {
  const verticals = findVerticalReflectionLines(pattern).filter(
    (n) => !(unfixedValue && !unfixedValue.isHorizontal && n === unfixedValue.value)
  );
  if (verticals.length > 0) {
    return { value: Math.min(...verticals), isHorizontal: false };
  }
  const horizontals = findVerticalReflectionLines(transposePattern(pattern)).filter(
    (n) => !(unfixedValue && unfixedValue.isHorizontal && n === unfixedValue.value)
  );
  if (horizontals.length > 0) {
    return { value: Math.min(...horizontals), isHorizontal: true };
  }
  return { value: 0, isHorizontal: false };
}

function findPatternFixedReflectionValue(pattern: string[]) {
  const initialReflection = findPatternReflectionValue(pattern);
  let reflection = { value: 0, isHorizontal: false };
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r].length; c++) {
      reflection = findPatternReflectionValue(
        pattern.map((str, idx) =>
          idx === r
            ? str.substring(0, c) + (pattern[r][c] === '#' ? '.' : '#') + str.substring(c + 1)
            : str
        ),
        initialReflection
      );
      if (reflection.value > 0) return reflection;
    }
  }
  return reflection;
}

async function sumReflectionLines(filename: string, fixSmudge?: boolean) {
  const patterns = await parseInput(filename);
  return patterns.reduce((acc, pattern) => {
    const { value, isHorizontal } = fixSmudge
      ? findPatternFixedReflectionValue(pattern)
      : findPatternReflectionValue(pattern);
    return isHorizontal ? acc + 100 * value : acc + value;
  }, 0);
}
