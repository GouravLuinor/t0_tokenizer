# TokenCraft Design Inspiration — Scraped Component & Pattern Reference

Compiled 2026-08-21 by scraping every design source cited in the NorAI blueprints.
Raw per-site notes live in `/tmp/opencode/scrape/*.md` (galleries-linear-raycast, magicui,
reactbits, aceternity, origin-cult). This file is the synthesized, actionable version.

Sources scraped: ui.aceternity.com · magicui.design · reactbits.dev · originui.com (now coss.com/ui) · cult-ui.com · refero.design · godly.website · saaspo.com · pageflows.com · linear.app teardown · raycast.com teardown.

---

## 1. Design-language rules (from Linear + Raycast DOM teardowns)

Apply these globally before adding any new component — this is the "staff-level" baseline.

1. **Elevation = lighter surface + hairline border, never drop shadows.** Keep the 3-step surface ladder (`#0E121E → #131827 → #1A2238`). Reserve shadows only for floating layers (tooltips, hover cards, palette): `0 8px 32px rgba(0,0,0,0.35)`, or Raycast's double-ring `0 0 0 1px rgb(27,28,30), inset 0 0 0 1px #07080a`.
2. **Typography:** Geist Sans 400/500/600 only; body 15px/1.6 (14px/1.45 in dense panes); titles tracking −0.01…−0.02em; micro-labels 11–12px/500 uppercase muted; JetBrains Mono 13px/1.5 for token IDs, byte counts, hex.
3. **Radius scale:** 4px keycaps/chips · 6px toolbar chips & command rows · 8px buttons/inputs · 12px cards/panels/palette · 16px large frames · pills for badges only.
4. **Borders:** 1px `#202B46` default, `#32436D` active; glass edges `rgba(255,255,255,0.06–0.08)` on elevated surfaces. Focus = 3px alpha ring of brand color (`rgba(16,185,129,0.3)`); inside the command palette use border-brighten instead (Raycast style).
5. **Badges/pills:** transparent or `rgba(255,255,255,0.05)` fill, hairline border, h-24–26px, 11–12px/500; status dots 6–8px emerald/cyan circles.
6. **Motion tokens:** state feedback 120–180ms with `cubic-bezier(0.25,0.46,0.45,0.94)` or `cubic-bezier(0.16,1,0.3,1)`; press = `scale(0.97)`; hover animates opacity/border/color only — never layout; modal/palette entrance 250–420ms over `rgba(0,0,0,0.85)` backdrop; honor `prefers-reduced-motion`.
7. **Tables:** hairline row separators only (no zebra), numeric columns mono, header 12px/500 uppercase-muted, hover = white 3–5% bg bump, selected = 2px left accent border.

## 2. Adoption map — existing components

| TokenCraft component | Upgrade | Source / recipe |
|---|---|---|
| **TopToolbar** | Gradient Text wordmark (`["#10B981","#06B6D4"]`, diagonal, 8s yoyo) | React Bits `/text-animations/gradient-text` |
| | Model selector as Segmented Control (or Combobox when list grows) | coss.com/ui `/ui/docs/components/segmented-control`, `/combobox` |
| | ⌘K Kbd chips + Toolbar grouping container | coss.com/ui `/kbd`, `/toolbar` |
| | Privacy badge per Linear spec: `rgba(16,185,129,0.05)` fill, hairline border, h-24px, 11px/500, 7px emerald status dot | Linear teardown §Components |
| **RawEditorPane** | Empty-state Dot Grid canvas: `baseColor="#202B46" activeColor="#10B981" dotSize=2 gap=24` | React Bits `/backgrounds/dot-grid` |
| | Empty-state copy via Blur Text (framer-motion, zero new deps) | React Bits `/text-animations/blur-text` |
| | Dropzone visuals per Aceternity File Upload (bg grid + drag-over micro-interactions) | ui.aceternity.com/components/file-upload |
| | Spotlight Card sheen: CSS vars `--mouse-x/y` + radial-gradient, `rgba(16,185,129,0.15)` | React Bits `/components/spotlight-card` |
| **TokenInspectorPane** | HoverCard anatomy per Raycast command row: elevated surface, hairline, radius 12, right-aligned mono metadata rows; shadow `0 8px 32px rgba(0,0,0,0.35)` | Raycast teardown |
| | Selected-token highlight: Border Glow following pointer proximity | React Bits `/components/border-glow` |
| | Shiny Text "Analyzing…" status (`shineColor="#10B981"`) | React Bits `/text-animations/shiny-text` |
| **MultiModelCostMatrix** | Number Ticker / Count Up on all figures — JetBrains Mono + `tabular-nums`, `separator=","`; keep `startValue`=previous to avoid re-counting from 0 | Magic UI number-ticker · React Bits count-up |
| | Border Beam on hovered/selected model column: parent `relative overflow-hidden`, `via-[#10B981]`, duration 6–8s ambient | Magic UI border-beam |
| | Table styling per rule 7 above; savings badges as emerald pills | Linear teardown |
| **ContextSafetyGauge** | Count Up % readout; amber >80%, rose >95% already correct | React Bits count-up |
| | Accessible `<Meter>` fallback layer | coss.com/ui `/meter` |
| **PromptDiffDialog** | Shine Border while diffing: `shineColor={["#10B981","#06B6D4"]} borderWidth={1} duration={14}` | Magic UI shine-border |
| | Glare Hover on before/after preview cards: cyan @ 0.12, 650ms | React Bits `/animations/glare-hover` |
| **CommandPalette** | Row anatomy: 6px-radius rows, active = one-notch-lighter surface, right-aligned keycap cluster (gradient `#121212→#0d0d0d`, inset top highlight, 4px radius, mono 12px); focus = border-brighten, no colored ring | Raycast ⌘K teardown |
| | Shiny Text hint footer | React Bits shiny-text |

## 3. Landing page (marketing surface)

- **Hero:** Aceternity Spotlight sweep behind headline — `--animate-spotlight: spotlight 2s ease 0.75s 1 forwards`, translate(-72%,-62%) scale(0.5)→translate(-50%,-40%) scale(1), `fill="#06B6D4"` (aceternity.com/components/spotlight). Headline via Split Text (GSAP, chars, 40ms stagger, power3.out) or Blur Text if avoiding GSAP.
- **Hero badge:** Magic UI Animated Gradient Text pill variant ("v1.0 · BPE engine") — demo literally uses our cyan `#06b6d4`.
- **Feature grid:** Magic UI Bento Grid (`lg:grid-cols-3 lg:grid-rows-3`, feature cell spans 2) with background layers masked `[mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]` and `group-hover:scale-105`. Cells: mini tokenizer demo, cost-matrix teaser w/ BorderBeam, context gauge, prompt-diff before/after.
- **Marquee:** model-logo social proof strip, `pauseOnHover [--duration:20s]`, edge fades `from-background`.
- **CTA:** Shimmer Button (`background="rgba(19,24,39,1)"`, `shimmerColor="#10B981"`) or Magnet + Star Border stack (+ Click Spark burst `sparkColor="#06B6D4"` on click).
- **Cursor-style card glow** (optional flagship): Aceternity Glowing Effect — conic gradient border tracking cursor; props `borderWidth=1 inactiveZone=0.7 spread=20 movementDuration=2`; recolor stops to emerald/cyan.
- **Thematic flourish:** React Bits Letter Glitch canvas backdrop (default palette is already green/cyan) — swap characters to BPE glyphs (Ġ, ▁). Low contrast, hero only.

## 4. Install commands

```bash
npx shadcn@latest add @magicui/number-ticker @magicui/border-beam @magicui/shine-border \
  @magicui/bento-grid @magicui/marquee @magicui/shimmer-button @magicui/animated-gradient-text
npx shadcn@latest add @aceternity/spotlight @aceternity/glowing-effect   # landing only
```
React Bits pieces are copy-paste (MIT); most need only framer-motion/CSS/canvas already in the stack. Only Split Text adds GSAP+SplitType — skip unless bundle budget allows.

## 5. Priority order

1. Motion + typography + radius tokens (§1) — global polish, zero deps
2. Number Ticker stats banner + Count Up figures
3. Spotlight Card sheen on panes/cards
4. Cost matrix table restyle + Border Beam highlight
5. CommandPalette Raycast row/keycap anatomy
6. Empty-state Dot Grid + Blur Text copy
7. Landing: Spotlight hero → Bento Grid → Marquee → CTA stack

## 6. Anti-fit list (do not import into app shell)

Vortex, Wavy/Aurora Background, Meteors, Sparkles, Background Boxes, Electric Border, Meteor showers — too decorative for the high-density tool chrome; marketing hero at most.

## 7. Gallery strategy (for future design iterations)

- **Refero.design** (135k+ screens): filter by *component facet* (toolbar/table/badge/empty-state), not brand; has an MCP server. Card-grid "similar items" pattern → idea: "similar tokens" suggestions in hover card.
- **Godly.website** (now "Recent"): deep-linkable filters `?font=&color=`; masonry via CSS columns; "N tokenizations today" live counter creates alive-tool feel.
- **Saaspo/PageFlows**: section-level galleries (pricing tables incl. Raycast's own) as direct references when styling the cost matrix; annotate each app state (empty → tokenize → hover → matrix) in demo GIFs like PageFlows does.
