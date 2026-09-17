# THE IMPOSSIBLE WEBSITE

An interactive psychological puzzle disguised as an unlisted experimental interface.
Dark, monospace, hairline-thin, with CRT grain and occasional instability.

The site remembers its visitors, reacts to what they do, and hides a number of
things that are never listed anywhere in the UI. Nothing is explained to the user
— that is the point.

## Running it

```bash
npm install
npm run dev      # development server
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
npm run lint     # oxlint
```

No backend. No external requests. No camera, microphone, geolocation, or any
other device permission — every "observation" the interface makes is derived
from data the page itself generated about the current and previous sessions,
held in `localStorage` under the key `impossible.sys`.

## Deployment

Pushing to the default branch builds the site and publishes it to GitHub Pages
via `.github/workflows/pages.yml`. The workflow injects `VITE_BASE=/<repo>/` so
the bundle resolves its assets under the project-site subpath; local dev and
`npm run preview` stay at the root.

Enable it once under **Settings -> Pages -> Build and deployment -> Source:
GitHub Actions**.

To build for a subpath by hand:

```bash
VITE_BASE=/imposibleweb/ npm run build
```

## Architecture

```
src/
  core/         pure logic and content, no React
    storage.js      the persisted record: visits, day streaks, clicks, discoveries
    secrets.js      registry of discoverable things and their reactions
    endings.js      the resolutions and their text
    observations.js rules that decide what the interface says about you, and when
    archive.js      archive records and their unlock conditions
    room.js         ROOM 07 puzzle definitions
    exit.js         the EXIT escalation ladder
    greetings.js    what the dashboard says, by visit count
    cipher.js       ROT / normalisation / tally helpers
    random.js       weighted picks, seeded hashing, text corruption
  state/
    reducer.js         every state transition, as one pure function
    SystemContext.jsx  provider: persistence, session clock, idle tracking
  hooks/
    useSequences.js    keyboard and touch detectors, long-press
    useGlitchEngine.js when the interface misbehaves, and how
    useObserver.js     the watching layer and the stillness detector
    useAudio.jsx       WebAudio provider
  audio/engine.js  the room tone: drone, hiss, blips, bursts
  components/
    gate/        first screen and boot handshake
    dashboard/   status bar, action grid, footer
    screens/     settings, the other settings, archive, ROOM 07, endings
    overlay/     CRT layers, whispers, discovery reactions
  styles/      base tokens, effects, interface surfaces
```

State lives in one reducer. The persisted slice is written back to `localStorage`
on a short debounce and flushed on `pagehide`/`visibilitychange`, so the last
seconds of a session survive a tab close.

## Notes for maintainers

- **Secrets** are defined in `src/core/secrets.js`; each one is wired to a
  detector in `src/App.jsx` or to the component that owns its surface. Every
  secret has a touch-reachable route as well as a keyboard one — check that any
  new one does too.
- **ROOM 07** answers live in `src/core/room.js`. It opens at
  `ROOM_THRESHOLD` discoveries.
- **Endings** are in `src/core/endings.js`. Reaching one marks the record as
  terminated; the next page load clears that flag and shows the recovery screen.
- **Glitches** are weighted and rare by design (`useGlitchEngine.js`). They are
  disabled entirely under `prefers-reduced-motion`, as are the grain and roll bar.
- **Sound** is off by default and nothing is constructed until the user turns it
  on, so no audio context exists without a gesture.
- A user can erase everything about themselves from the settings console.

## Browser support

Modern evergreen browsers. Layout is fluid from 320px up; hover-dependent
behaviour has a touch equivalent, and every control is at least 44px tall on
small screens.
