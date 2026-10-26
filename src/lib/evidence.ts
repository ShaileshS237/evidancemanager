import { parseChat, type ParsedChat } from './parseChat';

export interface SourceInfo {
    fileName: string;
    size: number;
    sha256: string;
    lastModified: Date | null;
    importedAt: Date;
    lineCount: number;
    isSample: boolean;
}

export interface ExcerptInfo {
    /** The excerpt file itself (its own name and hash). */
    file: SourceInfo;
    messageCount: number;
    totalMessages: number;
    /** Header lines in the excerpt that do not exist in the original; should always be 0. */
    unmatched: number;
}

export interface ChatExhibit {
    chat: ParsedChat;
    /** Always the original export; line references point into it. */
    source: SourceInfo;
    lines: string[];
    excerpt?: ExcerptInfo;
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// DEMO ONLY: marks arbitrary messages to preview the highlight style. Set to false before presenting.
export const DEMO_RANDOM_HIGHLIGHTS = true;
const DEMO_HIGHLIGHT_RATE = 0.05;

function applyRandomHighlights(messages: { sender: string | null; highlight: boolean }[]) {
    // Seeded (mulberry32) so the same messages stay highlighted across reloads.
    let seed = 0x9e3779b9;
    const rand = () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (const m of messages) if (m.sender && rand() < DEMO_HIGHLIGHT_RATE) m.highlight = true;
}

/** Hashes the exact original bytes, then decodes and parses them. */
export async function loadChatExhibit(
    buffer: ArrayBuffer,
    fileName: string,
    options: { lastModified?: number; isSample?: boolean } = {},
): Promise<ChatExhibit> {
    const sha256 = await sha256Hex(buffer);
    const text = new TextDecoder('utf-8').decode(buffer);
    const lines = text.split(/\r\n|\r|\n/);
    const chat = parseChat(text, fileName);
    if (DEMO_RANDOM_HIGHLIGHTS) applyRandomHighlights(chat.messages);
    return {
        chat,
        lines,
        source: {
            fileName,
            size: buffer.byteLength,
            sha256,
            lastModified: options.lastModified ? new Date(options.lastModified) : null,
            importedAt: new Date(),
            lineCount: lines.length,
            isSample: options.isSample ?? false,
        },
    };
}

/**
 * Builds an excerpt view from a file containing lines copied verbatim from the original.
 * Messages are taken from the original (so text and line numbers cannot drift); excerpt lines
 * that don't exist in the original are counted as `unmatched`.
 */
export async function loadExcerpt(full: ChatExhibit, buffer: ArrayBuffer, fileName: string): Promise<ChatExhibit> {
    const file = await loadChatExhibit(buffer, fileName);
    const wanted = new Set(file.chat.messages.map((m) => file.lines[m.lineNo - 1]));
    const messages = full.chat.messages.filter((m) => wanted.has(full.lines[m.lineNo - 1]));
    const found = new Set(messages.map((m) => full.lines[m.lineNo - 1]));
    return {
        ...full,
        chat: { ...full.chat, messages },
        excerpt: {
            file: file.source,
            messageCount: messages.length,
            totalMessages: full.chat.messages.length,
            unmatched: [...wanted].filter((l) => !found.has(l)).length,
        },
    };
}

export function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function formatDateTime(d: Date): string {
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
