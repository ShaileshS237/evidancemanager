import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DummyBadge } from './common';
import { useI18n } from '@/i18n';

export interface Column<T> {
    header: string;
    cell: (row: T) => ReactNode;
    className?: string;
}

export interface DetailField<T> {
    label: string;
    value: (row: T) => ReactNode;
}

interface RecordViewProps<T extends { id: string }> {
    rows: T[];
    columns: Column<T>[];
    /** Title and subtitle of the detail sheet. */
    detailTitle: (row: T) => ReactNode;
    detailSubtitle?: (row: T) => ReactNode;
    fields: DetailField<T>[];
    /** Free-form content appended to the detail sheet. */
    detailExtra?: (row: T) => ReactNode;
    searchPlaceholder?: string;
    expandable?: boolean;
    showDummyBadge?: boolean;
}

/** Searchable table; clicking a row expands its details inline below it. */
export function RecordView<T extends { id: string }>({
    rows,
    columns,
    detailTitle,
    detailSubtitle,
    fields,
    detailExtra,
    searchPlaceholder,
    expandable = true,
    showDummyBadge = true,
}: RecordViewProps<T>) {
    const { t } = useI18n();
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id));

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : rows;
    }, [rows, query]);

    return (
        <>
            <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-8"
                    placeholder={searchPlaceholder ?? t('search')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <Card className="py-0">
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {expandable && <TableHead className="w-8 pl-4" />}
                                {columns.map((c, i) => (
                                    <TableHead
                                        key={c.header}
                                        className={i === columns.length - 1 ? `pr-4 ${c.className ?? ''}` : c.className}
                                    >
                                        {c.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((row) => {
                                const open = expandable && expanded === row.id;
                                return (
                                    <Fragment key={row.id}>
                                        <TableRow
                                            className={expandable ? 'cursor-pointer align-top' : 'align-top'}
                                            tabIndex={expandable ? 0 : undefined}
                                            aria-expanded={expandable ? open : undefined}
                                            onClick={expandable ? () => toggle(row.id) : undefined}
                                            onKeyDown={expandable ? (e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    toggle(row.id);
                                                }
                                            } : undefined}
                                        >
                                            {expandable && (
                                                <TableCell className="pl-4 text-muted-foreground">
                                                    <ChevronRight className={cn('size-4 transition-transform', open && 'rotate-90')} />
                                                </TableCell>
                                            )}
                                            {columns.map((c, i) => (
                                                <TableCell
                                                    key={c.header}
                                                    className={i === columns.length - 1 ? `pr-4 ${c.className ?? ''}` : c.className}
                                                >
                                                    {c.cell(row)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                        {expandable && open && (
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableCell colSpan={columns.length + 1} className="px-4 py-4 whitespace-normal">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-medium">{detailTitle(row)}</span>
                                                            {detailSubtitle && (
                                                                <span className="text-sm text-muted-foreground">{detailSubtitle(row)}</span>
                                                            )}
                                                            {showDummyBadge && <span className="ml-auto"><DummyBadge /></span>}
                                                        </div>
                                                        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr_auto_1fr]">
                                                            {fields.map((f) => (
                                                                <div key={f.label} className="contents">
                                                                    <dt className="text-muted-foreground">{f.label}</dt>
                                                                    <dd className="min-w-0 break-words">{f.value(row) ?? '—'}</dd>
                                                                </div>
                                                            ))}
                                                        </dl>
                                                        {detailExtra && (
                                                            <>
                                                                <Separator />
                                                                {detailExtra(row)}
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (expandable ? 1 : 0)} className="py-8 text-center text-muted-foreground">
                                        {t('noMatches')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
