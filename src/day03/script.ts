import { start } from 'repl';
import { getInputReadlineInterface, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    example: { filename: exampleFilename, expected: 4361 },
    solveFn: (filename) => sumPartNumbers(filename),
  }
  // {
  //   example: { filename: exampleFilename, expected: 467835 },
  //   solveFn: (filename) => null,
  // }
);

type Position = [number, number];

type Schematic = {
  width: number;
  height: number;
  symbols: Position[];
  numbers: { value: number; start: Position; end: Position }[];
};

const isSamePosition = ([x1, y1]: Position, [x2, y2]: Position) => x1 === x2 && y1 === y2;

async function parseSchematic(filename: string) {
  const schematic: Schematic = {
    width: 0,
    height: 0,
    symbols: [],
    numbers: [],
  };
  const rl = getInputReadlineInterface(filename);
  let x = 0;
  for await (const line of rl) {
    for (const match of line.matchAll(/\d+|[^.\w]/dg)) {
      const matchValue = match[0];
      const [matchStart, matchEnd] = match.indices![0];
      if (/\d+/.test(matchValue)) {
        schematic.numbers.push({
          value: parseInt(matchValue),
          start: [x, matchStart],
          end: [x, matchEnd - 1],
        });
      } else {
        schematic.symbols.push([x, matchStart]);
      }
    }
    x++;
    schematic.height = x;
    if (x === 1) schematic.width = line.length;
  }
  return schematic;
}

function getNumberAdjacentPositions({
  numStart,
  numEnd,
  schematicWidth,
  schematicHeight,
}: {
  numStart: Position;
  numEnd: Position;
  schematicWidth: number;
  schematicHeight: number;
}) {
  const [numX, numStartY] = numStart;
  const numEndY = numEnd[1];
  const minX = Math.max(numX - 1, 0);
  const maxX = Math.min(numX + 1, schematicHeight - 1);
  const minY = Math.max(numStartY - 1, 0);
  const maxY = Math.min(numEndY + 1, schematicWidth - 1);
  const adjacent: Position[] = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (x !== numX || y < numStartY || y > numEndY) {
        adjacent.push([x, y]);
      }
    }
  }
  return adjacent;
}

function getPartNumbers(schematic: Schematic) {
  const partNumbers = schematic.numbers
    .filter((num) => {
      const adjacent = getNumberAdjacentPositions({
        numStart: num.start,
        numEnd: num.end,
        schematicWidth: schematic.width,
        schematicHeight: schematic.height,
      });
      for (const adj of adjacent) {
        for (const symbol of schematic.symbols) {
          if (isSamePosition(adj, symbol)) {
            return true;
          }
        }
      }
      return false;
    })
    .map(({ value }) => value);
  return partNumbers;
}

async function sumPartNumbers(filename: string) {
  const schematic = await parseSchematic(filename);
  const partNumbers = getPartNumbers(schematic);
  return partNumbers.reduce((acc, n) => acc + n, 0);
}
