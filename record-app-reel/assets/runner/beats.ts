/**
 * The beat vocabulary.
 *
 * A beat is one unit of choreography: travel somewhere, act, let the result land. Beats
 * resolve their target at run time and throw when it is missing — a UI change must fail
 * the run, never film a cursor pointing confidently at nothing.
 *
 * Dwell (stillness before acting, and after the result lands) is what reads as human;
 * every dwell scales by the storyboard's `pace`, so "make it snappier" is one number.
 */
import type { Locator, Page } from 'playwright'
import { moveTo, type Point } from './cursor.ts'

export type BeatContext = {
  page: Page
  /** Multiplier on every dwell and hold. 1 = the tuned default. */
  pace: number
}

export type Beat = {
  readonly label: string
  run: (context: BeatContext) => Promise<void>
}

export type Target = string | Point | ((page: Page) => Promise<Point>)

const DWELL_BEFORE = 300
const DWELL_AFTER = 600

const isPoint = (target: Target): target is Point =>
  typeof target === 'object' && 'x' in target && 'y' in target

const describe = (target: Target): string =>
  typeof target === 'string' ? target : isPoint(target) ? `(${target.x},${target.y})` : 'fn'

export async function centerOf(page: Page, selector: string): Promise<Point> {
  const locator: Locator = page.locator(selector).first()
  await locator.waitFor({ state: 'visible', timeout: 10_000 })
  const box = await locator.boundingBox()
  if (!box) throw new Error(`"${selector}" has no box — nothing to point at`)
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  // An off-canvas panel still reports a box. Pointing at it would film a cursor
  // clicking empty space, so refuse rather than record a lie.
  const viewport = page.viewportSize()
  if (viewport && (point.x < 0 || point.y < 0 || point.x > viewport.width || point.y > viewport.height)) {
    throw new Error(
      `"${selector}" sits outside the viewport at (${Math.round(point.x)},${Math.round(point.y)}) — off-canvas, or a panel that needs opening first`
    )
  }
  return point
}

const resolve = async (page: Page, target: Target): Promise<Point> =>
  typeof target === 'string'
    ? centerOf(page, target)
    : isPoint(target)
      ? target
      : target(page)

/**
 * A point at fractional coordinates inside an element — for charts whose interesting spots
 * are positions, not elements (a trend line, a band of a stacked bar).
 */
export const within = (selector: string, fx: number, fy: number): Target =>
  async (page: Page) => {
    const locator = page.locator(selector).first()
    await locator.waitFor({ state: 'visible', timeout: 10_000 })
    const box = await locator.boundingBox()
    if (!box) throw new Error(`"${selector}" has no box — nothing to point inside`)
    return { x: box.x + box.width * fx, y: box.y + box.height * fy }
  }

/**
 * The nth-largest match, resolved at run time. Positional indices are not stable across
 * the tour — filters applied in an earlier scene change how many bubbles or flows exist —
 * and the biggest one is the shot worth taking anyway.
 */
export const largest = (selector: string, rank = 0): Target =>
  async (page: Page) => {
    const locator = page.locator(selector)
    await locator.first().waitFor({ state: 'visible', timeout: 10_000 })
    const boxes = await Promise.all(
      (await locator.all()).map(async (candidate) => candidate.boundingBox())
    )
    const ranked = boxes
      .filter((box): box is NonNullable<typeof box> => box !== null && box.width > 0)
      .sort((a, b) => b.width * b.height - a.width * a.height)
    const box = ranked[rank]
    if (!box) throw new Error(`"${selector}" has no match at size rank ${rank} (${ranked.length} visible)`)
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }

const beat = (label: string, run: Beat['run']): Beat => ({ label, run })
const wait = (page: Page, ms: number, pace: number) => page.waitForTimeout(Math.round(ms * pace))

export const pause = (ms: number): Beat =>
  beat(`pause ${ms}ms`, ({ page, pace }) => wait(page, ms, pace))

export const moveToTarget = (target: Target): Beat =>
  beat(`move → ${describe(target)}`, async ({ page }) => {
    await moveTo(page, await resolve(page, target))
  })

export const click = (target: Target, options: { after?: number } = {}): Beat =>
  beat(`click ${describe(target)}`, async ({ page, pace }) => {
    await moveTo(page, await resolve(page, target))
    await wait(page, DWELL_BEFORE, pace)
    await page.mouse.down()
    await page.waitForTimeout(70)
    await page.mouse.up()
    await wait(page, options.after ?? DWELL_AFTER, pace)
  })

/**
 * Park the pointer on something and hold, so a tooltip has time to appear and be read.
 * `tooltip: true` makes the beat fail when none shows — a hover over nothing is a shot
 * that looks fine in the log and empty on screen.
 */
export const hover = (
  target: Target,
  options: { hold?: number; tooltip?: boolean } = {}
): Beat =>
  beat(`hover ${describe(target)}`, async ({ page, pace }) => {
    await moveTo(page, await resolve(page, target))
    if (options.tooltip) {
      await page
        .locator('[role="status"]')
        .first()
        .waitFor({ state: 'visible', timeout: 4_000 })
        .catch(() => {
          throw new Error(`no tooltip appeared over ${describe(target)}`)
        })
    }
    await wait(page, options.hold ?? 1400, pace)
  })

export const type = (text: string, options: { into?: string } = {}): Beat =>
  beat(`type "${text}"`, async ({ page, pace }) => {
    if (options.into) {
      await moveTo(page, await centerOf(page, options.into))
      await wait(page, DWELL_BEFORE, pace)
      await page.mouse.down()
      await page.waitForTimeout(70)
      await page.mouse.up()
      await page.waitForTimeout(180)
    }
    for (const character of text) {
      await page.keyboard.type(character)
      await page.waitForTimeout(60 + Math.random() * 80)
    }
    await wait(page, 320, pace)
  })

/** Navbar section link, by its visible label. */
export const nav = (label: string): Beat =>
  beat(`nav → ${label}`, async (context) => {
    await click(`role=link[name="${label}"]`).run(context)
  })

/**
 * The sidebar filter comboboxes and the header Timeframe select: click the control, then
 * the option by its text. Both render options as `role=option`.
 */
export const choose = (controlAriaLabel: string, item: string): Beat =>
  beat(`choose ${controlAriaLabel} → ${item}`, async (context) => {
    const { page, pace } = context
    await click(`[aria-label="${controlAriaLabel}"]`, { after: 220 }).run(context)
    const option = page.locator(`[role="option"]`, { hasText: item }).first()
    await option.waitFor({ state: 'visible', timeout: 5_000 })
    const box = await option.boundingBox()
    if (!box) throw new Error(`option "${item}" for ${controlAriaLabel} has no box`)
    await moveTo(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 })
    await wait(page, 260, pace)
    await page.mouse.down()
    await page.waitForTimeout(70)
    await page.mouse.up()
    await wait(page, DWELL_AFTER, pace)
  })

/**
 * Both sidebars start open, so beats state the state they want rather than flipping it —
 * a blind toggle silently films the opposite of the intended shot.
 */
/** Same control, picked by position — for lists whose contents differ per tenant. */
export const chooseNth = (controlAriaLabel: string, index: number): Beat =>
  beat(`choose ${controlAriaLabel} → #${index}`, async (context) => {
    const { page, pace } = context
    await click(`[aria-label="${controlAriaLabel}"]`, { after: 220 }).run(context)
    const option = page.locator('[role="option"]').nth(index)
    await option.waitFor({ state: 'visible', timeout: 5_000 })
    const box = await option.boundingBox()
    if (!box) throw new Error(`option #${index} for ${controlAriaLabel} has no box`)
    await moveTo(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 })
    await wait(page, 260, pace)
    await page.mouse.down()
    await page.waitForTimeout(70)
    await page.mouse.up()
    await wait(page, 600, pace)
  })

export const sidebar = (label: 'Filters' | 'KPIs', want: 'open' | 'closed'): Beat =>
  beat(`${label} sidebar → ${want}`, async (context) => {
    const handle = `[aria-label="Toggle ${label} sidebar"]`
    const expanded = await context.page.locator(handle).first().getAttribute('aria-expanded')
    if ((expanded === 'true') === (want === 'open')) return
    await click(handle, { after: 420 }).run(context)
  })

export type SettleOptions = {
  /** Wait for this to be visible first. */
  selector?: string
  /** Hold until no request has been in flight for this long — for map tiles. */
  networkQuietMs?: number
  /** Fixed hold afterwards, covering chart entry animations we cannot await. */
  budgetMs?: number
}

/**
 * Chart transitions expose no completion event, so a fixed budget is the honest tool.
 * Map tiles do have unbounded latency, which is what `networkQuietMs` is for.
 */
export const settle = (options: SettleOptions = {}): Beat =>
  beat('settle', async ({ page, pace }) => {
    if (options.selector) {
      await page.locator(options.selector).first().waitFor({ state: 'visible', timeout: 20_000 })
    }
    if (options.networkQuietMs) {
      await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
      await page.waitForTimeout(options.networkQuietMs)
    }
    await wait(page, options.budgetMs ?? 600, pace)
  })

/** Escape hatch for choreography the vocabulary does not cover. */
export const raw = (label: string, run: (page: Page) => Promise<void>): Beat =>
  beat(label, ({ page }) => run(page))
