import { getInputLines, runDay } from '../utils';

const exampleFilename = {
  part1Exple1: 'example-input1.txt',
  part1Exple2: 'example-input2.txt',
  part2Exple1: 'example-input3.txt',
  part2Exple2: 'example-input4.txt',
  part2Exple3: 'example-input5.txt',
  part2Exple4: 'example-input6.txt',
};

runDay(
  {
    examples: [
      { filename: exampleFilename.part1Exple1, expected: 4 },
      { filename: exampleFilename.part1Exple2, expected: 8 },
    ],
    solveFn: (filename) => calcFarthestPointSteps(filename),
  },
  {
    examples: [
      { filename: exampleFilename.part2Exple1, expected: 4 },
      { filename: exampleFilename.part2Exple2, expected: 4 },
      { filename: exampleFilename.part2Exple3, expected: 8 },
      { filename: exampleFilename.part2Exple4, expected: 10 },
    ],
    solveFn: (filename) => countTilesEnclosed(filename),
  }
);

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
      const tile: Tile = { value, isInLoop: false, loopConnections: [] };
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
  let boundFound = false;
  let boundsSteps = 0;
  while (!boundFound) {
    currPosList.forEach(([currRow, currCol]) => {
      tiles[currRow][currCol].isInLoop = true;
      tiles[currRow][currCol].loopConnections.push(
        ...findTileConnections({
          tilePos: [currRow, currCol],
          tiles,
          nbRows,
          nbCols,
        })
      );
    });

    if (currPosList.length < 2 && !currPosList.includes(startPos)) {
      boundFound = true;
      continue;
    }

    currPosList = currPosList.reduce(
      (acc, [currRow, currCol]) => [
        ...acc,
        ...tiles[currRow][currCol].loopConnections
          .map(({ row, col }) => [row, col] as [number, number])
          .filter(
            ([row, col]) =>
              !tiles[row][col].isInLoop &&
              acc.every(([nextRow, nextCol]) => nextRow !== row || nextCol !== col)
          ),
      ],
      [] as [number, number][]
    );
    boundsSteps++;
  }

  return { tiles, nbRows, nbCols, startPos, boundsSteps };
}

function findLoopVertices(tiles: Tile[][], startPos: [number, number]) {
  const isLoopVertex = ({ value, isInLoop, loopConnections }: Tile) => {
    const bends: Tile['value'][] = ['L', 'J', '7', 'F'] as const;
    return (
      isInLoop &&
      (bends.includes(value) ||
        (value === 'S' &&
          bends.some((bend) =>
            loopConnections.every(({ dir }) => isPossibleTileDirection(bend, dir))
          )))
    );
  };

  let prevPos: [number, number] | undefined = undefined;
  let currPos = startPos;
  const vertices: [number, number][] = [];
  while (!prevPos || currPos[0] !== startPos[0] || currPos[1] !== startPos[1]) {
    const tile = tiles[currPos[0]][currPos[1]];
    if (isLoopVertex(tile)) {
      vertices.push(currPos);
    }
    const nextPos = tile.loopConnections
      .map(({ row, col }) => [row, col] as [number, number])
      .find(([row, col]) => !prevPos || row !== prevPos[0] || col !== prevPos[1])!;
    prevPos = currPos;
    currPos = nextPos;
  }
  return vertices;
}

function shoelaceArea(vertices: [number, number][]) {
  // https://en.wikipedia.org/wiki/Shoelace_formula
  return (
    Math.abs(
      vertices.reduce((acc, [row, col], idx) => {
        const nextIdx = idx < vertices.length - 1 ? idx + 1 : 0;
        const [nextRow, nextCol] = vertices[nextIdx];
        return acc + row * nextCol - col * nextRow;
      }, 0)
    ) / 2
  );
}

function calcFarthestPointSteps(filename: string) {
  const { boundsSteps } = detectLoop(filename);
  return boundsSteps;
}

function countTilesEnclosed(filename: string) {
  // https://en.wikipedia.org/wiki/Pick%27s_theorem
  const { tiles, startPos } = detectLoop(filename);
  const loopVertices = findLoopVertices(tiles, startPos);
  const loopBoundaryPoints = loopVertices.reduce((acc, [row, col], idx) => {
    const prevIdx = idx === 0 ? loopVertices.length - 1 : idx - 1;
    const [prevRow, prevCol] = loopVertices[prevIdx];
    return acc + Math.abs(row - prevRow) + Math.abs(col - prevCol);
  }, 0);
  const loopArea = shoelaceArea(loopVertices);
  const loopInteriorPoints = loopArea - loopBoundaryPoints / 2 + 1;
  return loopInteriorPoints;
}
