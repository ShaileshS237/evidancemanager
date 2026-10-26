import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Bus, Car, ChevronLeft, ChevronRight, Plane, TrainFront, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TRIPS, type Trip, type TravelMode } from './travelData';
import { getLocale, useI18n } from '@/i18n';

const MODE_ICON: Record<TravelMode, LucideIcon> = { flight: Plane, train: TrainFront, bus: Bus, car: Car };

const DAY = 24 * 60 * 60 * 1000;
const toDate = (iso: string) => new Date(`${iso}T00:00:00`);
const fmtDate = (iso: string) =>
    toDate(iso).toLocaleDateString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' });
const fmtMoney = (n: number | null) =>
    n == null ? '—' : n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const tripDays = (t: Trip) => {
    const end = t.return || t.arrival;
    return end ? Math.round((+toDate(end) - +toDate(t.departure)) / DAY) + 1 : 1;
};

export function TravelSection() {
    const { t: tr } = useI18n();
    const [person, setPerson] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const travelTableRef = useRef<HTMLDivElement>(null);
    const [horizontalScroll, setHorizontalScroll] = useState({ left: false, right: false });
    const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id));

    const people = useMemo(() => [...new Set(TRIPS.flatMap((t) => t.people))], []);
    const trips = useMemo(
        () =>
            TRIPS.filter((t) => !person || t.people.includes(person)).sort((a, b) =>
                a.departure.localeCompare(b.departure),
            ),
        [person],
    );

    const costedTrips = trips.filter((trip) => trip.amount != null);
    const totalDays = trips.reduce((s, t) => s + tripDays(t), 0);
    const totalSpent = costedTrips.reduce((s, t) => s + (t.amount ?? 0), 0);
    const paidByShailesh = costedTrips.filter((t) => t.paidBy === 'Shailesh').reduce((s, t) => s + (t.amount ?? 0), 0);
    const updateHorizontalScroll = (element = travelTableRef.current) => {
        if (!element) return;
        const next = {
            left: element.scrollLeft > 0,
            right: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
        };
        setHorizontalScroll((current) => current.left === next.left && current.right === next.right ? current : next);
    };
    const scrollTravelTable = (direction: -1 | 1) => {
        const element = travelTableRef.current;
        if (element) element.scrollBy({ left: direction * Math.max(320, element.clientWidth * 0.75), behavior: 'smooth' });
    };

    useEffect(() => {
        const element = travelTableRef.current;
        if (!element) return;
        updateHorizontalScroll(element);
        const observer = new ResizeObserver(() => updateHorizontalScroll(element));
        observer.observe(element);
        const table = element.querySelector('table');
        if (table) observer.observe(table);
        return () => observer.disconnect();
    }, [person, trips.length]);

    return (
        <div className="travel-page-scroll flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-scroll overscroll-contain p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{tr('travelHistory')}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label={tr('trips')} value={String(trips.length)} />
                <Stat label={tr('daysTravelled')} value={String(totalDays)} />
                <Stat label={tr('totalCost')} value={costedTrips.length ? fmtMoney(totalSpent) : '—'} />
                <Stat label={tr('paidByShailesh')} value={costedTrips.some((trip) => trip.paidBy === 'Shailesh') ? fmtMoney(paidByShailesh) : '—'} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-sm text-muted-foreground">{tr('person')}</span>
                <Button size="sm" variant={person === null ? 'secondary' : 'ghost'} onClick={() => setPerson(null)}>
                    {tr('everyone')}
                </Button>
                {people.map((p) => (
                    <Button key={p} size="sm" variant={person === p ? 'secondary' : 'ghost'} onClick={() => setPerson(p)}>
                        {p}
                    </Button>
                ))}
            </div>

            <div className="flex justify-end gap-1" role="group" aria-label={tr('travelHistory')}>
                <Button variant="outline" size="icon" aria-label={tr('scrollTravelLeft')} disabled={!horizontalScroll.left} onClick={() => scrollTravelTable(-1)}>
                    <ChevronLeft />
                </Button>
                <Button variant="outline" size="icon" aria-label={tr('scrollTravelRight')} disabled={!horizontalScroll.right} onClick={() => scrollTravelTable(1)}>
                    <ChevronRight />
                </Button>
            </div>

            <Card className="min-w-0 py-0">
                <CardContent className="min-w-0 px-0">
                    <Table
                        className="min-w-[1100px]"
                        containerClassName="travel-table-scroll"
                        containerRef={travelTableRef}
                        containerTabIndex={0}
                        containerAriaLabel={tr('travelHistory')}
                        onContainerScroll={(event) => updateHorizontalScroll(event.currentTarget)}
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8 pl-4" />
                                <TableHead>{tr('dates')}</TableHead>
                                <TableHead>{tr('route')}</TableHead>
                                <TableHead>{tr('mode')}</TableHead>
                                <TableHead>{tr('people')}</TableHead>
                                <TableHead>{tr('purpose')}</TableHead>
                                <TableHead>{tr('bookedPaidBy')}</TableHead>
                                <TableHead className="text-right">{tr('amount')}</TableHead>
                                <TableHead className="pr-4">{tr('reference')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trips.map((t) => {
                                const Icon = MODE_ICON[t.mode];
                                const open = expanded === t.id;
                                const endDate = t.return || t.arrival;
                                return (
                                    <Fragment key={t.id}>
                                    <TableRow
                                        className="cursor-pointer align-top"
                                        tabIndex={0}
                                        aria-expanded={open}
                                        onClick={() => toggle(t.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggle(t.id);
                                            }
                                        }}
                                    >
                                        <TableCell className="pl-4 text-muted-foreground">
                                            <ChevronRight className={cn('size-4 transition-transform', open && 'rotate-90')} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{fmtDate(t.departure)}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {endDate
                                                    ? `${tr('toDate', { d: fmtDate(endDate) })} · ${tr('daysCount', { n: tripDays(t) })}`
                                                    : tr('oneWay')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-medium">
                                                {t.from} <ArrowRight className="size-3.5 text-muted-foreground" /> {t.to}
                                            </div>
                                            {t.notes && (
                                                <div className="max-w-56 text-xs whitespace-normal text-muted-foreground">{t.notes}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1.5 capitalize">
                                                <Icon className="size-4 text-muted-foreground" />
                                                {t.mode}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex max-w-56 flex-wrap gap-1">
                                                {t.people.map((p) => (
                                                    <Badge key={p} variant="outline">
                                                        {p}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-48 whitespace-normal">{t.purpose}</TableCell>
                                        <TableCell>
                                            <div>{t.bookedBy}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {tr('paid')}: {t.paidBy}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">{fmtMoney(t.amount)}</TableCell>
                                        <TableCell className="pr-4 font-mono text-xs">
                                            {t.bookingRef}
                                            {t.chatRefs?.length ? (
                                                <div className="text-muted-foreground">{t.chatRefs.join(', ')}</div>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                    {open && (
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={9} className="px-4 py-4 whitespace-normal">
                                                <TripDetails trip={t} />
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
        </div>
    );
}

function TripDetails({ trip: t }: { trip: Trip }) {
    const { t: tr } = useI18n();
    const Icon = MODE_ICON[t.mode];
    const endDate = t.return || t.arrival;
    return (
        <>
            <div className="mb-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    {t.isDummy !== false && <Badge variant="destructive">{tr('dummyData')}</Badge>}
                    <Badge variant="outline" className="capitalize">
                        <Icon />
                        {t.mode}
                    </Badge>
                </div>
                <h3 className="flex items-center gap-2 font-semibold">
                    {t.from} <ArrowRight className="size-4 text-muted-foreground" /> {t.to}
                </h3>
                <p className="text-sm text-muted-foreground">{t.purpose}</p>
            </div>

            <div className="flex flex-col gap-5">
                <ol className="relative ml-1 border-l pl-5">
                    <li className="pb-4">
                        <span className="absolute -left-1.5 mt-1 size-3 rounded-full border-2 border-background bg-foreground" />
                        <div className="text-xs text-muted-foreground">{tr('departure')}</div>
                        <div className="font-medium">{fmtDate(t.departure)}</div>
                        <div className="text-sm text-muted-foreground">from {t.from}</div>
                    </li>
                    <li>
                        <span className="absolute -left-1.5 mt-1 size-3 rounded-full border-2 border-background bg-muted-foreground" />
                        <div className="text-xs text-muted-foreground">{t.return ? tr('return') : t.arrival ? tr('arrival') : tr('oneWay')}</div>
                        <div className="font-medium">{endDate ? fmtDate(endDate) : '—'}</div>
                        <div className="text-sm text-muted-foreground">
                            {t.return ? `${t.to} → ${t.from} · ${tr('daysCount', { n: tripDays(t) })}` : t.arrival ? `${t.to} · ${tr('daysCount', { n: tripDays(t) })}` : t.to}
                        </div>
                    </li>
                </ol>

                <Separator />

                <div>
                    <div className="mb-2 text-xs font-medium text-muted-foreground">{tr('peopleInvolved')}</div>
                    <div className="flex flex-wrap gap-1.5">
                        {t.people.map((p) => (
                            <Badge key={p} variant="secondary">
                                {p}
                            </Badge>
                        ))}
                    </div>
                </div>

                <Separator />

                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
                    <Detail label={tr('bookedBy')}>{t.bookedBy}</Detail>
                    <Detail label={tr('paidBy')}>{t.paidBy}</Detail>
                    <Detail label={tr('amount')}>
                        <span className="tabular-nums">{fmtMoney(t.amount)}</span>
                    </Detail>
                    <Detail label={tr('bookingRef')}>
                        <span className="font-mono text-xs">{t.bookingRef}</span>
                    </Detail>
                    {t.carrier && <Detail label={tr('carrier')}>{t.carrier}</Detail>}
                    {t.travelClass && <Detail label={tr('travelClass')}>{t.travelClass}</Detail>}
                    {t.stay && <Detail label={tr('stay')}>{t.stay}</Detail>}
                </dl>

                {t.documents?.length ? (
                    <>
                        <Separator />
                        <div>
                            <div className="mb-2 text-xs font-medium text-muted-foreground">{tr('supportingDocuments')}</div>
                            <ul className="list-disc space-y-1 pl-5 text-sm">
                                {t.documents.map((d) => (
                                    <li key={d}>{d}</li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : null}

                {t.chatRefs?.length ? (
                    <div>
                        <div className="mb-2 text-xs font-medium text-muted-foreground">{tr('chatReferences')}</div>
                        <div className="font-mono text-xs">{t.chatRefs.join(', ')}</div>
                    </div>
                ) : null}

                {t.notes && (
                    <>
                        <Separator />
                        <div>
                            <div className="mb-1 text-xs font-medium text-muted-foreground">{tr('notes')}</div>
                            <p className="text-sm">{t.notes}</p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
    return (
        <>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 break-words">{children}</dd>
        </>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <Card className="gap-1 py-4">
            <CardHeader className="px-4">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-xl tabular-nums">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}
