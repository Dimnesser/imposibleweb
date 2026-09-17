import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSystem, SCREENS } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { useStillness } from '../../hooks/useObserver.js'
import { Console } from './Console.jsx'
import { Scrambler } from '../common/Scrambler.jsx'
import {
  GLYPHS,
  GLYPH_VECTOR,
  LOCKS,
  LOCK_I_CIPHER,
  ROOM_MESSAGES,
  allLocksSolved,
} from '../../core/room.js'
import { pick } from '../../core/random.js'

/** The countdown resets instead of ending. That is the point of it. */
const CYCLE_MS = 7 * 60 * 1000 + 7 * 1000

function useCycleTimer() {
  const start = useRef(Date.now())
  const [remaining, setRemaining] = useState(CYCLE_MS)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - start.current
      if (elapsed >= CYCLE_MS) {
        start.current = Date.now()
        setCycles((c) => c + 1)
        setRemaining(CYCLE_MS)
      } else {
        setRemaining(CYCLE_MS - elapsed)
      }
    }, 250)
    return () => clearInterval(id)
  }, [])

  const total = Math.floor(remaining / 1000)
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  const cs = String(Math.floor((remaining % 1000) / 10)).padStart(2, '0')
  return { label: `${mm}:${ss}:${cs}`, cycles }
}

function useRoomLog(cycles) {
  const [lines, setLines] = useState(() => ROOM_MESSAGES.slice(0, 4))

  const push = useCallback((text) => {
    setLines((prev) => [...prev, text].slice(-9))
  }, [])

  useEffect(() => {
    const id = setInterval(() => push(pick(ROOM_MESSAGES)), 6500)
    return () => clearInterval(id)
  }, [push])

  useEffect(() => {
    if (cycles > 0) push('the timer restarted. nothing happened.')
  }, [cycles, push])

  return [lines, push]
}

export function Room07() {
  const { record, actions } = useSystem()
  const audio = useAudio()
  const { label, cycles } = useCycleTimer()
  const [lines, push] = useRoomLog(cycles)
  const [armed, setArmed] = useState([])
  const [observerOffered, setObserverOffered] = useState(false)

  const solved = record.room.solved
  const complete = allLocksSolved(solved)

  useEffect(() => {
    if (complete) actions.secret('depth')
  }, [complete, actions])

  // Doing nothing in here for long enough is its own route out.
  useStillness(60_000, () => {
    if (!observerOffered) {
      setObserverOffered(true)
      push('you have stopped moving. that is allowed.')
    }
  })

  const solve = useCallback(
    (id, message) => {
      audio.blip('open')
      actions.solveLock(id)
      push(message)
    },
    [actions, audio, push],
  )

  const fail = useCallback(
    (message) => {
      audio.blip('deny')
      actions.attempt()
      push(message)
    },
    [actions, audio, push],
  )

  const handleText = (lock) => (raw) => {
    if (lock.check(raw, { visits: record.visits })) solve(lock.id, lock.solved)
    else fail(`rejected: "${raw}"`)
  }

  const tapGlyph = (index) => {
    if (solved.includes('vector')) return
    const next = [...armed, index + 1]
    const good = next.every((v, i) => v === GLYPH_VECTOR[i])
    if (!good) {
      setArmed([])
      fail('the sequence collapsed.')
      audio.burst(140)
      return
    }
    audio.blip('ui')
    if (next.length === GLYPH_VECTOR.length) {
      setArmed(next)
      solve('vector', LOCKS[2].solved)
      return
    }
    setArmed(next)
  }

  const progress = useMemo(
    () => `${solved.length} / ${LOCKS.length}`,
    [solved.length],
  )

  return (
    <div className="frame">
      <span className="frame-tag">unlisted room</span>

      <div className="panel-head">
        <Scrambler as="h2" text="ROOM 07" speed={40} />
        <button
          type="button"
          className="btn"
          data-variant="ghost"
          onClick={() => actions.navigate(SCREENS.DASHBOARD)}
        >
          leave the room
        </button>
      </div>

      <div className="room">
        <div className="room-col">
          <div>
            <span className="mono-label">cycle</span>
            <div className="timer">{label}</div>
            <span className="coords">
              07&deg;00&prime;00&Prime;N &nbsp; 000&deg;07&prime;00&Prime;W
            </span>
          </div>

          <div>
            <span className="mono-label">wall</span>
            <div className="cipher">{LOCK_I_CIPHER}</div>
            <span className="coords" style={{ display: 'block', marginTop: 12 }}>
              scratched underneath &nbsp; {GLYPH_VECTOR.join('\u00B7')}
            </span>
          </div>

          <div className="room-log">
            {lines.map((line, i) => (
              <span key={`${line}-${i}`}>{line}</span>
            ))}
          </div>
        </div>

        <div className="room-col">
          {LOCKS.map((lock, i) => {
            const isSolved = solved.includes(lock.id)
            return (
              <div className="lock" key={lock.id} data-solved={String(isSolved)}>
                <div className="lock-title">
                  <span>{lock.title}</span>
                  <span>{isSolved ? 'open' : 'sealed'}</span>
                </div>

                {isSolved ? (
                  <span className="sys">{lock.solved}</span>
                ) : lock.kind === 'text' ? (
                  <>
                    <span className="lock-question">{lock.question}</span>
                    <Console prompt=">" onSubmit={handleText(lock)} />
                  </>
                ) : (
                  <>
                    <span className="lock-question">{lock.question}</span>
                    <div className="glyph-rail">
                      {GLYPHS.map((g, gi) => (
                        <button
                          type="button"
                          key={g}
                          className="glyph"
                          data-armed={String(armed.includes(gi + 1))}
                          aria-label={`glyph ${gi + 1}`}
                          onClick={() => tapGlyph(gi)}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    {armed.length > 0 && (
                      <span className="coords" style={{ display: 'block', marginTop: 10 }}>
                        {armed.length} held
                      </span>
                    )}
                  </>
                )}
                {i === 0 && !isSolved && (
                  <span className="coords" style={{ display: 'block', marginTop: 10 }}>
                    the wall shifts by thirteen
                  </span>
                )}
              </div>
            )
          })}

          <div className="row" style={{ borderBottom: 0 }}>
            <span className="row-key">locks</span>
            <span className="row-val">{progress}</span>
          </div>

          {complete && (
            <button
              type="button"
              className="btn door"
              data-variant="danger"
              onClick={() => {
                audio.burst(420)
                actions.reachEnding('ESCAPED')
              }}
            >
              the door
            </button>
          )}

          {observerOffered && (
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={() => {
                audio.blip('secret')
                actions.reachEnding('OBSERVER')
              }}
            >
              do nothing
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
