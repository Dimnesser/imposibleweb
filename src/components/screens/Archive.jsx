import { useState } from 'react'
import { useSystem, SCREENS } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { RECORDS, isVisible } from '../../core/archive.js'

export function Archive() {
  const { record, actions } = useSystem()
  const audio = useAudio()
  const [open, setOpen] = useState(null)

  const visible = RECORDS.filter((r) => isVisible(record, r))
  const hidden = RECORDS.length - visible.length

  const toggle = (entry) => {
    const next = open === entry.id ? null : entry.id
    setOpen(next)
    audio.blip(entry.corrupt ? 'deny' : 'ui')
    if (next && entry.corrupt) actions.secret('archive')
  }

  return (
    <div className="frame" data-size="mid">
      <span className="frame-tag">records</span>

      <div className="panel-head">
        <h2>Archive</h2>
        <button
          type="button"
          className="btn"
          data-variant="ghost"
          onClick={() => actions.navigate(SCREENS.DASHBOARD)}
        >
          back
        </button>
      </div>

      <div className="records">
        {visible.map((entry) => (
          <div key={entry.id}>
            <button
              type="button"
              className="record"
              data-corrupt={String(Boolean(entry.corrupt))}
              aria-expanded={open === entry.id}
              onClick={() => toggle(entry)}
            >
              <span className="record-id">REC {entry.id}</span>
              <span className="record-title">{entry.title}</span>
              <span className="record-state">{entry.state}</span>
            </button>
            {open === entry.id && <div className="record-body">{entry.body}</div>}
          </div>
        ))}
      </div>

      <p className="sys" style={{ marginTop: 18 }}>
        {hidden > 0
          ? `${hidden} record${hidden === 1 ? '' : 's'} withheld from this occupant.`
          : 'the shelf is empty behind this one.'}
      </p>
    </div>
  )
}
