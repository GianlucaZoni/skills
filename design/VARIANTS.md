# Variants

For a feature test or an exploration: the versions the designer compares, on the real site with real content, one key press apart.

## How many

- **The designer has a specific idea**: build that, and any versions of it they name.
- **They have none yet**: build three radically different variants. Radically different means they disagree about structure (the layout, what reads first, the main action), where colour or copy alone makes a tweak. When two come out alike, rebuild one with the structure they share ruled out.

Either way, the first variant is `today`, the site as it is, so every variant is judged against what is live. Five at most besides it.

## Where they live

- **On the page that will host the change**, switched by `?variant=<key>` on its own route. The page's data fetching stays as it is; only what it renders swaps. Something with no page yet that would sit inside one is still mounted in that page. A brand new page gets a route of its own named `design-<topic>`, in the routing convention the repo already uses.
- **In the variants folder** `docs/agents/design.md` names, under `design-<topic>/`, one component per variant, each free to throw out the layout. An existing file changes only to mount them: an import and a few lines. Restyling a shared component in place leaves nothing live to compare against.
- **Marked**: each new file starts with the comment `DESIGN (design/<topic>): throwaway, never merges.`
- **Read-only**: a variant that would save or send something (a form, a like, a login) points at a stub, so the backend never sees it.

## The switcher

Copy the one `docs/agents/design.md` names, or else this one, into the variants folder. Mount it once on the page, behind `process.env.NODE_ENV !== 'production'`, and render the variant whose key `?variant=` names (the first when it names none). It is written for Next's App Router; in another framework, swap the three navigation hooks for its router's.

```tsx
'use client'

// DESIGN (design/<topic>): throwaway, never merges. The variant switcher: a floating bar
// naming the current variant, ← and → to step through them, `?variant=<key>` in the URL so
// a variant can be shared and survives a reload.

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'

export type Variant = { key: string; name: string }

export const Switcher = ({ variants }: { variants: readonly Variant[] }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('variant') ?? variants[0].key
  const index = Math.max(
    0,
    variants.findIndex((variant) => variant.key === current)
  )

  const step = useCallback(
    (by: number) => {
      const params = new URLSearchParams(searchParams)
      params.set('variant', variants[(index + by + variants.length) % variants.length].key)
      router.replace(`${pathname}?${params}`, { scroll: false })
    },
    [index, pathname, router, searchParams, variants]
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable]')) return
      if (event.key === 'ArrowLeft') step(-1)
      if (event.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const button = { padding: '4px 8px', background: 'none', border: 0, color: 'inherit' }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 999,
        background: '#000',
        color: '#fff',
        font: '12px/1.4 ui-monospace, monospace',
        boxShadow: '0 4px 16px rgb(0 0 0 / 0.3)',
      }}
    >
      <button type="button" style={button} onClick={() => step(-1)}>
        ←
      </button>
      <span>
        {variants[index].key} ({variants[index].name})
      </span>
      <button type="button" style={button} onClick={() => step(1)}>
        →
      </button>
    </div>
  )
}
```
