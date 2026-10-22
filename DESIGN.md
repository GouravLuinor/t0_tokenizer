---
name: TokenCraft
description: Token counter and LLM cost calculator, dressed as a bureau-de-change rate board.
colors:
  board-green: "#0F3B2E"
  board-green-raised: "#154839"
  board-rule: "#215645"
  board-ink: "#E4EDE8"
  board-ink-muted: "#A5C0B3"
  rate-amber: "#F2A93B"
  rate-amber-ink: "#865400"
  rate-amber-wash: "#FCECCD"
  paper: "#F3F5F1"
  sheet: "#FFFFFF"
  panel: "#E9EDE7"
  ink: "#13201A"
  ink-2: "#3D4D45"
  ink-3: "#586860"
  rule: "#D3DAD2"
  rule-2: "#B6C1B8"
  night-paper: "#0A1310"
  night-sheet: "#0E1915"
  ok: "#1F7A4D"
  warn: "#9E6000"
  danger: "#BE322C"
  token-green: "#3F8C6E"
  token-amber: "#CE861A"
  token-blue: "#4A7AB0"
  token-plum: "#A0568C"
typography:
  figure-xl:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "88px"
    fontWeight: 600
    lineHeight: 0.95
  figure-lg:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "72px"
    fontWeight: 600
    lineHeight: 0.95
  figure:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: 0.95
  display:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.02em"
  display-md:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.02em"
  display-sm:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  headline-sm:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.02em"
  tally:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1
  lead:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  board-label:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.06em"
  reading:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  ui:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  rate:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "tnum"
  editor:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "28px"
  meta:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  stamp: "3px"
  control: "6px"
  card: "8px"
  pill: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "32px"
  gutter-desktop: "40px"
  section-y: "80px"
  card-pad: "20px"
components:
  button-primary:
    backgroundColor: "{colors.board-green}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.board-green-raised}"
  button-rate:
    backgroundColor: "{colors.rate-amber}"
    textColor: "#1D1400"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 20px"
  stamp-exact:
    backgroundColor: "{colors.board-green}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.stamp}"
    padding: "2px 6px"
  stamp-estimate:
    backgroundColor: "{colors.rate-amber-wash}"
    textColor: "{colors.rate-amber-ink}"
    rounded: "{rounded.stamp}"
    padding: "2px 6px"
  segmented-on:
    backgroundColor: "{colors.board-green}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.control}"
  input-search:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "32px"
  card-answer:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
---

# Design System: TokenCraft

## Overview

**Creative North Star: "The Rate Board"**

TokenCraft is a bureau-de-change board for prompts. You hand it text, and it posts what that text costs on every model, in amber figures on green enamel, stamped with the time the rates were taken. The workspace around the board is cool rate-card paper in light mode and deep board-green-black at night. Everything that is not a price or a live rate stays quiet, so the figures carry the page.

Density is that of a working instrument, not a dashboard. The first viewport is one flow: the prompt on the left with token boundaries underlined on the text itself, and on the right the answer, which is one big count, three money figures, a fit bar and a five-row mini board. There are no stat-tile grids and no equal-weight panels. Below the fold the page changes register to reading: the full rate board as a full-bleed green section, then the minifier, comparison, guide and FAQ set on paper.

The system refuses glass, glow and gradient text, and it never fakes a material. The "board" is flat enamel colour and hairline rules, not a skeuomorphic split-flap.

**Key Characteristics:**
- Board-green owns the chrome (top bar, rate boards, footer); paper owns the work.
- Amber is money. If it is amber, it is a price, a rate or the live-rates stamp.
- Condensed uppercase display type for board labels and headings; mono for tokens and rates.
- One fixed log cost ramp shared by every row on every board.
- Every count says how sure it is: an Exact stamp or a ≈ Estimate stamp.

## Colors

Two inks on two grounds: enamel green and rate amber, over cool paper or green-black night.

### Primary
- **Board Green** (board-green): the top bar, both rate boards, the footer, primary buttons and the selected segment. In dark mode it stays the same green and sits above a darker ground.
- **Raised Board** (board-green-raised): hover and selected rows on a board, the search field on a board.
- **Board Rule** (board-rule): hairlines between board rows and around board controls.

### Secondary
- **Rate Amber** (rate-amber): prices on green, the cost ramp fill, the live-rates stamp, the reply-reserved side of the fit bar, the active provider filter.
- **Amber Ink** (rate-amber-ink): prices on paper, where plain amber fails contrast. In dark mode amber ink becomes Rate Amber itself.
- **Amber Wash** (rate-amber-wash): background of the ≈ Estimate stamp and the caret-token highlight.

### Tertiary
- **Token inks** (token-green, token-amber, token-blue, token-plum): the four underline colours cycled across adjacent tokens in the editor and the chip views. They exist only to separate neighbours and carry no meaning.

### Neutral
- **Paper** (paper) / **Sheet** (sheet) / **Panel** (panel): page ground, raised cards and the editor, quiet fills.
- **Ink** (ink), **Ink 2** (ink-2), **Ink 3** (ink-3): primary text, secondary text, hints and metadata. Ink 3 still clears 4.5:1 on paper.
- **Rule** (rule) / **Rule 2** (rule-2): hairlines and stronger dividers.
- **Night Paper** / **Night Sheet**: the dark-theme grounds. Inks invert to pale green-greys.

### Named Rules
**The Amber Is Money Rule.** Amber appears only on prices, rates, cost ramps and the live-rates stamp. A decorative amber accent breaks the board's one promise.

**The Two Grounds Rule.** Green enamel is chrome and boards; paper is work and reading. Never set long-form reading on green, and never put the editor on green.

## Typography

**Display Font:** Barlow Condensed (fallback: Geist, sans-serif)
**Body Font:** Geist (fallback: system-ui)
**Label/Mono Font:** Geist Mono (fallback: ui-monospace)

**Character:** A condensed sign-painter's face for the board and the big figures, a neutral grotesk for everything you read, and a mono that makes token widths and rate columns line up.

### Hierarchy
- **Figure** (600, figure 64px on phones up to figure-xl 88px on desktop, line-height 0.95; figure-lg 72px for the minifier before→after): the token count. One per screen.
- **Display** (700, display-sm 40 → display 56px, uppercase, 0.02em): section titles such as "The rate board" and "Tokens, plainly".
- **Headline / Title** (700, 28–36px, uppercase): the page H1, guide subheads, model-page sections; 22px tally on the phone bar.
- **Board label** (600, 17px, uppercase, 0.06em): headers inside boards ("Cheapest for this call", "Rate card").
- **Body** (400, 15–16px, 1.6–1.7): reading copy, capped at 68ch in the guide.
- **Label** (500, 12–13px): field labels and control text, sentence case.
- **Rate / editor** (mono, 12–14px, tabular numerals): every price, rate, token and ID. The editor sets 14px on a 28px line so underlines have room.

### Named Rules
**The Tabular Figures Rule.** Every number that can change uses tabular numerals so re-pricing never shifts a column.

**The Sentence-Case Controls Rule.** Uppercase belongs to the condensed display face only. Buttons, labels and tabs are sentence case in Geist.

## Layout

Content sits in a 1440px max container with 16px gutters on phones, 32px on tablets and 40px on desktop. The first viewport is a two-column grid at `lg`: prompt at 1.5fr and answer at a minimum of 360px / 1fr, with 20–32px gaps. Below `lg` the columns stack, and a floating tally (count plus per-call price on board green) rides at the bottom while the editor is visible and the count is not.

Sections below run full-bleed with 56px (phone) to 80px (desktop) vertical padding. Reading sections use a narrow left column (heading or table of contents) beside the content. Long tables collapse: the rate board shows 15 rows behind a "Show all N models" control, and its in/out columns hide below `md`.

**The One-Column Phone Rule.** Every grid declares an explicit one-column track on phones (`minmax(0,1fr)`), so a wide child can never widen the page.

## Elevation & Depth

The system is mostly flat and tonal. Paper and sheet separate by value and a hairline; boards separate by colour. Two shadows exist, both soft and structural, never decorative.

### Shadow Vocabulary
- **Elevated** (`0 12px 32px -8px rgb(ink / 0.18), 0 2px 6px rgb(ink / 0.06)`): the answer card, the minifier result card, popovers and dialogs.
- **Board** (`inset 0 1px 0 rgb(255 255 255 / 0.06), 0 10px 30px -12px rgb(board / 0.55)`): green boards that sit on paper (the mini board, the mobile tally).

**The Flat Board Rule.** A board is enamel, not a device. No bevels, no split-flap faking, no inner glow beyond the single 1px top highlight.

## Shapes

Small, square-ish corners: 3px for stamps and the live-rates badge, 6px for controls, 8px for cards and boards, and full rounds only for bar tracks and legend dots. Borders are 1px hairlines everywhere. Cost ramps and the fit bar are 6–10px rounded tracks with a flat fill.

## Components

### Buttons
- **Shape:** gently squared (6px radius).
- **Primary:** board green with board ink, 32–40px tall, 12–16px horizontal padding, 13–14px medium label. Hover lifts to raised board.
- **Rate CTA:** amber with near-black ink, 44px, used once per page for "Count a prompt for {model}".
- **Ghost / toolbar:** ink-2 text, panel fill on hover, used in the editor toolbar.
- **Focus:** a 2px focus ring in board green (gold in dark mode and on boards).

### Chips (tokens)
- **Style:** a 14% tint of one token ink with a 2px inset underline in the full ink, 3px radius, mono 13px.
- **State:** hover lifts 1px; the copied chip gets a 2px amber ring.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** sheet on paper, with a 1px rule border.
- **Shadow Strategy:** Elevated, for the answer card and the minifier card only.
- **Internal Padding:** 20px, or 24–32px for showcase cards.

### Inputs / Fields
- **Style:** 1px rule border, sheet background, 6px radius, 32–36px tall, with a leading search icon in ink-3.
- **Focus:** the border shifts to board green (gold in dark mode and on boards).

### Navigation
- **Top bar:** sticky, 56px, board green. Condensed wordmark ("Token" in board ink, "Craft" in amber), sentence-case section links in muted board ink that brighten on hover, then the live-rates stamp, theme toggle and a quiet text "Sign in". Section links hide below `md`, and the rates stamp hides below `sm`.

### Precision Stamp (signature)
A tiny mono uppercase stamp beside every count. **Exact** is board green with board ink; **≈ Estimate** is amber wash with amber ink. It is never omitted and never softened.

### Rate Board Row (signature)
Model name with its provider beneath, then in/out rates per 1M, context window, a fixed-log cost ramp and the per-call price in amber mono. A selected row gets raised board plus an amber dot. Clicking a row selects that model everywhere.

### Rolling Figure (signature motion)
When a settled change re-prices a figure, only the characters that changed roll in from above (260ms, `cubic-bezier(0.16, 1, 0.3, 1)`, slight blur). The swap is instant under reduced motion.

## Do's and Don'ts

### Do:
- **Do** show "Counting…" until the engine has answered; never render a fake 0 or a dash pretending to be a value.
- **Do** put the Exact or ≈ Estimate stamp next to every token count.
- **Do** draw every cost ramp on the same fixed log scale ($0.003 to $100 per 1M).
- **Do** keep prices in amber mono with tabular numerals, using amber ink on paper.
- **Do** collapse long lists behind "Show all" and keep phone pages free of horizontal scroll.

### Don't:
- **Don't** use amber for anything that is not money or a live rate.
- **Don't** build grids of equal stat tiles; give one figure display size and set the rest as a quiet row.
- **Don't** add kickers or eyebrow labels above headings, gradient text, glass, or glow.
- **Don't** fake the board as a physical split-flap or bevelled device.
- **Don't** claim savings in characters; the minifier reports tokens counted with the same encoding.
