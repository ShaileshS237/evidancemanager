import { Fragment, useState } from 'react';
import { ArrowRight, ChevronRight, FileAudio, FileVideo, Pause, Play } from 'lucide-react';
import {
    EVIDENCE,
    EVENTS,
    MEDIA,
    NOTICES,
    PROPERTY,
    WITNESSES,
    type MediaClip,
    type MediaItem,
} from '@/data/caseData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { dummyClipUrl } from '@/lib/dummyClip';
import { useI18n } from '@/i18n';
import { RecordView } from './RecordView';
import { PageHeader, PeopleChips, RefChips, SectionPage, StatCard, StatusBadge, fmtDate, fmtMoney } from './common';

export function EvidenceSection() {
    const { t: tr } = useI18n();
    const [view, setView] = useState<'exhibits' | 'claims'>('exhibits');
    const [claimCategory, setClaimCategory] = useState<string | null>(null);
    const claimCategories = [...new Set(EVENTS.map((event) => event.category))];
    const claims = EVENTS.filter((event) => !claimCategory || event.category === claimCategory);

    return (
        <SectionPage>
            <PageHeader title={tr('section.evidence')} description={tr('evidenceDesc')} />
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={tr('evidenceLibraryViews')}>
                <Button role="tab" aria-selected={view === 'exhibits'} size="sm" variant={view === 'exhibits' ? 'secondary' : 'ghost'} onClick={() => setView('exhibits')}>
                    {tr('exhibits')}
                </Button>
                <Button role="tab" aria-selected={view === 'claims'} size="sm" variant={view === 'claims' ? 'secondary' : 'ghost'} onClick={() => setView('claims')}>
                    {tr('claimsToProve')}
                </Button>
            </div>
            {view === 'exhibits' ? (
                <RecordView
                    rows={EVIDENCE}
                    searchPlaceholder={tr('searchExhibits')}
                    columns={[
                        { header: tr('id'), cell: (e) => <span className="font-mono text-xs">{e.id}</span> },
                        { header: tr('title'), cell: (e) => <span className="font-medium">{e.title}</span> },
                        { header: tr('type'), cell: (e) => e.type },
                        { header: tr('date'), cell: (e) => fmtDate(e.date) },
                        {
                            header: tr('status'),
                            cell: (e) => <StatusBadge tone={e.status === 'Original' ? 'green' : 'gray'}>{e.status}</StatusBadge>,
                        },
                        { header: tr('people'), cell: (e) => <PeopleChips people={e.people} /> },
                        { header: tr('linkedTo'), cell: (e) => <RefChips refs={e.linkedTo} /> },
                    ]}
                    detailTitle={(e) => e.title}
                    detailSubtitle={(e) => `${e.id} · ${e.type}`}
                    fields={[
                        { label: tr('date'), value: (e) => fmtDate(e.date) },
                        { label: tr('source'), value: (e) => e.source },
                        { label: tr('file'), value: (e) => <span className="font-mono text-xs">{e.fileName}</span> },
                        { label: 'SHA-256', value: (e) => <span className="font-mono text-[11px] break-all">{e.sha256}</span> },
                        { label: tr('status'), value: (e) => e.status },
                        { label: tr('people'), value: (e) => <PeopleChips people={e.people} /> },
                        { label: tr('linkedTo'), value: (e) => <RefChips refs={e.linkedTo} /> },
                        { label: tr('notes'), value: (e) => e.notes },
                    ]}
                />
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">{tr('claimsToProveDesc')}</p>
                    <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" variant={claimCategory === null ? 'secondary' : 'ghost'} onClick={() => setClaimCategory(null)}>
                            {tr('all')}
                        </Button>
                        {claimCategories.map((category) => (
                            <Button key={category} size="sm" variant={claimCategory === category ? 'secondary' : 'ghost'} onClick={() => setClaimCategory(category)}>
                                {tr(`cat.${category}`)}
                            </Button>
                        ))}
                    </div>
                    <RecordView
                        rows={claims}
                        searchPlaceholder={tr('searchClaims')}
                        showDummyBadge={false}
                        columns={[
                            { header: tr('id'), cell: (event) => <span className="font-mono text-xs">#{event.no}</span> },
                            { header: tr('claim'), cell: (event) => <span className="font-medium">{event.title}</span> },
                            { header: tr('category'), cell: (event) => tr(`cat.${event.category}`) },
                            { header: tr('period'), cell: (event) => event.period },
                        ]}
                        detailTitle={(event) => event.title}
                        detailSubtitle={(event) => `${tr(`cat.${event.category}`)} · ${tr(`phase.${event.phase}`)}`}
                        fields={[
                            { label: tr('chronologyAccount'), value: (event) => <div className="flex flex-col gap-2">{event.account.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div> },
                            { label: tr('toVerify'), value: (event) => event.verification },
                            { label: tr('linkedTo'), value: (event) => <RefChips refs={event.evidence ?? []} /> },
                        ]}
                    />
                </>
            )}
        </SectionPage>
    );
}

export function MediaSection() {
    const { t: tr } = useI18n();
    const [expanded, setExpanded] = useState<string | null>(null);
    const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id));

    return (
        <SectionPage>
            <PageHeader title={tr('section.media')} description={tr('mediaDesc')} />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label={tr('audio')} value={MEDIA.filter((m) => m.kind === 'Audio').length} />
                <StatCard label={tr('video')} value={MEDIA.filter((m) => m.kind === 'Video').length} />
            </div>
            <Card className="py-0">
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8 pl-4" />
                                <TableHead>{tr('recording')}</TableHead>
                                <TableHead>{tr('date')}</TableHead>
                                <TableHead>{tr('duration')}</TableHead>
                                <TableHead>{tr('participants')}</TableHead>
                                <TableHead className="pr-4">{tr('recordedBy')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MEDIA.map((m) => {
                                const open = expanded === m.id;
                                return (
                                    <Fragment key={m.id}>
                                        <TableRow
                                            className="cursor-pointer"
                                            tabIndex={0}
                                            aria-expanded={open}
                                            onClick={() => toggle(m.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    toggle(m.id);
                                                }
                                            }}
                                        >
                                            <TableCell className="pl-4 text-muted-foreground">
                                                <ChevronRight className={cn('size-4 transition-transform', open && 'rotate-90')} />
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-2 font-medium">
                                                    {m.kind === 'Audio' ? <FileAudio className="size-4" /> : <FileVideo className="size-4" />}
                                                    {m.title}
                                                </span>
                                            </TableCell>
                                            <TableCell>{fmtDate(m.date)}</TableCell>
                                            <TableCell className="tabular-nums">{m.duration}</TableCell>
                                            <TableCell>{m.participants.join(', ')}</TableCell>
                                            <TableCell className="pr-4">{m.recordedBy}</TableCell>
                                        </TableRow>
                                        {open && (
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableCell colSpan={6} className="px-4 py-4 whitespace-normal">
                                                    <MediaClips item={m} />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </SectionPage>
    );
}

function MediaClips({ item }: { item: MediaItem }) {
    const { t: tr } = useI18n();
    const [playing, setPlaying] = useState<MediaClip | null>(null);

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{item.summary}</p>
            <div className="flex flex-wrap items-center gap-2">
                {item.clips.map((c) => {
                    const active = playing?.id === c.id;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setPlaying(active ? null : c)}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:bg-muted',
                                active && 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
                            )}
                        >
                            {active ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                            {c.title}
                            {c.at && <span className="font-mono text-xs opacity-70">{c.at}</span>}
                        </button>
                    );
                })}
            </div>
            {playing && (
                <div className="flex flex-col gap-2 rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        {playing.title}
                        {!playing.url && (
                            <Badge variant="destructive" className="ml-auto text-[10px]">
                                {tr('dummyClip')}
                            </Badge>
                        )}
                    </div>
                    <audio
                        key={playing.id}
                        controls
                        autoPlay
                        src={playing.url ? `${import.meta.env.BASE_URL}${playing.url}` : dummyClipUrl(playing.id)}
                        onEnded={() => setPlaying(null)}
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
}

const POSSESSION_TONE = { 'With wife': 'blue', 'With husband': 'gray', Disputed: 'red', Returned: 'green', Unknown: 'gray' } as const;

export function PropertySection({
    onViewTvEmi,
    onViewSharedApplianceEmi,
}: {
    onViewTvEmi: () => void;
    onViewSharedApplianceEmi: () => void;
}) {
    const { t: tr } = useI18n();
    return (
        <SectionPage>
            <PageHeader title={tr('section.property')} description={tr('propertyDesc')} dummy={false} />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label={tr('items')} value={PROPERTY.length} />
                <StatCard label={tr('totalValue')} value={fmtMoney(PROPERTY.reduce((s, p) => s + p.value, 0))} />
                <StatCard label={tr('withWife')} value={PROPERTY.filter((p) => p.status === 'With wife').length} />
                <StatCard label={tr('disputed')} value={PROPERTY.filter((p) => p.status === 'Disputed').length} />
            </div>
            <RecordView
                rows={PROPERTY}
                expandable={false}
                searchPlaceholder={tr('searchItems')}
                columns={[
                    { header: tr('item'), cell: (p) => <span className="font-medium">{p.item}</span> },
                    { header: tr('category'), cell: (p) => p.category },
                    { header: tr('givenBy'), cell: (p) => p.givenBy },
                    { header: tr('inPossession'), cell: (p) => p.possession },
                    { header: tr('status'), cell: (p) => <StatusBadge tone={POSSESSION_TONE[p.status]}>{p.status}</StatusBadge> },
                    { header: tr('value'), cell: (p) => <span className="tabular-nums">{p.value ? fmtMoney(p.value) : '—'}</span>, className: 'text-right' },
                    {
                        header: '',
                        cell: (p) => p.id === 'P-13' ? (
                            <Button type="button" size="sm" variant="outline" onClick={onViewTvEmi}>
                                {tr('viewTvEmiTransactions')}<ArrowRight className="size-3.5" />
                            </Button>
                        ) : p.id === 'P-14' || p.id === 'P-15' ? (
                            <Button type="button" size="sm" variant="outline" title={tr('sharedApplianceEmiTooltip')} onClick={onViewSharedApplianceEmi}>
                                {tr('viewSharedApplianceEmi')}<ArrowRight className="size-3.5" />
                            </Button>
                        ) : null,
                    },
                ]}
                detailTitle={(p) => p.item}
                detailSubtitle={(p) => `${p.id} · ${p.category}`}
                fields={[
                    { label: tr('owner'), value: (p) => p.owner },
                    { label: tr('givenBy'), value: (p) => p.givenBy },
                    { label: tr('acquired'), value: (p) => (p.acquired === '—' ? '—' : fmtDate(p.acquired)) },
                    { label: tr('value'), value: (p) => (p.value ? fmtMoney(p.value) : '—') },
                    { label: tr('possession'), value: (p) => p.possession },
                    { label: tr('status'), value: (p) => p.status },
                    { label: tr('evidence'), value: (p) => <RefChips refs={p.evidence} /> },
                    { label: tr('notes'), value: (p) => p.notes },
                ]}
            />
        </SectionPage>
    );
}

const STATEMENT_TONE = { 'Statement recorded': 'green', Agreed: 'blue', 'Not contacted': 'gray', Declined: 'red' } as const;

export function WitnessesSection() {
    const { t: tr } = useI18n();
    return (
        <SectionPage>
            <PageHeader title={tr('section.witnesses')} description={tr('witnessesDesc')} />
            <RecordView
                rows={WITNESSES}
                searchPlaceholder={tr('searchWitnesses')}
                columns={[
                    { header: tr('name'), cell: (w) => <span className="font-medium">{w.name}</span> },
                    { header: tr('relation'), cell: (w) => w.relation },
                    { header: tr('canSpeakTo'), cell: (w) => <span className="whitespace-normal">{w.canSpeakTo}</span>, className: 'max-w-72' },
                    { header: tr('statement'), cell: (w) => <StatusBadge tone={STATEMENT_TONE[w.statement]}>{w.statement}</StatusBadge> },
                ]}
                detailTitle={(w) => w.name}
                detailSubtitle={(w) => `${w.id} · ${w.relation}`}
                fields={[
                    { label: tr('contact'), value: (w) => w.contact },
                    { label: tr('canSpeakTo'), value: (w) => w.canSpeakTo },
                    { label: tr('events'), value: (w) => <RefChips refs={w.events} /> },
                    { label: tr('statement'), value: (w) => w.statement },
                    { label: tr('notes'), value: (w) => w.notes },
                ]}
            />
        </SectionPage>
    );
}

const NOTICE_TONE = { Received: 'amber', Sent: 'blue', Pending: 'red', Scheduled: 'amber', Closed: 'green' } as const;

export function LegalSection() {
    const { t: tr } = useI18n();
    const upcoming = NOTICES.filter((n) => n.nextDate).sort((a, b) => a.nextDate!.localeCompare(b.nextDate!))[0];

    return (
        <SectionPage>
            <PageHeader title={tr('section.legal')} description={tr('legalDesc')} />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label={tr('documents')} value={NOTICES.length} />
                <StatCard label={tr('pending')} value={NOTICES.filter((n) => n.status === 'Pending').length} />
                <StatCard
                    label={tr('nextDate')}
                    value={upcoming ? fmtDate(upcoming.nextDate!) : '—'}
                    hint={upcoming ? `${upcoming.type} · ${upcoming.reference}` : undefined}
                />
            </div>
            <RecordView
                rows={NOTICES}
                searchPlaceholder={tr('searchNotices')}
                columns={[
                    { header: tr('date'), cell: (n) => fmtDate(n.date) },
                    { header: tr('type'), cell: (n) => <span className="font-medium">{n.type}</span> },
                    { header: tr('fromTo'), cell: (n) => <span className="whitespace-normal">{`${n.from} → ${n.to}`}</span>, className: 'max-w-72' },
                    { header: tr('reference'), cell: (n) => <span className="font-mono text-xs">{n.reference}</span> },
                    { header: tr('status'), cell: (n) => <StatusBadge tone={NOTICE_TONE[n.status]}>{n.status}</StatusBadge> },
                    { header: tr('nextDate'), cell: (n) => (n.nextDate ? fmtDate(n.nextDate) : '—') },
                ]}
                detailTitle={(n) => n.type}
                detailSubtitle={(n) => `${n.reference} · ${fmtDate(n.date)}`}
                fields={[
                    { label: tr('from'), value: (n) => n.from },
                    { label: tr('to'), value: (n) => n.to },
                    { label: tr('status'), value: (n) => n.status },
                    { label: tr('nextDate'), value: (n) => (n.nextDate ? fmtDate(n.nextDate) : undefined) },
                    { label: tr('summary'), value: (n) => n.summary },
                    { label: tr('documents'), value: (n) => n.documents?.join(', ') },
                ]}
            />
        </SectionPage>
    );
}
