import { formatDay, type ChatMessage } from './parseChat';
import type { BookMetrics } from '../hooks/useBookMetrics';

export type Block =
    | { kind: 'day'; key: string; label: string }
    | { kind: 'sys'; key: string; text: string; line: number; showMeta: boolean }
    | {
        kind: 'msg';
        key: string;
        line: number;
        sender: string;
        time: string;
        text: string;
        color: number;
        highlight: boolean;
        showMeta: boolean;
        continued: boolean;
    };

type TextBlock = Extract<Block, { kind: 'sys' | 'msg' }>;

export interface BookPageData {
    blocks: Block[];
    dayLabel: string;
}

export const SENDER_COLORS = 6;

export function buildBlocks(messages: ChatMessage[], participants: string[]): Block[] {
    const blocks: Block[] = [];
    let lastDay = '';
    for (const m of messages) {
        if (m.rawDate && m.rawDate !== lastDay) {
            lastDay = m.rawDate;
            blocks.push({ kind: 'day', key: `d${m.id}`, label: formatDay(m) });
        }
        if (m.sender === null) {
            blocks.push({ kind: 'sys', key: `s${m.id}`, text: m.text, line: m.lineNo, showMeta: true });
        } else {
            blocks.push({
                kind: 'msg',
                key: `m${m.id}`,
                line: m.lineNo,
                sender: m.sender,
                time: m.time,
                text: m.text,
                color: participants.indexOf(m.sender) % SENDER_COLORS,
                highlight: m.highlight,
                showMeta: true,
                continued: false,
            });
        }
    }
    return blocks;
}

/** Imperative twin of <BlockView/>; markup and class names must stay identical for accurate measurement. */
function createBlockElement(b: Block): HTMLElement {
    const el = document.createElement('div');
    if (b.kind === 'day') {
        el.className = 'day';
        const span = document.createElement('span');
        span.textContent = b.label;
        el.appendChild(span);
    } else if (b.kind === 'sys') {
        el.className = 'sys';
        if (b.showMeta) {
            const ref = document.createElement('span');
            ref.className = 'ref';
            ref.textContent = `L${b.line}`;
            el.appendChild(ref);
        }
        el.appendChild(document.createTextNode(b.text));
    } else {
        el.className = `msg msg--c${b.color}${b.continued ? ' msg--cont' : ''}${b.highlight ? ' msg--hl' : ''}`;
        if (b.showMeta) {
            const meta = document.createElement('div');
            meta.className = 'msg__meta';
            const sender = document.createElement('span');
            sender.className = 'msg__sender';
            sender.textContent = b.sender;
            const time = document.createElement('span');
            time.className = 'msg__time';
            time.textContent = b.time;
            const ref = document.createElement('span');
            ref.className = 'ref';
            ref.textContent = `L${b.line}`;
            meta.append(sender, time, ref);
            el.appendChild(meta);
        }
        const p = document.createElement('p');
        p.className = 'msg__text';
        p.textContent = b.text;
        el.appendChild(p);
    }
    return el;
}

function withText(b: TextBlock, text: string, part: 'head' | 'tail', offset: number): TextBlock {
    if (part === 'head') return { ...b, text };
    const key = `${b.key}.${offset}`;
    return b.kind === 'msg'
        ? { ...b, key, text, showMeta: false, continued: true }
        : { ...b, key, text, showMeta: false };
}

/** Largest n in [lo, hi] for which ok(n) holds, assuming monotonicity; returns lo - 1 if none. */
function maxFitting(lo: number, hi: number, ok: (n: number) => boolean): number {
    let best = lo - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (ok(mid)) {
            best = mid;
            lo = mid + 1;
        } else hi = mid - 1;
    }
    return best;
}

function splitBlock(
    b: TextBlock,
    avail: number,
    measure: (b: Block) => number,
): { head: TextBlock; tail: TextBlock | null } | null {
    const fits = (text: string) => measure(withText(b, text, 'head', 0)) <= avail;

    // Prefer breaking between words; fall back to characters for very long tokens (e.g. URLs).
    const tokens = b.text.match(/\s+|\S+/g) ?? [];
    let headText = '';
    let consumed = 0;
    const n = maxFitting(1, tokens.length - 1, (k) => fits(tokens.slice(0, k).join('').trimEnd()));
    if (n >= 1 && tokens.slice(0, n).join('').trim()) {
        headText = tokens.slice(0, n).join('').trimEnd();
        consumed = tokens.slice(0, n).join('').length;
    } else {
        const chars = Array.from(b.text);
        const k = maxFitting(1, chars.length - 1, (c) => fits(chars.slice(0, c).join('')));
        if (k < 1) return null;
        headText = chars.slice(0, k).join('');
        consumed = headText.length;
    }

    const rest = b.text.slice(consumed).replace(/^\s+/, '');
    return {
        head: withText(b, headText, 'head', 0),
        tail: rest ? withText(b, rest, 'tail', consumed) : null,
    };
}

export function paginate(blocks: Block[], m: BookMetrics): BookPageData[] {
    const measurer = document.createElement('div');
    measurer.className = 'page__content page-measure';
    measurer.style.width = `${m.contentW}px`;
    measurer.style.setProperty('--fs', `${m.fontSize}px`);
    document.body.appendChild(measurer);

    try {
        // Measure everything in a single layout pass.
        const els = blocks.map(createBlockElement);
        const frag = document.createDocumentFragment();
        els.forEach((el) => frag.appendChild(el));
        measurer.appendChild(frag);
        const heights = els.map((el) => el.getBoundingClientRect().height);
        measurer.textContent = '';

        const measure = (b: Block) => {
            const el = createBlockElement(b);
            measurer.appendChild(el);
            const h = el.getBoundingClientRect().height;
            measurer.removeChild(el);
            return h;
        };

        const H = m.contentH - 2; // small safety margin for sub-pixel rounding
        const minSplit = m.fontSize * 1.55 * 3; // roughly three lines of text
        const pages: Block[][] = [];
        let cur: Block[] = [];
        let used = 0;
        const newPage = () => {
            if (cur.length) pages.push(cur);
            cur = [];
            used = 0;
        };

        for (let i = 0; i < blocks.length; i++) {
            let b = blocks[i];
            let h = heights[i];

            for (; ;) {
                const remaining = H - used;

                if (b.kind === 'day') {
                    // Never leave a date heading orphaned at the bottom of a page.
                    const need = h + Math.min(heights[i + 1] ?? 0, minSplit);
                    if (cur.length && need > remaining) {
                        newPage();
                        continue;
                    }
                    cur.push(b);
                    used += h;
                    break;
                }

                if (h <= remaining) {
                    cur.push(b);
                    used += h;
                    break;
                }

                const worthSplitting = h > H || (h > H * 0.3 && remaining >= minSplit);
                if (cur.length && (!worthSplitting || remaining < minSplit)) {
                    newPage();
                    continue;
                }

                const parts = splitBlock(b, remaining, measure);
                if (!parts) {
                    if (cur.length) {
                        newPage();
                        continue;
                    }
                    cur.push(b); // cannot be split any further; accept (clipped) rather than loop forever
                    used += h;
                    break;
                }
                cur.push(parts.head);
                newPage();
                if (!parts.tail) break;
                b = parts.tail;
                h = measure(b);
            }
        }
        newPage();

        let lastDay = '';
        return pages.map((blocks) => {
            // Running head shows the day in effect at the top of the page.
            const dayLabel = blocks[0]?.kind === 'day' ? blocks[0].label : lastDay;
            for (const b of blocks) if (b.kind === 'day') lastDay = b.label;
            return { blocks, dayLabel };
        });
    } finally {
        measurer.remove();
    }
}
