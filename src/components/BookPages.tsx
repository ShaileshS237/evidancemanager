import { forwardRef, type CSSProperties } from 'react';
import { BlockView } from './BlockView';
import type { BookPageData } from '../lib/paginate';
import type { BookMetrics } from '../hooks/useBookMetrics';
import { formatDateTime, type ExcerptInfo, type SourceInfo } from '../lib/evidence';
import { useIsPageNear } from '../lib/pageWindow';

type Side = 'left' | 'right';

interface ContentPageProps {
    index: number;
    data: BookPageData | null;
    number: number | null;
    side: Side;
    title: string;
    metrics: BookMetrics;
}

export const ContentPage = forwardRef<HTMLDivElement, ContentPageProps>(function ContentPage(
    { index, data, number, side, title, metrics },
    ref,
) {
    const near = useIsPageNear(index);
    const innerStyle: CSSProperties = { padding: `${metrics.padY}px ${metrics.padX}px` };
    const contentStyle = { height: metrics.contentH, '--fs': `${metrics.fontSize}px` } as CSSProperties;

    return (
        <div ref={ref} className={`page page--${side}`} data-density="soft">
            {near && (
                <div className="page__inner" style={innerStyle}>
                    <header className="page__head" style={{ height: metrics.head }}>
                        {data && <span>{side === 'left' ? title : data.dayLabel}</span>}
                    </header>
                    <div className="page__content" style={contentStyle}>
                        {data?.blocks.map((b) => <BlockView key={b.key} block={b} />)}
                    </div>
                    <footer className="page__foot" style={{ height: metrics.foot }}>
                        {number !== null && <span>{number}</span>}
                    </footer>
                </div>
            )}
        </div>
    );
});

interface CoverProps {
    variant: 'front' | 'back';
    title?: string;
    subtitle?: string;
    range?: string;
    source?: SourceInfo;
    excerpt?: ExcerptInfo;
}

export const Cover = forwardRef<HTMLDivElement, CoverProps>(function Cover(
    { variant, title, subtitle, range, source, excerpt },
    ref,
) {
    return (
        <div ref={ref} className={`cover cover--${variant}`} data-density="hard">
            {variant === 'front' && (
                <div className="cover__frame">
                    <span className="cover__label">
                        Exhibit — Chat{excerpt ? ' · Short version' : ''}
                        {source?.isSample ? ' (sample)' : ''}
                    </span>
                    <div className="cover__main">
                        <h1 className="cover__title">{title}</h1>
                        {subtitle && <p className="cover__subtitle">{subtitle}</p>}
                        {range && <p className="cover__range">{range}</p>}
                    </div>
                    {source && (
                        <dl className="cover__source">
                            <dt>Source</dt>
                            <dd>{source.fileName}</dd>
                            <dt>SHA-256</dt>
                            <dd className="cover__hash">{source.sha256}</dd>
                            <dt>Loaded</dt>
                            <dd>{formatDateTime(source.importedAt)}</dd>
                            {excerpt && (
                                <>
                                    <dt>Excerpt</dt>
                                    <dd>
                                        {excerpt.file.fileName} — {excerpt.messageCount} of {excerpt.totalMessages} messages, verbatim;
                                        line numbers refer to the source file
                                    </dd>
                                </>
                            )}
                        </dl>
                    )}
                </div>
            )}
        </div>
    );
});
