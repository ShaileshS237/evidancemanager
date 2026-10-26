import { useEffect, useState } from 'react';
import { buildBlocks, paginate, type BookPageData } from '../lib/paginate';
import type { ParsedChat } from '../lib/parseChat';
import type { BookMetrics } from './useBookMetrics';

/** Splits the chat into page-sized chunks by measuring rendered blocks off-screen. */
export function usePagination(chat: ParsedChat, metrics: BookMetrics | null): BookPageData[] | null {
    const [pages, setPages] = useState<BookPageData[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        setPages(null);
        if (!metrics) return;
        const run = () => {
            if (cancelled) return;
            setPages(paginate(buildBlocks(chat.messages, chat.participants), metrics));
        };
        // Fonts must be ready, otherwise measurements are taken with fallback metrics.
        document.fonts.ready.then(() => setTimeout(run, 0));
        return () => {
            cancelled = true;
        };
    }, [chat, metrics]);

    return pages;
}
