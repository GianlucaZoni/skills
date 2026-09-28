/**
 * The visible cursor.
 *
 * One source of truth: the overlay is positioned by a capture-phase `mousemove` listener
 * in the page, so it follows the *real* synthetic pointer rather than a parallel
 * animation. Cursor and hover states therefore cannot desync, and any interaction — a
 * storyboard beat or a raw() escape hatch — gets a correct cursor for free.
 *
 * Node's only job is to emit eased `mouse.move` steps at 60Hz. Human-looking motion is
 * three things: distance-scaled duration, a slight arc, and an overshoot that settles.
 */
import type { Page } from 'playwright'

export type Point = { x: number; y: number }

const positions = new WeakMap<Page, Point>()
/** Arcs alternate side by move, so travel does not trace the same bow every time. */
const arcSigns = new WeakMap<Page, number>()

const PAGE_SCRIPT = `(() => {
  if (window.__reelCursor) return
  window.__reelCursor = true

  const mount = () => {
    const cursor = document.createElement('div')
    cursor.setAttribute('data-reel-cursor', '')
    cursor.innerHTML =
      '<svg width="22" height="30" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1 1 L1 22.2 L6.4 17 L10 25.6 L13.8 24 L10.2 15.6 L17.6 15.4 Z" ' +
      'fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>'
    Object.assign(cursor.style, {
      position: 'fixed', left: '0px', top: '0px', zIndex: '2147483647',
      pointerEvents: 'none', transform: 'translate3d(-200px, -200px, 0)',
      willChange: 'transform', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.28))',
    })
    document.documentElement.appendChild(cursor)

    const place = (event) => {
      cursor.style.transform =
        'translate3d(' + event.clientX + 'px,' + event.clientY + 'px,0) scale(' +
        (window.__reelCursorDown ? 0.88 : 1) + ')'
      window.__reelCursorAt = { x: event.clientX, y: event.clientY }
    }
    addEventListener('mousemove', place, true)

    addEventListener('mousedown', (event) => {
      window.__reelCursorDown = true
      place(event)
      const ring = document.createElement('div')
      Object.assign(ring.style, {
        position: 'fixed', left: event.clientX + 'px', top: event.clientY + 'px',
        width: '10px', height: '10px', marginLeft: '-5px', marginTop: '-5px',
        borderRadius: '50%', border: '2px solid rgba(17,17,17,0.55)',
        zIndex: '2147483646', pointerEvents: 'none',
      })
      document.documentElement.appendChild(ring)
      ring.animate(
        [{ transform: 'scale(0.4)', opacity: 0.9 }, { transform: 'scale(3.6)', opacity: 0 }],
        { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      ).finished.then(() => ring.remove(), () => ring.remove())
    }, true)

    addEventListener('mouseup', (event) => {
      window.__reelCursorDown = false
      place(event)
    }, true)
  }

  if (document.documentElement) mount()
  else addEventListener('DOMContentLoaded', mount, { once: true })
})()`

export async function installCursor(page: Page): Promise<void> {
  await page.addInitScript(PAGE_SCRIPT)
  positions.set(page, { x: -200, y: -200 })
  arcSigns.set(page, 1)
}

export const cursorAt = (page: Page): Point => positions.get(page) ?? { x: -200, y: -200 }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Fitts-ish: near targets snap, far ones take their time, both inside human bounds. */
const travelMs = (distance: number) => Math.min(820, Math.max(260, 200 + distance * 0.55))

export type MoveOptions = { steps?: number; durationMs?: number }

export async function moveTo(page: Page, to: Point, options: MoveOptions = {}): Promise<void> {
  const from = cursorAt(page)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)

  // First placement of the run: no travel to animate from off-screen.
  if (from.x < 0 || from.y < 0) {
    await page.mouse.move(to.x, to.y)
    positions.set(page, to)
    return
  }
  if (distance < 1) return

  const duration = options.durationMs ?? travelMs(distance)
  const steps = options.steps ?? Math.max(2, Math.round(duration / (1000 / 60)))
  const sign = arcSigns.get(page) ?? 1
  arcSigns.set(page, -sign)
  // Perpendicular bow, capped so long hauls do not sail off the viewport.
  const arc = Math.min(46, distance * 0.07) * sign
  const nx = distance === 0 ? 0 : -dy / distance
  const ny = distance === 0 ? 0 : dx / distance
  // Overshoot only where a hand would carry momentum.
  const overshoot = distance > 220 ? Math.min(13, distance * 0.025) : 0

  const startedAt = Date.now()
  for (let step = 1; step <= steps; step++) {
    const linear = step / steps
    const eased = easeInOut(linear)
    // Ride past the target, then settle back over the last fifth of the move.
    const past = overshoot === 0 ? 0 : Math.sin(Math.min(1, linear / 0.8) * Math.PI) * overshoot
    const bow = Math.sin(eased * Math.PI) * arc
    const x = from.x + dx * eased + nx * bow + (dx / (distance || 1)) * past
    const y = from.y + dy * eased + ny * bow + (dy / (distance || 1)) * past
    await page.mouse.move(x, y)
    const due = startedAt + (duration * step) / steps
    const wait = due - Date.now()
    if (wait > 0) await sleep(wait)
  }
  await page.mouse.move(to.x, to.y)
  positions.set(page, to)
}
