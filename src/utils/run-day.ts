export function runDay<T>(
  ...parts: {
    example: { filename: string; expected: T };
    solveFn: (filename: string) => T | Promise<T>;
  }[]
) {
  const puzzleFilename = 'puzzle-input.txt';
  const handleSolvePromise = (value: T | Promise<T>, handleValue: (value: T) => void) =>
    value instanceof Promise ? value.then((val) => handleValue(val)) : handleValue(value);
  parts.forEach(
    ({ solveFn, example: { filename: exampleFilename, expected: exampleExpected } }, idx) => {
      console.log(`*** Part${idx + 1} ***`);
      handleSolvePromise(solveFn(exampleFilename), (value) =>
        console.log('Example check:', 'result=', value, 'expected=', exampleExpected)
      );
      handleSolvePromise(solveFn(puzzleFilename), (value) => console.log('Puzzle result:', value));
    }
  );
}
