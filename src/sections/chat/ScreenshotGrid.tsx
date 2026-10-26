import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

// Screenshots live in src/evidence-screenshots/<chat id>/ and are picked up automatically.
const FILES = import.meta.glob('/src/evidence-screenshots/*/*.{png,jpg,jpeg,webp,svg}', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

interface Shot {
    name: string;
    url: string;
    dummy: boolean;
}

function shotsFor(chatId: string): Shot[] {
    const prefix = `/src/evidence-screenshots/${chatId}/`;
    return Object.entries(FILES)
        .filter(([path]) => path.startsWith(prefix))
        .map(([path, url]) => {
            const name = path.slice(prefix.length);
            return { name, url, dummy: name.startsWith('dummy-') };
        })
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

const ZOOM = 2.5;

export function ScreenshotGrid({ chatId }: { chatId: string }) {
    const { t } = useI18n();
    const shots = useMemo(() => shotsFor(chatId), [chatId]);
    const [open, setOpen] = useState<number | null>(null);
    const [zoomed, setZoomed] = useState(false);
    const [origin, setOrigin] = useState('50% 50%');

    const go = useCallback(
        (dir: 1 | -1) => {
            setZoomed(false);
            setOpen((i) => (i === null ? i : (i + dir + shots.length) % shots.length));
        },
        [shots.length],
    );

    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(null);
            else if (e.key === 'ArrowRight') go(1);
            else if (e.key === 'ArrowLeft') go(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, go]);

    const pointAt = (e: MouseEvent<HTMLImageElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        return `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    };

    if (!shots.length) {
        return (
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                    {t('screenshotsPlaceholder')}{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">src/evidence-screenshots/{chatId}/</code>.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="overflow-hidden rounded-lg border bg-background">
                            <div className="flex aspect-[9/16] items-center justify-center bg-muted/50">
                                <ImageOff className="size-6 text-muted-foreground/50" />
                            </div>
                            <div className="flex items-center gap-1.5 border-t px-2 py-1.5">
                                <span className="truncate text-xs text-muted-foreground">{t('screenshotN', { n: i + 1 })}</span>
                                <Badge variant="destructive" className="ml-auto shrink-0 text-[10px]">
                                    {t('dummy')}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const current = open !== null ? shots[open] : null;

    return (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {shots.map((s, i) => (
                    <button
                        key={s.name}
                        type="button"
                        onClick={() => {
                            setZoomed(false);
                            setOpen(i);
                        }}
                        className="group relative overflow-hidden rounded-lg border bg-muted/30 text-left transition-shadow hover:shadow-md"
                    >
                        <img src={s.url} alt={s.name} loading="lazy" className="aspect-[9/16] w-full object-cover object-top" />
                        <div className="flex items-center gap-1.5 border-t bg-background px-2 py-1.5">
                            <span className="truncate text-xs text-muted-foreground">{s.name}</span>
                            {s.dummy && (
                                <Badge variant="destructive" className="ml-auto shrink-0 text-[10px]">
                                    {t('dummy')}
                                </Badge>
                            )}
                        </div>
                        <ZoomIn className="absolute top-2 right-2 size-6 rounded-full bg-background/90 p-1 opacity-0 shadow transition-opacity group-hover:opacity-100" />
                    </button>
                ))}
            </div>

            {current && (
                <div
                    className="fixed inset-0 z-50 flex flex-col bg-black/90"
                    role="dialog"
                    aria-modal="true"
                    aria-label={current.name}
                    onClick={() => setOpen(null)}
                >
                    <div className="flex items-center gap-2 p-3 text-sm text-white" onClick={(e) => e.stopPropagation()}>
                        <span className="truncate">{current.name}</span>
                        <span className="text-white/60 tabular-nums">
                            {open! + 1} / {shots.length}
                        </span>
                        <div className="ml-auto flex gap-1">
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                className="text-white hover:bg-white/10 hover:text-white"
                                onClick={() => setZoomed((z) => !z)}
                                aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
                            >
                                {zoomed ? <ZoomOut /> : <ZoomIn />}
                            </Button>
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                className="text-white hover:bg-white/10 hover:text-white"
                                onClick={() => setOpen(null)}
                                aria-label="Close"
                            >
                                <X />
                            </Button>
                        </div>
                    </div>

                    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-12 pb-6">
                        <img
                            src={current.url}
                            alt={current.name}
                            draggable={false}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!zoomed) setOrigin(pointAt(e));
                                setZoomed((z) => !z);
                            }}
                            onMouseMove={(e) => zoomed && setOrigin(pointAt(e))}
                            style={{ transform: zoomed ? `scale(${ZOOM})` : 'none', transformOrigin: origin }}
                            className={cn(
                                'max-h-full max-w-full rounded-md bg-white object-contain transition-transform duration-200',
                                zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
                            )}
                        />
                        {shots.length > 1 && (
                            <>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute left-2 rounded-full text-white hover:bg-white/10 hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        go(-1);
                                    }}
                                    aria-label="Previous screenshot"
                                >
                                    <ChevronLeft />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-2 rounded-full text-white hover:bg-white/10 hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        go(1);
                                    }}
                                    aria-label="Next screenshot"
                                >
                                    <ChevronRight />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
