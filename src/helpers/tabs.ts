import {
  getTypeFromAbbrev
} from './abbreviations'
import {
  convertPitchToTone, pitchDifference
} from './pitchTones'
import { IChordParams } from '../components/calculator/chord/Chord'
import * as dictionary from '../models/dictionary.json'
const dict = dictionary as IChordDict;

interface IChordData {
  "shape": any,
  "type": any,
  "option": any,
  "fret-6": number | 'X',
  "fret-5": number | 'X',
  "fret-4": number | 'X',
  "fret-3": number | 'X',
  "fret-2": number | 'X',
  "fret-1": number | 'X',
  "tone-6": number | 'X',
  "tone-5": number | 'X',
  "tone-4": number | 'X',
  "tone-3": number | 'X',
  "tone-2": number | 'X',
  "tone-1": number | 'X',
};

interface IShapeOptions {
  "C"?: IChordData[],
  "A"?: IChordData[],
  "G"?: IChordData[],
  "E"?: IChordData[],
  "D"?: IChordData[]
}
type Shape = keyof IShapeOptions;
const shapes: Shape[] = ["C", "A", "G", "E", "D"];

export interface IChordDict {
  "6"?: IShapeOptions,
  "69"?: IShapeOptions,
  "7#9"?: IShapeOptions,
  "7b9"?: IShapeOptions,
  "diminished"?: IShapeOptions,
  "dominate 7th"?: IShapeOptions,
  "dominate 9th"?: IShapeOptions,
  "half diminished"?: IShapeOptions,
  "major"?: IShapeOptions,
  "major 7th"?: IShapeOptions,
  "minor"?: IShapeOptions,
  "minor 7th"?: IShapeOptions,
  "minor 9th"?: IShapeOptions,
}
export type Type = keyof IChordDict;

export interface ITabStringValue {
  "fret": number | '',
  "tone": number | '',
}

export interface IChordTab {
  "e": ITabStringValue
  "B": ITabStringValue
  "G": ITabStringValue
  "D": ITabStringValue
  "A": ITabStringValue
  "E": ITabStringValue
}
export type TabKey = keyof IChordTab;
const tabKeys: TabKey[] = ['E', 'A', 'D', 'G', 'B', 'e'];

function filterChordsByShape(shapeOptionsArray: IShapeOptions[], shape: string): IChordData[] {
  let chordArray: IChordData[] = [];
  for (let shapeOptions of shapeOptionsArray) {
    if (
      shape === "C" ||
      shape === "A" ||
      shape === "G" ||
      shape === "E" ||
      shape === "D"
    ) {
      const chords = shapeOptions[shape];
      if (chords) {
        chordArray.push(...chords);
      }
    } else if (shape  === '') {
      // todo add logic to search in lowest shape first
      for (let shape of shapes) {
        const chords = shapeOptions[shape];
        if (chords) {
          chordArray.push(...chords);
        }
      }
    }
  }
  return chordArray;
}

function convertChordsToTab(chords: IChordData[], root: string): IChordTab[] {
  function getTabValue(input: number | 'X', offset?: number | undefined): (number | '') {
    if (input === 'X') return '';
    if (offset) return input + offset;
    return input;
  }

  return chords.map((chord) => {
    const offset = pitchDifference(chord.shape, root);
    return {
      "e": {
        'fret': getTabValue(chord['fret-6'], offset),
        'tone': getTabValue(chord['tone-6'])
      },
      "B": {
        'fret': getTabValue(chord['fret-5'], offset),
        'tone': getTabValue(chord['tone-5'])
      },
      "G": {
        'fret': getTabValue(chord['fret-4'], offset),
        'tone': getTabValue(chord['tone-4'])
      },
      "D": {
        'fret': getTabValue(chord['fret-3'], offset),
        'tone': getTabValue(chord['tone-3'])
      },
      "A": {
        'fret': getTabValue(chord['fret-2'], offset),
        'tone': getTabValue(chord['tone-2'])
      },
      "E": {
        'fret': getTabValue(chord['fret-1'], offset),
        'tone': getTabValue(chord['tone-1'])
      },
    };
  })
}

function getMinFretValue(chord: IChordTab): number | undefined {
  let min: number | undefined;
  for (let key of tabKeys) {
    const fretValue = chord[key].fret;
    if (
      typeof fretValue === 'number' &&
      (min === undefined || fretValue < min)
    ) {
      min = fretValue;
    }
  }
  return min;
}

function updateChordsWithPosition(chordArray: IChordTab[], position: string): IChordTab[] {
  let numPos: number = parseInt(position);
  if (isNaN(numPos)) numPos = 0;

  return chordArray.map((chord) => {
    let minFret = getMinFretValue(chord);
    if (typeof minFret !== 'number') return chord;

    while (minFret < numPos) {
      for (let s of tabKeys) {
        const f = chord[s].fret;
        if (typeof f === 'number') {
          chord[s].fret = f + 12;
        }
      }
      minFret = getMinFretValue(chord);
      if (typeof minFret !== 'number') return chord;
    }
    return chord;
  })
}

function sortChordsByLowest(chordArray: IChordTab[]): IChordTab[] {
  return chordArray.sort((a: IChordTab, b: IChordTab) => {
    const minA = getMinFretValue(a);
    const minB = getMinFretValue(b);
    if (
      minA === undefined || 
      minB === undefined
      ) return 0;
    return minA - minB;
  });
}

export function generateTabs(data: IChordParams): IChordTab {
  const {
    root,
    type: abbrev,
    shape,
    position,
    option
  } = data;

  const emptyTab: IChordTab = {
    "e": {
      fret: '',
      tone: ''
    },
    "B": {
      fret: '',
      tone: ''
    },
    "G": {
      fret: '',
      tone: ''
    },
    "D": {
      fret: '',
      tone: ''
    },
    "A": {
      fret: '',
      tone: ''
    },
    "E": {
      fret: '',
      tone: ''
    },
  }

  const tone = convertPitchToTone(root);
  const type = getTypeFromAbbrev(abbrev);
  if (!tone || !type) {
    return emptyTab;
  }
  
  const shapeOptionsArray: IShapeOptions[] = [];
  const shapeOptions = dict[type];
  if (shapeOptions) {
    shapeOptionsArray.push(shapeOptions);
  }

  const chordArray: IChordData[] = filterChordsByShape(shapeOptionsArray, shape);
  if (!chordArray.length) {
    return emptyTab;
  }

  let tabArray: IChordTab[] = convertChordsToTab(chordArray, root);
  tabArray = updateChordsWithPosition(tabArray, position);
  tabArray = sortChordsByLowest(tabArray);

  // for (let tab of tabArray) {
  //   console.log({
  //     tab,
  //     min: getMinFretValue(tab)
  //   })
  // }

  const index: number = option % tabArray.length;
  return tabArray[index];
}