import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 62 }],
    solveFn: (filename) => calcLagoonVolume(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 952408144115 }],
    solveFn: (filename) => calcFixedPlanLagoonVolume(filename),
  }
);

function parseInput(filename: string) {
  const lines = getInputLines(filename);
  return lines.map((line) => {
    const [direction, count, colorHex] = line.split(' ');
    return {
      direction,
      count: parseInt(count),
      colorHex: colorHex.replace(/[()#]/g, ''),
    };
  });
}

function getVertices(instructions: [string, number][]) {
  const vertices: [number, number][] = [[0, 0]];
  for (let i = 0; i < instructions.length; i++) {
    const [prevRow, prevCol] = vertices[vertices.length - 1] ?? [0, 0];
    const [direction, count] = instructions[i];
    switch (direction) {
      case 'U':
      case '3':
        vertices.push([prevRow - count, prevCol]);
        break;
      case 'D':
      case '1':
        vertices.push([prevRow + count, prevCol]);
        break;
      case 'L':
      case '2':
        vertices.push([prevRow, prevCol - count]);
        break;
      case 'R':
      case '0':
        vertices.push([prevRow, prevCol + count]);
        break;
    }
  }
  return vertices;
}

function countPolygonPoints(vertices: [number, number][]) {
  // https://en.wikipedia.org/wiki/Pick%27s_theorem
  // https://en.wikipedia.org/wiki/Shoelace_formula
  const boundaryPoints = vertices.reduce((acc, [row, col], idx) => {
    const prevIdx = idx === 0 ? vertices.length - 1 : idx - 1;
    const [prevRow, prevCol] = vertices[prevIdx];
    return acc + Math.abs(row - prevRow) + Math.abs(col - prevCol);
  }, 0);
  const area =
    Math.abs(
      vertices.reduce((acc, [row, col], idx) => {
        const nextIdx = idx < vertices.length - 1 ? idx + 1 : 0;
        const [nextRow, nextCol] = vertices[nextIdx];
        return acc + row * nextCol - col * nextRow;
      }, 0)
    ) / 2;
  const interiorPoints = area - boundaryPoints / 2 + 1;
  return { boundaryPoints, interiorPoints };
}

function calcLagoonVolume(filename: string) {
  const digPlan = parseInput(filename);
  const vertices = getVertices(digPlan.map(({ direction, count }) => [direction, count]));
  const { boundaryPoints, interiorPoints } = countPolygonPoints(vertices);
  return boundaryPoints + interiorPoints;
}

function calcFixedPlanLagoonVolume(filename: string) {
  const digPlan = parseInput(filename);
  const vertices = getVertices(
    digPlan.map(({ colorHex }) => [colorHex.substring(5), parseInt(colorHex.substring(0, 5), 16)])
  );
  const { boundaryPoints, interiorPoints } = countPolygonPoints(vertices);
  return boundaryPoints + interiorPoints;
}
