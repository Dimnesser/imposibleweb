import { registerVisit } from '../core/storage.js'
import { SECRETS } from '../core/secrets.js'
import { allLocksSolved } from '../core/room.js'

export const SCREENS = {
  GATE: 'gate',
  BOOT: 'boot',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  DEEP: 'deep',
  ARCHIVE: 'archive',
  ROOM: 'room',
  ENDING: 'ending',
}

export function initState({ record, sessionId, now }) {
  const visited = registerVisit(record, now)
  const wasTerminated = Boolean(visited.terminated)
  const restored = wasTerminated ? { ...visited, restored: visited.restored + 1, terminated: null } : visited

  return {
    record: restored,
    screen: restored.booted ? SCREENS.GATE : SCREENS.GATE,
    sessionId,
    startedAt: now,
    sessionTime: 0,
    idleTime: 0,
    sessionClicks: {},
    whisper: null,
    toast: null,
    glitch: null,
    exitStage: 0,
    endingId: null,
    restoredFrom: wasTerminated ? visited.terminated : null,
    reduceMotion: false,
    soundReady: false,
  }
}

function bump(map, key) {
  return { ...map, [key]: (map[key] || 0) + 1 }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'enter':
      return { ...state, screen: SCREENS.BOOT }

    case 'booted':
      return {
        ...state,
        screen: SCREENS.DASHBOARD,
        record: { ...state.record, booted: true },
      }

    case 'navigate':
      return { ...state, screen: action.screen }

    case 'press': {
      const id = action.id
      return {
        ...state,
        sessionClicks: bump(state.sessionClicks, id),
        record: { ...state.record, clicks: bump(state.record.clicks, id) },
      }
    }

    case 'exit-press': {
      const record = { ...state.record, exitPresses: state.record.exitPresses + 1 }
      return { ...state, record, exitStage: state.exitStage + 1 }
    }

    case 'key-seen': {
      if (state.record.keys[action.key]) return state
      return { ...state, record: { ...state.record, keys: bump(state.record.keys, action.key) } }
    }

    case 'secret': {
      const id = action.id
      if (state.record.secrets[id]) return state
      const meta = SECRETS[id]
      return {
        ...state,
        record: { ...state.record, secrets: { ...state.record.secrets, [id]: Date.now() } },
        toast: meta ? { id, title: meta.reaction, sub: meta.sub } : state.toast,
      }
    }

    case 'clear-toast':
      return state.toast?.id === action.id || !action.id ? { ...state, toast: null } : state

    case 'whisper':
      return {
        ...state,
        whisper: { id: action.id, text: action.text, at: Date.now() },
        record: {
          ...state.record,
          observations: state.record.observations.includes(action.id)
            ? state.record.observations
            : [...state.record.observations, action.id],
        },
      }

    case 'clear-whisper':
      return { ...state, whisper: null }

    case 'glitch':
      return { ...state, glitch: action.glitch }

    case 'clear-glitch':
      return { ...state, glitch: null }

    case 'tick':
      return {
        ...state,
        sessionTime: state.sessionTime + action.delta,
        idleTime: state.idleTime + action.delta,
        record: { ...state.record, totalTime: state.record.totalTime + action.delta },
      }

    case 'activity':
      return state.idleTime === 0 ? state : { ...state, idleTime: 0 }

    case 'open-room':
      return { ...state, screen: SCREENS.ROOM, record: { ...state.record, room: { ...state.record.room, opened: true } } }

    case 'lock-solved': {
      const room = state.record.room
      if (room.solved.includes(action.lock)) return state
      const solved = [...room.solved, action.lock]
      return {
        ...state,
        record: {
          ...state.record,
          room: { ...room, solved, stage: solved.length },
        },
      }
    }

    case 'attempt':
      return { ...state, record: { ...state.record, attempts: state.record.attempts + 1 } }

    case 'ending': {
      const id = action.id
      return {
        ...state,
        screen: SCREENS.ENDING,
        endingId: id,
        record: {
          ...state.record,
          endings: { ...state.record.endings, [id]: Date.now() },
          terminated: id,
        },
      }
    }

    case 'sound':
      return { ...state, record: { ...state.record, sound: action.on }, soundReady: true }

    case 'reduce-motion':
      return { ...state, reduceMotion: action.on }

    case 'dismiss-restore':
      return { ...state, restoredFrom: null }

    case 'reset':
      return {
        ...initState({ record: action.record, sessionId: state.sessionId, now: Date.now() }),
        screen: SCREENS.GATE,
      }

    default:
      return state
  }
}

export const roomComplete = (record) => allLocksSolved(record.room.solved)
