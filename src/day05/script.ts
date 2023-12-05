import { getInputLines, runDay } from '../utils';

const exampleFilename = 'example-input.txt';

runDay(
  {
    example: { filename: exampleFilename, expected: 35 },
    solveFn: (filename) => findLowestLocation(filename),
  }
  // {
  //   example: { filename: exampleFilename, expected: null },
  //   solveFn: (filename) => null,
  // }
);

type AlmanacMap = { source: number; destination: number; length: number }[];
type Almanac = {
  seeds: number[];
  seedToSoil: AlmanacMap;
  soilToFertilizer: AlmanacMap;
  fertilizerToWater: AlmanacMap;
  waterToLight: AlmanacMap;
  lightToTemperature: AlmanacMap;
  temperatureToHumidity: AlmanacMap;
  humidityToLocation: AlmanacMap;
};

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
  if (mapping) {
    return mapping.destination + sourceNum - mapping.source;
  }
  return sourceNum;
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
