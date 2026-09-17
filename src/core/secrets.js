/**
 * The registry of discoverable things. `reaction` is the only part the user
 * ever sees; nothing here is listed in the interface.
 */

export const SECRETS = {
  konami: {
    label: 'SEQUENCE',
    reaction: 'YOU FOUND SOMETHING.',
    sub: 'that pattern is older than this system.',
  },
  word: {
    label: 'THE WORD',
    reaction: 'DO NOT SAY THAT AGAIN.',
    sub: 'it hears better than it listens.',
  },
  inspect: {
    label: 'LOOKING INSIDE',
    reaction: 'THIS WASN’T SUPPOSED TO BE VISIBLE.',
    sub: 'there is nothing in there. keep telling yourself that.',
  },
  dot: {
    label: 'THE DOT',
    reaction: 'YOU WERE NOT SUPPOSED TO SEE THAT.',
    sub: 'it has been there since the first visit.',
  },
  stillness: {
    label: 'STILLNESS',
    reaction: 'THANK YOU FOR HOLDING STILL.',
    sub: 'it is easier to measure you this way.',
  },
  persistence: {
    label: 'PERSISTENCE',
    reaction: 'THE DOOR IS NOT THE PROBLEM.',
    sub: 'you have tried that six times now.',
  },
  ritual: {
    label: 'RITUAL',
    reaction: 'YOU KEEP COMING BACK ON SCHEDULE.',
    sub: 'that is how habits become instructions.',
  },
  archive: {
    label: 'RECORD 000',
    reaction: 'THAT FILE WAS DELETED.',
    sub: 'twice, apparently.',
  },
  depth: {
    label: 'DEPTH',
    reaction: 'ROOM 07 IS NOT THE LAST ROOM.',
    sub: 'it is simply the last one with a number.',
  },
}

export const SECRET_IDS = Object.keys(SECRETS)
export const TOTAL_SECRETS = SECRET_IDS.length

/** ROOM 07 becomes reachable at this many discoveries. */
export const ROOM_THRESHOLD = 4

export const countSecrets = (record) => Object.keys(record.secrets || {}).length
export const hasSecret = (record, id) => Boolean(record.secrets?.[id])
export const roomUnlocked = (record) =>
  record.room?.opened || countSecrets(record) >= ROOM_THRESHOLD
