/**
 * Persistence layer. Everything the system "remembers" about the user lives
 * here. Reads are defensive: a corrupted or partial record must never prevent
 * the interface from booting.
 */

const KEY = 'impossible.sys'
const VERSION = 1

export const BUTTONS = ['CONTINUE', 'SETTINGS', 'ARCHIVE', 'EXIT']

export function blankRecord() {
  return {
    version: VERSION,
    firstSeen: null,
    lastSeen: null,
    visits: 0,
    days: [], // unique ISO dates, newest last
    streak: 0,
    longestStreak: 0,
    totalTime: 0, // ms accumulated across every session
    clicks: {}, // buttonId -> count, lifetime
    keys: {}, // notable key names the user has pressed
    secrets: {}, // secretId -> timestamp discovered
    endings: {}, // endingId -> timestamp reached
    observations: [], // ids of watcher lines already delivered
    room: { stage: 0, solved: [], opened: false },
    attempts: 0, // failed puzzle / lock attempts
    exitPresses: 0,
    terminated: null, // endingId of the last termination, if any
    restored: 0, // how many times a terminated session was restored
    sound: false,
    booted: false, // has the user ever completed the boot sequence
  }
}

function todayISO(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10)
}

function daysBetween(aISO, bISO) {
  const a = Date.parse(`${aISO}T00:00:00Z`)
  const b = Date.parse(`${bISO}T00:00:00Z`)
  return Math.round((b - a) / 86400000)
}

/** Merge an unknown blob into the current shape without trusting any of it. */
function reconcile(raw) {
  const base = blankRecord()
  if (!raw || typeof raw !== 'object') return base
  const out = { ...base, ...raw, version: VERSION }
  out.clicks = { ...(raw.clicks || {}) }
  out.keys = { ...(raw.keys || {}) }
  out.secrets = { ...(raw.secrets || {}) }
  out.endings = { ...(raw.endings || {}) }
  out.days = Array.isArray(raw.days) ? raw.days.filter((d) => typeof d === 'string') : []
  out.observations = Array.isArray(raw.observations) ? raw.observations : []
  out.room = { ...base.room, ...(raw.room || {}) }
  out.room.solved = Array.isArray(out.room.solved) ? out.room.solved : []
  for (const n of ['visits', 'streak', 'longestStreak', 'totalTime', 'attempts', 'exitPresses', 'restored']) {
    out[n] = Number.isFinite(out[n]) ? out[n] : 0
  }
  out.sound = out.sound === true
  out.booted = out.booted === true
  return out
}

export function loadRecord() {
  try {
    return reconcile(JSON.parse(localStorage.getItem(KEY)))
  } catch {
    return blankRecord()
  }
}

export function saveRecord(record) {
  try {
    localStorage.setItem(KEY, JSON.stringify(record))
    return true
  } catch {
    // Private mode / quota. The session still runs, it just won't be remembered.
    return false
  }
}

export function wipeRecord() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to do */
  }
}

/**
 * Called once per page load. Increments the visit counter and folds today's
 * date into the day-streak history.
 */
export function registerVisit(record, now = Date.now()) {
  const today = todayISO(now)
  const next = { ...record, days: [...record.days] }
  next.visits += 1
  next.lastSeen = now
  if (!next.firstSeen) next.firstSeen = now

  const last = next.days[next.days.length - 1]
  if (last !== today) {
    const gap = last ? daysBetween(last, today) : null
    next.streak = gap === 1 ? next.streak + 1 : 1
    next.days.push(today)
    if (next.days.length > 60) next.days = next.days.slice(-60)
  } else if (next.streak === 0) {
    next.streak = 1
  }
  next.longestStreak = Math.max(next.longestStreak, next.streak)
  return next
}

/** Hours since the previous session, or null on a first visit. */
export function hoursAway(record, now = Date.now()) {
  if (!record.lastSeen) return null
  return (now - record.lastSeen) / 3600000
}
