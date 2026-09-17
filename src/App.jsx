import { useEffect } from 'react'
import { SCREENS, useSystem } from './state/SystemContext.jsx'
import { useAudio } from './hooks/useAudio.jsx'
import {
  useInspectCombo,
  useKeyJournal,
  useKonami,
  useTypedWord,
} from './hooks/useSequences.js'
import { useGlitchEngine } from './hooks/useGlitchEngine.js'
import { useObserver, useStillness } from './hooks/useObserver.js'
import { Effects } from './components/overlay/Effects.jsx'
import { Whisper } from './components/overlay/Whisper.jsx'
import { SecretToast } from './components/overlay/SecretToast.jsx'
import { Gate } from './components/gate/Gate.jsx'
import { BootSequence } from './components/gate/BootSequence.jsx'
import { Dashboard } from './components/dashboard/Dashboard.jsx'
import { Settings } from './components/screens/Settings.jsx'
import { Deep } from './components/screens/Deep.jsx'
import { Archive } from './components/screens/Archive.jsx'
import { Room07 } from './components/screens/Room07.jsx'
import { Ending } from './components/screens/Ending.jsx'
import { Restored } from './components/screens/Restored.jsx'

/** The day-streak reward is granted on arrival, not on any interaction. */
function useRitual() {
  const { record, actions } = useSystem()
  useEffect(() => {
    if (record.streak >= 3) actions.secret('ritual')
  }, [record.streak, actions])
}

function useDetectors(inside) {
  const { actions } = useSystem()

  useKonami(() => actions.secret('konami'))
  useTypedWord('impossible', () => actions.secret('word'))
  useInspectCombo(() => actions.secret('inspect'))
  useKeyJournal((key) => actions.keySeen(key))
  useStillness(30_000, () => actions.secret('stillness'), inside)
  useRitual()
}

function Screen() {
  const { screen, restoredFrom } = useSystem()
  if (restoredFrom) return <Restored />

  switch (screen) {
    case SCREENS.BOOT:
      return <BootSequence />
    case SCREENS.DASHBOARD:
      return <Dashboard />
    case SCREENS.SETTINGS:
      return <Settings />
    case SCREENS.DEEP:
      return <Deep />
    case SCREENS.ARCHIVE:
      return <Archive />
    case SCREENS.ROOM:
      return <Room07 />
    case SCREENS.ENDING:
      return <Ending />
    default:
      return <Gate />
  }
}

export default function App() {
  const { screen, record, glitch } = useSystem()
  const audio = useAudio()
  const inside = screen !== SCREENS.GATE && screen !== SCREENS.BOOT

  useDetectors(inside)
  useGlitchEngine(inside && screen !== SCREENS.ENDING)
  useObserver(inside && screen !== SCREENS.ENDING)

  // The title drifts along with everything else.
  useEffect(() => {
    const base = 'THE IMPOSSIBLE WEBSITE'
    if (glitch?.kind === 'scramble') document.title = 'THE IMP█SSIBLE W██SITE'
    else if (record.visits > 4) document.title = `${base} · ${record.visits}`
    else document.title = base
  }, [glitch, record.visits])

  // One quiet acknowledgement per screen change, when sound is on.
  useEffect(() => {
    if (record.sound) audio.blip('ui')
  }, [screen])

  return (
    <>
      <main className="shell">
        <Screen />
      </main>
      <Effects />
      <Whisper />
      <SecretToast />
    </>
  )
}
