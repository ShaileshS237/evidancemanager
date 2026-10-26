import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useI18n } from '@/i18n';
import type { ChatExhibit } from '@/lib/evidence';
import { MessageRow } from './chat/ChatListView';
import { CHATS, chatTitle } from './chat/chats';
import type { SectionId } from './registry';

const CONTEXT_SIZE = 6;

// Reference prefix → section that lists it.
const PREFIX_SECTION: [RegExp, SectionId][] = [
    [/^A-/, 'allegations'],
    [/^E-/, 'evidence'],
    [/^F-/, 'financial'],
    [/^P-/, 'property'],
    [/^W-/, 'witnesses'],
    [/^N-/, 'legal'],
    [/^M-/, 'media'],
    [/^T-/, 'travel'],
    [/^ev\d/, 'chronology'],
];

interface EvidenceRefApi {
    open: (ref: string) => void;
}

const EvidenceRefContext = createContext<EvidenceRefApi>({ open: () => { } });
export const useEvidenceRef = () => useContext(EvidenceRefContext);

interface ProviderProps {
    /** The main chat that `L…` references point into, if already loaded. */
    chat: ChatExhibit | undefined;
    loadChat: () => Promise<void>;
    onNavigate: (id: SectionId) => void;
    children: ReactNode;
}

export function EvidenceRefProvider({ chat, loadChat, onNavigate, children }: ProviderProps) {
    const [line, setLine] = useState<number | null>(null);

    const open = useCallback(
        (ref: string) => {
            const m = ref.match(/^L(\d+)$/);
            if (m) {
                setLine(Number(m[1]));
                if (!chat) void loadChat();
                return;
            }
            const target = PREFIX_SECTION.find(([re]) => re.test(ref));
            if (target) onNavigate(target[1]);
        },
        [chat, loadChat, onNavigate],
    );

    const api = useMemo(() => ({ open }), [open]);

    return (
        <EvidenceRefContext.Provider value={api}>
            {children}
            <Sheet open={line !== null} onOpenChange={(o) => !o && setLine(null)}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    {line !== null && <ChatContext line={line} chat={chat} />}
                </SheetContent>
            </Sheet>
        </EvidenceRefContext.Provider>
    );
}

function ChatContext({ line, chat }: { line: number; chat: ChatExhibit | undefined }) {
    const { t } = useI18n();
    const config = CHATS[0];

    const slice = useMemo(() => {
        if (!chat) return null;
        const msgs = chat.chat.messages;
        // The message that contains the line: the last one starting at or before it.
        let idx = -1;
        for (let i = 0; i < msgs.length && msgs[i].lineNo <= line; i++) idx = i;
        if (idx < 0) return { items: [], target: -1 };
        const start = Math.max(0, idx - CONTEXT_SIZE);
        return { items: msgs.slice(start, idx + CONTEXT_SIZE + 1), target: msgs[idx].id };
    }, [chat, line]);

    return (
        <>
            <SheetHeader>
                <SheetTitle className="font-mono">L{line}</SheetTitle>
                <SheetDescription>
                    {t('chatContext')} · {chatTitle(config)}
                </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
                {!slice ? (
                    <p className="text-sm text-muted-foreground">{t('loadingChat')}</p>
                ) : slice.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('lineNotFound')}</p>
                ) : (
                    slice.items.map((m) => (
                        <MessageRow
                            key={m.id}
                            m={m}
                            isMe={m.sender === config.rightSender}
                            query=""
                            active={m.id === slice.target}
                        />
                    ))
                )}
            </div>
        </>
    );
}
