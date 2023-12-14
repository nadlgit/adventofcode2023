import { getInputReadlineInterface, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 21 }],
    solveFn: (filename) => sumPossibleArrangements(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 525152 }],
    solveFn: (filename) => sumUnfoldPossibleArrangements(filename),
  }
);

type SpringRow = { record: string; damagedGroups: number[] };

async function parseInput(filename: string) {
  const springRows: SpringRow[] = [];
  const rl = getInputReadlineInterface(filename);
  for await (const line of rl) {
    const [record, damaged] = line.split(' ');
    const damagedGroups = damaged.split(',').map((n) => parseInt(n));
    springRows.push({ record, damagedGroups });
  }
  return springRows;
}

function makeArrangemements(str: string, count: number): string[] {
  if (count <= 0 || str.length < count || !'.#?'.includes(str[0])) {
    return [];
  }

  if (str.substring(0, count) === '#'.repeat(count) && str[count] !== '#') {
    return [str.substring(0, count) + (str.length > count ? '.' : '')];
  }

  const escapedChar: Record<string, string> = { '.': '\\.', '?': '\\?' };
  const char = str[0];
  let leading = str.match(new RegExp('^' + (escapedChar[char] ?? char) + '+'))![0];

  if (char === '#' && leading.length < count && '#?'.includes(str[leading.length])) {
    return makeArrangemements('#' + str.substring(leading.length + 1), count - leading.length).map(
      (s) => leading + s
    );
  }

  if (char === '.') {
    return makeArrangemements(str.substring(leading.length), count).map((s) => leading + s);
  }

  if (char === '?') {
    const res: string[] = [];
    for (let i = 0; i <= leading.length; i++) {
      leading =
        '.'.repeat(leading.length - i) +
        '#'.repeat(Math.min(i, count)) +
        '.'.repeat(Math.max(0, i - count));
      res.push(...makeArrangemements(leading + str.substring(leading.length), count));
    }
    return res;
  }

  return [];
}

function isValidArrangement({
  record,
  damagedGroups,
  arrangement,
}: SpringRow & { arrangement: string }) {
  const pattern = '^\\.*' + damagedGroups.map((n) => `#{${n}}`).join('\\.+') + '\\.*$';
  return (
    new RegExp(pattern).test(arrangement) &&
    arrangement
      .padEnd(record.length, '.')
      .split('')
      .every((char, idx) => char === record[idx] || record[idx] === '?')
  );
}

function calcArrangements({ record, damagedGroups }: SpringRow) {
  let arrangements: string[] = [''];
  for (let i = 0; i < damagedGroups.length; i++) {
    arrangements = arrangements.flatMap((arr) =>
      makeArrangemements(record.substring(arr.length), damagedGroups[i]).map((a) => arr + a)
    );
  }
  return arrangements.filter((arrangement) =>
    isValidArrangement({ record, damagedGroups, arrangement })
  );
}

async function sumPossibleArrangements(filename: string) {
  const springRows = await parseInput(filename);
  return springRows.reduce((acc, row) => acc + calcArrangements(row).length, 0);
}

async function sumUnfoldPossibleArrangements(filename: string) {
  const springRows = await parseInput(filename);
  const unfoldSpringRows = springRows.map(({ record, damagedGroups }) => ({
    record: record + ('?' + record).repeat(4),
    damagedGroups: [
      ...damagedGroups,
      ...damagedGroups,
      ...damagedGroups,
      ...damagedGroups,
      ...damagedGroups,
    ],
  }));
  return unfoldSpringRows.reduce((acc, row) => acc + calcArrangements(row).length, 0);
}
