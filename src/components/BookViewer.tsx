import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Cover, ContentPage } from './BookPages';
import { NavBar } from './NavBar';
import { useBookMetrics } from '../hooks/useBookMetrics';
import { usePagination } from '../hooks/usePagination';
import { formatDay } from '../lib/parseChat';
import { createPageWindowStore, PageWindowContext } from '../lib/pageWindow';
import type { ChatExhibit } from '../lib/evidence';

interface PageFlipApi {
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    flip(page: number, corner?: 'top' | 'bottom'): void;
}

interface FlipBookHandle {
    pageFlip(): PageFlipApi | undefined;
}

export function BookViewer({ exhibit }: { exhibit: ChatExhibit }) {
    const { chat, source } = exhibit;
    const containerRef = useRef<HTMLDivElement>(null);
    const metrics = useBookMetrics(containerRef);
    const pages = usePagination(chat, metrics);
    const bookRef = useRef<FlipBookHandle>(null);
    const currentRef = useRef(0);
    const [current, setCurrent] = useState(0);
    const windowStore = useMemo(() => createPageWindowStore(currentRef.current), []);

    const contentCount = pages?.length ?? 0;
    const needsBlank = contentCount % 2 === 1;
    const totalPages = 2 + contentCount + (needsBlank ? 1 : 0);
    const lastIndex = totalPages - 1;

    const coverInfo = useMemo(() => {
        const dated = chat.messages.filter((m) => m.date);
        const first = dated[0];
        const last = dated[dated.length - 1];
        const range = first && last ? `${formatDay(first)} — ${formatDay(last)}` : undefined;
        const n = chat.participants.length;
        const subtitle =
            n > 3 ? `${n} participants · ${chat.messages.length} messages` : `${chat.messages.length} messages`;
        return { range, subtitle };
    }, [chat]);

    const api = useCallback(() => bookRef.current?.pageFlip(), []);
    const prev = useCallback(() => api()?.flipPrev(), [api]);
    const next = useCallback(() => api()?.flipNext(), [api]);

    const jump = useCallback(
        (contentPage: number) => {
            if (contentPage === currentRef.current) return;
            // Keep both ends rendered while the page turns.
            windowStore.setFocus(currentRef.current, contentPage);
            api()?.flip(contentPage);
        },
        [api, windowStore],
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                next();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prev();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [next, prev]);

    const onFlip = useCallback(
        (e: { data: number }) => {
            currentRef.current = e.data;
            windowStore.setFocus(e.data);
            setCurrent(e.data);
        },
        [windowStore],
    );

    const bookPages = useMemo(() => {
        if (!pages || !metrics) return null;
        const { portrait } = metrics;
        const sideOf = (index: number) => (portrait ? 'right' : index % 2 === 1 ? 'left' : 'right');
        const list = [
            <Cover
                key="front"
                variant="front"
                title={chat.title}
                subtitle={coverInfo.subtitle}
                range={coverInfo.range}
                source={source}
                excerpt={exhibit.excerpt}
            />,
            ...pages.map((p, i) => (
                <ContentPage
                    key={i}
                    index={i + 1}
                    data={p}
                    number={i + 1}
                    side={sideOf(i + 1)}
                    title={chat.title}
                    metrics={metrics}
                />
            )),
        ];
        if (pages.length % 2 === 1) {
            list.push(
                <ContentPage
                    key="blank"
                    index={pages.length + 1}
                    data={null}
                    number={null}
                    side={sideOf(pages.length + 1)}
                    title={chat.title}
                    metrics={metrics}
                />,
            );
        }
        list.push(<Cover key="back" variant="back" />);
        return list;
    }, [pages, chat, coverInfo, source, metrics]);

    const containerClass =
        'flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-3 py-6';

    if (!pages || !bookPages || !metrics) {
        return (
            <div ref={containerRef} className={containerClass}>
                <p className="text-sm text-muted-foreground">Preparing pages…</p>
            </div>
        );
    }

    const { portrait, pageW, pageH } = metrics;
    const startPage = Math.min(currentRef.current, lastIndex);
    const closedFront = !portrait && current === 0;
    const closedBack = !portrait && current >= lastIndex;
    const isOpen = !portrait && !closedFront && !closedBack;

    const stageStyle = {
        width: portrait ? pageW : pageW * 2,
        height: pageH,
        '--page-w': `${pageW}px`,
    } as CSSProperties;

    const pageNumber = Math.min(Math.max(current, 1), contentCount);
    const label = 'Page';

    return (
        <div ref={containerRef} className={containerClass}>
            {/* overflow-hidden: the turning page sweeps outside the book and would otherwise add scrollbars */}
            <div
                className={[
                    'book-stage',
                    portrait && 'book-stage--portrait',
                    closedFront && 'book-stage--closed-front',
                    closedBack && 'book-stage--closed-back',
                    isOpen && 'book-stage--open',
                ]
                    .filter(Boolean)
                    .join(' ')}
                style={stageStyle}
            >
                <div className="book-stage__shadow" aria-hidden />
                <PageWindowContext.Provider value={windowStore}>
                    <HTMLFlipBook
                        key={`${pageW}x${pageH}-${portrait}-${totalPages}`}
                        ref={bookRef}
                        className="book"
                        style={{}}
                        width={pageW}
                        height={pageH}
                        size="fixed"
                        minWidth={pageW}
                        maxWidth={pageW}
                        minHeight={pageH}
                        maxHeight={pageH}
                        startPage={startPage}
                        drawShadow
                        flippingTime={850}
                        usePortrait={portrait}
                        startZIndex={1}
                        autoSize
                        maxShadowOpacity={0.45}
                        showCover
                        mobileScrollSupport
                        clickEventForward
                        useMouseEvents
                        swipeDistance={30}
                        showPageCorners={false}
                        disableFlipByClick={false}
                        onFlip={onFlip}
                        // Pages are only re-read when their count changes; content updates come via the window store.
                        renderOnlyPageLengthChange
                    >
                        {bookPages}
                    </HTMLFlipBook>
                </PageWindowContext.Provider>
                {isOpen && <div className="book-stage__spine" aria-hidden />}
            </div>

            <NavBar
                current={pageNumber}
                total={contentCount}
                label={label}
                canPrev={current > 0}
                canNext={current < lastIndex}
                onPrev={prev}
                onNext={next}
                onJump={jump}
            />
            <p className="-mt-3 hidden text-xs text-muted-foreground sm:block">
                Click or drag the page corners · ← → keys to turn pages
            </p>
        </div>
    );
}
