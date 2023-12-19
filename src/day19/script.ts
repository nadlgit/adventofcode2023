import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 19114 }],
    solveFn: (filename) => sumAcceptedPartsRating(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: null }],
    solveFn: (filename) => null,
  }
);

type Part = Record<string, number>;
type Rule = { str: string; conditionFn: (part: Part) => boolean; destination: string };

function parseInput(filename: string) {
  const lines = getInputLines(filename);

  const parseRule = (rule: string) => {
    const [ruleLeft, ruleRight] = rule.split(':');
    const destination = ruleRight || ruleLeft;
    let conditionFn: Rule['conditionFn'] = () => false;
    if (ruleRight) {
      const [category, operator, value] = ruleLeft.match(/(\w+)([^\w])(\d+)/)!.splice(1);
      if (operator === '<') conditionFn = (part) => part[category] < parseInt(value);
      if (operator === '>') conditionFn = (part) => part[category] > parseInt(value);
    } else {
      conditionFn = () => true;
    }
    return { str: rule, conditionFn, destination };
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

function sumAcceptedPartsRating(filename: string) {
  const { workflows, parts } = parseInput(filename);
  const accepted: Part[] = [];
  for (const part of parts) {
    let current = 'in';
    while (!['A', 'R'].includes(current)) {
      for (const { conditionFn, destination } of workflows[current]) {
        if (conditionFn(part)) {
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
