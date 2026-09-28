/**
 * Storyboard replay. Dumb by design: it walks scenes, runs beats, and stamps the
 * boundaries — every editorial decision lives in the storyboard, not here.
 */
import type { Page } from 'playwright'
import type { Beat, BeatContext } from './beats.ts'
import type { Capture } from './capture.ts'

export type Scene = { name: string; beats: Beat[] }

export type Storyboard = {
  /** Milliseconds. Scales every dwell and hold in the take. */
  pace: number
  scenes: Scene[]
}

export type SceneBoundary = { name: string; startMs: number; endMs: number }

export async function runStoryboard(
  page: Page,
  storyboard: Storyboard,
  capture: Capture,
  only?: Set<string>
): Promise<SceneBoundary[]> {
  const context: BeatContext = { page, pace: storyboard.pace }
  const boundaries: SceneBoundary[] = []

  for (const scene of storyboard.scenes) {
    if (only && !only.has(scene.name)) continue
    const startMs = capture.elapsedMs()
    console.log(`  ▸ ${scene.name}`)
    for (const beat of scene.beats) {
      try {
        await beat.run(context)
      } catch (error) {
        throw new Error(`scene "${scene.name}", beat "${beat.label}": ${(error as Error).message}`)
      }
    }
    boundaries.push({ name: scene.name, startMs, endMs: capture.elapsedMs() })
  }

  return boundaries
}
