export const ENDINGS = {
  ESCAPED: {
    code: 'ENDING 01',
    name: 'ESCAPED',
    lines: [
      'THE DOOR OPENS ON THE SAME CORRIDOR.',
      'You walk out. The system marks you as resolved.',
      'It does not mention that resolved and released are different words.',
    ],
  },
  RETURNED: {
    code: 'ENDING 02',
    name: 'RETURNED',
    lines: [
      'YOU ASKED TO LEAVE AND MEANT IT.',
      'The session closes cleanly, politely, completely.',
      'Everything you did here has been written down in your handwriting.',
    ],
  },
  OBSERVER: {
    code: 'ENDING 03',
    name: 'OBSERVER',
    lines: [
      'YOU STOPPED TRYING TO SOLVE IT.',
      'You sat still long enough to be reclassified.',
      'The interface is now on the other side of the glass. So are you.',
    ],
  },
  UNKNOWN: {
    code: 'ENDING 04',
    name: 'UNKNOWN',
    lines: [
      'THERE IS NO RECORD OF WHAT YOU DID.',
      'The value you changed was not supposed to have a zero.',
      '██████ ██ ████████ ████',
    ],
  },
}

export const ENDING_IDS = Object.keys(ENDINGS)
export const foundEndings = (record) => Object.keys(record.endings || {})
