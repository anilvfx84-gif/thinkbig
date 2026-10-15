# Design Brief

## Direction

The Ledger — a two-sided idea marketplace styled as a premium investment prospectus crossed with a literary journal; credible, ambitious, editorial.

## Tone

Editorial/refined — warm paper surfaces, ink-green authority, and a single copper accent replace the generic navy-corporate finance cliché.

## Differentiation

An investment-broadsheet aesthetic: high-contrast serif headlines over a bone-paper canvas with monospace funding figures, so ideas read as serious capital opportunities rather than startup pitches.

## Color Palette

| Token      | OKLCH (light)   | Role   |
| ---------- | --------------- | ------ |
| background | 0.965 0.012 85  | warm bone paper canvas |
| foreground | 0.2 0.02 160    | deep ink-green text |
| card       | 0.99 0.006 85   | near-white listing surfaces |
| primary    | 0.32 0.055 162  | ink-green brand, primary CTAs |
| accent     | 0.62 0.13 55    | copper — active states, funding, rules |
| muted      | 0.93 0.012 85   | filter rails, section fills |

Dark mode: background 0.16 0.018 162 (deep ink green), foreground 0.93 0.012 85, primary/accent swap to copper 0.72 0.11 62 on dark.

## Typography

- Display: Fraunces — hero headlines, idea titles, section headings (high-contrast serif, tight tracking)
- Body: General Sans — UI, paragraphs, labels, navigation
- Mono: Geist Mono — funding targets, counts, tabular metadata
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-xs font-semibold tracking-[0.2em] uppercase`, body `text-base md:text-lg`

## Elevation & Depth

Flat paper base with hairline borders; depth comes from card-on-paper layering and soft `shadow-subtle`/`shadow-elevated`, never heavy drop shadows or glows.

## Structural Zones

| Zone    | Background        | Border             | Notes                                             |
| ------- | ----------------- | ------------------ | ------------------------------------------------- |
| Header  | `bg-card`         | `border-b` hairline| Sticky slim nav; serif wordmark, sans links, green pill CTA |
| Content | `bg-background`   | —                  | Alternate `bg-muted/40` bands; filter rail on `bg-card` |
| Footer  | `bg-muted/50`     | `border-t` hairline| Grouped link columns, tracked uppercase labels    |

## Spacing & Rhythm

Generous editorial whitespace: `py-16 md:py-24` section gaps, `gap-6 md:gap-8` card grids, `gap-4` micro-spacing, consistent `container` max width with `px-4 md:px-8`.

## Component Patterns

- Buttons: pill radius, ink-green `bg-primary` primary / hairline-outline secondary; hover deepens to `bg-gradient-primary`, 0.3s smooth
- Cards: 12px radius, `bg-card` with 1px hairline border, `shadow-subtle` → `shadow-lift` on hover
- Badges: full-pill, tracked uppercase; stage badges use muted fill, field labels use copper text on transparent

## Motion

- Entrance: `animate-fade-up` staggered 60ms per grid item, 0.5s smooth curve
- Hover: cards lift via shadow + 2px translateY, 0.3s; links get copper underline grow
- Decorative: thin copper `rule-grow` under hero headline on load

## Constraints

- 3 core colors only: bone paper, ink green, copper — no purple, no blue gradients
- All colors via OKLCH semantic tokens; no raw hex or arbitrary color classes
- AA+ contrast in both themes; body text min 4.5:1
- No in-app messaging UI and no buyer verification badges (out of scope)

## Signature Detail

A thin copper rule that animates out from beneath each serif headline — a recurring editorial "byline" motif that ties the marketplace together.
