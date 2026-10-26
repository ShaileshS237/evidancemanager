import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CalendarSearch, ChevronDown, ChevronUp, Highlighter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDay, type ChatMessage } from '@/lib/parseChat';
import type { ChatExhibit } from '@/lib/evidence';
import { getLocale, useI18n } from '@/i18n';

type Row = { kind: 'day'; key: string; label: string; date: Date | null } | { kind: 'msg'; key: string; m: ChatMessage };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const shortDate = (m: ChatMessage) =>
    m.date ? m.date.toLocaleDateString(getLocale(), { day: '2-digit', month: 'short', year: 'numeric' }) : m.rawDate;

function highlightText(text: string, query: string): ReactNode {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    return parts.map((p, i) =>
        i % 2 === 1 ? (
            <mark key={i} className="rounded-sm bg-orange-200 px-0.5 text-inherit">
                {p}
            </mark>
        ) : (
            p
        ),
    );
}

/** Scrollable, virtualized WhatsApp-style message list. */
export function ChatListView({ exhibit, rightSender }: { exhibit: ChatExhibit; rightSender: string }) {
    const { t, lang } = useI18n();
    const { chat } = exhibit;
    const me = rightSender;

    const [order, setOrder] = useState<'oldest' | 'newest'>('oldest');
    const [onlyHighlighted, setOnlyHighlighted] = useState(false);
    const highlightCount = useMemo(() => chat.messages.filter((m) => m.highlight).length, [chat]);

    const rows = useMemo(() => {
        const out: Row[] = [];
        let lastDay = '';
        const base = onlyHighlighted ? chat.messages.filter((m) => m.highlight) : chat.messages;
        const messages = order === 'oldest' ? base : [...base].reverse();
        for (const m of messages) {
            if (m.rawDate && m.rawDate !== lastDay) {
                lastDay = m.rawDate;
                out.push({ kind: 'day', key: `d${m.id}`, label: formatDay(m), date: m.date });
            }
            out.push({ kind: 'msg', key: `m${m.id}`, m });
        }
        return out;
    }, [chat, order, onlyHighlighted, lang]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: (i) => (rows[i].kind === 'day' ? 44 : 64),
        overscan: 12,
        getItemKey: (i) => rows[i].key,
    });

    const [query, setQuery] = useState('');
    const [matchPos, setMatchPos] = useState(0);
    const q = query.trim();
    const matches = useMemo(() => {
        if (q.length < 2) return [];
        const needle = q.toLowerCase();
        const out: number[] = [];
        rows.forEach((r, i) => {
            if (r.kind === 'msg' && r.m.text.toLowerCase().includes(needle)) out.push(i);
        });
        return out;
    }, [rows, q]);
    const currentMatch = matches.length ? matches[Math.min(matchPos, matches.length - 1)] : -1;

    useEffect(() => setMatchPos(0), [q]);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [order, onlyHighlighted]);
    useEffect(() => {
        if (currentMatch >= 0) virtualizer.scrollToIndex(currentMatch, { align: 'center' });
    }, [currentMatch, virtualizer]);

    const step = (dir: 1 | -1) => {
        if (!matches.length) return;
        setMatchPos((p) => (p + dir + matches.length) % matches.length);
    };

    const jumpToDate = (iso: string) => {
        if (!iso) return;
        const target = new Date(`${iso}T00:00:00`).getTime();
        const idx = rows.findIndex(
            (r) =>
                r.kind === 'day' && r.date && (order === 'oldest' ? r.date.getTime() >= target : r.date.getTime() <= target),
        );
        virtualizer.scrollToIndex(idx >= 0 ? idx : rows.length - 1, { align: 'start' });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2 border-b bg-background px-4 py-2 sm:px-6">
                <div className="relative w-full max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pr-8 pl-8"
                        placeholder={t('searchMessages')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                step(e.shiftKey ? -1 : 1);
                            }
                        }}
                    />
                    {query && (
                        <button
                            type="button"
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
                {q.length >= 2 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                        {matches.length ? `${Math.min(matchPos, matches.length - 1) + 1} / ${matches.length}` : t('noMatchesShort')}
                        <Button variant="ghost" size="icon-sm" onClick={() => step(-1)} disabled={!matches.length} aria-label="Previous match">
                            <ChevronUp />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => step(1)} disabled={!matches.length} aria-label="Next match">
                            <ChevronDown />
                        </Button>
                    </div>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    aria-pressed={onlyHighlighted}
                    onClick={() => setOnlyHighlighted((v) => !v)}
                    className={cn(
                        'ml-auto border-yellow-300 hover:bg-yellow-100',
                        onlyHighlighted && 'bg-yellow-300 text-yellow-950 hover:bg-yellow-300',
                    )}
                >
                    <Highlighter />
                    {onlyHighlighted ? t('showingHighlighted') : t('highlightedOnly')}
                    <span className="tabular-nums opacity-70">{highlightCount.toLocaleString()}</span>
                </Button>
                <div className="flex rounded-lg border p-0.5" role="group" aria-label="Sort order">
                    {(['oldest', 'newest'] as const).map((o) => (
                        <Button
                            key={o}
                            size="sm"
                            variant={order === o ? 'secondary' : 'ghost'}
                            className="h-7"
                            aria-pressed={order === o}
                            onClick={() => setOrder(o)}
                        >
                            {o === 'oldest' ? t('oldestFirst') : t('newestFirst')}
                        </Button>
                    ))}
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarSearch className="size-4" />
                    <span className="hidden sm:inline">{t('goToDate')}</span>
                    <Input type="date" className="h-8 w-auto" onChange={(e) => jumpToDate(e.target.value)} />
                </label>
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-background">
                <div className="relative mx-auto w-full max-w-3xl" style={{ height: virtualizer.getTotalSize() }}>
                    {virtualizer.getVirtualItems().map((v) => {
                        const row = rows[v.index];
                        return (
                            <div
                                key={v.key}
                                data-index={v.index}
                                ref={virtualizer.measureElement}
                                className="absolute top-0 left-0 w-full px-3 sm:px-6"
                                style={{ transform: `translateY(${v.start}px)` }}
                            >
                                {row.kind === 'day' ? (
                                    <div className="flex justify-center py-3">
                                        <span className="rounded-full border px-3 py-0.5 text-xs text-muted-foreground">
                                            {row.label}
                                        </span>
                                    </div>
                                ) : (
                                    <MessageRow m={row.m} isMe={row.m.sender === me} query={q} active={v.index === currentMatch} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function MessageRow({ m, isMe, query, active }: { m: ChatMessage; isMe: boolean; query: string; active: boolean }) {
    if (m.sender === null) {
        return (
            <div className="flex justify-center py-1.5">
                <span className="max-w-[85%] rounded-md border border-dashed px-3 py-1 text-center text-xs whitespace-pre-wrap text-muted-foreground">
                    {highlightText(m.text, query)}
                </span>
            </div>
        );
    }
    return (
        <div className={cn('flex flex-col py-1', isMe ? 'items-end' : 'items-start')}>
            <div className="mb-0.5 px-3 text-[11px] font-medium text-muted-foreground">{m.sender}</div>
            <div
                className={cn(
                    'max-w-[80%] rounded-[22px] px-3.5 py-2 text-sm break-words whitespace-pre-wrap sm:max-w-[65%]',
                    isMe ? 'bg-[#3797f0] text-white' : 'bg-[#efefef] text-foreground',
                    m.highlight && 'bg-none bg-yellow-200 text-yellow-950 ring-2 ring-yellow-400',
                    active && 'ring-2 ring-orange-400 ring-offset-2',
                )}
            >
                {highlightText(m.text, query)}
            </div>
            <div className="mt-0.5 px-3 text-[10px] text-muted-foreground">
                {shortDate(m)} {m.time}
            </div>
        </div>
    );
}
