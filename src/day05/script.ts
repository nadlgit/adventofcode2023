import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    examples: [{ filename: exampleFilename, expected: 35 }],
    solveFn: (filename) => findLowestLocation(filename),
  },
  {
    examples: [{ filename: exampleFilename, expected: 46 }],
    solveFn: (filename) => findRangesLowestLocation(filename),
  }
);

type AlmanacMap = { source: number; destination: number; length: number }[];
type Almanac = {
  seeds: number[];
  seedsAsRanges: { start: number; length: number }[];
  seedToSoil: AlmanacMap;
  soilToFertilizer: AlmanacMap;
  fertilizerToWater: AlmanacMap;
  waterToLight: AlmanacMap;
  lightToTemperature: AlmanacMap;
  temperatureToHumidity: AlmanacMap;
  humidityToLocation: AlmanacMap;
};

type Range = [number, number];

function parseAlmanac(filename: string) {
  const parseNumList = (str: string) => str.match(/\d+/g)!.map((n) => parseInt(n));
  const parseMap = (input: string[], section: string) => {
    const startIdx = input.findIndex((line) => line.includes(section));
    const endIdx = input.findIndex((line, idx) => !line && idx > startIdx);
    return input
      .slice(startIdx + 1, endIdx)
      .map((line) => {
        const [destination, source, length] = parseNumList(line);
        return { destination, source, length };
      })
      .sort((a, b) => a.source - b.source);
  };
  const almanac: Almanac = {
    seeds: [],
    seedsAsRanges: [],
    seedToSoil: [],
    soilToFertilizer: [],
    fertilizerToWater: [],
    waterToLight: [],
    lightToTemperature: [],
    temperatureToHumidity: [],
    humidityToLocation: [],
  };
  const lines = getInputLines(filename);
  almanac.seeds = parseNumList(lines[0]);
  almanac.seedsAsRanges = lines[0].match(/\d+\s+\d+/g)!.map((range) => {
    const [start, length] = parseNumList(range);
    return { start, length };
  });
  almanac.seedToSoil = parseMap(lines, 'seed-to-soil');
  almanac.soilToFertilizer = parseMap(lines, 'soil-to-fertilizer');
  almanac.fertilizerToWater = parseMap(lines, 'fertilizer-to-water');
  almanac.waterToLight = parseMap(lines, 'water-to-light');
  almanac.lightToTemperature = parseMap(lines, 'light-to-temperature');
  almanac.temperatureToHumidity = parseMap(lines, 'temperature-to-humidity');
  almanac.humidityToLocation = parseMap(lines, 'humidity-to-location');
  return almanac;
}

function findDestination(sourceNum: number, map: AlmanacMap) {
  const mapping = map.find(
    ({ source, length }) => sourceNum >= source && sourceNum < source + length
  );
  return mapping ? sourceNum + mapping.destination - mapping.source : sourceNum;
}

function findLowestLocation(filename: string) {
  const almanac = parseAlmanac(filename);
  const locations = almanac.seeds.map((seed) => {
    const soil = findDestination(seed, almanac.seedToSoil);
    const fertilizer = findDestination(soil, almanac.soilToFertilizer);
    const water = findDestination(fertilizer, almanac.fertilizerToWater);
    const light = findDestination(water, almanac.waterToLight);
    const temperature = findDestination(light, almanac.lightToTemperature);
    const humidity = findDestination(temperature, almanac.temperatureToHumidity);
    const location = findDestination(humidity, almanac.humidityToLocation);
    return location;
  });
  return Math.min(...locations);
}

function findRangeDestinations([rangeStart, rangeEnd]: Range, map: AlmanacMap) {
  const mappedRanges = map
    .filter(({ source, length }) => source <= rangeEnd && source + length >= rangeStart)
    .map(({ source, destination, length }) => {
      const sourceStart = Math.max(source, rangeStart);
      const sourceEnd = Math.min(source + length, rangeEnd);
      const destinationStart = sourceStart + destination - source;
      return { sourceStart, sourceEnd, destinationStart };
    });
  const allRanges = mappedRanges.length
    ? mappedRanges.reduce((acc, { sourceStart, sourceEnd, destinationStart }, idx) => {
        const prevSourceEnd = acc.length ? acc.slice(-1)[0].sourceEnd : rangeStart;
        if (sourceStart > prevSourceEnd) {
          acc.push({
            sourceStart: prevSourceEnd,
            sourceEnd: sourceStart,
            destinationStart: prevSourceEnd,
          });
        }
        acc.push({ sourceStart, sourceEnd, destinationStart });
        if (idx === mappedRanges.length - 1 && sourceEnd < rangeEnd) {
          acc.push({ sourceStart: sourceEnd, sourceEnd: rangeEnd, destinationStart: sourceEnd });
        }
        return acc;
      }, [] as typeof mappedRanges)
    : [
        {
          sourceStart: rangeStart,
          sourceEnd: rangeEnd,
          destinationStart: rangeStart,
        },
      ];
  const destinationRanges = allRanges.map(
    ({ sourceStart, sourceEnd, destinationStart }) =>
      [destinationStart, destinationStart + sourceEnd - sourceStart] as Range
  );
  return destinationRanges;
}

function findRangesLowestLocation(filename: string) {
  const almanac = parseAlmanac(filename);
  const locationRanges = almanac.seedsAsRanges
    .map(({ start, length }) => [start, start + length] as Range)
    .flatMap((range) => findRangeDestinations(range, almanac.seedToSoil))
    .flatMap((range) => findRangeDestinations(range, almanac.soilToFertilizer))
    .flatMap((range) => findRangeDestinations(range, almanac.fertilizerToWater))
    .flatMap((range) => findRangeDestinations(range, almanac.waterToLight))
    .flatMap((range) => findRangeDestinations(range, almanac.lightToTemperature))
    .flatMap((range) => findRangeDestinations(range, almanac.temperatureToHumidity))
    .flatMap((range) => findRangeDestinations(range, almanac.humidityToLocation));
  return Math.min(...locationRanges.map(([start]) => start));
}
