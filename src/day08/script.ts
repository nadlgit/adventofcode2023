import { getInputLines, runDay } from '../utils';

const exampleFilename = {
  part1Exple1: 'example-input1.txt',
  part1Exple2: 'example-input2.txt',
  part2: 'example-input3.txt',
};

runDay(
  {
    examples: [
      { filename: exampleFilename.part1Exple1, expected: 2 },
      { filename: exampleFilename.part1Exple2, expected: 6 },
    ],
    solveFn: (filename) => countNavigationSteps(filename),
  },
  {
    examples: [{ filename: exampleFilename.part2, expected: 6 }],
    solveFn: (filename) => countNavigationSteps(filename, true),
  }
);

type NodeName = string;
type Network = Record<NodeName, { L: NodeName; R: NodeName }>;

function parseInput(filename: string) {
  const lines = getInputLines(filename);
  return {
    instructions: lines[0],
    network: lines.slice(2).reduce((acc, line) => {
      const [name, L, R] = line.match(/\w+/g)!;
      return { ...acc, [name]: { L, R } };
    }, {} as Network),
  };
}

function countNavigationSteps(filename: string, ghostRule?: boolean) {
  const { instructions, network } = parseInput(filename);
  const countNodeSteps = (startNode: NodeName, endNode?: NodeName) => {
    const endNodes = endNode ? [endNode] : Object.keys(network).filter((node) => node[2] === 'Z');
    let node = startNode;
    let i = 0;
    let count = 0;
    while (!endNodes.includes(node)) {
      node = network[node][instructions[i] as keyof Network[NodeName]];
      count++;
      i = i < instructions.length - 1 ? i + 1 : 0;
    }
    return count;
  };

  if (!ghostRule) {
    return countNodeSteps('AAA', 'ZZZ');
  }

  const startNodes = Object.keys(network).filter((node) => node[2] === 'A');
  const counts = startNodes.reduce((acc, node) => [...acc, countNodeSteps(node)], [] as number[]);
  const commonCountPrimes = counts.reduce((acc, n) => {
    const primes = primeFactors(n);
    for (const prime of Object.keys(primes).map((key) => parseInt(key))) {
      if (!acc[prime]) acc[prime] = 0;
      acc[prime] = Math.max(acc[prime], primes[prime]);
    }
    return acc;
  }, {} as Record<number, number>);
  const leastCommonMultiple = Object.entries(commonCountPrimes).reduce(
    (acc, [prime, pow]) => acc * parseInt(prime) ** pow,
    1
  );
  return leastCommonMultiple;
}

function primeFactors(n: number): Record<number, number> {
  let result = {};
  let prime = 2;
  while (n > 1) {
    let pow = 0;
    while (n % prime === 0) {
      n /= prime;
      pow++;
    }
    if (pow) {
      result = { ...result, [prime]: pow };
    }
    prime++;
  }
  return result;
}
