import { useEffect, useState, type RefObject } from 'react';

export interface BookMetrics {
    portrait: boolean;
    pageW: number;
    pageH: number;
    padX: number;
    padY: number;
    head: number;
    foot: number;
    contentW: number;
    contentH: number;
    fontSize: number;
}

const CONTROLS_H = 90; // navigation + hint below the book
const MIN_PAGE_W = 220;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** `w`/`h` are the inner size of the area the book (plus its controls) may occupy. */
export function computeMetrics(w: number, h: number): BookMetrics {
    const portrait = w / 2 < MIN_PAGE_W + 24;
    const ratio = portrait ? 0.66 : 0.72;
    const availW = portrait ? w : w - 48;
    const availH = h - CONTROLS_H;

    let pageH = Math.min(availH, 860);
    let pageW = pageH * ratio;
    const maxW = portrait ? availW : availW / 2;
    if (pageW > maxW) {
        pageW = maxW;
        pageH = pageW / ratio;
    }
    pageW = Math.floor(Math.max(pageW, MIN_PAGE_W));
    pageH = Math.floor(Math.max(pageH, 300));

    const padX = Math.round(clamp(pageW * 0.09, 20, 46));
    const padY = Math.round(clamp(pageH * 0.045, 18, 36));
    const head = 28;
    const foot = 30;
    const fontSize = pageW < 340 ? 14 : 15;

    return {
        portrait,
        pageW,
        pageH,
        padX,
        padY,
        head,
        foot,
        contentW: pageW - padX * 2,
        contentH: pageH - padY * 2 - head - foot,
        fontSize,
    };
}

/** Measures `ref` and derives page geometry; null until the first measurement. */
export function useBookMetrics(ref: RefObject<HTMLElement | null>): BookMetrics | null {
    const [metrics, setMetrics] = useState<BookMetrics | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let timer = 0;
        let first = true;
        const update = (w: number, h: number) => {
            const next = computeMetrics(Math.floor(w), Math.floor(h));
            // Keep the same object while the layout is unchanged, to avoid needless re-pagination.
            setMetrics((prev) =>
                prev && (Object.keys(next) as (keyof BookMetrics)[]).every((k) => prev[k] === next[k]) ? prev : next,
            );
        };
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            window.clearTimeout(timer);
            // Debounce so sidebar/window animations don't trigger repeated re-pagination.
            timer = window.setTimeout(() => update(width, height), first ? 0 : 250);
            first = false;
        });
        ro.observe(el);
        return () => {
            window.clearTimeout(timer);
            ro.disconnect();
        };
    }, [ref]);

    return metrics;
}
