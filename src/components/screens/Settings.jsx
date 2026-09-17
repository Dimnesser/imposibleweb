import { useState } from 'react'
import { useSystem, SCREENS } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { Console } from './Console.jsx'
import { roomUnlocked } from '../../core/secrets.js'
import { formatDuration } from '../../core/greetings.js'

export function Settings() {
  const { record, actions, reduceMotion } = useSystem()
  const audio = useAudio()
  const [reality, setReality] = useState(100)
  const [log, setLog] = useState('adjustments are recorded, not applied.')
  const [armed, setArmed] = useState(false)

  const dropReality = (v) => {
    setReality(v)
    if (v <= 0) {
      audio.burst(500)
      actions.reachEnding('UNKNOWN')
    }
  }

  const run = (raw, cmd) => {
    audio.blip('ui')
    if (cmd === 'impossible') {
      actions.secret('word')
      setLog('that word is not a command. it is a category.')
      return
    }
    if (cmd === 'help') return setLog('there is no help. there is only the interface.')
    if (cmd === 'who' || cmd === 'whoareyou')
      return setLog('the part of the page that kept running after the rest loaded.')
    if (cmd === 'room' || cmd === 'room07') {
      if (roomUnlocked(record)) return actions.openRoom()
      return setLog('not yet. you are missing things.')
    }
    if (cmd === 'exit') return setLog('use the button. it will disappoint you correctly.')
    if (cmd === 'sound') {
      actions.setSound(!record.sound)
      return setLog(`atmosphere ${record.sound ? 'off' : 'on'}.`)
    }
    if (cmd === 'wipe' || cmd === 'reset' || cmd === 'forgetme') {
      setArmed(true)
      return setLog('confirm below. it will not remember that you asked.')
    }
    setLog(`"${raw}" — unrecognised. logged anyway.`)
  }

  return (
    <div className="frame" data-size="mid">
      <span className="frame-tag">parameters</span>

      <div className="panel-head">
        <h2>Settings</h2>
        <button
          type="button"
          className="btn"
          data-variant="ghost"
          onClick={() => actions.navigate(SCREENS.DASHBOARD)}
        >
          back
        </button>
      </div>

      <div className="rows">
        <div className="row">
          <span className="row-key">atmosphere</span>
          <button
            type="button"
            className="toggle"
            data-on={String(record.sound)}
            aria-label="toggle sound"
            aria-pressed={record.sound}
            onClick={() => {
              const on = !record.sound
              actions.setSound(on)
              if (on) setTimeout(() => audio.blip('open'), 240)
            }}
          />
        </div>

        <div className="row">
          <span className="row-key">motion</span>
          <span className="row-val">{reduceMotion ? 'reduced (system)' : 'full'}</span>
        </div>

        <div className="row">
          <span className="row-key">session visibility</span>
          <span className="row-val">locked by operator</span>
        </div>

        <div className="row">
          <span className="row-key">reality</span>
          <input
            className="slider"
            type="range"
            min="0"
            max="100"
            value={reality}
            aria-label="reality"
            onChange={(e) => dropReality(Number(e.target.value))}
          />
        </div>

        <div className="row">
          <span className="row-key">time on record</span>
          <span className="row-val">{formatDuration(record.totalTime)}</span>
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Console prompt="&gt;" placeholder="type something" onSubmit={run} />
        <span className="sys">{log}</span>
      </div>

      {armed && (
        <div className="actions" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="btn"
            data-variant="danger"
            onClick={() => {
              audio.burst(300)
              actions.reset()
            }}
          >
            erase everything
          </button>
          <button
            type="button"
            className="btn"
            data-variant="ghost"
            onClick={() => {
              setArmed(false)
              setLog('kept.')
            }}
          >
            keep it
          </button>
        </div>
      )}
    </div>
  )
}
