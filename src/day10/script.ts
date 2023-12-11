import { getInputLines, runDay } from '../utils';

const exampleFilename = {
  part1Exple1: 'example-input1.txt',
  part1Exple2: 'example-input2.txt',
  part2Exple1: 'example-input3.txt',
  part2Exple2: 'example-input4.txt',
  part2Exple3: 'example-input5.txt',
  part2Exple4: 'example-input6.txt',
};

runDay({
  example: { filename: exampleFilename.part1Exple1, expected: 4 },
  solveFn: (filename) => calcFarthestPointSteps(filename),
});
runDay({
  example: { filename: exampleFilename.part1Exple2, expected: 8 },
  solveFn: (filename) => calcFarthestPointSteps(filename),
});
// runDay(
//   {
//     example: { filename: exampleFilename.part1Exple1, expected: null },
//     solveFn: (filename) => null,
//   },
//   {
//     example: { filename: exampleFilename.part2Exple1, expected: 4 },
//     solveFn: (filename) => null,
//   },
//   {
//     example: { filename: exampleFilename.part2Exple2, expected: 4 },
//     solveFn: (filename) => null,
//   },
//   {
//     example: { filename: exampleFilename.part2Exple3, expected: 8 },
//     solveFn: (filename) => null,
//   },
//   {
//     example: { filename: exampleFilename.part2Exple4, expected: 10 },
//     solveFn: (filename) => null,
//   }
// );

type Direction = 'N' | 'S' | 'W' | 'E';
type Tile = {
  value: '|' | '-' | 'L' | 'J' | '7' | 'F' | '.' | 'S';
  isInLoop: boolean;
  loopConnections: { row: number; col: number; dir: Direction }[];
};

function parseInput(filename: string) {
  let startPos: [number, number] = [-1, -1];
  const tiles = getInputLines(filename).map((line, rowIdx) =>
    (line.split('') as Tile['value'][]).map((value, colIdx) => {
      if (value === 'S') startPos = [rowIdx, colIdx];
      const tile: Tile = { value, isInLoop: value === 'S', loopConnections: [] };
      return tile;
    })
  );
  return { tiles, nbRows: tiles.length, nbCols: tiles[0].length, startPos };
}

function isPossibleTileDirection(tileValue: Tile['value'], direction: Direction) {
  const tileDirection: Record<Tile['value'], Direction[]> = {
    '|': ['N', 'S'],
    '-': ['W', 'E'],
    L: ['N', 'E'],
    J: ['N', 'W'],
    '7': ['S', 'W'],
    F: ['S', 'E'],
    '.': [],
    S: ['N', 'S', 'W', 'E'],
  };
  return tileDirection[tileValue].includes(direction);
}

function findTileConnections({
  tilePos: [row, col],
  tiles,
  nbRows,
  nbCols,
}: {
  tilePos: [number, number];
  tiles: Tile[][];
  nbRows: number;
  nbCols: number;
}) {
  const directionInfo: Record<Direction, { vector: [number, number]; opposite: Direction }> = {
    N: { vector: [-1, 0], opposite: 'S' },
    S: { vector: [1, 0], opposite: 'N' },
    W: { vector: [0, -1], opposite: 'E' },
    E: { vector: [0, 1], opposite: 'W' },
  };

  const connections: Tile['loopConnections'] = [];
  for (const dir of Object.keys(directionInfo) as Direction[]) {
    const {
      vector: [vectorR, vectorC],
      opposite: oppositeDir,
    } = directionInfo[dir];
    if (
      isPossibleTileDirection(tiles[row][col].value, dir) &&
      row + vectorR >= 0 &&
      row + vectorR < nbRows &&
      col + vectorC >= 0 &&
      col + vectorC < nbCols &&
      isPossibleTileDirection(tiles[row + vectorR][col + vectorC].value, oppositeDir)
    ) {
      connections.push({ row: row + vectorR, col: col + vectorC, dir });
    }
  }
  return connections;
}

function detectLoop(filename: string) {
  const { tiles, nbRows, nbCols, startPos } = parseInput(filename);

  let currPosList = [startPos];
  let boundsSteps = 0;
  while (currPosList.length > 1 || boundsSteps === 0) {
    const nextPosList: [number, number][] = [];
    currPosList.forEach(([currRow, currCol]) => {
      const tileConnections = findTileConnections({
        tilePos: [currRow, currCol],
        tiles,
        nbRows,
        nbCols,
      });
      tiles[currRow][currCol].loopConnections.push(...tileConnections);
      nextPosList.push(
        ...tileConnections
          .map(({ row, col }) => [row, col] as [number, number])
          .filter(
            ([row, col]) =>
              !tiles[row][col].isInLoop &&
              nextPosList.every(([nextRow, nextCol]) => nextRow !== row || nextCol !== col)
          )
      );
    });
    nextPosList.forEach(([row, col]) => {
      tiles[row][col].isInLoop = true;
    });
    currPosList = nextPosList;
    boundsSteps++;
  }

  return { tiles, nbRows, nbCols, startPos, boundsSteps };
}

function calcFarthestPointSteps(filename: string) {
  const { boundsSteps } = detectLoop(filename);
  return boundsSteps;
}

function countTilesEnclosed(filename: string) {
  // const { tiles, nbRows, nbCols, startPos, boundsSteps } = detectLoop(filename);
  // let count = 0;
  // return count;
}
// countTilesEnclosed(exampleFilename.part2Exple1);
// countTilesEnclosed(exampleFilename.part2Exple2);
// countTilesEnclosed(exampleFilename.part2Exple3);
// countTilesEnclosed(exampleFilename.part2Exple4);
// countTilesEnclosed(puzzleFilename);
