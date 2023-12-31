import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 19114 }],
    solveFn: (filename) => sumAcceptedPartsRating(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 167409079868000 }],
    solveFn: (filename) => countAcceptedRatingCombinations(filename),
  }
);

type Part = Record<string, number>;
type Rule = {
  condition: { category: string; operator: string; value: number } | null;
  destination: string;
};
type RatingRange = {
  x: [number, number];
  m: [number, number];
  a: [number, number];
  s: [number, number];
};

function parseInput(filename: string) {
  const lines = getInputLines(filename);

  const parseRule = (rule: string) => {
    const [ruleLeft, ruleRight] = rule.split(':');
    const destination = ruleRight || ruleLeft;
    let condition: Rule['condition'] = null;
    if (ruleRight) {
      const [category, operator, value] = ruleLeft.match(/(\w+)([^\w])(\d+)/)!.splice(1);
      condition = { category, operator, value: parseInt(value) };
    }
    return { condition, destination };
  };
  const workflows = lines
    .filter((line) => /^\w/.test(line))
    .reduce((acc, str) => {
      const [name, rules] = str.match(/[^{}]+/g)!;
      return { ...acc, [name]: rules.split(',').map((rule) => parseRule(rule)) };
    }, {} as Record<string, Rule[]>);

  const parts = lines
    .filter((line) => /^\{/.test(line))
    .map((str) =>
      str.match(/[^{},]+/g)!.reduce((acc, rating) => {
        const [key, value] = rating.split('=');
        return { ...acc, [key]: parseInt(value) };
      }, {} as Part)
    );

  return { workflows, parts };
}

function splitRange(range: [number, number], value: number, operator: string) {
  let inside: [number, number] | null = null;
  let outside: [number, number] | null = null;
  if ((operator === '<' && value <= range[0]) || (operator === '>' && value >= range[1])) {
    outside = range;
  } else if ((operator === '<' && value > range[1]) || (operator === '>' && value < range[0])) {
    inside = range;
  } else if (operator === '<') {
    const bound = Math.max(value - 1, range[0]);
    inside = [range[0], bound];
    outside = [bound + 1, range[1]];
  } else if (operator === '>') {
    const bound = Math.min(value + 1, range[1]);
    inside = [bound, range[1]];
    outside = [range[0], bound - 1];
  }
  return { inside, outside };
}

function sumAcceptedPartsRating(filename: string) {
  const { workflows, parts } = parseInput(filename);
  const accepted: Part[] = [];
  for (const part of parts) {
    let current = 'in';
    while (!['A', 'R'].includes(current)) {
      for (const { condition, destination } of workflows[current]) {
        if (
          !condition ||
          (condition.operator === '<' && part[condition.category] < condition.value) ||
          (condition.operator === '>' && part[condition.category] > condition.value)
        ) {
          current = destination;
          break;
        }
      }
    }
    if (current === 'A') {
      accepted.push(part);
    }
  }
  return accepted.reduce((acc, part) => acc + part['x'] + part['m'] + part['a'] + part['s'], 0);
}

function countAcceptedRatingCombinations(filename: string) {
  const { workflows } = parseInput(filename);
  const queue: {
    workflowName: string;
    ratingRange: RatingRange;
  }[] = [
    { workflowName: 'in', ratingRange: { x: [1, 4000], m: [1, 4000], a: [1, 4000], s: [1, 4000] } },
  ];
  const accepted: RatingRange[] = [];

  while (queue.length > 0) {
    const { workflowName, ratingRange } = queue.shift()!;
    for (const { condition, destination } of workflows[workflowName]) {
      let nextIn: (typeof queue)[number] | undefined;
      let nextOut: (typeof queue)[number] | undefined;
      if (condition) {
        const { category, operator, value } = condition;
        const { inside, outside } = splitRange(
          ratingRange[category as keyof typeof ratingRange],
          value,
          operator
        );
        if (inside) {
          nextIn = {
            workflowName: destination,
            ratingRange: { ...ratingRange, [category]: inside },
          };
          if (outside) {
            nextOut = {
              workflowName,
              ratingRange: { ...ratingRange, [category]: outside },
            };
          }
        }
      } else {
        nextIn = { workflowName: destination, ratingRange };
      }
      if (nextOut) {
        queue.push(nextOut);
      }
      if (nextIn && nextIn.workflowName !== 'R') {
        if (nextIn.workflowName === 'A') {
          accepted.push(nextIn.ratingRange);
        } else {
          queue.push(nextIn);
        }
      }
      if (nextIn) {
        break;
      }
    }
  }

  return accepted.reduce(
    (acc, ratingRange) =>
      acc + Object.values(ratingRange).reduce((racc, [start, end]) => racc * (end - start + 1), 1),
    0
  );
}
