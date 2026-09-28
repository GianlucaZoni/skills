/**
 * Scene clips, cut from the master take.
 *
 * The encode placed a keyframe on every scene boundary, so these are stream copies: no
 * re-encode, no generation loss, and the cut lands on the intended frame rather than
 * drifting back to the nearest keyframe.
 */
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import type { SceneBoundary } from './runner.ts'

const run = promisify(execFile)

export async function cutScenes(
  take: string,
  boundaries: SceneBoundary[],
  outDir: string
): Promise<string[]> {
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })

  const written: string[] = []
  for (const [index, scene] of boundaries.entries()) {
    // Numbered so the folder sorts into story order.
    const file = path.join(outDir, `${String(index + 1).padStart(2, '0')}-${scene.name}.mp4`)
    await run('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-ss', (scene.startMs / 1000).toFixed(3),
      '-i', take,
      '-t', ((scene.endMs - scene.startMs) / 1000).toFixed(3),
      '-c', 'copy',
      '-avoid_negative_ts', 'make_zero',
      '-y', file,
    ])
    written.push(file)
  }
  return written
}
