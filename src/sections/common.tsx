import type { ReactNode } from 'react';
import { ArrowUpRight, UserRound } from 'lucide-react';
import { personName } from '@/data/people';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { getLocale, useI18n } from '@/i18n';
import { useEvidenceRef } from './EvidenceRef';

export const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' });

export const fmtMoney = (n: number) =>
    n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function DummyBadge() {
    const { t } = useI18n();
    return <Badge variant="destructive">{t('dummyData')}</Badge>;
}

export function PageHeader({
    title,
    description,
    actions,
    dummy = true,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    dummy?: boolean;
}) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {dummy && <DummyBadge />}
                </div>
                {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions}
        </div>
    );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
    return (
        <Card className="gap-1 py-4">
            <CardHeader className="px-4">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-xl tabular-nums">{value}</CardTitle>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </CardHeader>
        </Card>
    );
}

export function PeopleChips({ people }: { people?: string[] }) {
    const { lang } = useI18n();
    if (!people?.length) return null;
    return (
        <div className="flex max-w-64 flex-wrap gap-1">
            {people.map((p) => (
                <Badge key={p} variant="secondary" className="gap-1 font-normal">
                    <UserRound className="size-3" />
                    {personName(p, lang)}
                </Badge>
            ))}
        </div>
    );
}

export function RefChips({ refs }: { refs?: string[] }) {
    const { open } = useEvidenceRef();
    if (!refs?.length) return null;
    return (
        <div className="flex flex-wrap gap-1">
            {refs.map((r) => (
                <button
                    key={r}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        open(r);
                    }}
                    className="rounded-md focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <Badge variant="outline" className="group/ref cursor-pointer gap-0.5 font-mono text-[11px] hover:bg-muted">
                        {r}
                        <ArrowUpRight className="size-3 text-muted-foreground transition-transform group-hover/ref:translate-x-px group-hover/ref:-translate-y-px" />
                    </Badge>
                </button>
            ))}
        </div>
    );
}

const TONES: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    gray: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ children, tone = 'gray' }: { children: ReactNode; tone?: keyof typeof TONES }) {
    return (
        <Badge variant="outline" className={TONES[tone]}>
            {children}
        </Badge>
    );
}

/** Scrollable page wrapper used by every non-chat section. */
export function SectionPage({ children }: { children: ReactNode }) {
    // Children must not shrink, otherwise cards get squashed instead of the page scrolling.
    return <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 [&>*]:shrink-0">{children}</div>;
}
