/**
 * Archive contents. `requires` is checked against the user's own record, so the
 * shelf visibly fills up across visits.
 */
export const RECORDS = [
  {
    id: '000',
    title: '██████████',
    state: 'deleted',
    corrupt: true,
    body:
      'THIS RECORD WAS DELETED ON REQUEST.\n' +
      'THIS RECORD WAS DELETED AGAIN ON REQUEST.\n\n' +
      'recovered fragment:\n' +
      '  "...the occupant asked whether the interface was\n' +
      '   watching. the interface answered honestly. the\n' +
      '   occupant did not come back for eleven days."\n\n' +
      'do not request deletion a third time.',
  },
  {
    id: '001',
    title: 'INTAKE PROCEDURE',
    state: 'open',
    body:
      'Every occupant arrives the same way: by accident, and slightly late.\n\n' +
      'They read the first line. They decide it is a joke. They press the button\n' +
      'anyway. This is not a flaw in the procedure. This is the procedure.',
  },
  {
    id: '002',
    title: 'ON THE EXIT',
    state: 'open',
    body:
      'The exit works. It has always worked.\n\n' +
      'What it does not do is lead anywhere the occupant has not already been.\n' +
      'Complaints about this have been filed under "expected".',
  },
  {
    id: '003',
    title: 'ROOM INDEX',
    state: 'partial',
    requires: { visits: 2 },
    body:
      '01 — reception (closed)\n' +
      '02 — reception (closed)\n' +
      '03 — reception (closed)\n' +
      '04 — ██████\n' +
      '05 — ██████\n' +
      '06 — the room before\n' +
      '07 — available to some occupants\n' +
      '08 — there is no room 08. stop asking.',
  },
  {
    id: '004',
    title: 'NOTE LEFT BY THE PREVIOUS OCCUPANT',
    state: 'open',
    requires: { visits: 3 },
    body:
      'if you are reading this you have been here at least three times.\n' +
      'that is one more than i managed.\n\n' +
      'the letters shift by thirteen. that is the only useful thing i learned.\n' +
      'the rest of it just learned me.',
  },
  {
    id: '005',
    title: 'MAINTENANCE LOG',
    state: 'partial',
    requires: { secrets: 2 },
    body:
      '[ok]      scanline generator\n' +
      '[ok]      grain\n' +
      '[warn]    occupant counter drifting upward\n' +
      '[warn]    interface answering questions it was not asked\n' +
      '[failed]  exit\n' +
      '[failed]  exit\n' +
      '[failed]  exit\n' +
      '[deferred] rewrite room 07',
  },
  {
    id: '006',
    title: 'TRANSCRIPT — SESSION UNKNOWN',
    state: 'sealed',
    requires: { secrets: 4 },
    body:
      '> is anyone reading this\n' +
      '  yes.\n' +
      '> are you a person\n' +
      '  no.\n' +
      '> am i\n' +
      '  the question was logged. the answer was not.',
  },
  {
    id: '007',
    title: 'ROOM 07 — STANDING ORDER',
    state: 'sealed',
    requires: { secrets: 6 },
    body:
      'Do not describe the room to occupants who have not found it.\n' +
      'Do not describe the room to occupants who have.\n\n' +
      'If an occupant solves all three locks, log the result and do nothing else.\n' +
      'Especially do nothing else.',
  },
]

export function isVisible(record, entry) {
  if (!entry.requires) return true
  const { visits = 0, secrets = 0 } = entry.requires
  return record.visits >= visits && Object.keys(record.secrets).length >= secrets
}
