import { useEffect } from 'react'
import { useSystem } from '../../state/SystemContext.jsx'
import { ENDINGS } from '../../core/endings.js'
import { Scrambler } from '../common/Scrambler.jsx'

const HOLD_MS = 3200

/** Shown once, when a page load follows a terminated session. */
export function Restored() {
  const { actions, restoredFrom } = useSystem()

  useEffect(() => {
    const id = setTimeout(() => actions.dismissRestore(), HOLD_MS)
    return () => clearTimeout(id)
  }, [actions])

  const previous = ENDINGS[restoredFrom]

  return (
    <div className="frame" data-size="narrow">
      <span className="frame-tag">recovery</span>
      <div className="ending">
        <Scrambler as="h2" text="SESSION RESTORED." speed={44} />
        <div className="ending-lines">
          <span>
            {previous
              ? `the previous session ended as ${previous.code} — ${previous.name}.`
              : 'the previous session ended.'}
          </span>
          <span>it has been put back exactly as you left it.</span>
        </div>
      </div>
    </div>
  )
}
