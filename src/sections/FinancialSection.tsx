import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, House, List, Search, UsersRound, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { manualTransactions } from '@/data/manual-transactions';
import { PageHeader, SectionPage, StatCard, StatusBadge } from './common';

interface BankTransaction {
    id: string;
    date: string;
    dateDisplay?: string;
    narration: string;
    referenceNumber?: string;
    valueDate?: string;
    withdrawalAmount: number;
    depositAmount: number;
    closingBalance: number | null;
    transactionType: string;
    month?: string;
    duplicate?: boolean;
    personOrMerchant?: string;
    normalizedName?: string;
    category?: string;
    subcategory?: string;
    partyType?: string;
    vpa?: string;
    needsReview?: boolean;
    financialKind?: string;
    computedBalance?: number | null;
}

interface BankDataset {
    meta: {
        accountHolder?: string;
        accountNumberMasked?: string;
        statementFrom?: string;
        statementTo?: string;
        openingBalance?: number;
        closingBalance?: number;
        transactionCount?: number;
        duplicateCount?: number;
        sourceFile?: string;
        totalWithdrawals?: number;
        totalDeposits?: number;
        currency?: string;
    };
    transactions: BankTransaction[];
}

interface CardTransaction {
    id: string;
    date: string;
    dateDisplay?: string;
    card: string;
    sourceFile: string;
    narration: string;
    amount: number;
    transactionType: string;
    category?: string;
    subcategory?: string;
    needsReview?: boolean;
    month?: string;
    year?: number;
}

interface CardDataset {
    meta: {
        transactionCount?: number;
        totalDebit?: number;
        totalCredit?: number;
        currency?: string;
    };
    transactions: CardTransaction[];
}

interface EmailEvidence {
    id: string;
    receivedDate?: string;
    sender?: string;
    subject?: string;
    recordType?: string;
    transactionStatus?: string;
    merchant?: string;
    amount?: number | null;
    refundAmount?: number | null;
    direction?: string;
    reference?: string;
    paymentMethod?: string;
    maskedAccountOrCard?: string;
    availableBalance?: number | null;
    statementPeriod?: string;
    attachmentNames?: string[];
    isPromotional?: boolean;
    isFalsePositive?: boolean;
    needsReview?: boolean;
    confidenceScore?: number | null;
    exclusionReason?: string | null;
    snippet?: string;
    rawEvidence?: string;
}

interface EmailDataset {
    count?: number;
    records: EmailEvidence[];
}

type Source = 'all' | 'bank' | 'card' | 'email' | 'manual';
type Condition = 'all' | 'review' | 'not-reviewed' | 'settled' | 'missing-reference' | 'refunded' | 'false-positive' | 'unresolved' | 'not-completed';

interface FinancialRow {
    key: string;
    id: string;
    date: string;
    title: string;
    description: string;
    source: Exclude<Source, 'all'>;
    account: string;
    direction: string;
    amount?: number;
    reimbursementReturnedAmount?: number;
    category?: string;
    subcategory?: string;
    reference?: string;
    needsReview: boolean;
    duplicate: boolean;
    settled?: boolean;
    tvEmiReimbursement?: boolean;
    sharedApplianceEmiReimbursement?: boolean;
    bank?: BankTransaction;
    card?: CardTransaction;
    email?: EmailEvidence;
    manual?: (typeof manualTransactions)[number];
}

interface PersonFlow {
    key: string;
    name: string;
    sent: number;
    received: number;
    sentCount: number;
    receivedCount: number;
    settledCount: number;
    latestDate: string;
}

const BANK_URL = new URL('../data/transactions.json', import.meta.url).href;
const CARD_URL = new URL('../data/credit-card-transactions.json', import.meta.url).href;
const EMAIL_URL = new URL('../data/gmail-evidence.json', import.meta.url).href;
const PAGE_SIZE = 50;
const RENT_PAYEE_PATTERN = /^(revathy n|sridhar hariram)$/i;

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json() as Promise<T>;
}

function formatMoney(value?: number | null) {
    if (value == null || !Number.isFinite(value)) return '—';
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

function formatDate(value: string | undefined, locale: string) {
    if (!value) return '—';
    const day = value.slice(0, 10);
    const date = new Date(`${day}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function amountForBank(row: BankTransaction) {
    return Math.abs(row.depositAmount || row.withdrawalAmount || 0);
}

function reimbursementReturnAmount(transaction: BankTransaction) {
    if (transaction.transactionType !== 'Received') return undefined;
    if (isTvEmiReimbursement(transaction) || isSharedApplianceEmiReimbursement(transaction)) return transaction.depositAmount;
    const match = transaction.narration.match(/\bRETURN\s+(?:INR|RS\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (!match) return undefined;
    const amount = Number(match[1].replace(/,/g, ''));
    return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function isTvEmiReimbursement(transaction: BankTransaction) {
    return transaction.transactionType === 'Received' &&
        transaction.financialKind === 'p2p' &&
        transaction.partyType === 'person' &&
        personTransactionKey(transaction) === 'nikita vilas ingle' &&
        /\bTV\s+EMI\b/i.test(transaction.narration);
}

function isSharedApplianceEmiReimbursement(transaction: BankTransaction) {
    return transaction.transactionType === 'Received' &&
        transaction.financialKind === 'p2p' &&
        transaction.partyType === 'person' &&
        personTransactionKey(transaction) === 'nikita vilas ingle' &&
        Math.round(transaction.depositAmount * 100) === 500000 &&
        /FRIDGE|WASHING/i.test(transaction.narration);
}

function normalizeDirection(value?: string) {
    const direction = value?.toLowerCase();
    if (direction === 'debit' || direction === 'sent') return 'Sent';
    if (direction === 'credit' || direction === 'received') return 'Received';
    return value || '—';
}

function suggestCardCategory(narration: string) {
    const text = narration.toLocaleLowerCase();
    if (/^b\/f\b|balance brought forward/.test(text)) return 'Balance forward';
    if (/reversal|\brev\b|refund|chargeback|cradj|cashback|cash back|reward|waiver|rebate/.test(text)) return 'Refunds & adjustments';
    if (/emi|interest|finance charge|gst|igst|cgst|sgst|late fee|joining fee|annual fee|fuel surcharge/.test(text)) return 'Fees & EMI';
    if (/swiggy|zomato|blinkit|zepto|instamart|bigbasket|grocery|groceries|food|restaurant/.test(text)) return 'Food & Groceries';
    if (/flight|airline|hotel|travel|cleartrip|makemytrip|irctc/.test(text)) return 'Travel';
    if (/electric|water|gas bill|broadband|mobile recharge|bill payment|utilities/.test(text)) return 'Bills & Utilities';
    if (/hospital|pharmacy|medical|health|clinic/.test(text)) return 'Healthcare';
    if (/fuel|uber|ola|rapido|metro|transport|parking/.test(text)) return 'Transport';
    if (/amazon|flipkart|myntra|meesho|ajio|westside|retail|cloth|store|shopping/.test(text)) return 'Shopping';
    if (/upi|p2p/.test(text)) return 'Person-to-Person / UPI';
    return 'Needs review';
}

function classifyCardCredit(narration: string) {
    const text = narration.toLocaleLowerCase();
    if (/cashback|cash back|reward|waiver|rebate/.test(text)) return 'Rewards & waivers';
    if (/refund|reversal|chargeback|cradj|\brev\b/.test(text)) return 'Refunds & reversals';
    if (/payment|bbps|tele transfer|received/.test(text)) return 'Card bill payments';
    return 'Other credits';
}

function transactionDate(value: string) {
    return value.slice(0, 10);
}

function cardTransactionsInPeriod(transactions: CardTransaction[], fromDate: string, toDate: string) {
    return transactions.filter((transaction) =>
        (!fromDate || transactionDate(transaction.date) >= fromDate) &&
        (!toDate || transactionDate(transaction.date) <= toDate),
    );
}

function deduplicateTransactions<T extends BankTransaction>(transactions: T[]) {
    const seen = new Set<string>();
    return transactions.filter((transaction) => {
        if (transaction.duplicate) return false;
        const identity = [
            transaction.date,
            transaction.transactionType,
            transaction.withdrawalAmount,
            transaction.depositAmount,
            transaction.normalizedName?.trim().toLocaleLowerCase(),
            transaction.referenceNumber?.trim().toLocaleLowerCase(),
            transaction.narration.trim().toLocaleLowerCase(),
            transaction.closingBalance,
        ].join('|');
        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
    });
}

function personTransactionKey(transaction: BankTransaction) {
    return (transaction.normalizedName?.trim() || transaction.personOrMerchant?.trim() || '').toLocaleLowerCase();
}

function findSettledPersonTransactionIds(transactions: BankTransaction[]) {
    const outgoing = transactions.filter((transaction) =>
        transaction.financialKind === 'p2p' && transaction.partyType === 'person' && transaction.transactionType === 'Sent' && transaction.withdrawalAmount > 0,
    );
    const incoming = transactions.filter((transaction) =>
        transaction.financialKind === 'p2p' && transaction.partyType === 'person' && transaction.transactionType === 'Received' && transaction.depositAmount > 0,
    );
    const matches: { sent: BankTransaction; received: BankTransaction; daysApart: number }[] = [];

    for (const sent of outgoing) {
        const sentDay = Date.parse(`${transactionDate(sent.date)}T00:00:00Z`);
        if (!Number.isFinite(sentDay)) continue;
        for (const received of incoming) {
            if (personTransactionKey(sent) !== personTransactionKey(received)) continue;
            if (Math.round(sent.withdrawalAmount * 100) !== Math.round(received.depositAmount * 100)) continue;
            const receivedDay = Date.parse(`${transactionDate(received.date)}T00:00:00Z`);
            if (!Number.isFinite(receivedDay)) continue;
            const daysApart = Math.abs(receivedDay - sentDay) / 86_400_000;
            if (daysApart <= 3) matches.push({ sent, received, daysApart });
        }
    }

    matches.sort((left, right) =>
        left.daysApart - right.daysApart ||
        left.sent.date.localeCompare(right.sent.date) ||
        left.received.date.localeCompare(right.received.date) ||
        left.sent.id.localeCompare(right.sent.id),
    );
    const settledIds = new Set<string>();
    for (const match of matches) {
        if (settledIds.has(match.sent.id) || settledIds.has(match.received.id)) continue;
        settledIds.add(match.sent.id);
        settledIds.add(match.received.id);
    }
    return settledIds;
}

function isValidDate(value: string) {
    return Boolean(value) && !Number.isNaN(new Date(`${transactionDate(value)}T00:00:00`).getTime());
}

function FilterSelect({
    id,
    label,
    value,
    onChange,
    children,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor={id}>
            {label}
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            >
                {children}
            </select>
        </label>
    );
}

function PersonTransactions({
    name,
    transactions,
    settledIds,
    onClose,
}: {
    name: string;
    transactions: BankTransaction[];
    settledIds: ReadonlySet<string>;
    onClose: () => void;
}) {
    const { t, lang } = useI18n();
    const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
    const ordered = [...transactions].sort((left, right) => right.date.localeCompare(left.date));

    return (
        <section className="flex min-w-0 flex-col gap-2" aria-label={t('financialTransactionsFor', { name })}>
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t('financialTransactionsFor', { name })}</h3>
                <Button variant="outline" size="icon" aria-label={t('close')} onClick={onClose}><X /></Button>
            </div>
            <Card className="py-0">
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">{t('date')}</TableHead>
                                <TableHead>{t('financialDirection')}</TableHead>
                                <TableHead>{t('financialRecord')}</TableHead>
                                <TableHead>{t('category')}</TableHead>
                                <TableHead>{t('financialSettlementStatus')}</TableHead>
                                <TableHead>{t('reference')}</TableHead>
                                <TableHead className="pr-4 text-right">{t('amount')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ordered.map((transaction) => {
                                const settled = settledIds.has(transaction.id);
                                const returnedAmount = reimbursementReturnAmount(transaction);
                                const returned = returnedAmount != null;
                                const tvEmiReimbursement = isTvEmiReimbursement(transaction);
                                const sharedApplianceEmiReimbursement = isSharedApplianceEmiReimbursement(transaction);
                                const received = transaction.transactionType === 'Received';
                                const DirectionIcon = received ? ArrowDownLeft : ArrowUpRight;
                                const rowTint = tvEmiReimbursement || sharedApplianceEmiReimbursement || returned
                                    ? 'bg-red-50/40 hover:bg-red-50/40 dark:bg-red-950/15 dark:hover:bg-red-950/15'
                                    : settled
                                    ? 'bg-orange-50/45 hover:bg-orange-50/45 dark:bg-orange-950/15 dark:hover:bg-orange-950/15'
                                    : received
                                      ? 'bg-emerald-50/35 hover:bg-emerald-50/35 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/10'
                                      : 'bg-red-50/30 hover:bg-red-50/30 dark:bg-red-950/10 dark:hover:bg-red-950/10';
                                return (
                                <TableRow key={transaction.id} className={rowTint}>
                                    <TableCell className={cn('whitespace-nowrap pl-4', settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returned && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{formatDate(transaction.date, locale)}</TableCell>
                                <TableCell className={cn('whitespace-nowrap', returned ? 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70' : received ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400', settled && 'line-through decoration-orange-600/60')}>
                                    <span className="inline-flex items-center gap-1"><DirectionIcon className="size-3.5" />{transaction.transactionType}</span>
                                </TableCell>
                                    <TableCell className={cn('max-w-72 whitespace-normal', settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returned && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{transaction.narration}</TableCell>
                                    <TableCell className={cn('whitespace-nowrap', settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returned && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{[transaction.category, transaction.subcategory].filter(Boolean).join(' · ') || '—'}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                        {settled && !tvEmiReimbursement && !sharedApplianceEmiReimbursement && <Badge variant="outline" className="border-orange-300/60 bg-orange-50/50 text-orange-800/75 dark:border-orange-800/60 dark:bg-orange-950/20 dark:text-orange-200/75">{t('financialSettledChip')}</Badge>}
                                        {returnedAmount != null && <Badge title={tvEmiReimbursement ? t('financialTvEmiTooltip') : sharedApplianceEmiReimbursement ? t('financialSharedApplianceEmiTooltip') : undefined} variant="outline" className="border-emerald-300/70 bg-emerald-50/60 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">{tvEmiReimbursement ? t('financialTvEmiReimbursementChip', { amount: formatMoney(returnedAmount) }) : sharedApplianceEmiReimbursement ? t('financialSharedApplianceEmiChip', { amount: formatMoney(returnedAmount) }) : t('financialReturnedReimbursement', { amount: formatMoney(returnedAmount) })}</Badge>}
                                    </div>
                                </TableCell>
                                    <TableCell className={cn('max-w-36 break-all font-mono text-xs', settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returned && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{transaction.referenceNumber || '—'}</TableCell>
                                    <TableCell className={cn('pr-4 text-right font-medium tabular-nums whitespace-nowrap', settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returned && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{formatMoney(amountForBank(transaction))}</TableCell>
                                </TableRow>
                                );
                            })}
                            {ordered.length === 0 && <TableRow><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">{t('financialNoPersonTransactions')}</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    );
}

function FlowRank({
    title,
    flows,
    direction,
    emptyLabel,
    selectedKey,
    onSelectPerson,
}: {
    title: string;
    flows: PersonFlow[];
    direction: 'sent' | 'received';
    emptyLabel: string;
    selectedKey: string | null;
    onSelectPerson: (person: PersonFlow) => void;
}) {
    const { t, lang } = useI18n();
    const maxAmount = Math.max(1, ...flows.map((flow) => flow[direction]));
    const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
    const Icon = direction === 'sent' ? ArrowUpRight : ArrowDownLeft;

    return (
        <section className="min-w-0">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Icon className="size-4 text-muted-foreground" />
                {title}
            </h3>
            {flows.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">{emptyLabel}</p>
            ) : (
                <ol className="divide-y">
                    {flows.map((flow) => {
                        const amount = flow[direction];
                        const count = direction === 'sent' ? flow.sentCount : flow.receivedCount;
                        return (
                            <li key={flow.key} className="py-2.5">
                                <div className="flex min-w-0 items-baseline justify-between gap-3">
                                    <button
                                        type="button"
                                        aria-pressed={selectedKey === flow.key}
                                        onClick={() => onSelectPerson(flow)}
                                        className="min-w-0 truncate text-left text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                                    >
                                        {flow.name}
                                    </button>
                                    <span className="shrink-0 text-sm font-semibold tabular-nums">{formatMoney(amount)}</span>
                                </div>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(3, (amount / maxAmount) * 100)}%` }} />
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">{count.toLocaleString(locale)} {t(count === 1 ? 'financialSingleTransfer' : 'financialTransferUnit')}</span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}

function PeopleFlowOverview({
    flows,
    transactions,
    settledIds,
    settledPairCount,
    settledAmount,
    tvEmiReimbursementCount,
    tvEmiReimbursementTotal,
    sharedApplianceEmiCount,
    sharedApplianceEmiTotal,
    sentTotal,
    receivedTotal,
    transferCount,
    duplicatesRemoved,
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
}: {
    flows: PersonFlow[];
    transactions: BankTransaction[];
    settledIds: ReadonlySet<string>;
    settledPairCount: number;
    settledAmount: number;
    tvEmiReimbursementCount: number;
    tvEmiReimbursementTotal: number;
    sharedApplianceEmiCount: number;
    sharedApplianceEmiTotal: number;
    sentTotal: number;
    receivedTotal: number;
    transferCount: number;
    duplicatesRemoved: number;
    fromDate: string;
    toDate: string;
    onFromDateChange: (value: string) => void;
    onToDateChange: (value: string) => void;
}) {
    const { t, lang } = useI18n();
    const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
    const [query, setQuery] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [page, setPage] = useState(0);
    const [selectedPerson, setSelectedPerson] = useState<PersonFlow | null>(null);
    const selectPerson = (person: PersonFlow) => setSelectedPerson((current) => current?.key === person.key ? null : person);
    const people = flows
        .filter((flow) => flow.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
        .sort((left, right) => (right.sent + right.received) - (left.sent + left.received));
    const sentFlows = [...people].filter((flow) => flow.sent > 0).sort((left, right) => right.sent - left.sent).slice(0, 8);
    const receivedFlows = [...people].filter((flow) => flow.received > 0).sort((left, right) => right.received - left.received).slice(0, 8);
    const pageSize = 25;
    const pageCount = Math.ceil(people.length / pageSize);
    const pagePeople = people.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label={t('financialSentToPeople')} value={formatMoney(sentTotal)} />
                <StatCard label={t('financialReceivedFromPeople')} value={formatMoney(receivedTotal)} />
                <StatCard label={t('financialPeopleCount')} value={flows.length.toLocaleString(locale)} />
                <StatCard label={t('financialTransfers')} value={transferCount.toLocaleString(locale)} />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3">
                <div className="grid w-full grid-cols-2 gap-2 sm:max-w-md">
                    <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor="people-from-date">
                        {t('financialFromDate')}
                        <Input id="people-from-date" type="date" value={fromDate} onChange={(event) => onFromDateChange(event.target.value)} className="h-9 min-w-0 px-2 text-sm" />
                    </label>
                    <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor="people-to-date">
                        {t('financialToDate')}
                        <Input id="people-to-date" type="date" value={toDate} onChange={(event) => onToDateChange(event.target.value)} className="h-9 min-w-0 px-2 text-sm" />
                    </label>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-8" placeholder={t('financialPeopleSearch')} value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} />
                </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{t('financialDuplicatesExcluded', { n: duplicatesRemoved.toLocaleString(locale) })}</span>
                <span>{t('financialSettledPairsExcluded', { pairs: settledPairCount.toLocaleString(locale), amount: formatMoney(settledAmount) })}</span>
                {tvEmiReimbursementCount > 0 && <span>{t('financialTvEmiExcluded', { count: tvEmiReimbursementCount.toLocaleString(locale), amount: formatMoney(tvEmiReimbursementTotal) })}</span>}
                {sharedApplianceEmiCount > 0 && <span>{t('financialSharedApplianceEmiExcluded', { count: sharedApplianceEmiCount.toLocaleString(locale), amount: formatMoney(sharedApplianceEmiTotal) })}</span>}
            </div>

            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                <FlowRank title={t('financialMostSent')} flows={sentFlows} direction="sent" emptyLabel={t('financialNoPeople')} selectedKey={selectedPerson?.key ?? null} onSelectPerson={selectPerson} />
                <FlowRank title={t('financialMostReceived')} flows={receivedFlows} direction="received" emptyLabel={t('financialNoPeople')} selectedKey={selectedPerson?.key ?? null} onSelectPerson={selectPerson} />
            </div>

            {selectedPerson && (
                <PersonTransactions
                    name={selectedPerson.name}
                    transactions={transactions.filter((transaction) =>
                        (transaction.normalizedName?.trim().toLocaleLowerCase() || transaction.personOrMerchant?.trim().toLocaleLowerCase()) === selectedPerson.key,
                    )}
                    settledIds={settledIds}
                    onClose={() => setSelectedPerson(null)}
                />
            )}

            <div>
                <Button variant="outline" onClick={() => { setShowAll((current) => !current); setPage(0); }}>
                    {showAll ? t('financialHidePeople') : t('financialShowAllPeople', { n: people.length.toLocaleString(locale) })}
                </Button>
                {showAll && (
                    <div className="mt-3 flex flex-col gap-3">
                        <Card className="py-0">
                            <CardContent className="px-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-4">{t('financialPerson')}</TableHead>
                                            <TableHead className="text-right">{t('financialSentToPeople')}</TableHead>
                                            <TableHead className="text-right">{t('financialReceivedFromPeople')}</TableHead>
                                            <TableHead className="pr-4 text-right">{t('financialTransfers')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pagePeople.map((person) => (
                                            <TableRow key={person.key}>
                                                <TableCell className="pl-4">
                                                    <button type="button" aria-pressed={selectedPerson?.key === person.key} onClick={() => selectPerson(person)} className="text-left font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
                                                        {person.name}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">{formatMoney(person.sent)}</TableCell>
                                                <TableCell className="text-right tabular-nums">{formatMoney(person.received)}</TableCell>
                                                <TableCell className="pr-4 text-right tabular-nums">{(person.sentCount + person.receivedCount).toLocaleString(locale)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {pagePeople.length === 0 && <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">{t('financialNoPeople')}</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                            <Button variant="outline" size="icon" aria-label={t('financialPreviousPage')} disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}><ChevronLeft /></Button>
                            <span className="tabular-nums">{pageCount ? `${page + 1} / ${pageCount}` : '0 / 0'}</span>
                            <Button variant="outline" size="icon" aria-label={t('financialNextPage')} disabled={page + 1 >= pageCount} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}><ChevronRight /></Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function HouseholdOverview({
    transactions,
    cardTransactions,
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
}: {
    transactions: BankTransaction[];
    cardTransactions: CardTransaction[];
    fromDate: string;
    toDate: string;
    onFromDateChange: (value: string) => void;
    onToDateChange: (value: string) => void;
}) {
    const { t, lang } = useI18n();
    const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
    const [showAllMonths, setShowAllMonths] = useState(false);
    const [showAllMerchants, setShowAllMerchants] = useState(false);
    const [merchantPage, setMerchantPage] = useState(0);
    const [selectedRentPayee, setSelectedRentPayee] = useState<string | null>(null);

    const uniqueTransactions = useMemo(
        () => deduplicateTransactions(transactions).filter((transaction) =>
            (!fromDate || transactionDate(transaction.date) >= fromDate) &&
            (!toDate || transactionDate(transaction.date) <= toDate),
        ),
        [transactions, fromDate, toDate],
    );
    const personTransfers = useMemo(
        () => uniqueTransactions.filter((transaction) => transaction.financialKind === 'p2p' && transaction.partyType === 'person'),
        [uniqueTransactions],
    );
    const settledIds = useMemo(() => findSettledPersonTransactionIds(personTransfers), [personTransfers]);
    const periodCards = cardTransactionsInPeriod(cardTransactions, fromDate, toDate);
    const expenses = uniqueTransactions.filter((transaction) => transaction.financialKind === 'expense' && transaction.withdrawalAmount > 0);
    const rentPayments = uniqueTransactions.filter((transaction) =>
        transaction.financialKind === 'p2p' &&
        transaction.partyType === 'person' &&
        transaction.transactionType === 'Sent' &&
        RENT_PAYEE_PATTERN.test(transaction.normalizedName || transaction.personOrMerchant || ''),
    );
    const needsReview = uniqueTransactions.filter((transaction) => transaction.financialKind === 'needs_review' && transaction.withdrawalAmount > 0);
    const countedRentPayments = rentPayments.filter((transaction) => !settledIds.has(transaction.id));
    const settledRentSent = rentPayments.filter((transaction) => settledIds.has(transaction.id));
    const settledRentPairs = settledRentSent.length;
    const settledRentAmount = settledRentSent.reduce((total, transaction) => total + transaction.withdrawalAmount, 0);
    const cardDebitRows = periodCards.filter((transaction) => transaction.transactionType === 'Sent');
    const cardCreditRows = periodCards.filter((transaction) => transaction.transactionType === 'Received');

    const directExpenseTotal = expenses.reduce((total, transaction) => total + transaction.withdrawalAmount, 0);
    const rentTotal = countedRentPayments.reduce((total, transaction) => total + transaction.withdrawalAmount, 0);
    const reviewTotal = needsReview.reduce((total, transaction) => total + transaction.withdrawalAmount, 0);
    const cardReviewTotal = cardDebitRows.reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
    const cardCreditTotal = cardCreditRows.reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
    const householdTotal = directExpenseTotal + rentTotal;
    const recordedOutflow = householdTotal + cardReviewTotal;

    const cardBySource = [...periodCards.reduce((groups, transaction) => {
        const current = groups.get(transaction.card) || { debits: 0, credits: 0, debitCount: 0, creditCount: 0 };
        if (transaction.transactionType === 'Sent') {
            current.debits += Math.abs(transaction.amount);
            current.debitCount += 1;
        } else if (transaction.transactionType === 'Received') {
            current.credits += Math.abs(transaction.amount);
            current.creditCount += 1;
        }
        groups.set(transaction.card, current);
        return groups;
    }, new Map<string, { debits: number; credits: number; debitCount: number; creditCount: number }>())]
        .map(([card, totals]) => ({ card, ...totals }))
        .sort((left, right) => right.debits - left.debits);

    const cardCategoryTotals = [...cardDebitRows.reduce((groups, transaction) => {
        const category = suggestCardCategory(transaction.narration);
        const current = groups.get(category) || { amount: 0, count: 0 };
        current.amount += Math.abs(transaction.amount);
        current.count += 1;
        groups.set(category, current);
        return groups;
    }, new Map<string, { amount: number; count: number }>())]
        .map(([category, totals]) => ({ category, ...totals }))
        .sort((left, right) => right.amount - left.amount);

    const cardCreditTypes = [...cardCreditRows.reduce((groups, transaction) => {
        const type = classifyCardCredit(transaction.narration);
        const current = groups.get(type) || { amount: 0, count: 0 };
        current.amount += Math.abs(transaction.amount);
        current.count += 1;
        groups.set(type, current);
        return groups;
    }, new Map<string, { amount: number; count: number }>())]
        .map(([type, totals]) => ({ type, ...totals }))
        .sort((left, right) => right.amount - left.amount);

    const categoryTotals = [...expenses.reduce((totals, transaction) => {
        const current = totals.get(transaction.category || 'Other') || { amount: 0, count: 0 };
        current.amount += transaction.withdrawalAmount;
        current.count += 1;
        totals.set(transaction.category || 'Other', current);
        return totals;
    }, new Map<string, { amount: number; count: number }>())]
        .map(([name, totals]) => ({ name, ...totals }))
        .sort((left, right) => right.amount - left.amount);

    const rentByPayee = [...countedRentPayments.reduce((payees, transaction) => {
        const name = transaction.personOrMerchant || transaction.normalizedName || t('financialUnknownPerson');
        const current = payees.get(name) || { amount: 0, count: 0, months: new Set<string>(), latestDate: '' };
        current.amount += transaction.withdrawalAmount;
        current.count += 1;
        current.months.add(transaction.month || transaction.date.slice(0, 7));
        if (transaction.date > current.latestDate) current.latestDate = transaction.date;
        payees.set(name, current);
        return payees;
    }, new Map<string, { amount: number; count: number; months: Set<string>; latestDate: string }>())]
        .map(([name, totals]) => ({ name, ...totals }))
        .sort((left, right) => right.amount - left.amount);

    const merchants = [...expenses.reduce((groups, transaction) => {
        const name = transaction.normalizedName || transaction.personOrMerchant || t('financialUnknownPerson');
        const current = groups.get(name) || { amount: 0, count: 0, category: transaction.category || 'Other' };
        current.amount += transaction.withdrawalAmount;
        current.count += 1;
        groups.set(name, current);
        return groups;
    }, new Map<string, { amount: number; count: number; category: string }>())]
        .map(([name, totals]) => ({ name, ...totals }))
        .sort((left, right) => right.amount - left.amount);

    const monthlyGroups = uniqueTransactions.reduce((groups, transaction) => {
        const month = transaction.month || transaction.date.slice(0, 7);
        const current = groups.get(month) || { expenses: 0, rent: 0, cardDebits: 0, cardCredits: 0, count: 0 };
        if (transaction.financialKind === 'expense' && transaction.withdrawalAmount > 0) {
            current.expenses += transaction.withdrawalAmount;
            current.count += 1;
        }
        if (
            transaction.financialKind === 'p2p' &&
            transaction.partyType === 'person' &&
            transaction.transactionType === 'Sent' &&
            !settledIds.has(transaction.id) &&
            RENT_PAYEE_PATTERN.test(transaction.normalizedName || transaction.personOrMerchant || '')
        ) {
            current.rent += transaction.withdrawalAmount;
            current.count += 1;
        }
        groups.set(month, current);
        return groups;
    }, new Map<string, { expenses: number; rent: number; cardDebits: number; cardCredits: number; count: number }>());
    for (const transaction of periodCards) {
        const month = transaction.month || transaction.date.slice(0, 7);
        const current = monthlyGroups.get(month) || { expenses: 0, rent: 0, cardDebits: 0, cardCredits: 0, count: 0 };
        if (transaction.transactionType === 'Sent') {
            current.cardDebits += Math.abs(transaction.amount);
            current.count += 1;
        } else if (transaction.transactionType === 'Received') {
            current.cardCredits += Math.abs(transaction.amount);
        }
        monthlyGroups.set(month, current);
    }
    const monthly = [...monthlyGroups]
        .map(([month, totals]) => ({ month, ...totals }))
        .sort((left, right) => right.month.localeCompare(left.month));
    const shownMonths = showAllMonths ? monthly : monthly.slice(0, 12);
    const maxMonthlyTotal = Math.max(1, ...monthly.map((month) => month.expenses + month.rent + month.cardDebits));
    const merchantPageSize = 25;
    const merchantPageCount = Math.ceil(merchants.length / merchantPageSize);
    const shownMerchants = showAllMerchants
        ? merchants.slice(merchantPage * merchantPageSize, (merchantPage + 1) * merchantPageSize)
        : merchants.slice(0, 8);

    const categoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'Bills & Utilities': t('financialBillsUtilities'),
            'Balance forward': t('financialBalanceForward'),
            'Entertainment': t('financialEntertainment'),
            'Fees & EMI': t('financialCardFeesEmi'),
            'Food & Groceries': t('financialCardFoodGroceries'),
            'Food & Restaurants': t('financialFoodRestaurants'),
            'Groceries': t('financialGroceries'),
            'Healthcare': t('financialHealthcare'),
            'Needs review': t('financialNeedsReviewFilter'),
            'Other': t('financialOther'),
            'Person-to-Person / UPI': t('financialPersonToPerson'),
            'Refunds & adjustments': t('financialCardRefundAdjustments'),
            'Shopping': t('financialShopping'),
            'Transportation': t('financialTransportation'),
            'Transport': t('financialTransportation'),
            'Travel': t('financialTravel'),
        };
        return labels[category] || category;
    };
    const cardCreditLabel = (type: string) => {
        if (type === 'Rewards & waivers') return t('financialCardRewards');
        if (type === 'Refunds & reversals') return t('financialCardRefunds');
        if (type === 'Card bill payments') return t('financialCardBillPayments');
        return t('financialOther');
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-7">
                <StatCard label={t('financialRecordedOutflow')} value={formatMoney(recordedOutflow)} hint={t('financialRecordedOutflowNote')} />
                <StatCard label={t('financialHouseholdSpend')} value={formatMoney(householdTotal)} hint={t('financialHouseholdSpendHint')} />
                <StatCard label={t('financialDirectExpenses')} value={formatMoney(directExpenseTotal)} hint={`${expenses.length.toLocaleString(locale)} ${t('financialTransactions').toLocaleLowerCase(locale)}`} />
                <StatCard label={t('financialRentPaid')} value={formatMoney(rentTotal)} hint={`${rentPayments.length.toLocaleString(locale)} ${t('financialTransactions').toLocaleLowerCase(locale)}`} />
                <StatCard label={t('financialCardDebits')} value={formatMoney(cardReviewTotal)} hint={`${cardDebitRows.length.toLocaleString(locale)} ${t('financialTransactions').toLocaleLowerCase(locale)}`} />
                <StatCard label={t('financialCardCredits')} value={formatMoney(cardCreditTotal)} hint={`${cardCreditRows.length.toLocaleString(locale)} ${t('financialTransactions').toLocaleLowerCase(locale)}`} />
                <StatCard label={t('financialReviewOutflow')} value={formatMoney(reviewTotal)} hint={`${needsReview.length.toLocaleString(locale)} ${t('financialNeedsReviewFilter').toLocaleLowerCase(locale)}`} />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3">
                <div className="grid w-full grid-cols-2 gap-2 sm:max-w-md">
                    <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor="household-from-date">
                        {t('financialFromDate')}
                        <Input id="household-from-date" type="date" value={fromDate} onChange={(event) => onFromDateChange(event.target.value)} className="h-9 min-w-0 px-2 text-sm" />
                    </label>
                    <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor="household-to-date">
                        {t('financialToDate')}
                        <Input id="household-to-date" type="date" value={toDate} onChange={(event) => onToDateChange(event.target.value)} className="h-9 min-w-0 px-2 text-sm" />
                    </label>
                </div>
                <p className="max-w-2xl text-xs text-muted-foreground">{t('financialRentNote')}</p>
            </div>

            <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
                <section className="min-w-0">
                    <h3 className="mb-2 text-sm font-semibold">{t('financialExpenseCategories')}</h3>
                    {categoryTotals.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground">{t('financialNoHouseholdRecords')}</p>
                    ) : (
                        <ol className="divide-y">
                            {categoryTotals.map((category) => (
                                <li key={category.name} className="py-2.5">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="text-sm font-medium">{categoryLabel(category.name)}</span>
                                        <span className="shrink-0 text-sm font-semibold tabular-nums">{formatMoney(category.amount)}</span>
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, (category.amount / Math.max(1, directExpenseTotal)) * 100)}%` }} />
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">{((category.amount / Math.max(1, directExpenseTotal)) * 100).toLocaleString(locale, { maximumFractionDigits: 1 })}% · {category.count.toLocaleString(locale)}</span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                <section className="min-w-0">
                    <h3 className="mb-2 text-sm font-semibold">{t('financialRentBreakdown')}</h3>
                    <p className="mb-2 text-xs text-muted-foreground">{t('financialRentNote')}</p>
                    <Card className="py-0">
                        <CardContent className="px-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-4">{t('financialPerson')}</TableHead>
                                        <TableHead className="text-right">{t('financialPayments')}</TableHead>
                                        <TableHead className="text-right">{t('financialMonthsCovered')}</TableHead>
                                        <TableHead className="pr-4 text-right">{t('financialTotalPaid')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rentByPayee.map((payee) => (
                                        <TableRow key={payee.name}>
                                            <TableCell className="pl-4 font-medium">
                                                <button type="button" aria-pressed={selectedRentPayee === payee.name} onClick={() => setSelectedRentPayee((current) => current === payee.name ? null : payee.name)} className="text-left font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
                                                    {payee.name}
                                                </button>
                                                <div className="text-xs text-muted-foreground">{t('financialLastPayment')}: {formatDate(payee.latestDate, locale)}</div>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{payee.count.toLocaleString(locale)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{payee.months.size.toLocaleString(locale)}</TableCell>
                                            <TableCell className="pr-4 text-right font-medium tabular-nums">{formatMoney(payee.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {rentByPayee.length === 0 && <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">{t('financialNoHouseholdRecords')}</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    {settledRentPairs > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            {t('financialSettledRentExcluded', { pairs: settledRentPairs.toLocaleString(locale), amount: formatMoney(settledRentAmount) })}
                        </p>
                    )}
                    {selectedRentPayee && (
                        <div className="mt-3">
                            <PersonTransactions
                                name={selectedRentPayee}
                                transactions={personTransfers.filter((transaction) => personTransactionKey(transaction) === selectedRentPayee.toLocaleLowerCase())}
                                settledIds={settledIds}
                                onClose={() => setSelectedRentPayee(null)}
                            />
                        </div>
                    )}
                </section>
            </div>

            <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
                <section className="min-w-0">
                    <h3 className="mb-2 text-sm font-semibold">{t('financialCardByIssuer')}</h3>
                    <p className="mb-2 text-xs text-muted-foreground">{t('financialCardReviewNote')}</p>
                    <Card className="py-0">
                        <CardContent className="px-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-4">{t('financialCard')}</TableHead>
                                        <TableHead className="text-right">{t('financialCardDebits')}</TableHead>
                                        <TableHead className="text-right">{t('financialCardCredits')}</TableHead>
                                        <TableHead className="pr-4 text-right">{t('financialTransactions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cardBySource.map((card) => (
                                        <TableRow key={card.card}>
                                            <TableCell className="pl-4 font-medium">{card.card}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatMoney(card.debits)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatMoney(card.credits)}</TableCell>
                                            <TableCell className="pr-4 text-right tabular-nums">{(card.debitCount + card.creditCount).toLocaleString(locale)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>

                <section className="min-w-0">
                    <h3 className="mb-2 text-sm font-semibold">{t('financialCardSuggestedCategories')}</h3>
                    <p className="mb-2 text-xs text-muted-foreground">{t('financialCardSuggestionNote')}</p>
                    <ol className="divide-y">
                        {cardCategoryTotals.map((category) => (
                            <li key={category.category} className="flex items-center justify-between gap-3 py-2">
                                <span className="min-w-0 truncate text-sm">{categoryLabel(category.category)} <span className="text-xs text-muted-foreground">({category.count.toLocaleString(locale)})</span></span>
                                <span className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(category.amount)}</span>
                            </li>
                        ))}
                    </ol>
                    <h4 className="mb-2 mt-4 text-xs font-semibold uppercase text-muted-foreground">{t('financialCardCreditsBreakdown')}</h4>
                    <ol className="divide-y">
                        {cardCreditTypes.map((credit) => (
                            <li key={credit.type} className="flex items-center justify-between gap-3 py-2 text-sm">
                                <span>{cardCreditLabel(credit.type)}</span>
                                <span className="shrink-0 tabular-nums">{formatMoney(credit.amount)} <span className="text-xs text-muted-foreground">({credit.count.toLocaleString(locale)})</span></span>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            <section className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{t('financialTopHouseholdSpending')}</h3>
                    {merchants.length > 8 && (
                        <Button variant="outline" size="sm" onClick={() => { setShowAllMerchants((current) => !current); setMerchantPage(0); }}>
                            {showAllMerchants ? t('financialShowTopMerchants') : t('financialShowAllMerchants', { n: merchants.length.toLocaleString(locale) })}
                        </Button>
                    )}
                </div>
                <Card className="py-0">
                    <CardContent className="px-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-4">{t('financialMerchant')}</TableHead>
                                    <TableHead>{t('category')}</TableHead>
                                    <TableHead className="text-right">{t('financialTransactions')}</TableHead>
                                    <TableHead className="pr-4 text-right">{t('financialTotalPaid')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shownMerchants.map((merchant) => (
                                    <TableRow key={merchant.name}>
                                        <TableCell className="max-w-64 whitespace-normal pl-4 font-medium">{merchant.name}</TableCell>
                                        <TableCell>{categoryLabel(merchant.category)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{merchant.count.toLocaleString(locale)}</TableCell>
                                        <TableCell className="pr-4 text-right tabular-nums">{formatMoney(merchant.amount)}</TableCell>
                                    </TableRow>
                                ))}
                                {shownMerchants.length === 0 && <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">{t('financialNoHouseholdRecords')}</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {showAllMerchants && merchantPageCount > 1 && (
                    <div className="mt-2 flex items-center justify-end gap-2 text-sm text-muted-foreground">
                        <Button variant="outline" size="icon" aria-label={t('financialPreviousPage')} disabled={merchantPage === 0} onClick={() => setMerchantPage((current) => Math.max(0, current - 1))}><ChevronLeft /></Button>
                        <span className="tabular-nums">{merchantPage + 1} / {merchantPageCount}</span>
                        <Button variant="outline" size="icon" aria-label={t('financialNextPage')} disabled={merchantPage + 1 >= merchantPageCount} onClick={() => setMerchantPage((current) => Math.min(merchantPageCount - 1, current + 1))}><ChevronRight /></Button>
                    </div>
                )}
            </section>

            <section className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{t('financialMonthlySpending')}</h3>
                    {monthly.length > 12 && <Button variant="outline" size="sm" onClick={() => setShowAllMonths((current) => !current)}>{showAllMonths ? t('financialShowRecentMonths') : t('financialShowAllMonths')}</Button>}
                </div>
                <Card className="py-0">
                    <CardContent className="px-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-4">{t('financialMonth')}</TableHead>
                                    <TableHead>{t('financialSpendingTrend')}</TableHead>
                                    <TableHead className="text-right">{t('financialDirectExpenses')}</TableHead>
                                    <TableHead className="text-right">{t('financialRentPaid')}</TableHead>
                                    <TableHead className="text-right">{t('financialCardDebits')}</TableHead>
                                    <TableHead className="text-right">{t('financialCardCredits')}</TableHead>
                                    <TableHead className="pr-4 text-right">{t('financialRecordedOutflow')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shownMonths.map((month) => {
                                    const total = month.expenses + month.rent + month.cardDebits;
                                    return (
                                        <TableRow key={month.month}>
                                            <TableCell className="whitespace-nowrap pl-4 font-medium">{new Date(`${month.month}-01T00:00:00`).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}</TableCell>
                                            <TableCell className="min-w-24"><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(total > 0 ? 1 : 0, (total / maxMonthlyTotal) * 100)}%` }} /></div></TableCell>
                                            <TableCell className="text-right tabular-nums">{formatMoney(month.expenses)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatMoney(month.rent)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatMoney(month.cardDebits)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatMoney(month.cardCredits)}</TableCell>
                                            <TableCell className="pr-4 text-right font-medium tabular-nums">{formatMoney(total)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                {shownMonths.length === 0 && <TableRow><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">{t('financialNoHouseholdRecords')}</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>

            <div className="grid gap-3 md:grid-cols-2">
                <Card className="gap-1 border-amber-300 py-4">
                    <CardContent className="px-4">
                        <div className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="size-4 text-amber-700" />{t('financialReviewOutflow')}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{t('financialReviewOutflowNote', { count: needsReview.length.toLocaleString(locale) })}</p>
                        <p className="mt-2 font-semibold tabular-nums">{formatMoney(reviewTotal)}</p>
                    </CardContent>
                </Card>
                <Card className="gap-1 py-4">
                    <CardContent className="px-4">
                        <div className="text-sm font-semibold">{t('financialCardCreditsNoteTitle')}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{t('financialCardCreditsNote')}</p>
                        <p className="mt-2 font-semibold tabular-nums">{formatMoney(cardCreditTotal)}</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export function FinancialSection({
    initialSearch = null,
    onInitialSearchConsumed,
}: {
    initialSearch?: string | null;
    onInitialSearchConsumed?: () => void;
}) {
    const { t, lang } = useI18n();
    const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
    const [bank, setBank] = useState<BankDataset | null>(null);
    const [cards, setCards] = useState<CardDataset | null>(null);
    const [emails, setEmails] = useState<EmailDataset | null>(null);
    const [loading, setLoading] = useState(true);
    const [emailLoading, setEmailLoading] = useState(false);
    const [error, setError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [view, setView] = useState<'overview' | 'household' | 'transactions'>('overview');
    const [source, setSource] = useState<Source>('all');
    const [query, setQuery] = useState('');
    const [direction, setDirection] = useState('all');
    const [condition, setCondition] = useState<Condition>('all');
    const [category, setCategory] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (!initialSearch) return;
        setView('transactions');
        setSource('bank');
        setDirection('received');
        setCondition('all');
        setCategory('all');
        setFromDate('');
        setToDate('');
        setQuery(initialSearch);
        setPage(0);
        setExpanded(null);
        onInitialSearchConsumed?.();
    }, [initialSearch, onInitialSearchConsumed]);

    useEffect(() => {
        let active = true;
        Promise.all([fetchJson<BankDataset>(BANK_URL), fetchJson<CardDataset>(CARD_URL)])
            .then(([bankData, cardData]) => {
                if (!active) return;
                setBank(bankData);
                setCards(cardData);
            })
            .catch(() => {
                if (active) setError(true);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (source !== 'email' || emails || emailError) return;
        let active = true;
        setEmailLoading(true);
        fetchJson<EmailDataset>(EMAIL_URL)
            .then((data) => {
                if (active) setEmails(data);
            })
            .catch(() => {
                if (active) setEmailError(true);
            })
            .finally(() => {
                if (active) setEmailLoading(false);
            });
        return () => {
            active = false;
        };
    }, [source, emails, emailError]);

    const personSourceTransactions = useMemo(() => {
        const candidates: BankTransaction[] = [
            ...(bank?.transactions ?? []),
            ...manualTransactions,
        ].filter((transaction) => transaction.financialKind === 'p2p' && transaction.partyType === 'person');
        return { candidates, unique: deduplicateTransactions(candidates) };
    }, [bank]);

    const periodPersonCandidates = useMemo(
        () => personSourceTransactions.candidates.filter((transaction) =>
            (!fromDate || transactionDate(transaction.date) >= fromDate) &&
            (!toDate || transactionDate(transaction.date) <= toDate),
        ),
        [personSourceTransactions.candidates, fromDate, toDate],
    );
    const periodPersonTransactions = useMemo(
        () => personSourceTransactions.unique.filter((transaction) =>
            (!fromDate || transactionDate(transaction.date) >= fromDate) &&
            (!toDate || transactionDate(transaction.date) <= toDate),
        ),
        [personSourceTransactions.unique, fromDate, toDate],
    );
    const matchedPersonIds = useMemo(() => findSettledPersonTransactionIds(periodPersonTransactions), [periodPersonTransactions]);
    const tvEmiReimbursementIds = useMemo(
        () => new Set(periodPersonTransactions.filter(isTvEmiReimbursement).map((transaction) => transaction.id)),
        [periodPersonTransactions],
    );
    const sharedApplianceEmiIds = useMemo(
        () => new Set(periodPersonTransactions.filter(isSharedApplianceEmiReimbursement).map((transaction) => transaction.id)),
        [periodPersonTransactions],
    );
    const settledPersonIds = useMemo(
        () => new Set([...matchedPersonIds, ...tvEmiReimbursementIds, ...sharedApplianceEmiIds]),
        [matchedPersonIds, tvEmiReimbursementIds, sharedApplianceEmiIds],
    );
    const settledPairCount = matchedPersonIds.size / 2;
    const settledAmount = periodPersonTransactions.reduce((total, transaction) =>
        total + (matchedPersonIds.has(transaction.id) && transaction.transactionType === 'Sent' ? transaction.withdrawalAmount : 0),
    0);
    const tvEmiReimbursementCount = tvEmiReimbursementIds.size;
    const tvEmiReimbursementTotal = periodPersonTransactions.reduce((total, transaction) =>
        total + (tvEmiReimbursementIds.has(transaction.id) ? transaction.depositAmount : 0),
    0);
    const sharedApplianceEmiCount = sharedApplianceEmiIds.size;
    const sharedApplianceEmiTotal = periodPersonTransactions.reduce((total, transaction) =>
        total + (sharedApplianceEmiIds.has(transaction.id) ? transaction.depositAmount : 0),
    0);
    const personFlows = useMemo(() => {
        const grouped = new Map<string, PersonFlow>();
        for (const transaction of periodPersonTransactions) {
            const name = transaction.personOrMerchant?.trim() || transaction.normalizedName?.trim() || t('financialUnknownPerson');
            const key = transaction.normalizedName?.trim().toLocaleLowerCase() || name.toLocaleLowerCase();
            const flow = grouped.get(key) ?? { key, name, sent: 0, received: 0, sentCount: 0, receivedCount: 0, settledCount: 0, latestDate: '' };
            if (settledPersonIds.has(transaction.id)) {
                flow.settledCount += 1;
            } else if (transaction.transactionType === 'Sent') {
                flow.sent += transaction.withdrawalAmount;
                flow.sentCount += 1;
            } else if (transaction.transactionType === 'Received') {
                flow.received += transaction.depositAmount;
                flow.receivedCount += 1;
            }
            if (transaction.date > flow.latestDate) flow.latestDate = transaction.date;
            grouped.set(key, flow);
        }
        return [...grouped.values()];
    }, [periodPersonTransactions, settledPersonIds, t]);
    const peopleSentTotal = personFlows.reduce((total, flow) => total + flow.sent, 0);
    const peopleReceivedTotal = personFlows.reduce((total, flow) => total + flow.received, 0);

    const deduplicatedBankTransactions = useMemo(
        () => deduplicateTransactions(bank?.transactions ?? []),
        [bank],
    );
    const settledTransactionIds = useMemo(() => {
        const allPersonTransactions = [...deduplicatedBankTransactions, ...manualTransactions];
        return new Set([
            ...findSettledPersonTransactionIds(allPersonTransactions),
            ...allPersonTransactions.filter(isTvEmiReimbursement).map((transaction) => transaction.id),
            ...allPersonTransactions.filter(isSharedApplianceEmiReimbursement).map((transaction) => transaction.id),
        ]);
    }, [deduplicatedBankTransactions]);

    const bankRows = useMemo<FinancialRow[]>(
        () =>
            deduplicatedBankTransactions.map((transaction) => ({
                key: `bank-${transaction.id}`,
                id: transaction.id,
                date: transaction.date,
                title: transaction.personOrMerchant || transaction.normalizedName || transaction.narration,
                description: transaction.narration,
                source: 'bank',
                account: [bank?.meta.accountHolder, bank?.meta.accountNumberMasked].filter(Boolean).join(' · ') || t('financialBankSource'),
                direction: transaction.transactionType,
                amount: amountForBank(transaction),
                category: transaction.category,
                subcategory: transaction.subcategory,
                reference: transaction.referenceNumber,
                needsReview: Boolean(transaction.needsReview),
                duplicate: Boolean(transaction.duplicate),
                settled: settledTransactionIds.has(transaction.id),
                tvEmiReimbursement: isTvEmiReimbursement(transaction),
                sharedApplianceEmiReimbursement: isSharedApplianceEmiReimbursement(transaction),
                reimbursementReturnedAmount: reimbursementReturnAmount(transaction),
                bank: transaction,
            })),
        [bank, deduplicatedBankTransactions, settledTransactionIds, t],
    );

    const cardRows = useMemo<FinancialRow[]>(
        () =>
            (cards?.transactions ?? []).map((transaction) => ({
                key: `card-${transaction.id}`,
                id: transaction.id,
                date: transaction.date,
                title: transaction.card,
                description: transaction.narration,
                source: 'card',
                account: transaction.card,
                direction: transaction.transactionType,
                amount: Math.abs(transaction.amount),
                category: transaction.category,
                subcategory: transaction.subcategory,
                needsReview: Boolean(transaction.needsReview),
                duplicate: false,
                card: transaction,
            })),
        [cards],
    );

    const manualRows = useMemo<FinancialRow[]>(
        () => manualTransactions.map((transaction) => ({
            key: `manual-${transaction.id}`,
            id: transaction.id,
            date: transaction.date,
            title: transaction.personOrMerchant || transaction.normalizedName,
            description: transaction.narration,
            source: 'manual',
            account: t('financialManualSource'),
            direction: transaction.transactionType,
            amount: amountForBank(transaction),
            category: transaction.category,
            subcategory: transaction.subcategory,
            reference: transaction.referenceNumber,
            needsReview: Boolean(transaction.needsReview),
            duplicate: Boolean(transaction.duplicate),
            settled: settledTransactionIds.has(transaction.id),
            manual: transaction,
        })),
        [settledTransactionIds, t],
    );

    const emailRows = useMemo<FinancialRow[]>(
        () =>
            (emails?.records ?? []).map((record) => ({
                key: `email-${record.id}`,
                id: record.id,
                date: record.receivedDate ?? '',
                title: record.merchant || record.subject || record.sender || t('financialEmailSource'),
                description: record.subject || record.snippet || '',
                source: 'email',
                account: record.paymentMethod || record.maskedAccountOrCard || record.sender || '—',
                direction: normalizeDirection(record.direction),
                amount: record.amount ?? record.refundAmount ?? undefined,
                category: record.recordType,
                subcategory: record.transactionStatus,
                reference: record.reference,
                needsReview: Boolean(record.needsReview),
                duplicate: false,
                email: record,
            })),
        [emails, t],
    );

    const sourceRows = source === 'bank' ? bankRows : source === 'card' ? cardRows : source === 'email' ? emailRows : source === 'manual' ? manualRows : [...bankRows, ...cardRows, ...manualRows];
    const categories = useMemo(
        () => [...new Set(sourceRows.map((row) => row.category).filter((value): value is string => Boolean(value)))].sort(),
        [sourceRows],
    );

    const filteredRows = useMemo(() => {
        const search = query.trim().toLocaleLowerCase();
        return sourceRows
            .filter((row) => {
                if (direction !== 'all' && row.direction.toLowerCase() !== direction) return false;
                if (category !== 'all' && row.category !== category) return false;
                const date = transactionDate(row.date);
                if (fromDate && date < fromDate) return false;
                if (toDate && date > toDate) return false;
                if (condition === 'review' && !row.needsReview) return false;
                if (condition === 'not-reviewed' && row.needsReview) return false;
                if (condition === 'settled' && !row.settled) return false;
                if (condition === 'missing-reference' && row.reference) return false;
                if (condition === 'refunded' && row.email?.transactionStatus !== 'Refunded') return false;
                if (condition === 'false-positive' && !row.email?.isFalsePositive) return false;
                if (condition === 'unresolved' && row.email?.transactionStatus !== 'Unknown') return false;
                if (condition === 'not-completed' && !['Failed', 'Cancelled'].includes(row.email?.transactionStatus ?? '')) return false;
                if (!search) return true;
                return [row.id, row.title, row.description, row.account, row.direction, row.category, row.subcategory, row.reference, row.email?.snippet]
                    .filter(Boolean)
                    .some((value) => value!.toLocaleLowerCase().includes(search));
            })
            .sort((left, right) => right.date.localeCompare(left.date) || left.key.localeCompare(right.key));
    }, [sourceRows, query, direction, category, fromDate, toDate, condition]);

    useEffect(() => {
        setPage(0);
        setExpanded(null);
    }, [source, query, direction, category, fromDate, toDate, condition]);

    const pageCount = Math.ceil(filteredRows.length / PAGE_SIZE);
    const visibleRows = filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const needsReviewCount = bankRows.filter((row) => row.needsReview).length + cardRows.filter((row) => row.needsReview).length;
    const bankOutflow = bankRows.filter((row) => !row.settled).reduce((sum, row) => sum + (row.bank?.withdrawalAmount ?? 0), 0);
    const bankInflow = bankRows.filter((row) => !row.settled).reduce((sum, row) => sum + (row.bank?.depositAmount ?? 0), 0);
    const cardSpend = cardRows.reduce((sum, row) => sum + (row.card?.transactionType === 'Sent' ? row.amount ?? 0 : 0), 0);
    const cardCredits = cardRows.reduce((sum, row) => sum + (row.card?.transactionType === 'Received' ? row.amount ?? 0 : 0), 0);

    const formatAnalysis = (row: FinancialRow) => {
        const issues: { label: string; detail?: string; tone: 'amber' | 'red' | 'gray' | 'green' }[] = [];
        if (!isValidDate(row.date)) issues.push({ label: t('financialInvalidDate'), tone: 'red' });
        if (row.needsReview) issues.push({ label: t('financialReviewFlagged'), tone: 'amber' });
        else issues.push({ label: t('financialNoReviewFlag'), tone: 'green' });
        if (row.duplicate) issues.push({ label: t('financialDuplicateFlag'), tone: 'red' });
        if (row.settled && !row.tvEmiReimbursement && !row.sharedApplianceEmiReimbursement) issues.push({ label: t('financialSettledExcluded'), tone: 'gray' });
        if (row.tvEmiReimbursement && row.reimbursementReturnedAmount != null) {
            issues.push({ label: t('financialTvEmiTooltip'), detail: t('financialTvEmiExcludedDetail', { amount: formatMoney(row.reimbursementReturnedAmount) }), tone: 'green' });
        } else if (row.sharedApplianceEmiReimbursement && row.reimbursementReturnedAmount != null) {
            issues.push({ label: t('financialSharedApplianceEmiTooltip'), detail: t('financialSharedApplianceEmiDetail'), tone: 'green' });
        } else if (row.reimbursementReturnedAmount != null) {
            issues.push({ label: t('financialReturnedReimbursementNote', {
                amount: formatMoney(row.reimbursementReturnedAmount),
                recorded: formatMoney(row.bank?.depositAmount),
            }), tone: 'green' });
        }
        if (!row.reference) issues.push({ label: t('financialMissingReferenceFlag'), tone: 'gray' });
        if (row.amount == null || !Number.isFinite(row.amount) || row.amount <= 0) {
            issues.push({ label: t('financialAmountInvalid'), tone: 'red' });
        }

        if (row.bank) {
            const transaction = row.bank;
            if (transaction.valueDate && transaction.valueDate !== transaction.date) {
                issues.push({ label: t('financialValueDateDiffers'), detail: formatDate(transaction.valueDate, locale), tone: 'gray' });
            }
            const expectedDirection = transaction.withdrawalAmount > 0 && transaction.depositAmount === 0
                ? 'sent'
                : transaction.depositAmount > 0 && transaction.withdrawalAmount === 0
                  ? 'received'
                  : undefined;
            if (
                (transaction.withdrawalAmount > 0 && transaction.depositAmount > 0) ||
                (expectedDirection && transaction.transactionType.toLowerCase() !== expectedDirection)
            ) issues.push({ label: t('financialFlowMismatch'), tone: 'red' });
            if (
                transaction.closingBalance != null &&
                transaction.computedBalance != null &&
                Math.abs(transaction.closingBalance - transaction.computedBalance) > 0.01
            ) {
                issues.push({ label: t('financialBalanceMismatch'), tone: 'red' });
            }
        }

        if (row.email) {
            if (row.email.transactionStatus === 'Refunded') issues.push({ label: t('financialRefunded'), tone: 'green' });
            if (row.email.transactionStatus === 'Unknown') issues.push({ label: t('financialUnresolvedStatus'), tone: 'amber' });
            if (row.email.transactionStatus === 'Failed' || row.email.transactionStatus === 'Cancelled') {
                issues.push({ label: t('financialNotCompletedStatus'), detail: row.email.transactionStatus, tone: 'amber' });
            }
            if (row.email.isPromotional) issues.push({ label: t('financialPromotional'), tone: 'gray' });
            if (row.email.isFalsePositive) issues.push({ label: t('financialFalsePositiveFlag'), tone: 'amber' });
        }
        if (row.manual) issues.push({ label: t('financialManualVerified'), detail: row.manual.note, tone: 'green' });
        return issues;
    };

    return (
        <SectionPage>
            <PageHeader title={t('section.financial')} description={t('financialDesc')} dummy={false} />
            {loading && <p className="text-sm text-muted-foreground">{t('financialLoading')}</p>}
            {error && <p role="alert" className="text-sm text-destructive">{t('financialLoadError')}</p>}
            {!loading && !error && (
                <>
                    <div className="flex flex-wrap gap-2" role="group" aria-label={t('section.financial')}>
                        <Button variant={view === 'overview' ? 'default' : 'outline'} onClick={() => setView('overview')}>
                            <UsersRound className="size-4" />{t('financialOverview')}
                        </Button>
                        <Button variant={view === 'household' ? 'default' : 'outline'} onClick={() => setView('household')}>
                            <House className="size-4" />{t('financialHousehold')}
                        </Button>
                        <Button variant={view === 'transactions' ? 'default' : 'outline'} onClick={() => setView('transactions')}>
                            <List className="size-4" />{t('financialAllTransactions')}
                        </Button>
                    </div>

                    {view === 'overview' && (
                        <PeopleFlowOverview
                            flows={personFlows}
                            transactions={periodPersonTransactions}
                            settledIds={settledPersonIds}
                            settledPairCount={settledPairCount}
                            settledAmount={settledAmount}
                            tvEmiReimbursementCount={tvEmiReimbursementCount}
                            tvEmiReimbursementTotal={tvEmiReimbursementTotal}
                            sharedApplianceEmiCount={sharedApplianceEmiCount}
                            sharedApplianceEmiTotal={sharedApplianceEmiTotal}
                            sentTotal={peopleSentTotal}
                            receivedTotal={peopleReceivedTotal}
                            transferCount={periodPersonTransactions.length - settledPersonIds.size}
                            duplicatesRemoved={periodPersonCandidates.length - periodPersonTransactions.length}
                            fromDate={fromDate}
                            toDate={toDate}
                            onFromDateChange={setFromDate}
                            onToDateChange={setToDate}
                        />
                    )}

                    {view === 'household' && (
                        <HouseholdOverview
                            transactions={deduplicatedBankTransactions}
                            cardTransactions={cards?.transactions ?? []}
                            fromDate={fromDate}
                            toDate={toDate}
                            onFromDateChange={setFromDate}
                            onToDateChange={setToDate}
                        />
                    )}

                    {view === 'transactions' && (
                      <>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        <StatCard label={t('financialBankOutflow')} value={formatMoney(bankOutflow)} />
                        <StatCard label={t('financialBankInflow')} value={formatMoney(bankInflow)} />
                        <StatCard label={t('financialCardSpend')} value={formatMoney(cardSpend)} />
                        <StatCard label={t('financialCardCredits')} value={formatMoney(cardCredits)} />
                        <StatCard label={t('financialNeedsReview')} value={needsReviewCount.toLocaleString(locale)} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                            {bankRows.length.toLocaleString(locale)} {t('financialBankSource')} · {cardRows.length.toLocaleString(locale)} {t('financialCardSource')} · {manualRows.length.toLocaleString(locale)} {t('financialManualSource')}
                        </span>
                        <span>{t('financialSourcesExcludedFromTotals')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                        <FilterSelect id="financial-source" label={t('financialSource')} value={source} onChange={(value) => setSource(value as Source)}>
                            <option value="all">{t('financialAllSources')}</option>
                            <option value="bank">{t('financialBankSource')}</option>
                            <option value="card">{t('financialCardSource')}</option>
                            <option value="email">{t('financialEmailSource')}</option>
                            <option value="manual">{t('financialManualSource')}</option>
                        </FilterSelect>
                        <FilterSelect id="financial-direction" label={t('financialDirection')} value={direction} onChange={setDirection}>
                            <option value="all">{t('financialAllDirections')}</option>
                            <option value="sent">{t('financialSent')}</option>
                            <option value="received">{t('financialReceived')}</option>
                        </FilterSelect>
                        <FilterSelect id="financial-condition" label={t('financialCondition')} value={condition} onChange={(value) => setCondition(value as Condition)}>
                            <option value="all">{t('financialAnyCondition')}</option>
                            <option value="review">{t('financialNeedsReviewFilter')}</option>
                            <option value="not-reviewed">{t('financialNoReviewFilter')}</option>
                            <option value="settled">{t('financialSettledExcluded')}</option>
                            <option value="missing-reference">{t('financialMissingReference')}</option>
                            <option value="refunded">{t('financialRefunded')}</option>
                            <option value="unresolved">{t('financialUnresolvedStatus')}</option>
                            <option value="not-completed">{t('financialNotCompletedStatus')}</option>
                            <option value="false-positive">{t('financialFalsePositiveFilter')}</option>
                        </FilterSelect>
                        <FilterSelect id="financial-category" label={t('financialCategory')} value={category} onChange={setCategory}>
                            <option value="all">{t('financialAllCategories')}</option>
                            {categories.map((value) => <option key={value} value={value}>{value}</option>)}
                        </FilterSelect>
                        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor="financial-from">
                            {t('financialFromDate')}
                            <Input id="financial-from" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-9 min-w-0 px-2 text-sm" />
                        </label>
                        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor="financial-to">
                            {t('financialToDate')}
                            <Input id="financial-to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-9 min-w-0 px-2 text-sm" />
                        </label>
                    </div>

                    <div className="relative max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-8" placeholder={t('searchTransactions')} value={query} onChange={(event) => setQuery(event.target.value)} />
                    </div>

                    {source === 'email' && <p className="text-xs text-muted-foreground">{t('financialEmailNotInTotals')}</p>}
                    {source === 'email' && emailLoading && <p className="text-sm text-muted-foreground">{t('financialLoading')}</p>}
                    {source === 'email' && emailError && <p role="alert" className="text-sm text-destructive">{t('financialEmailLoadError')}</p>}

                    {!(source === 'email' && (emailLoading || emailError)) && (
                        <Card className="py-0">
                            <CardContent className="px-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-8 pl-4" />
                                            <TableHead>{t('date')}</TableHead>
                                            <TableHead>{t('financialRecord')}</TableHead>
                                            <TableHead>{t('financialSource')}</TableHead>
                                            <TableHead>{t('category')}</TableHead>
                                            <TableHead>{t('financialDirection')}</TableHead>
                                            <TableHead>{t('financialSettlementStatus')}</TableHead>
                                            <TableHead className="pr-4 text-right">{t('amount')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visibleRows.map((row) => {
                                            const open = expanded === row.key;
                                            const badges = formatAnalysis(row);
                                                                                        const received = row.direction === 'Received';
                                            const returnedReimbursement = row.reimbursementReturnedAmount != null;
                                            const tvEmiReimbursement = row.tvEmiReimbursement ?? false;
                                            const sharedApplianceEmiReimbursement = row.sharedApplianceEmiReimbursement ?? false;
                                                                                        const DirectionIcon = received ? ArrowDownLeft : ArrowUpRight;
                                                                                        const rowTint = tvEmiReimbursement || sharedApplianceEmiReimbursement || returnedReimbursement
                                                                                                ? 'bg-red-50/40 hover:bg-red-50/40 dark:bg-red-950/15 dark:hover:bg-red-950/15'
                                                                                                : row.settled
                                                                                                ? 'bg-orange-50/45 hover:bg-orange-50/45 dark:bg-orange-950/15 dark:hover:bg-orange-950/15'
                                                                                                : received
                                                                                                    ? 'bg-emerald-50/35 hover:bg-emerald-50/35 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/10'
                                                                                                    : 'bg-red-50/30 hover:bg-red-50/30 dark:bg-red-950/10 dark:hover:bg-red-950/10';
                                            return (
                                                <Fragment key={row.key}>
                                                    <TableRow
                                                        className={cn('cursor-pointer align-top', rowTint)}
                                                        tabIndex={0}
                                                        aria-expanded={open}
                                                        onClick={() => setExpanded((current) => current === row.key ? null : row.key)}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter' || event.key === ' ') {
                                                                event.preventDefault();
                                                                setExpanded((current) => current === row.key ? null : row.key);
                                                            }
                                                        }}
                                                    >
                                                        <TableCell className="pl-4 text-muted-foreground">
                                                            <ChevronRight className={cn('size-4 transition-transform', open && 'rotate-90')} />
                                                        </TableCell>
                                                        <TableCell className={cn('whitespace-nowrap', row.settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returnedReimbursement && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{formatDate(row.date, locale)}</TableCell>
                                                        <TableCell className="max-w-64 whitespace-normal">
                                                            <div className={cn('font-medium', row.settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returnedReimbursement && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{row.title}</div>
                                                            <div className={cn('line-clamp-2 text-xs text-muted-foreground', row.settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returnedReimbursement && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{row.description}</div>
                                                        </TableCell>
                                                        <TableCell className={cn('whitespace-nowrap', row.settled && 'line-through decoration-orange-600/60', returnedReimbursement && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>
                                                            <StatusBadge>{t(row.source === 'bank' ? 'financialBankSource' : row.source === 'card' ? 'financialCardSource' : row.source === 'email' ? 'financialEmailSource' : 'financialManualSource')}</StatusBadge>
                                                        </TableCell>
                                                        <TableCell className="max-w-40 whitespace-normal">
                                                            <span className={cn(row.settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returnedReimbursement && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{row.category || '—'}</span>
                                                            {row.needsReview && <Badge variant="outline" className="mt-1 border-amber-300 text-amber-800">{t('financialNeedsReviewFilter')}</Badge>}
                                                            {row.reimbursementReturnedAmount != null && <Badge title={tvEmiReimbursement ? t('financialTvEmiTooltip') : sharedApplianceEmiReimbursement ? t('financialSharedApplianceEmiTooltip') : undefined} variant="outline" className="mt-1 border-emerald-300/70 bg-emerald-50/60 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">{tvEmiReimbursement ? t('financialTvEmiReimbursementChip', { amount: formatMoney(row.reimbursementReturnedAmount) }) : sharedApplianceEmiReimbursement ? t('financialSharedApplianceEmiChip', { amount: formatMoney(row.reimbursementReturnedAmount) }) : t('financialReturnedReimbursement', { amount: formatMoney(row.reimbursementReturnedAmount) })}</Badge>}
                                                        </TableCell>
                                                        <TableCell className={cn('whitespace-nowrap', returnedReimbursement ? 'text-red-700/70 dark:text-red-300/70' : received ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400', (row.settled || returnedReimbursement) && 'line-through', row.settled && 'decoration-orange-600/60', returnedReimbursement && 'decoration-red-600/60')}>
                                                            <span className="inline-flex items-center gap-1"><DirectionIcon className="size-3.5" />{row.direction}</span>
                                                        </TableCell>
                                                        <TableCell className="whitespace-nowrap">{row.settled && !tvEmiReimbursement && !sharedApplianceEmiReimbursement ? <Badge variant="outline" className="border-orange-300/60 bg-orange-50/50 text-orange-800/75 dark:border-orange-800/60 dark:bg-orange-950/20 dark:text-orange-200/75">{t('financialSettledChip')}</Badge> : '—'}</TableCell>
                                                        <TableCell className={cn('pr-4 text-right font-medium tabular-nums whitespace-nowrap', row.settled && 'text-orange-700/70 line-through decoration-orange-600/60 dark:text-orange-300/70', returnedReimbursement && 'text-red-700/70 line-through decoration-red-600/60 dark:text-red-300/70')}>{formatMoney(row.amount)}</TableCell>
                                                    </TableRow>
                                                    {open && (
                                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                            <TableCell colSpan={8} className="px-4 py-4 whitespace-normal">
                                                                <div className="flex flex-col gap-4">
                                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                                        <div>
                                                                            <h3 className="text-sm font-semibold">{t('financialDetails')}</h3>
                                                                            <p className="text-xs text-muted-foreground">{row.id} · {formatDate(row.date, locale)} · {row.account}</p>
                                                                                                                                                        {row.tvEmiReimbursement && row.reimbursementReturnedAmount != null
                                                                                                                                                                ? <p className="mt-1 max-w-2xl text-xs text-emerald-800 dark:text-emerald-300">{t('financialTvEmiExcludedDetail', { amount: formatMoney(row.reimbursementReturnedAmount) })}</p>
                                                                                                                                                                : row.sharedApplianceEmiReimbursement && row.reimbursementReturnedAmount != null
                                                                                                                                                                    ? <p className="mt-1 max-w-2xl text-xs text-emerald-800 dark:text-emerald-300">{t('financialSharedApplianceEmiDetail')}</p>
                                                                                                                                                                    : row.reimbursementReturnedAmount != null && <p className="mt-1 max-w-2xl text-xs text-emerald-800 dark:text-emerald-300">{t('financialReturnedReimbursementNote', { amount: formatMoney(row.reimbursementReturnedAmount), recorded: formatMoney(row.bank?.depositAmount) })}</p>}
                                                                        </div>
                                                                        <span className="font-semibold tabular-nums">{formatMoney(row.amount)}</span>
                                                                    </div>
                                                                    <div className="grid gap-4 md:grid-cols-2">
                                                                        <div className="flex flex-col gap-2">
                                                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">{t('financialAnalysis')}</h4>
                                                                            <ul className="flex flex-col gap-1.5">
                                                                                {badges.map((item, index) => (
                                                                                    <li key={`${item.label}-${index}`} className="flex items-start gap-2 text-sm">
                                                                                        {item.tone === 'amber' || item.tone === 'red'
                                                                                            ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
                                                                                            : <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />}
                                                                                        <span>{item.label}{item.detail && <span className="text-muted-foreground">: {item.detail}</span>}</span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                            {row.email?.confidenceScore != null && (
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {t('financialConfidence')}: {Math.round(row.email.confidenceScore <= 1 ? row.email.confidenceScore * 100 : row.email.confidenceScore)}%
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col gap-2">
                                                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">{t('financialSourceDetails')}</h4>
                                                                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                                                                                <dt className="text-muted-foreground">{t('financialRecord')}</dt><dd className="break-words">{row.description || '—'}</dd>
                                                                                <dt className="text-muted-foreground">{t('category')}</dt><dd>{[row.category, row.subcategory].filter(Boolean).join(' · ') || '—'}</dd>
                                                                                <dt className="text-muted-foreground">{t('reference')}</dt><dd className="break-all font-mono text-xs">{row.reference || t('financialNotProvided')}</dd>
                                                                                {row.bank && <>
                                                                                    <dt className="text-muted-foreground">{t('financialBankAccount')}</dt><dd>{row.account}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialStatementPeriod')}</dt><dd>{formatDate(bank?.meta.statementFrom, locale)} - {formatDate(bank?.meta.statementTo, locale)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialSourceFile')}</dt><dd className="break-all font-mono text-xs">{bank?.meta.sourceFile || '—'}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialOpeningBalance')}</dt><dd>{formatMoney(bank?.meta.openingBalance)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialValueDate')}</dt><dd>{formatDate(row.bank.valueDate, locale)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialWithdrawal')}</dt><dd>{formatMoney(row.bank.withdrawalAmount)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialDeposit')}</dt><dd>{formatMoney(row.bank.depositAmount)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialBalance')}</dt><dd>{formatMoney(row.bank.closingBalance)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialComputedBalance')}</dt><dd>{formatMoney(row.bank.computedBalance)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialParty')}</dt><dd>{[row.bank.partyType, row.bank.vpa].filter(Boolean).join(' · ') || '—'}</dd>
                                                                                </>}
                                                                                {row.card && <>
                                                                                    <dt className="text-muted-foreground">{t('financialCard')}</dt><dd>{row.card.card}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialSourceFile')}</dt><dd className="break-all font-mono text-xs">{row.card.sourceFile}</dd>
                                                                                </>}
                                                                                {row.manual && <>
                                                                                    <dt className="text-muted-foreground">{t('financialManualNote')}</dt><dd>{row.manual.note}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialPaymentMethod')}</dt><dd>{row.manual.vpa}</dd>
                                                                                </>}
                                                                                {row.email && <>
                                                                                    <dt className="text-muted-foreground">{t('financialEmailStatus')}</dt><dd>{row.email.transactionStatus || '—'}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialRefundAmount')}</dt><dd>{formatMoney(row.email.refundAmount)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialOriginalDirection')}</dt><dd>{row.email.direction || '—'}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialPaymentMethod')}</dt><dd>{row.email.paymentMethod || '—'}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialAccount')}</dt><dd>{row.email.maskedAccountOrCard || '—'}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialAvailableBalance')}</dt><dd>{formatMoney(row.email.availableBalance)}</dd>
                                                                                    <dt className="text-muted-foreground">{t('financialAttachments')}</dt><dd className="break-words">{row.email.attachmentNames?.join(', ') || '—'}</dd>
                                                                                    {row.email.exclusionReason && <><dt className="text-muted-foreground">{t('financialExclusionReason')}</dt><dd>{row.email.exclusionReason}</dd></>}
                                                                                </>}
                                                                            </dl>
                                                                        </div>
                                                                    </div>
                                                                    {row.email?.rawEvidence && (
                                                                        <details className="border-t pt-3">
                                                                            <summary className="cursor-pointer text-sm font-medium">{t('financialRawEmail')}</summary>
                                                                            <p className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background p-3 text-xs text-muted-foreground">{row.email.rawEvidence}</p>
                                                                        </details>
                                                                    )}
                                                                    <Separator />
                                                                    <p className="text-xs text-muted-foreground">{t('financialAnalysisDisclaimer')}</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                        {visibleRows.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">{t('noMatches')}</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                        <span>{t('financialShowing', {
                            start: filteredRows.length ? (page * PAGE_SIZE + 1).toLocaleString(locale) : '0',
                            end: Math.min((page + 1) * PAGE_SIZE, filteredRows.length).toLocaleString(locale),
                            count: filteredRows.length.toLocaleString(locale),
                        })}</span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" aria-label={t('financialPreviousPage')} disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                                <ChevronLeft />
                            </Button>
                            <span className="tabular-nums">{pageCount ? `${page + 1} / ${pageCount}` : '0 / 0'}</span>
                            <Button variant="outline" size="icon" aria-label={t('financialNextPage')} disabled={page + 1 >= pageCount} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>
                                <ChevronRight />
                            </Button>
                        </div>
                    </div>
                      </>
                    )}
                </>
            )}
        </SectionPage>
    );
}