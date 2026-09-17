/**
 * EXIT escalates across the user's whole history, not just this session.
 * Every stage still leaves a way forward — the interface is never a dead end.
 */
export function exitStage(presses) {
  if (presses <= 1) return 'close'      // it genuinely closes the interface
  if (presses === 2) return 'dont'      // the label changes its mind
  if (presses === 3) return 'nice-try'
  if (presses === 4) return 'moved'     // the button relocates
  if (presses === 5) return 'door'
  return 'offer'                        // a real, confirmable termination
}

export function exitLabel(presses) {
  // Once the label changes its mind it does not change it back.
  if (presses >= 6) return 'LEAVE'
  if (presses >= 2) return 'DON’T'
  return 'EXIT'
}

export const EXIT_RESPONSES = {
  close: 'The interface closed. The session did not.',
  dont: 'That button has changed its mind.',
  'nice-try': 'Nice try.',
  moved: 'It moved. You saw it move.',
  door: 'There is no exit. There is a door. They are not the same thing.',
  offer: 'Fine. Confirm it and the session will end properly.',
}

export const CONTINUE_RESPONSES = [
  'Continue what?',
  'You were not in the middle of anything.',
  'Nothing has started yet. Nothing has stopped.',
  'The interface is already continuing. Without you.',
  'Pressing it again will not make it mean something.',
]
