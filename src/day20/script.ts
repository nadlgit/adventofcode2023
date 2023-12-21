import { getInputLines, runDay } from '../utils';

const exampleFilename = {
  part1Exple1: 'example-input1.txt',
  part1Exple2: 'example-input2.txt',
};

runDay(
  {
    examples: [
      { filename: exampleFilename.part1Exple1, expected: 32000000 },
      { filename: exampleFilename.part1Exple2, expected: 11687500 },
    ],
    solveFn: (filename) => multiplyFinalPulses(filename),
  },
  {
    examples: [],
    solveFn: (filename) => findRxTriggerPressCount(filename),
  }
);

type Pulse = 'low' | 'high';

type BroadcastModule = {
  name: 'broadcaster';
  destination: string[];
  type: 'broadcast';
};
type FlipFlopModule = {
  name: string;
  destination: string[];
  type: 'flipflop';
  state: 'on' | 'off';
};
type ConjonctionModule = {
  name: string;
  destination: string[];
  type: 'conjonction';
  inputs: { name: string; prevPulse: Pulse }[];
};
type Module = BroadcastModule | FlipFlopModule | ConjonctionModule;

function parseInput(filename: string) {
  const lines = getInputLines(filename);
  const conjonctionModules: ConjonctionModule[] = [];
  const modules: Module[] = lines.map((line) => {
    const [type, name, destList] = line.match(/([%&]{0,1})(\w+)\s->\s(.+)/)!.slice(1);
    const destination = destList.match(/(\w+)/g)!;
    let module: Module;
    if (name === 'broadcaster') {
      module = { name, destination, type: 'broadcast' };
    }
    if (type === '%') {
      module = { name, destination, type: 'flipflop', state: 'off' };
    }
    if (type === '&') {
      module = { name, destination, type: 'conjonction', inputs: [] };
      conjonctionModules.push(module);
    }
    return module!;
  });
  for (const module of conjonctionModules) {
    module.inputs = modules
      .filter(({ destination }) => destination.includes(module.name))
      .map(({ name }) => ({ name, prevPulse: 'low' }));
  }
  return modules;
}

function pressButton(
  modules: Module[],
  outputToCheck: { moduleName: string; pulse: Pulse }[] = []
) {
  const pulseCount: Record<Pulse, number> = { low: 0, high: 0 };
  const outputTriggered = new Set<(typeof outputToCheck)[number]>();
  const queue: { srcModule: string; destModule: string; pulse: Pulse }[] = [
    { srcModule: '', destModule: 'broadcaster', pulse: 'low' },
  ];
  while (queue.length > 0) {
    const { srcModule, destModule, pulse } = queue.shift()!;
    pulseCount[pulse]++;
    const module = modules.find(({ name }) => name === destModule);
    if (!module) {
      continue;
    }

    let moduleOutput: Pulse | null = null;
    if (module.type === 'broadcast') {
      moduleOutput = pulse;
    }
    if (module.type === 'flipflop' && pulse === 'low') {
      module.state = module.state === 'off' ? 'on' : 'off';
      moduleOutput = module.state === 'on' ? 'high' : 'low';
    }
    if (module.type === 'conjonction') {
      module.inputs.find(({ name }) => name === srcModule)!.prevPulse = pulse;
      moduleOutput = module.inputs.every(({ prevPulse }) => prevPulse === 'high') ? 'low' : 'high';
    }
    if (moduleOutput) {
      for (const dest of module.destination) {
        queue.push({ srcModule: destModule, destModule: dest, pulse: moduleOutput });
      }
      const check = outputToCheck.find(
        ({ moduleName, pulse }) => moduleName === destModule && pulse === moduleOutput
      );
      if (check) {
        outputTriggered.add(check);
      }
    }
  }
  return { ...pulseCount, outputTriggered };
}

function multiplyFinalPulses(filename: string) {
  const moduleConfiguration = parseInput(filename);
  let lowPulseCount = 0;
  let highPulseCount = 0;
  for (let i = 0; i < 1000; i++) {
    const { low, high } = pressButton(moduleConfiguration);
    lowPulseCount += low;
    highPulseCount += high;
  }
  return lowPulseCount * highPulseCount;
}

function findRxTriggerPressCount(filename: string) {
  // In my personal input rx predecessors are: rx <- dt <- dl, ks, pm, vk
  // dt, dl, ks, pm, vk are all conjonctions modules
  // dl, ks, pm, vk each have only 1 conjonction module as predecessor: ts, vr, pf, xd
  // So we need to output a low pulse from ts, vr, pf, xd at same time
  const moduleConfiguration = parseInput(filename);
  const outputToCheck: { moduleName: string; pulse: Pulse }[] = [
    { moduleName: 'ts', pulse: 'low' },
    { moduleName: 'vr', pulse: 'low' },
    { moduleName: 'pf', pulse: 'low' },
    { moduleName: 'xd', pulse: 'low' },
  ];
  const outputMinPressCount: Record<string, number> = {};
  let pressCount = 0;
  while (Object.keys(outputMinPressCount).length < outputToCheck.length) {
    pressCount++;
    const { outputTriggered } = pressButton(moduleConfiguration, outputToCheck);
    for (const { moduleName } of outputTriggered) {
      if (!outputMinPressCount[moduleName]) {
        outputMinPressCount[moduleName] = pressCount;
      }
    }
  }
  return Object.values(outputMinPressCount).reduce((acc, count) => acc * count, 1);
}
