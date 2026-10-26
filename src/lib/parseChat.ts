import { getLocale } from '@/i18n';

export interface ChatMessage {
    id: number;
    /** 1-based line in the original file where the message starts */
    lineNo: number;
    rawDate: string;
    time: string;
    date: Date | null;
    /** null for system messages (e.g. "Alice added Bob") */
    sender: string | null;
    text: string;
    highlight: boolean;
}

export interface ParsedChat {
    title: string;
    messages: ChatMessage[];
    participants: string[];
}

type DateOrder = 'DMY' | 'MDY' | 'YMD';

// Matches Android ("12/31/20, 9:41 PM - Name: text") and iOS ("[31.12.20, 21:41:05] Name: text") headers.
const HEADER_RE =
    /^\[?(\d{1,4}[./-]\d{1,2}[./-]\d{1,4}),?\s+(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?(?:\s*[aApP]\.?\s*[mM]\.?)?)\]?\s*(?:[-–]\s*)?(.*)$/;
const LEADING_MARKS = /^[\u200e\u200f\u202a-\u202e\ufeff]+/;
const EDGE_MARKS = /^[\u200e\u200f\u202a-\u202e]+|[\u200e\u200f\u202a-\u202e]+$/g;

function splitDate(raw: string): string[] {
    return raw.split(/[./-]/);
}

function detectOrder(rawDates: string[], hasAmPm: boolean): DateOrder {
    let dmy = 0;
    let mdy = 0;
    for (const raw of rawDates) {
        const [a, b] = splitDate(raw);
        if (a.length === 4) return 'YMD';
        if (+a > 12) dmy++;
        if (+b > 12) mdy++;
    }
    if (mdy > dmy) return 'MDY';
    if (dmy > 0) return 'DMY';
    return hasAmPm ? 'MDY' : 'DMY';
}

function toDate(raw: string, order: DateOrder): Date | null {
    const p = splitDate(raw).map(Number);
    let y: number, m: number, d: number;
    if (order === 'YMD') [y, m, d] = p;
    else if (order === 'MDY') [m, d, y] = p;
    else[d, m, y] = p;
    if (y < 100) y += 2000;
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) || date.getMonth() !== m - 1 ? null : date;
}

function titleFromFileName(fileName: string): string | null {
    const base = fileName.replace(/\.txt$/i, '').trim();
    const match = base.match(/^WhatsApp Chat (?:with|-)\s*(.+)$/i);
    if (match) return match[1].trim();
    if (/^_?chat$/i.test(base) || !base) return null;
    return base;
}

export function parseChat(content: string, fileName = 'chat.txt'): ParsedChat {
    const lines = content.split(/\r\n|\r|\n/);
    const messages: ChatMessage[] = [];
    let hasAmPm = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.replace(LEADING_MARKS, '').match(HEADER_RE);
        if (match) {
            const [, rawDate, time, rest] = match;
            if (/[ap]\.?\s*m/i.test(time)) hasAmPm = true;
            const sep = rest.indexOf(': ');
            const hasSender = sep > 0 && sep <= 80;
            const nameOnly = !hasSender && rest.endsWith(':') && rest.length <= 81;
            messages.push({
                id: messages.length,
                lineNo: i + 1,
                rawDate,
                time: time.trim(),
                date: null,
                sender: hasSender
                    ? rest.slice(0, sep).replace(EDGE_MARKS, '').trim()
                    : nameOnly
                        ? rest.slice(0, -1).replace(EDGE_MARKS, '').trim()
                        : null,
                text: hasSender ? rest.slice(sep + 2) : nameOnly ? '' : rest,
                highlight: false,
            });
        } else if (messages.length > 0) {
            messages[messages.length - 1].text += '\n' + line;
        } else if (line.trim()) {
            messages.push({ id: 0, lineNo: i + 1, rawDate: '', time: '', date: null, sender: null, text: line, highlight: false });
        }
    }

    // Drop trailing blank lines that belong to the file, not the message.
    for (const m of messages) m.text = m.text.replace(/\n+$/, '');

    const order = detectOrder(
        messages.filter((m) => m.rawDate).map((m) => m.rawDate),
        hasAmPm,
    );
    const dateCache = new Map<string, Date | null>();
    for (const m of messages) {
        if (!m.rawDate) continue;
        if (!dateCache.has(m.rawDate)) dateCache.set(m.rawDate, toDate(m.rawDate, order));
        m.date = dateCache.get(m.rawDate) ?? null;
    }

    const participants: string[] = [];
    for (const m of messages) {
        if (m.sender && !participants.includes(m.sender)) participants.push(m.sender);
    }

    const title =
        titleFromFileName(fileName) ??
        (participants.length === 0
            ? 'Conversation'
            : participants.length <= 3
                ? participants.join(' & ')
                : 'Group Conversation');

    return { title, messages, participants };
}

export function formatDay(m: ChatMessage): string {
    if (!m.date) return m.rawDate;
    return m.date.toLocaleDateString(getLocale(), {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
