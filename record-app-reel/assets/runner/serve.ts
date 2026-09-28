/**
 * Building and serving the app under test.
 *
 * Generic: the commands come from project.ts. Film a production build, not a dev server —
 * no HMR socket, no dev overlays, real bundle timing.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const RECORD_DIR = path.dirname(fileURLToPath(import.meta.url))
/** The app's root: two levels up from scripts/record. */
export const REPO_ROOT = path.resolve(RECORD_DIR, '../..')

/**
 * Package managers resolve `node` off PATH, and a broken nvm shim in the shell profile is
 * a common local hazard — so hand children the directory of the node that is running us.
 */
const childEnv = (): NodeJS.ProcessEnv => ({
  ...process.env,
  PATH: `${path.dirname(process.execPath)}:${process.env.PATH ?? ''}`,
})

export const run = (command: string, args: string[], cwd = REPO_ROOT): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: childEnv(), stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} → exit ${code}`))
    )
  })

const waitForServer = async (url: string, timeoutMs = 30_000): Promise<void> => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`server never answered on ${url}`)
}

export type Server = { url: string; stop: () => void }

export type ServeOptions = {
  command: string
  args: string[]
  port: number
  cwd?: string
  path?: string
}

export async function serveCommand(options: ServeOptions): Promise<Server> {
  const child: ChildProcess = spawn(options.command, options.args, {
    cwd: options.cwd ?? REPO_ROOT,
    env: childEnv(),
    stdio: 'ignore',
    // Own process group, so stopping kills the server rather than orphaning it under the
    // package-manager wrapper.
    detached: true,
  })
  const url = `http://localhost:${options.port}${options.path ?? '/'}`
  const stop = () => {
    if (child.pid) {
      try {
        process.kill(-child.pid, 'SIGTERM')
      } catch {
        /* already gone */
      }
    }
  }
  try {
    await waitForServer(url)
  } catch (error) {
    stop()
    throw error
  }
  return { url, stop }
}
