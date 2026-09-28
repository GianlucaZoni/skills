/**
 * Paint-driven frames → constant-frame-rate H.264.
 *
 * Why not Playwright's `recordVideo`: it is built on this same CDP screencast, then
 * hardcodes VP8/WebM at a bitrate the API does not expose. On a data-dense dashboard that
 * softens axis labels, which is the one thing this footage exists to show. Going direct
 * costs the loop below and buys CRF, codec and scaling control — capture at 4K, downscale
 * to 1080p, and small text survives. Resist collapsing this file into the one-liner.
 *
 * The loop is the whole trick: frames arrive only on paint, so for each output slot we
 * emit whichever frame was current at that instant — duplicating through still stretches.
 * libx264 encodes repeated frames almost for free.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { once } from 'node:events'
import type { CapturedFrame } from './capture.ts'

export type EncodeOptions = {
  frames: CapturedFrame[]
  /** Length of the take; the tail beyond the last painted frame is held, not dropped. */
  durationMs: number
  fps: number
  /** Output width; height follows the source aspect ratio. */
  width: number
  out: string
  /**
   * Exact times to place keyframes at, so scene clips can be cut with `-c copy` and land
   * on the frame instead of drifting to the nearest keyframe.
   */
  keyframesAtMs?: number[]
}

export async function encode(options: EncodeOptions): Promise<void> {
  const { frames, durationMs, fps, width, out, keyframesAtMs = [] } = options
  if (frames.length === 0) throw new Error('no frames captured')

  const args = [
    '-hide_banner',
    '-loglevel', 'error',
    '-f', 'image2pipe',
    '-framerate', String(fps),
    '-i', '-',
    '-vf', `scale=${width}:-2:flags=lanczos`,
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
  ]
  if (keyframesAtMs.length > 0) {
    args.push('-force_key_frames', keyframesAtMs.map((ms) => (ms / 1000).toFixed(3)).join(','))
  }
  args.push('-y', out)

  const ffmpeg = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'inherit'] })
  const failed = new Promise<never>((_, reject) => {
    ffmpeg.on('error', reject)
    ffmpeg.on('exit', (code) => {
      if (code !== 0) reject(new Error(`ffmpeg exited ${code}`))
    })
  })

  const write = async (buffer: Buffer): Promise<void> => {
    if (!ffmpeg.stdin.write(buffer)) await Promise.race([once(ffmpeg.stdin, 'drain'), failed])
  }

  const slots = Math.max(1, Math.round((durationMs / 1000) * fps))
  let index = 0
  let buffer = await fs.promises.readFile(frames[0].file)

  for (let slot = 0; slot < slots; slot++) {
    const slotMs = (slot * 1000) / fps
    while (index + 1 < frames.length && frames[index + 1].tMs <= slotMs) {
      index += 1
      buffer = await fs.promises.readFile(frames[index].file)
    }
    await write(buffer)
  }

  ffmpeg.stdin.end()
  const [code] = (await Promise.race([once(ffmpeg, 'exit'), failed])) as [number]
  if (code !== 0) throw new Error(`ffmpeg exited ${code}`)
}
