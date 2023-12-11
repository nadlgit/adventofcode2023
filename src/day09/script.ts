import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 114 }],
    solveFn: (filename) => sumExtrapolatedNextValues(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 2 }],
    solveFn: (filename) => sumExtrapolatedPrevValues(filename),
  }
);

function parseInput(filename: string) {
  const lines = getInputLines(filename);
  return lines.map((line) => line.split(' ').map((value) => parseInt(value)));
}

function extrapolateBoundValues(sequence: number[]) {
  const seqBoundValues = (seq: number[]): [number, number] => [seq[0], seq[seq.length - 1]];
  let currSeq = [...sequence];
  const boundValues = [seqBoundValues(sequence)];
  while (currSeq.some((n) => n !== currSeq[0])) {
    currSeq = currSeq.reduce(
      (acc, n, idx) => (idx > 0 ? [...acc, n - currSeq[idx - 1]] : acc),
      [] as number[]
    );
    boundValues.push(seqBoundValues(currSeq));
  }
  const { nextValue, prevValue } = boundValues.reverse().reduce(
    ({ nextValue, prevValue }, [first, last]) => ({
      nextValue: last + nextValue,
      prevValue: first - prevValue,
    }),
    { nextValue: 0, prevValue: 0 }
  );
  return { nextValue, prevValue };
}

function sumExtrapolatedNextValues(filename: string) {
  const sequences = parseInput(filename);
  return sequences.reduce((acc, seq) => acc + extrapolateBoundValues(seq).nextValue, 0);
}

function sumExtrapolatedPrevValues(filename: string) {
  const sequences = parseInput(filename);
  return sequences.reduce((acc, seq) => acc + extrapolateBoundValues(seq).prevValue, 0);
}
