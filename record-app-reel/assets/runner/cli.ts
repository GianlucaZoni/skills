/**
 * app-reel — record a storyboard as one continuous take, per subject.
 *
 *   yarn record                          all subjects
 *   yarn record --subject anonymized
 *   yarn record --subject amazon --scenes location,traceability --headed --no-build
 *
 * Knows nothing about the app it films: everything app-specific lives in project.ts.
 */
import fs from 'node:fs'
import path from 'node:path'
import { chromium, type Browser } from 'playwright'
import { startCapture } from './capture.ts'
import { cutScenes } from './cut.ts'
import { installCursor, moveTo } from './cursor.ts'
import { encode } from './encode.ts'
import { project } from './project.ts'
import { runStoryboard, type SceneBoundary } from './runner.ts'
import { REPO_ROOT } from './serve.ts'

const argv = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const index = argv.indexOf(name)
  return index === -1 ? undefined : argv[index + 1]
}
const has = (name: string) => argv.includes(name)

const requested = flag('--subject')
const subjects = requested ? requested.split(',') : project.subjects
const only = flag('--scenes') ? new Set(flag('--scenes')!.split(',')) : undefined

const record = async (browser: Browser, url: string, subject: string): Promise<void> => {
  const outDir = path.join(REPO_ROOT, 'recordings', subject)
  const framesDir = path.join(outDir, 'frames')
  fs.rmSync(framesDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })

  const context = await browser.newContext({
    viewport: project.viewport,
    deviceScaleFactor: project.deviceScaleFactor,
  })
  const page = await context.newPage()
  await installCursor(page)
  await project.prepare?.(page, subject)
  const board = await project.storyboard(subject)

  await page.goto(url, { waitUntil: 'networkidle' })
  // Park the pointer before rolling, so it is on screen from frame one.
  await moveTo(page, { x: project.viewport.width / 2, y: project.viewport.height - 220 })

  console.log(`› ${subject}: rolling`)
  const capture = await startCapture(page, {
    dir: framesDir,
    maxWidth: project.viewport.width * project.deviceScaleFactor,
    maxHeight: project.viewport.height * project.deviceScaleFactor,
  })

  let boundaries: SceneBoundary[] = []
  try {
    boundaries = await runStoryboard(page, board, capture, only)
  } finally {
    const frames = await capture.stop()
    const durationMs = capture.elapsedMs()
    await context.close()

    if (frames.length > 0 && boundaries.length > 0) {
      const take = path.join(outDir, 'take.mp4')
      await encode({
        frames,
        durationMs,
        fps: project.fps,
        width: project.viewport.width,
        out: take,
        // A keyframe on every boundary, so clips cut with `-c copy` land on the frame.
        keyframesAtMs: [0, ...boundaries.map((scene) => scene.startMs)],
      })
      fs.writeFileSync(path.join(outDir, 'scenes.json'), `${JSON.stringify(boundaries, null, 2)}\n`)
      fs.rmSync(framesDir, { recursive: true, force: true })
      const clips = await cutScenes(take, boundaries, path.join(outDir, 'scenes'))
      console.log(
        `✓ ${path.relative(REPO_ROOT, take)} — ${(durationMs / 1000).toFixed(1)}s, ${frames.length} frames, ${clips.length} clips`
      )
      if (only) console.log('  (partial run: take.mp4 covers only the scenes recorded)')
    }
  }
}

const main = async () => {
  project.preflight?.()
  if (project.build && !has('--no-build')) {
    console.log('› building')
    await project.build()
  }
  const server = await project.serve()
  const browser = await chromium.launch({
    channel: 'chromium', // full Chromium, not the headless shell: WebGL content needs it
    headless: !has('--headed'),
  })
  try {
    for (const subject of subjects) await record(browser, server.url, subject)
  } finally {
    await browser.close()
    server.stop()
  }
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`)
  process.exit(1)
})
