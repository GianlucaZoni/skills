/**
 * Frame capture over CDP (Chrome DevTools Protocol).
 *
 * `Page.startScreencast` makes the browser push a `Page.screencastFrame` event on every
 * paint, each carrying a JPEG and an epoch timestamp. Frames therefore arrive on paint,
 * not on a clock: a still page emits nothing. Turning that into constant-frame-rate video
 * is encode.ts's job — here we only persist frames and their arrival times.
 *
 * Frames go to disk rather than memory: a two-minute 4K take is gigabytes.
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Page } from 'playwright'

export type CapturedFrame = { file: string; tMs: number }

export type CaptureOptions = {
  /** Directory for the JPEG sequence. Created if absent; caller owns cleanup. */
  dir: string
  maxWidth: number
  maxHeight: number
  /** JPEG quality 0-100. 90 is visually clean at 4K before the downscale to 1080p. */
  quality?: number
}

export type Capture = {
  /** Milliseconds since the first frame — the clock scene boundaries are stamped against. */
  elapsedMs: () => number
  stop: () => Promise<CapturedFrame[]>
}

export async function startCapture(page: Page, options: CaptureOptions): Promise<Capture> {
  const { dir, maxWidth, maxHeight, quality = 90 } = options
  fs.mkdirSync(dir, { recursive: true })

  const cdp = await page.context().newCDPSession(page)
  const frames: CapturedFrame[] = []
  const writes: Promise<void>[] = []
  let originMs: number | null = null
  let sequence = 0

  cdp.on('Page.screencastFrame', (payload) => {
    // Stamped on arrival, in Node's clock — the same clock the runner stamps scene
    // boundaries with. `metadata.timestamp` looks like the obvious source and is not:
    // it runs on the browser's own base, so trusting it silently skews the take against
    // its scene boundaries. Transfer jitter is a few ms, invisible at 30fps.
    const stampMs = Date.now()
    originMs ??= stampMs
    const file = path.join(dir, `${String(sequence++).padStart(6, '0')}.jpg`)
    frames.push({ file, tMs: Math.max(0, stampMs - originMs) })
    writes.push(fs.promises.writeFile(file, Buffer.from(payload.data, 'base64')))
    // Unacked frames stall the stream.
    cdp.send('Page.screencastFrameAck', { sessionId: payload.sessionId }).catch(() => {})
  })

  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality,
    maxWidth,
    maxHeight,
    everyNthFrame: 1,
  })

  return {
    // Stamped against the first frame's clock, so scene boundaries and frame
    // timestamps share an origin.
    elapsedMs: () => (originMs === null ? 0 : Date.now() - originMs),
    async stop() {
      await cdp.send('Page.stopScreencast').catch(() => {})
      await Promise.all(writes)
      await cdp.detach().catch(() => {})
      return frames
    },
  }
}
