import { getInputReadlineInterface, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 4361 }],
    solveFn: (filename) => sumPartNumbers(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 467835 }],
    solveFn: (filename) => sumGearRatios(filename),
  }
);

type Position = [number, number];

type SchematicNumber = { value: number; start: Position; end: Position };

type Schematic = {
  width: number;
  height: number;
  symbols: Record<string, Position[]>;
  numbers: SchematicNumber[];
};

async function parseSchematic(filename: string) {
  const schematic: Schematic = {
    width: 0,
    height: 0,
    symbols: {},
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
        if (!schematic.symbols[matchValue]) schematic.symbols[matchValue] = [];
        schematic.symbols[matchValue].push([x, matchStart]);
      }
    }
    x++;
    schematic.height = x;
    if (x === 1) schematic.width = line.length;
  }
  return schematic;
}

function isAdjacentNumber({
  pos: [posX, posY],
  num: {
    start: [numX, numStartY],
    end: [, numEndY],
  },
  schematicWidth,
  schematicHeight,
}: {
  pos: Position;
  num: SchematicNumber;
  schematicWidth: number;
  schematicHeight: number;
}) {
  for (let x = Math.max(posX - 1, 0); x <= Math.min(posX + 1, schematicHeight - 1); x++) {
    for (let y = Math.max(posY - 1, 0); y <= Math.min(posY + 1, schematicWidth - 1); y++) {
      if ((x !== posX || y !== posY) && x === numX && y >= numStartY && y <= numEndY) {
        return true;
      }
    }
  }
  return false;
}

function getPartNumbers(schematic: Schematic) {
  const partNumbers = schematic.numbers
    .filter((num) => {
      for (const pos of Object.values(schematic.symbols).flatMap((pos) => pos)) {
        if (
          isAdjacentNumber({
            pos,
            num,
            schematicWidth: schematic.width,
            schematicHeight: schematic.height,
          })
        ) {
          return true;
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

function getGears(schematic: Schematic) {
  const gears = schematic.symbols['*']
    .map((pos) => {
      const partNumbers: SchematicNumber[] = [];
      for (const num of schematic.numbers) {
        if (
          isAdjacentNumber({
            pos,
            num,
            schematicWidth: schematic.width,
            schematicHeight: schematic.height,
          })
        ) {
          partNumbers.push(num);
        }
      }
      return { pos, partNumbers };
    })
    .filter(({ partNumbers }) => partNumbers.length === 2);
  return gears;
}

async function sumGearRatios(filename: string) {
  const schematic = await parseSchematic(filename);
  const gears = getGears(schematic);
  const gearsRatios = gears.map(
    ({ partNumbers: [{ value: value1 }, { value: value2 }] }) => value1 * value2
  );
  return gearsRatios.reduce((acc, n) => acc + n, 0);
}
