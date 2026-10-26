export interface ChatConfig {
    id: string;
    /** The two people in the conversation; the first is shown on the right. */
    people: [string, string];
    /** Original export, copied byte-for-byte under public/. */
    file: string;
    /** Optional excerpt made of lines copied verbatim from `file`. */
    shortFile?: string;
    /** Exact sender name used in the export for the right-hand person. */
    rightSender: string;
}

// Add a conversation by copying its WhatsApp export to the given path.
export const CHATS: ChatConfig[] = [
    {
        id: 'shailesh-nikita',
        people: ['Shailesh', 'Nikita'],
        file: 'evidence/_chat.txt',
        shortFile: 'evidence/shortversion.txt',
        rightSender: 'Shailesh',
    },
    { id: 'shailesh-vilash', people: ['Shailesh', 'Vilash Ingle'], file: 'evidence/chats/shailesh-vilash-ingle.txt', rightSender: 'Shailesh' },
    { id: 'shailesh-pravin', people: ['Shailesh', 'Pravin Ingle'], file: 'evidence/chats/shailesh-pravin-ingle.txt', rightSender: 'Shailesh' },
    { id: 'shailesh-ankush', people: ['Shailesh', 'Ankush Ingle'], file: 'evidence/chats/shailesh-ankush-ingle.txt', rightSender: 'Shailesh' },
    { id: 'nikita-bebi', people: ['Nikita', 'Bebi Sawale'], file: 'evidence/chats/nikita-bebi-sawale.txt', rightSender: 'Nikita' },
    { id: 'pragati-pravin', people: ['Pragati Sawale', 'Pravin Ingle'], file: 'evidence/chats/pragati-sawale-pravin-ingle.txt', rightSender: 'Pragati Sawale' },
];

export const chatTitle = (c: ChatConfig) => `${c.people[0]} – ${c.people[1]}`;
