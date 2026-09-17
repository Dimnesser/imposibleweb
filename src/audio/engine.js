/**
 * A small WebAudio room tone. Nothing is created until the user turns sound on,
 * so the page never produces audio without an explicit gesture.
 */

const MASTER = 0.16

function noiseBuffer(ctx, seconds = 3) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    // Brown-ish noise: softer and less hissy than white.
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.2
  }
  return buf
}

export class AtmosphereEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.nodes = []
    this.running = false
  }

  ensure() {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(this.ctx.destination)
    return this.ctx
  }

  async start() {
    const ctx = this.ensure()
    if (!ctx || this.running) return
    if (ctx.state === 'suspended') await ctx.resume()

    const now = ctx.currentTime

    // Two detuned low oscillators, filtered down to a hum.
    const bus = ctx.createGain()
    bus.gain.value = 0.5
    bus.connect(this.master)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 220
    lp.Q.value = 6
    lp.connect(bus)

    for (const freq of [55, 55.7, 82.5]) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const g = ctx.createGain()
      g.gain.value = 0.35
      osc.connect(g).connect(lp)
      osc.start(now)
      this.nodes.push(osc, g)
    }

    // Very slow filter sweep so the tone never sits still.
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.035
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 90
    lfo.connect(lfoGain).connect(lp.frequency)
    lfo.start(now)
    this.nodes.push(lfo, lfoGain)

    // Tape-hiss bed.
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(ctx)
    src.loop = true
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1200
    bp.Q.value = 0.6
    const ng = ctx.createGain()
    ng.gain.value = 0.05
    src.connect(bp).connect(ng).connect(bus)
    src.start(now)
    this.nodes.push(src, bp, ng)

    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(0.0001, now)
    this.master.gain.exponentialRampToValueAtTime(MASTER, now + 2.5)
    this.running = true
  }

  stop() {
    if (!this.ctx || !this.running) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value || 0.0001, now)
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
    const nodes = this.nodes
    this.nodes = []
    this.running = false
    setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop?.()
          n.disconnect()
        } catch {
          /* already gone */
        }
      })
    }, 1000)
  }

  /** Short interface tick. `kind` shifts the character without new plumbing. */
  blip(kind = 'ui') {
    if (!this.ctx || !this.running) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    const table = { ui: 660, deny: 180, open: 990, secret: 1320 }
    osc.type = kind === 'deny' ? 'square' : 'triangle'
    osc.frequency.setValueAtTime(table[kind] ?? 660, now)
    if (kind === 'deny') osc.frequency.exponentialRampToValueAtTime(90, now + 0.18)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.09, now + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    osc.connect(g).connect(this.master)
    osc.start(now)
    osc.stop(now + 0.25)
  }

  /** Burst of noise used when the interface misbehaves. */
  burst(ms = 200) {
    if (!this.ctx || !this.running) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(ctx, 0.4)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2600
    bp.Q.value = 1.4
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.14, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000)
    src.connect(bp).connect(g).connect(this.master)
    src.start(now)
    src.stop(now + ms / 1000 + 0.05)
  }

  dispose() {
    this.stop()
    setTimeout(() => {
      try {
        this.ctx?.close()
      } catch {
        /* ignore */
      }
      this.ctx = null
    }, 1200)
  }
}
