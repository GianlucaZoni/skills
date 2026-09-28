/**
 * Everything app-specific about filming THIS app. The runner reads only this file.
 *
 * Copy to project.ts and fill in. A `subject` is one run of the storyboard — a tenant, a
 * locale, a plan tier. Apps with nothing to vary use a single subject.
 */
import type { Page } from 'playwright'
import type { Storyboard } from './runner.ts'
import { run, serveCommand, type Server } from './serve.ts'
import { storyboard } from './storyboard.ts'

export type Project = {
  subjects: string[]
  viewport: { width: number; height: number }
  deviceScaleFactor: number
  fps: number
  /** Fail before spending a build on footage that would be wrong. */
  preflight?: () => void
  build?: () => Promise<void>
  serve: () => Promise<Server>
  /** Route stubs and anything else the page needs before it loads. */
  prepare?: (page: Page, subject: string) => Promise<void>
  storyboard: (subject: string) => Promise<Storyboard>
}

export const project: Project = {
  subjects: ['default'],
  viewport: { width: 1920, height: 1080 },
  // Capture at 4K and downscale: what keeps small text legible at 1080p.
  deviceScaleFactor: 2,
  fps: 30,
  // preflight: () => { /* assert env/data the footage depends on */ },
  build: () => run('npm', ['run', 'build']),
  serve: () => serveCommand({ command: 'npm', args: ['run', 'preview', '--', '--port', '4173'], port: 4173 }),
  // prepare: (page, subject) => stubAuth(page, subject),
  storyboard: async () => storyboard(),
}
