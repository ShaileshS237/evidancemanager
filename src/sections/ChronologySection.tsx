import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CHRONOLOGY_META, EVENTS, type EventCategory, type EventPhase } from '@/data/caseData';
import { CHRONOLOGY_META_MR, EVENTS_MR } from '@/data/chronology.mr';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { PageHeader, PeopleChips, RefChips, SectionPage, StatusBadge, fmtDate } from './common';

const CATEGORY_TONE: Record<EventCategory, 'green' | 'amber' | 'red' | 'blue' | 'gray'> = {
    Relationship: 'green',
    Marriage: 'blue',
    Dispute: 'red',
    Legal: 'amber',
    Financial: 'gray',
    Travel: 'gray',
};

const PHASES: EventPhase[] = ['beforeMarriage', 'duringMarriage', 'breakdown', 'afterSeparation'];

export function ChronologySection() {
    const { t, lang } = useI18n();
    const mr = lang === 'mr';
    const meta = mr ? { ...CHRONOLOGY_META, ...CHRONOLOGY_META_MR } : CHRONOLOGY_META;
    const [category, setCategory] = useState<EventCategory | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const categories = useMemo(() => [...new Set(EVENTS.map((e) => e.category))], []);
    const events = useMemo(() => EVENTS.filter((e) => !category || e.category === category), [category]);

    return (
        <SectionPage>
            <PageHeader title={t('section.chronology')} description={t('chronologyDesc')} dummy={false} />

            <div className="rounded-lg border bg-background p-4 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                    <dt className="text-muted-foreground">{t('accountOf')}</dt>
                    <dd>{meta.accountOf}</dd>
                    <dt className="text-muted-foreground">{t('preparedFor')}</dt>
                    <dd>{meta.preparedFor}</dd>
                    <dt className="text-muted-foreground">{t('preparedOn')}</dt>
                    <dd>{fmtDate(CHRONOLOGY_META.preparedOn)}</dd>
                    <dt className="text-muted-foreground">{t('coverage')}</dt>
                    <dd>{meta.coverage}</dd>
                </dl>
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                    {meta.note}
                    {mr && <span className="mt-1 block font-medium">{t('translationNote')}</span>}
                </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant={category === null ? 'secondary' : 'ghost'} onClick={() => setCategory(null)}>
                    {t('all')}
                </Button>
                {categories.map((c) => (
                    <Button key={c} size="sm" variant={category === c ? 'secondary' : 'ghost'} onClick={() => setCategory(c)}>
                        {t(`cat.${c}`)}
                    </Button>
                ))}
            </div>

            {PHASES.map((phase) => {
                const items = events.filter((e) => e.phase === phase);
                if (!items.length) return null;
                return (
                    <div key={phase} className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">{t(`phase.${phase}`)}</h3>
                        <ol className="relative ml-2 flex flex-col gap-3 border-l pl-6">
                            {items.map((ev) => {
                                const e = mr && EVENTS_MR[ev.id] ? { ...ev, ...EVENTS_MR[ev.id] } : ev;
                                const open = expanded === e.id;
                                return (
                                    <li key={e.id} className="relative">
                                        <span className="absolute top-5 -left-[31px] size-3 rounded-full border-2 border-background bg-foreground" />
                                        <Card className="gap-0 py-0">
                                            <button
                                                type="button"
                                                aria-expanded={open}
                                                onClick={() => setExpanded(open ? null : e.id)}
                                                className="flex w-full items-start gap-3 px-4 py-3 text-left"
                                            >
                                                <ChevronRight
                                                    className={cn(
                                                        'mt-1 size-4 shrink-0 text-muted-foreground transition-transform',
                                                        open && 'rotate-90',
                                                    )}
                                                />
                                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-xs text-muted-foreground">#{e.no}</span>
                                                        {e.date && (
                                                            <span className="text-xs font-medium tabular-nums">{fmtDate(e.date)}</span>
                                                        )}
                                                        <StatusBadge tone={CATEGORY_TONE[e.category]}>{t(`cat.${e.category}`)}</StatusBadge>
                                                    </div>
                                                    <div className="font-medium">{e.title}</div>
                                                    <div className="text-xs text-muted-foreground">{e.period}</div>
                                                </div>
                                            </button>
                                            {open && (
                                                <CardContent className="flex flex-col gap-3 border-t px-4 py-4 pl-11">
                                                    {e.account.map((p, i) => (
                                                        <p key={i} className="text-sm">
                                                            {p}
                                                        </p>
                                                    ))}
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                                        <PeopleChips people={e.people} />
                                                        <RefChips refs={e.evidence} />
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                );
            })}

            <p className="text-xs text-muted-foreground">{meta.source}</p>
        </SectionPage>
    );
}
