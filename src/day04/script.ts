import { getInputReadlineInterface, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    example: { filename: exampleFilename, expected: 13 },
    solveFn: (filename) => sumWinningPoints(filename),
  },
  {
    example: { filename: exampleFilename, expected: 30 },
    solveFn: (filename) => countFinalCards(filename),
  }
);

type Card = {
  id: number;
  playerList: number[];
  winningList: number[];
};

async function parseCards(filename: string) {
  const cards: Card[] = [];
  const rl = getInputReadlineInterface(filename);
  for await (const line of rl) {
    const lineParts = line.replace('Card', '').split(':');
    const id = parseInt(lineParts[0].trim());
    const [playerList, winningList] = lineParts[1]
      .split('|')
      .map((list) => list.match(/\d+/g)!.map((num) => parseInt(num)));
    cards.push({ id, playerList, winningList });
  }
  return cards;
}

const getWinningNumbers = ({ playerList, winningList }: Card) =>
  playerList.filter((num) => winningList.includes(num));

async function sumWinningPoints(filename: string) {
  const cards = await parseCards(filename);
  return cards.reduce((acc, card) => {
    const matching = getWinningNumbers(card);
    return acc + (matching.length ? 2 ** (matching.length - 1) : 0);
  }, 0);
}

async function countFinalCards(filename: string) {
  const cards = await parseCards(filename);
  const cardStock = Object.fromEntries(cards.map(({ id }) => [id, 1]));
  cards.forEach((card) => {
    const matching = getWinningNumbers(card);
    for (let i = card.id + 1; i <= Math.min(card.id + matching.length, cards.length); i++)
      cardStock[i] += cardStock[card.id];
  });
  return Object.values(cardStock).reduce((acc, n) => acc + n, 0);
}
