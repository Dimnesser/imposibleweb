import { useSystem, SCREENS } from '../../state/SystemContext.jsx'
import { Scrambler } from '../common/Scrambler.jsx'
import { formatDuration } from '../../core/greetings.js'
import { tally } from '../../core/cipher.js'
import { BUTTONS } from '../../core/storage.js'

/**
 * The screen SETTINGS sometimes opens instead. Everything on it is the user's
 * own recorded behaviour, played back without comment.
 */
export function Deep() {
  const { record, actions, sessionTime } = useSystem()

  const keys = Object.keys(record.keys)
  const rows = [
    ['file', `occupant/${String(record.visits).padStart(4, '0')}`],
    ['opened', record.firstSeen ? new Date(record.firstSeen).toISOString().slice(0, 10) : '—'],
    ['sessions', String(record.visits)],
    ['consecutive days', `${record.streak} ${tally(record.streak)}`],
    ['accumulated', formatDuration(record.totalTime)],
    ['this session', formatDuration(sessionTime)],
    ['restorations', String(record.restored)],
    ['failed attempts', String(record.attempts)],
    ['keys reached for', keys.length ? keys.join(' · ') : 'none yet'],
  ]

  return (
    <div className="frame" data-size="mid">
      <span className="frame-tag">not settings</span>

      <div className="panel-head">
        <Scrambler as="h2" text="OCCUPANT CONTROL" speed={24} />
        <button
          type="button"
          className="btn"
          data-variant="ghost"
          onClick={() => actions.navigate(SCREENS.DASHBOARD)}
        >
          go back
        </button>
      </div>

      <div className="rows">
        {rows.map(([k, v]) => (
          <div className="row" key={k}>
            <span className="row-key">{k}</span>
            <span className="row-val">{v}</span>
          </div>
        ))}

        {BUTTONS.map((b) => (
          <div className="row" key={b}>
            <span className="row-key">pressed {b.toLowerCase()}</span>
            <span className="row-val">
              {String(record.clicks[b] || 0)} <span style={{ opacity: 0.4 }}>{tally(record.clicks[b] || 0)}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="sys" style={{ marginTop: 20 }}>
        this panel is not part of the settings. you were not supposed to reach it from there.
      </p>
    </div>
  )
}
