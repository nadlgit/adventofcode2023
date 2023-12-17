import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 46 }],
    solveFn: (filename) => countDefaultTilesEnergized(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 51 }],
    solveFn: (filename) => countMaxTilesEnergized(filename),
  }
);

type Tile = '.' | '/' | '\\' | '-' | '|';
type Direction = 'up' | 'down' | 'left' | 'right';
type BeamHead = { origin: Direction; targetRow: number; targetCol: number };

function parseInput(filename: string) {
  return getInputLines(filename).map((line) => line.split('')) as Tile[][];
}

function countTilesEnergized(tiles: Tile[][], beamStart: BeamHead) {
  const crossedOrigins = tiles.map((tileRow) => tileRow.map(() => new Set<Direction>()));
  const beamHeads = [beamStart];

  do {
    const { origin, targetRow, targetCol } = beamHeads.shift()!;

    const tileCrossedOrigins = crossedOrigins[targetRow][targetCol];
    if (tileCrossedOrigins.has(origin)) {
      continue;
    }
    tileCrossedOrigins.add(origin);

    const sideLength = tiles.length;
    const tile = tiles[targetRow][targetCol];
    if (
      ((tile === '.' && origin === 'down') ||
        (tile === '/' && origin === 'left') ||
        (tile === '\\' && origin === 'right') ||
        (tile === '|' && ['down', 'left', 'right'].includes(origin))) &&
      targetRow > 0
    ) {
      beamHeads.push({ origin: 'down', targetRow: targetRow - 1, targetCol });
    }
    if (
      ((tile === '.' && origin === 'up') ||
        (tile === '/' && origin === 'right') ||
        (tile === '\\' && origin === 'left') ||
        (tile === '|' && ['up', 'left', 'right'].includes(origin))) &&
      targetRow < sideLength - 1
    ) {
      beamHeads.push({ origin: 'up', targetRow: targetRow + 1, targetCol });
    }
    if (
      ((tile === '.' && origin === 'right') ||
        (tile === '/' && origin === 'up') ||
        (tile === '\\' && origin === 'down') ||
        (tile === '-' && ['right', 'up', 'down'].includes(origin))) &&
      targetCol > 0
    ) {
      beamHeads.push({ origin: 'right', targetRow, targetCol: targetCol - 1 });
    }
    if (
      ((tile === '.' && origin === 'left') ||
        (tile === '/' && origin === 'down') ||
        (tile === '\\' && origin === 'up') ||
        (tile === '-' && ['left', 'up', 'down'].includes(origin))) &&
      targetCol < sideLength - 1
    ) {
      beamHeads.push({ origin: 'left', targetRow, targetCol: targetCol + 1 });
    }
  } while (beamHeads.length > 0);

  return crossedOrigins.reduce(
    (acc, originRow) => acc + originRow.filter((origin) => origin.size > 0).length,
    0
  );
}

function countDefaultTilesEnergized(filename: string) {
  const tiles = parseInput(filename);
  return countTilesEnergized(tiles, { origin: 'left', targetRow: 0, targetCol: 0 });
}

function countMaxTilesEnergized(filename: string) {
  const tiles = parseInput(filename);
  let maxCount = 0;
  for (let i = 0; i < tiles.length; i++) {
    maxCount = Math.max(
      maxCount,
      countTilesEnergized(tiles, { origin: 'left', targetRow: i, targetCol: 0 }),
      countTilesEnergized(tiles, {
        origin: 'right',
        targetRow: i,
        targetCol: tiles.length - 1,
      }),
      countTilesEnergized(tiles, { origin: 'up', targetRow: 0, targetCol: i }),
      countTilesEnergized(tiles, { origin: 'down', targetRow: tiles.length - 1, targetCol: i })
    );
  }
  return maxCount;
}
