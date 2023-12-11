import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 6440 }],
    solveFn: (filename) => sumWinnings(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 5905 }],
    solveFn: (filename) => sumWinnings(filename, true),
  }
);

function parseInput(filename: string) {
  const lines = getInputLines(filename);
  return lines.map((line) => {
    const [hand, bid] = line.split(' ');
    return { hand, bid: parseInt(bid) };
  });
}

function getHandTypesRef() {
  return [
    'Five of a kind',
    'Four of a kind',
    'Full house',
    'Three of a kind',
    'Two pair',
    'One pair',
    'High card',
  ] as const;
}
type HandType = ReturnType<typeof getHandTypesRef>[number];

function getCardsRef(jokersRule?: boolean) {
  return jokersRule
    ? (['A', 'K', 'Q', 'T', '9', '8', '7', '6', '5', '4', '3', '2', 'J'] as const)
    : (['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const);
}
type Card = ReturnType<typeof getCardsRef>[number];

function getHandType(hand: string, jokersRule?: boolean): HandType {
  const handCards = Object.entries(
    hand.split('').reduce((acc, card) => {
      if (!acc[card as Card]) acc[card as Card] = 0;
      acc[card as Card]++;
      return acc;
    }, {} as Record<Card, number>)
  ).sort(([, count1], [, count2]) => count2 - count1);

  const JOKER = jokersRule ? 'J' : '';
  const jokersCount = handCards.find(([card]) => card === JOKER)?.[1] ?? 0;
  const counts = handCards.filter(([card]) => card !== JOKER).map(([, count]) => count);
  const firstCount = (counts.length > 0 ? counts[0] : 0) + jokersCount;
  const secondCount = counts.length > 1 ? counts[1] : 0;

  if (firstCount === 5) return 'Five of a kind';
  if (firstCount === 4) return 'Four of a kind';
  if (firstCount === 3) return secondCount === 2 ? 'Full house' : 'Three of a kind';
  if (firstCount === 2) return secondCount === 2 ? 'Two pair' : 'One pair';
  return 'High card';
}

function sortHandsFn(hand1: string, hand2: string, jokersRule?: boolean) {
  const HAND_TYPES = getHandTypesRef();
  const handTypeIdx1 = HAND_TYPES.indexOf(getHandType(hand1, jokersRule));
  const handTypeIdx2 = HAND_TYPES.indexOf(getHandType(hand2, jokersRule));
  const byHandTypes = Math.sign(handTypeIdx2 - handTypeIdx1);
  if (byHandTypes !== 0) return byHandTypes;

  const CARDS = getCardsRef(jokersRule);
  for (let i = 0; i < 5; i++) {
    const cardIdx1 = CARDS.indexOf(hand1[i] as Card);
    const cardIdx2 = CARDS.indexOf(hand2[i] as Card);
    const byCardLabel = Math.sign(cardIdx2 - cardIdx1);
    if (byCardLabel !== 0) return byCardLabel;
  }

  return 0;
}

function sumWinnings(filename: string, jokersRule?: boolean) {
  const hands = parseInput(filename);
  const sorted = [...hands].sort((a, b) => sortHandsFn(a.hand, b.hand, jokersRule));
  return sorted.reduce((acc, { bid }, idx) => acc + bid * (idx + 1), 0);
}
