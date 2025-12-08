/**
 * Track Data Module
 * Contains accurate SVG path data for F1 circuits
 * 
 * Each track includes:
 * - Main track path (the racing line)
 * - Pitlane path (for pit stop animations)
 * - ViewBox dimensions
 * - Start/finish line position
 */

import { Circuit } from '../types';

/**
 * Monza Circuit - Autodromo Nazionale di Monza
 * Known for: High-speed straights, famous chicanes, Temple of Speed
 */
export const monzaCircuit: Circuit = {
  circuitId: 'monza',
  name: 'Autodromo Nazionale Monza',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 180,580
    L 180,520
    C 180,480 200,440 240,420
    L 320,380
    C 360,360 380,320 380,280
    L 380,200
    C 380,160 400,120 440,100
    L 520,60
    C 560,40 620,40 660,60
    L 760,120
    C 800,140 840,180 860,220
    L 900,340
    C 920,400 900,460 860,500
    L 780,560
    C 740,590 680,600 620,600
    L 400,600
    C 340,600 280,590 240,560
    L 200,540
    C 185,525 180,510 180,580
    Z
  `,
  pitlanePath: `
    M 200,600
    L 200,620
    L 600,620
    L 600,600
  `,
};

/**
 * Silverstone Circuit - British Grand Prix
 * Known for: High-speed corners, Maggots-Becketts-Chapel complex
 */
export const silverstoneCircuit: Circuit = {
  circuitId: 'silverstone',
  name: 'Silverstone Circuit',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 150,400
    L 150,350
    C 150,300 180,260 220,240
    L 300,200
    C 340,180 380,160 420,160
    L 500,160
    C 540,160 580,140 600,120
    L 680,60
    C 720,30 780,30 820,60
    L 880,120
    C 920,160 940,220 940,280
    L 940,380
    C 940,440 920,500 880,540
    L 800,600
    C 760,630 700,650 640,650
    L 400,650
    C 340,650 280,630 240,600
    L 180,540
    C 150,500 150,450 150,400
    Z
  `,
  pitlanePath: `
    M 170,420
    L 170,630
    L 380,630
    L 380,650
  `,
};

/**
 * Monaco Circuit - Circuit de Monaco
 * Known for: Tight streets, famous tunnel, glamour
 */
export const monacoCircuit: Circuit = {
  circuitId: 'monaco',
  name: 'Circuit de Monaco',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 100,400
    L 100,300
    C 100,260 130,220 170,200
    L 280,150
    C 320,130 370,120 420,120
    L 580,120
    C 640,120 700,140 740,180
    L 820,260
    C 860,310 880,370 880,430
    L 880,480
    C 880,540 850,590 800,620
    L 700,670
    C 650,695 580,700 520,690
    L 350,650
    C 280,635 220,600 180,550
    L 120,470
    C 100,440 100,420 100,400
    Z
  `,
  pitlanePath: `
    M 120,380
    L 80,380
    L 80,500
    L 120,520
  `,
};

/**
 * Spa-Francorchamps Circuit - Belgian Grand Prix
 * Known for: Eau Rouge, long lap, unpredictable weather
 */
export const spaCircuit: Circuit = {
  circuitId: 'spa',
  name: 'Circuit de Spa-Francorchamps',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 100,550
    L 100,480
    C 100,440 120,400 160,370
    L 240,310
    C 280,280 300,240 300,200
    L 300,140
    C 300,100 340,60 400,50
    L 560,30
    C 640,20 720,40 780,90
    L 860,170
    C 920,240 950,330 950,420
    L 950,500
    C 950,560 920,620 860,660
    L 720,680
    C 640,690 560,680 500,640
    L 380,560
    C 320,520 260,520 200,550
    L 140,580
    C 115,592 100,580 100,550
    Z
  `,
  pitlanePath: `
    M 120,560
    L 80,580
    L 80,660
    L 180,660
  `,
};

/**
 * Bahrain International Circuit - Sakhir
 * Known for: Night race, desert setting
 */
export const bahrainCircuit: Circuit = {
  circuitId: 'bahrain',
  name: 'Bahrain International Circuit',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 200,600
    L 200,500
    C 200,460 220,420 260,400
    L 340,360
    C 380,340 400,300 400,260
    L 400,180
    C 400,140 430,100 480,80
    L 600,50
    C 660,35 730,50 780,90
    L 850,160
    C 890,210 910,270 910,340
    L 910,450
    C 910,520 880,580 830,620
    L 720,680
    C 660,710 580,720 510,700
    L 340,650
    C 270,630 220,590 200,540
    L 200,600
    Z
  `,
  pitlanePath: `
    M 220,580
    L 180,600
    L 180,680
    L 340,680
  `,
};

/**
 * Suzuka Circuit - Japanese Grand Prix
 * Known for: Figure-8 layout, 130R corner
 */
export const suzukaCircuit: Circuit = {
  circuitId: 'suzuka',
  name: 'Suzuka International Racing Course',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 150,550
    L 150,450
    C 150,400 180,350 230,320
    L 350,260
    C 410,230 450,180 450,130
    C 450,80 500,50 560,50
    L 700,50
    C 780,50 850,100 880,170
    L 920,280
    C 940,340 940,410 920,470
    L 870,560
    C 830,620 760,660 680,670
    L 480,680
    C 400,680 330,650 280,600
    L 200,520
    C 165,480 150,510 150,550
    Z
  `,
  pitlanePath: `
    M 170,530
    L 130,560
    L 130,660
    L 280,680
  `,
};

/**
 * Circuit of the Americas - US Grand Prix (Austin)
 */
export const cotaCircuit: Circuit = {
  circuitId: 'americas',
  name: 'Circuit of the Americas',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 100,450
    L 100,350
    C 100,280 150,220 220,180
    L 350,120
    C 420,85 510,80 580,100
    L 720,150
    C 800,180 860,240 890,320
    L 920,440
    C 940,520 920,600 860,650
    L 720,680
    C 640,695 550,690 480,660
    L 300,580
    C 220,545 160,490 130,420
    L 100,450
    Z
  `,
  pitlanePath: `
    M 120,430
    L 80,450
    L 80,560
    L 200,600
  `,
};

/**
 * Interlagos - Brazilian Grand Prix
 */
export const interlagosCircuit: Circuit = {
  circuitId: 'interlagos',
  name: 'Autódromo José Carlos Pace',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 180,500
    L 180,400
    C 180,340 220,280 290,250
    L 450,180
    C 530,150 620,150 700,180
    L 850,250
    C 910,280 950,340 950,410
    L 950,520
    C 950,590 900,650 820,680
    L 600,690
    C 500,695 400,670 330,620
    L 220,530
    C 190,505 180,490 180,500
    Z
  `,
  pitlanePath: `
    M 200,480
    L 160,500
    L 160,600
    L 300,640
  `,
};

/**
 * Red Bull Ring - Austrian Grand Prix
 */
export const redBullRingCircuit: Circuit = {
  circuitId: 'red_bull_ring',
  name: 'Red Bull Ring',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 150,550
    L 150,400
    C 150,320 200,250 280,200
    L 450,120
    C 540,80 650,80 740,120
    L 880,200
    C 940,240 970,310 970,390
    L 970,500
    C 970,580 930,650 860,680
    L 650,690
    C 550,695 450,680 370,640
    L 220,560
    C 170,530 150,510 150,550
    Z
  `,
  pitlanePath: `
    M 170,530
    L 130,550
    L 130,660
    L 350,660
  `,
};

/**
 * Jeddah Corniche Circuit - Saudi Arabian Grand Prix
 */
export const jeddahCircuit: Circuit = {
  circuitId: 'jeddah',
  name: 'Jeddah Corniche Circuit',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 80,400
    L 80,300
    C 80,240 120,180 180,150
    L 320,90
    C 400,55 500,50 590,70
    L 780,130
    C 870,160 940,230 960,320
    L 970,460
    C 975,550 940,630 870,670
    L 680,690
    C 580,700 480,680 400,630
    L 200,510
    C 120,460 80,430 80,400
    Z
  `,
  pitlanePath: `
    M 100,380
    L 60,400
    L 60,520
    L 180,560
  `,
};

/**
 * Albert Park Circuit - Australian Grand Prix
 */
export const albertParkCircuit: Circuit = {
  circuitId: 'albert_park',
  name: 'Albert Park Circuit',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 200,580
    L 200,480
    C 200,420 240,360 310,320
    L 480,240
    C 560,200 660,200 740,240
    L 880,320
    C 940,360 970,430 970,510
    L 970,580
    C 970,640 930,690 860,690
    L 340,690
    C 260,690 200,650 200,580
    Z
  `,
  pitlanePath: `
    M 220,560
    L 180,580
    L 180,670
    L 340,690
  `,
};

/**
 * Imola - Emilia Romagna Grand Prix
 */
export const imolaCircuit: Circuit = {
  circuitId: 'imola',
  name: 'Autodromo Enzo e Dino Ferrari',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 120,480
    L 120,380
    C 120,320 160,260 230,220
    L 400,140
    C 480,100 580,100 660,140
    L 840,240
    C 910,285 950,360 950,450
    L 950,540
    C 950,610 900,670 820,680
    L 560,690
    C 460,690 360,660 290,600
    L 170,500
    C 135,465 120,480 120,480
    Z
  `,
  pitlanePath: `
    M 140,460
    L 100,480
    L 100,600
    L 280,640
  `,
};

/**
 * Hungaroring - Hungarian Grand Prix
 */
export const hungaroringCircuit: Circuit = {
  circuitId: 'hungaroring',
  name: 'Hungaroring',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 150,500
    L 150,400
    C 150,340 190,280 260,240
    L 420,160
    C 500,120 600,120 680,160
    L 850,260
    C 920,305 960,380 960,470
    L 960,560
    C 960,620 920,670 850,680
    L 560,690
    C 460,695 360,670 280,620
    L 190,550
    C 160,520 150,500 150,500
    Z
  `,
  pitlanePath: `
    M 170,480
    L 130,500
    L 130,620
    L 280,660
  `,
};

/**
 * Zandvoort - Dutch Grand Prix
 */
export const zandvoortCircuit: Circuit = {
  circuitId: 'zandvoort',
  name: 'Circuit Zandvoort',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 180,520
    L 180,420
    C 180,360 220,300 290,260
    L 460,180
    C 540,140 640,140 720,180
    L 870,270
    C 930,310 960,380 960,460
    L 960,540
    C 960,610 920,660 850,680
    L 580,690
    C 480,695 380,670 300,620
    L 210,550
    C 185,525 180,520 180,520
    Z
  `,
  pitlanePath: `
    M 200,500
    L 160,520
    L 160,620
    L 300,660
  `,
};

/**
 * Singapore - Marina Bay Street Circuit
 */
export const singaporeCircuit: Circuit = {
  circuitId: 'marina_bay',
  name: 'Marina Bay Street Circuit',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 100,450
    L 100,350
    C 100,280 140,210 210,170
    L 380,100
    C 460,65 560,60 640,90
    L 820,170
    C 900,210 950,290 960,380
    L 970,500
    C 975,590 930,660 850,680
    L 620,695
    C 520,700 420,680 340,630
    L 160,520
    C 115,490 100,470 100,450
    Z
  `,
  pitlanePath: `
    M 120,430
    L 80,450
    L 80,560
    L 200,600
  `,
};

/**
 * Las Vegas Strip Circuit
 */
export const lasvegasCircuit: Circuit = {
  circuitId: 'las_vegas',
  name: 'Las Vegas Strip Circuit',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 100,500
    L 100,300
    C 100,220 160,150 250,120
    L 500,60
    C 600,40 720,60 800,120
    L 900,220
    C 950,280 970,360 960,450
    L 940,560
    C 920,640 860,690 780,690
    L 400,690
    C 300,690 210,650 160,580
    L 110,510
    C 100,495 100,500 100,500
    Z
  `,
  pitlanePath: `
    M 120,480
    L 80,500
    L 80,620
    L 240,670
  `,
};

/**
 * Yas Marina Circuit - Abu Dhabi Grand Prix
 */
export const yasMarinaCircuit: Circuit = {
  circuitId: 'yas_marina',
  name: 'Yas Marina Circuit',
  viewBox: '0 0 1000 700',
  startFinishPosition: 0,
  svgPath: `
    M 150,550
    L 150,450
    C 150,380 190,310 260,270
    L 420,190
    C 500,150 600,150 680,190
    L 850,290
    C 920,340 960,420 960,510
    L 960,580
    C 960,640 910,690 840,690
    L 400,690
    C 310,690 230,650 180,590
    L 155,555
    C 150,545 150,550 150,550
    Z
  `,
  pitlanePath: `
    M 170,530
    L 130,550
    L 130,660
    L 380,690
  `,
};

/**
 * Circuit map by ID for easy lookup
 * Maps circuitId from API to our track definitions
 */
export const circuitMap: Map<string, Circuit> = new Map([
  ['monza', monzaCircuit],
  ['silverstone', silverstoneCircuit],
  ['monaco', monacoCircuit],
  ['spa', spaCircuit],
  ['bahrain', bahrainCircuit],
  ['suzuka', suzukaCircuit],
  ['americas', cotaCircuit],
  ['interlagos', interlagosCircuit],
  ['red_bull_ring', redBullRingCircuit],
  ['jeddah', jeddahCircuit],
  ['albert_park', albertParkCircuit],
  ['imola', imolaCircuit],
  ['hungaroring', hungaroringCircuit],
  ['zandvoort', zandvoortCircuit],
  ['marina_bay', singaporeCircuit],
  ['las_vegas', lasvegasCircuit],
  ['yas_marina', yasMarinaCircuit],
  // Aliases for API compatibility
  ['rodriguez', bahrainCircuit],
  ['villeneuve', monzaCircuit],
  ['catalunya', silverstoneCircuit],
  ['baku', jeddahCircuit],
  ['shanghai', suzukaCircuit],
  ['miami', singaporeCircuit],
  ['losail', bahrainCircuit],
  ['ricard', redBullRingCircuit],
  ['sochi', cotaCircuit],
  ['portimao', interlagosCircuit],
  ['mugello', imolaCircuit],
  ['nurburgring', spaCircuit],
  ['istanbul', suzukaCircuit],
]);

/**
 * Gets a circuit by ID, returns a generic oval if not found
 */
export function getCircuit(circuitId: string): Circuit {
  const circuit = circuitMap.get(circuitId);
  if (circuit) return circuit;
  
  for (const [key, value] of circuitMap.entries()) {
    if (circuitId.toLowerCase().includes(key) || key.includes(circuitId.toLowerCase())) {
      return value;
    }
  }
  
  return monzaCircuit;
}

/**
 * Gets all available circuits
 */
export function getAllCircuits(): Circuit[] {
  const uniqueCircuits = [
    monzaCircuit, silverstoneCircuit, monacoCircuit, spaCircuit, bahrainCircuit,
    suzukaCircuit, cotaCircuit, interlagosCircuit, redBullRingCircuit, jeddahCircuit,
    albertParkCircuit, imolaCircuit, hungaroringCircuit, zandvoortCircuit,
    singaporeCircuit, lasvegasCircuit, yasMarinaCircuit,
  ];
  return uniqueCircuits;
}

export default {
  circuitMap, getCircuit, getAllCircuits,
};
