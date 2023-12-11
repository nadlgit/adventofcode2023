import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 374 }],
    solveFn: (filename) => sumShortestGalaxyPaths(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: null }],
    solveFn: (filename) => sumShortestGalaxyPaths(filename, 1000000),
  }
);

function parseInput(filename: string) {
  const lines = getInputLines(filename);

  const universeRows = lines.length;
  const universeCols = lines[0].length;

  const galaxies = lines.reduce((acc, line, rowIdx) => {
    for (let colIdx = 0; colIdx < line.length; colIdx++) {
      if (line[colIdx] === '#') acc.push([rowIdx, colIdx]);
    }
    return acc;
  }, [] as [number, number][]);

  const emptyLines = (lines: string[]) =>
    lines.reduce((acc, str, idx) => {
      if (!str.includes('#')) acc.push(idx);
      return acc;
    }, [] as number[]);
  const emptyRows = emptyLines(lines);
  const emptyCols = emptyLines(
    lines.reduce(
      (acc, line) => {
        for (let i = 0; i < line.length; i++) {
          acc[i] += line[i];
        }
        return acc;
      },
      Array.from(lines[0], () => '')
    )
  );

  return { universeRows, universeCols, galaxies, emptyRows, emptyCols };
}

function shortestPath([row1, col1]: [number, number], [row2, col2]: [number, number]) {
  return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

function sumShortestGalaxyPaths(filename: string, expansionFactor = 2) {
  const { galaxies, emptyRows, emptyCols } = parseInput(filename);

  const expandedUniverseGalaxies = galaxies.map(([row, col]) => {
    const expandDimension = (dimension: number, emptyList: number[]) =>
      emptyList.reduce(
        (acc, idx) => (dimension > idx ? acc + Math.max(1, expansionFactor) - 1 : acc),
        dimension
      );
    return [expandDimension(row, emptyRows), expandDimension(col, emptyCols)] as [number, number];
  });

  return expandedUniverseGalaxies.reduce((acc, galaxy, idx) => {
    for (let i = idx + 1; i < expandedUniverseGalaxies.length; i++) {
      acc += shortestPath(galaxy, expandedUniverseGalaxies[i]);
    }
    return acc;
  }, 0);
}
