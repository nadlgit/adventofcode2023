import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 1320 }],
    solveFn: (filename) => sumSequenceStepsHash(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 145 }],
    solveFn: (filename) => sumLensesFocusingPower(filename),
  }
);

type Lens = { label: string; focal: number };

function parseInput(filename: string) {
  return getInputLines(filename)[0].split(',');
}

function hashStr(str: string) {
  let hash = 0;
  for (const char of str) {
    hash += char.charCodeAt(0);
    hash *= 17;
    hash %= 256;
  }
  return hash;
}

function applySequenceStep(step: string, boxes: Lens[][]) {
  const [label, operation, focalStr] = step.split(/([-=])/);
  const box = boxes[hashStr(label)];
  const lensIdx = box.findIndex(({ label: lensLabel }) => lensLabel === label);

  if (operation === '=') {
    const focal = parseInt(focalStr);
    if (lensIdx >= 0) {
      box[lensIdx].focal = focal;
    } else {
      box.push({ label, focal });
    }
  }

  if (operation === '-' && lensIdx >= 0) {
    box.splice(lensIdx, 1);
  }
}

function sumSequenceStepsHash(filename: string) {
  const sequence = parseInput(filename);
  return sequence.reduce((acc, step) => acc + hashStr(step), 0);
}

function sumLensesFocusingPower(filename: string) {
  const sequence = parseInput(filename);
  const boxes = Array.from(new Array(256), () => [] as Lens[]);
  sequence.forEach((step) => applySequenceStep(step, boxes));
  return boxes.reduce(
    (acc, box, boxIdx) =>
      acc +
      box.reduce((bacc, { focal }, lensIdx) => bacc + (boxIdx + 1) * (lensIdx + 1) * focal, 0),
    0
  );
}
