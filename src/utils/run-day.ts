import { puzzleFilename } from './file';

export function runDay<T>(
  ...parts: {
    examples: { filename: string; expected: T }[];
    solveFn: (filename: string) => T | Promise<T>;
  }[]
) {
  const handleSolvePromise = (value: T | Promise<T>, handleValue: (value: T) => void) =>
    value instanceof Promise ? value.then((val) => handleValue(val)) : handleValue(value);
  parts.forEach(({ solveFn, examples }, idx) => {
    const partNum = idx + 1;
    for (const { filename: exampleFilename, expected: exampleExpected } of examples) {
      handleSolvePromise(solveFn(exampleFilename), (value) =>
        console.log(`Part${partNum} example check:`, 'result=', value, 'expected=', exampleExpected)
      );
    }
    handleSolvePromise(solveFn(puzzleFilename), (value) =>
      console.log(`Part${partNum} puzzle result:`, value)
    );
  });
}
