export function runDay<T>(
  ...parts: {
    example: { filename: string; expected: T };
    solveFn: (filename: string) => T;
  }[]
) {
  const puzzleFilename = 'puzzle-input.txt';
  parts.forEach(
    ({ solveFn, example: { filename: exampleFilename, expected: exampleExpected } }, idx) => {
      console.log(`*** Part${idx + 1} ***`);
      console.log(
        'Example check:',
        'result=',
        solveFn(exampleFilename),
        'expected=',
        exampleExpected
      );
      console.log('Puzzle result:', solveFn(puzzleFilename));
    }
  );
}
