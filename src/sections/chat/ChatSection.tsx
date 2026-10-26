import { useEffect, useState } from 'react';
import { FileWarning, Images, MessageSquareText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { ChatListView } from './ChatListView';
import { ScreenshotGrid } from './ScreenshotGrid';
import { CHATS, chatTitle, type ChatConfig } from './chats';
import { loadChatExhibit, loadExcerpt, type ChatExhibit } from '../../lib/evidence';

type Mode = 'full' | 'short';
type LoadState = { status: 'loading' } | { status: 'missing' } | { status: 'error'; message: string };

const urlOf = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const fileName = (path: string) => path.split('/').pop() ?? path;

async function fetchText(url: string): Promise<ArrayBuffer | null> {
    const res = await fetch(url, { cache: 'no-store' });
    // The dev server answers unknown paths with index.html, so check the type too.
    if (!res.ok || !res.headers.get('content-type')?.includes('text/plain')) return null;
    return res.arrayBuffer();
}

interface ChatSectionProps {
    cache: Record<string, ChatExhibit>;
    onLoaded: (id: string, exhibit: ChatExhibit) => void;
}

export function ChatSection({ cache, onLoaded }: ChatSectionProps) {
    const { t } = useI18n();
    const [activeId, setActiveId] = useState(CHATS[0].id);
    const [view, setView] = useState<'messages' | 'screenshots'>('messages');
    const [states, setStates] = useState<Record<string, LoadState>>({});
    const active = CHATS.find((c) => c.id === activeId)!;

    // Check which exports exist so the list can mark missing ones.
    useEffect(() => {
        for (const c of CHATS) {
            if (cache[c.id]) continue;
            fetch(urlOf(c.file), { method: 'HEAD', cache: 'no-store' })
                .then((r) => {
                    if (!r.ok || !r.headers.get('content-type')?.includes('text/plain')) {
                        setStates((s) => ({ ...s, [c.id]: { status: 'missing' } }));
                    }
                })
                .catch(() => setStates((s) => ({ ...s, [c.id]: { status: 'missing' } })));
        }
    }, []);

    useEffect(() => {
        if (cache[active.id] || states[active.id]?.status === 'missing') return;
        let cancelled = false;
        setStates((s) => ({ ...s, [active.id]: { status: 'loading' } }));
        (async () => {
            try {
                const buffer = await fetchText(urlOf(active.file));
                if (cancelled) return;
                if (!buffer) {
                    setStates((s) => ({ ...s, [active.id]: { status: 'missing' } }));
                    return;
                }
                const result = await loadChatExhibit(buffer, fileName(active.file), {});
                if (!result.chat.messages.some((m) => m.sender)) {
                    throw new Error("This file doesn't look like a WhatsApp chat export.");
                }
                if (!cancelled) onLoaded(active.id, result);
            } catch (e) {
                if (cancelled) return;
                const message = e instanceof Error && e.message ? e.message : 'The chat file could not be read.';
                setStates((s) => ({ ...s, [active.id]: { status: 'error', message } }));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [active.id]);

    const exhibit = cache[active.id];
    const state = states[active.id];

    return (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <nav
                aria-label={t('conversations')}
                className="flex shrink-0 gap-1 overflow-x-auto border-b bg-background p-2 md:w-60 md:flex-col md:overflow-y-auto md:border-r md:border-b-0"
            >
                <div className="hidden px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground md:block">{t('conversations')}</div>
                {CHATS.map((c) => {
                    const missing = !cache[c.id] && states[c.id]?.status === 'missing';
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setActiveId(c.id)}
                            className={cn(
                                'flex shrink-0 flex-col items-start rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted',
                                c.id === activeId && 'bg-muted',
                            )}
                        >
                            <span className={cn('font-medium whitespace-nowrap', missing && 'text-muted-foreground')}>
                                {chatTitle(c)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {cache[c.id]
                                    ? t('messagesCount', { n: cache[c.id].chat.messages.length.toLocaleString() })
                                    : missing
                                        ? t('notAddedYet')
                                        : '—'}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-3 border-b bg-background px-4 py-2.5 sm:px-6">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{chatTitle(active)}</span>
                    <div className="flex shrink-0 rounded-lg border p-0.5" role="group" aria-label="View">
                        {(
                            [
                                ['messages', t('messages'), MessageSquareText],
                                ['screenshots', t('screenshots'), Images],
                            ] as const
                        ).map(([v, label, Icon]) => (
                            <Button
                                key={v}
                                size="sm"
                                variant={view === v ? 'secondary' : 'ghost'}
                                className="h-7"
                                aria-pressed={view === v}
                                onClick={() => setView(v)}
                            >
                                <Icon />
                                <span className="hidden sm:inline">{label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
                {view === 'screenshots' ? (
                    <ScreenshotGrid key={active.id} chatId={active.id} />
                ) : exhibit ? (
                    <ChatPane key={active.id} config={active} exhibit={exhibit} />
                ) : state?.status === 'missing' ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
                        <FileWarning className="size-8 text-muted-foreground" />
                        <p className="font-medium">{chatTitle(active)}</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {t('noExport')}{' '}
                            <code className="rounded bg-muted px-1 font-mono text-xs">public/{active.file}</code> {t('andReload')}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center p-6">
                        <p className={state?.status === 'error' ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
                            {state?.status === 'error' ? state.message : t('loadingChat')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChatPane({ config, exhibit }: { config: ChatConfig; exhibit: ChatExhibit }) {
    const { t } = useI18n();
    const [mode, setMode] = useState<Mode>('full');
    const [short, setShort] = useState<ChatExhibit | null>(null);

    useEffect(() => {
        if (!config.shortFile) return;
        let cancelled = false;
        (async () => {
            const buffer = await fetchText(urlOf(config.shortFile!)).catch(() => null);
            if (!buffer || cancelled) return;
            const excerpt = await loadExcerpt(exhibit, buffer, fileName(config.shortFile!));
            if (!cancelled) setShort(excerpt);
        })();
        return () => {
            cancelled = true;
        };
    }, [exhibit, config.shortFile]);

    const shown = mode === 'short' && short ? short : exhibit;
    const excerpt = shown.excerpt;

    return (
        <>
            {(config.shortFile || (excerpt && excerpt.unmatched > 0)) && (
                <div className="flex items-center gap-3 border-b bg-background px-4 py-2 sm:px-6">
                    {excerpt && excerpt.unmatched > 0 && (
                        <Badge variant="destructive">{t('linesNotInOriginal', { n: excerpt.unmatched })}</Badge>
                    )}
                    {config.shortFile && (
                        <div className="ml-auto flex shrink-0 rounded-lg border p-0.5" role="group" aria-label="Chat version">
                            {(['full', 'short'] as const).map((m) => (
                                <Button
                                    key={m}
                                    size="sm"
                                    variant={mode === m ? 'secondary' : 'ghost'}
                                    className="h-7"
                                    disabled={m === 'short' && !short}
                                    aria-pressed={mode === m}
                                    onClick={() => setMode(m)}
                                >
                                    {m === 'full' ? t('full') : t('short')}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <ChatListView key={mode} exhibit={shown} rightSender={config.rightSender} />
        </>
    );
}
