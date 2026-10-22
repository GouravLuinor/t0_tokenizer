---
version: 1
slug: "app-tools-tokencraft-page-tsx"
primary_target: "app/tools/tokencraft/page.tsx"
related_targets: []
---

Scope: /tools/tokencraft (the whole page). Visitor mode: Operate for the first viewport (workstation); Persuade/Read for the sections below (rate board, minifier story, guide, comparison, FAQ).
Audience & job: developers pasting a prompt to learn tokens, fit, and cost now. Proof: live OpenRouter rates, exact-vs-estimate labels, in-tab compute.
Memorable moment: the live rate board stamped with its sync time, re-pricing your prompt across every model.
Unresolved: real per-provider tokenizers (Llama/Qwen/DeepSeek via HF tokenizer.json) are a roadmap item, not in this build.

## Direction contract
THESIS: One prompt converted into its cost on every model at live rates, like a bureau-de-change board. Refuses the category default of two equal panes (text | coloured chips) plus four identical stat tiles.
OWN-WORLD: Board-green enamel (#0F3B2E family) owns the top bar and the rate board; amber figures (#F2A93B family) are reserved for money and live rates; light theme is cool rate-card paper, dark theme is deep board-green-black. Barlow Condensed for board labels and display figures, Geist for UI, Geist Mono for tokens and rates. Hairline rules, 3px radii on board elements, no glass, no glow.
STORY: Visitor pastes, sees count at display size with an exact/estimate stamp, sees what it costs here and at volume, sees it fits, then sees which model is cheapest; scrolls to the full board, minifier savings, and why TokenCraft beats tiktokenizer/OpenAI tokenizer.
FIRST VIEWPORT: Green top bar (wordmark, Counter/Rate board/Minifier/Guide/FAQ, live-rates stamp, theme, quiet sign-in). Left ~60%: "Your prompt" editor with token boundaries underlined in place on the text, mode toggle, footer stats + minify savings. Right ~40%: model picker, display-size token count, estimate stamp, three cost figures, two-sided fit bar, green mini board of five cheapest models with fixed log cost ramps, link to the full 95-model board.
FORM: The Rate Board, candidate 3 of 7 on my ordered list; seed key 28bab997. Signature move: rate-board figures roll once when a settled change re-prices them (instant under reduced motion).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
