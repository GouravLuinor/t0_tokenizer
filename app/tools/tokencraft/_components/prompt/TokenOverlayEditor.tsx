"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type { TokenChunk } from "../../_lib/tokenizeTypes";

/** Above this many tokens the in-place underlines would cost more than they help. */
export const OVERLAY_TOKEN_LIMIT = 20_000;

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Tokens for `value`, or null while they are being computed */
  tokens: TokenChunk[] | null;
  onCaretToken: (token: TokenChunk | null) => void;
  placeholder: string;
}

interface Segment {
  start: number;
  end: number;
  /** Index of the first token in this segment, or -1 for untokenized text */
  first: number;
  last: number;
}

/** Tokens that share a span (pieces of one multi-byte character) draw as one unit. */
function buildSegments(text: string, tokens: TokenChunk[]): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;
  for (const t of tokens) {
    if (t.end <= t.start) continue;
    const prev = segments[segments.length - 1];
    if (prev && prev.start === t.start && prev.end === t.end) {
      prev.last = t.index;
      continue;
    }
    if (t.start > pos) segments.push({ start: pos, end: t.start, first: -1, last: -1 });
    segments.push({ start: t.start, end: t.end, first: t.index, last: t.index });
    pos = t.end;
  }
  if (pos < text.length) segments.push({ start: pos, end: text.length, first: -1, last: -1 });
  return segments;
}

/** Binary search for the token whose span holds the caret. */
function tokenAtOffset(tokens: TokenChunk[], offset: number): TokenChunk | null {
  let lo = 0;
  let hi = tokens.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = tokens[mid];
    if (offset < t.start) hi = mid - 1;
    else if (offset >= t.end) lo = mid + 1;
    else {
      // Prefer the completing token of a shared span: it carries the text
      let k = mid;
      while (k + 1 < tokens.length && tokens[k + 1].start === t.start && tokens[k + 1].end === t.end) k++;
      return tokens[k];
    }
  }
  return null;
}

/**
 * A plain textarea with the token boundaries drawn underneath it. The
 * backdrop renders the same text, transparently, with every token span
 * underlined in a cycling ink; it shares the textarea's font, padding,
 * wrapping and scroll position, so the lines sit exactly under the glyphs.
 */
export function TokenOverlayEditor({ value, onChange, tokens, onCaretToken, placeholder }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef<HTMLElement | null>(null);

  const drawable = tokens !== null && tokens.length <= OVERLAY_TOKEN_LIMIT;

  const backdrop = useMemo(() => {
    if (!drawable || !tokens) return value;
    return buildSegments(value, tokens).map((seg) =>
      seg.first < 0 ? (
        <React.Fragment key={`g${seg.start}`}>{value.slice(seg.start, seg.end)}</React.Fragment>
      ) : (
        <span key={seg.first} data-t={seg.last} className={`tk tk-${seg.first % 4}`}>
          {value.slice(seg.start, seg.end)}
        </span>
      )
    );
  }, [value, tokens, drawable]);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    const bd = backdropRef.current;
    if (ta && bd) {
      bd.scrollTop = ta.scrollTop;
      bd.scrollLeft = ta.scrollLeft;
    }
  }, []);

  const reportCaret = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || !tokens) {
      onCaretToken(null);
      return;
    }
    const caret = ta.selectionStart === ta.value.length ? Math.max(0, ta.selectionStart - 1) : ta.selectionStart;
    const token = document.activeElement === ta ? tokenAtOffset(tokens, caret) : null;
    onCaretToken(token);

    markedRef.current?.classList.remove("tk-at");
    markedRef.current = null;
    if (token && drawable && backdropRef.current) {
      const el = backdropRef.current.querySelector<HTMLElement>(`[data-t="${token.index}"]`);
      if (el) {
        el.classList.add("tk-at");
        markedRef.current = el;
      }
    }
  }, [tokens, drawable, onCaretToken]);

  // Keep the backdrop aligned after re-renders (new text, resize)
  useEffect(syncScroll, [backdrop, syncScroll]);
  useEffect(() => {
    reportCaret();
  }, [reportCaret]);

  const shared =
    "whitespace-pre-wrap break-words px-5 py-4 font-mono text-[14px] leading-[28px] [tab-size:4] [scrollbar-gutter:stable] sm:px-6 sm:py-5";

  return (
    <div className="relative min-h-[320px] flex-1 lg:min-h-0">
      <div
        ref={backdropRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 select-none overflow-hidden text-transparent ${shared}`}
      >
        {backdrop}
        {"\n"}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onSelect={reportCaret}
        onKeyUp={reportCaret}
        onClick={reportCaret}
        onBlur={() => onCaretToken(null)}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Your prompt"
        aria-describedby="prompt-stats"
        className={`absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-ink outline-none placeholder:text-ink-3 ${shared}`}
      />
    </div>
  );
}
