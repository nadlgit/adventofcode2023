import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    example: { filename: exampleFilename, expected: 8 },
    solveFn: (filename) =>
      sumPossibleGamesIds(getInputLines(filename), { red: 12, green: 13, blue: 14 }),
  },
  {
    example: { filename: exampleFilename, expected: 2286 },
    solveFn: (filename) => sumMinSetsPower(getInputLines(filename)),
  }
);

type CubeSet = { red: number; green: number; blue: number };
type Game = { id: number; sets: CubeSet[] };

function parseGame(line: string): Game {
  const lineParts = line.replace('Game ', '').split(': ');
  const id = parseInt(lineParts[0]);
  const sets = lineParts[1].split('; ').map((str) =>
    str.split(', ').reduce(
      (acc, curr) => {
        const [count, color] = curr.split(' ');
        acc[color as keyof CubeSet] += parseInt(count);
        return acc;
      },
      { red: 0, green: 0, blue: 0 } as CubeSet
    )
  );
  return { id, sets };
}

function sumPossibleGamesIds(input: string[], bagSet: CubeSet): number {
  const isPossible = (gameSets: CubeSet[]) =>
    gameSets.every((gSet) =>
      (Object.keys(bagSet) as (keyof CubeSet)[]).every((color) => gSet[color] <= bagSet[color])
    );
  const games = input.map((line) => parseGame(line));
  return games.filter(({ sets }) => isPossible(sets)).reduce((acc, { id }) => acc + id, 0);
}

function sumMinSetsPower(input: string[]): number {
  const minSet = (gameSets: CubeSet[]) =>
    gameSets.reduce(
      (acc, { red, green, blue }) => ({
        red: Math.max(red, acc.red),
        green: Math.max(green, acc.green),
        blue: Math.max(blue, acc.blue),
      }),
      { red: 0, green: 0, blue: 0 } as CubeSet
    );
  const games = input.map((line) => parseGame(line));
  return games
    .map(({ sets }) => minSet(sets))
    .map(({ red, green, blue }) => red * green * blue)
    .reduce((acc, curr) => acc + curr, 0);
}
