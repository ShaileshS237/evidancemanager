// DUMMY DATA: placeholder records for layout only. Replace every entry with real, verifiable facts
// before this viewer is shown to anyone. Chat line numbers (L…) refer to public/evidence/_chat.txt.

export { EVENTS, CHRONOLOGY_META, type EventCategory, type EventPhase, type TimelineEvent } from './chronology';

export type AllegationStatus = 'Denied' | 'Disputed' | 'Partly admitted';

export interface Allegation {
    id: string;
    title: string;
    raisedBy: string;
    raisedOn?: string;
    source: string;
    allegation: string;
    response: string;
    status: AllegationStatus;
    evidence: string[];
}

// From Nikita's legal notice. Allegations are summaries, not verbatim quotes from the signed notice;
// answers are Shailesh's stated position. Verify both against the original documents.
const NOTICE = 'Legal notice (Nikita)';

export const ALLEGATIONS: Allegation[] = [
    {
        id: 'A-01',
        title: 'Mental, physical and financial harassment',
        raisedBy: 'Nikita',
        source: NOTICE,
        allegation: 'You subjected her to mental, physical and financial cruelty during the marriage.',
        response:
            'I deny physically assaulting Nikita, demanding dowry or deliberately subjecting her to financial harassment. I provided for our household and supported her personal and professional life. There were disagreements between us, particularly concerning the conduct of her family members and the respect shown towards me.',
        status: 'Denied',
        evidence: ['L8487', 'L8490', 'L45016'],
    },
    {
        id: 'A-02',
        title: 'Wedding expenditure and financial demands',
        raisedBy: 'Nikita',
        source: NOTICE,
        allegation: 'Her family incurred substantial marriage expenses and provided money, gifts and household articles.',
        response:
            'I also incurred significant marriage-related expenses. I obtained a personal loan of approximately ₹9.5 lakh, and my family arranged finances for work on our residence. My mother also contributed gold ornaments. I dispute treating all expenditure claimed by Nikita’s family as money owed by me. Each financial claim should be verified against actual transactions and invoices.',
        status: 'Disputed',
        evidence: [],
    },
    {
        id: 'A-03',
        title: 'Household expenses and Apple laptop',
        raisedBy: 'Nikita',
        source: NOTICE,
        allegation: 'She used her salary to purchase household goods and an Apple laptop valued at approximately ₹1.5 lakh.',
        response:
            'Nikita contributed financially to our household, which I acknowledge. However, I also paid household expenses, rent, loan instalments and other costs. I previously described the laptop as a gift, and its purchase and ownership should be established using the invoice and relevant communications.',
        status: 'Partly admitted',
        evidence: [],
    },
    {
        id: 'A-04',
        title: 'Financial assistance to family members',
        raisedBy: 'Nikita',
        source: NOTICE,
        allegation: 'Her earnings were used for household expenses and financial transfers involving my family members.',
        response:
            'I acknowledge receiving approximately ₹2.5 lakh in financial assistance from Nikita. However, I dispute that she was solely responsible for maintaining my family. I have also stated that I was paying instalments relating to a loan in her name. The exact transfers and repayments should be reconciled.',
        status: 'Partly admitted',
        evidence: ['L45012', 'L45559', 'L45738'],
    },
    {
        id: 'A-05',
        title: 'Unexplained outings, telephone calls and physical abuse',
        raisedBy: 'Nikita',
        source: NOTICE,
        allegation:
            'While living in Bengaluru, I went out without explanation, returned late, engaged in telephone calls, verbally abused her and physically assaulted her.',
        response:
            'I deny physically assaulting Nikita. I also dispute the broader portrayal of my conduct. Specific incidents, dates, communications and circumstances should be examined rather than treating general allegations as established facts.',
        status: 'Denied',
        evidence: [],
    },
    {
        id: 'A-06',
        title: 'Diwali 2024 incident in Akola',
        raisedBy: 'Nikita',
        source: NOTICE,
        allegation:
            'During Diwali 2024, I argued with her regarding her family’s behaviour, subsequently mistreated her and restricted her contact with her parental family.',
        response:
            'I had concerns about the disrespectful behaviour of some of her family members towards me. I raised those concerns with Nikita. However, I did not prohibit her from speaking with her parents or brothers. She remained in regular contact with them. I dispute the allegation of physical assault.',
        status: 'Disputed',
        evidence: [],
    },
    {
        id: 'A-07',
        title: 'Assault and demand for money on 30 November 2025',
        raisedBy: 'Nikita',
        raisedOn: '2025-11-30',
        source: NOTICE,
        allegation: 'On 30 November 2025, I assaulted her and demanded that she bring money or agree to divorce.',
        response:
            'I deny physically assaulting Nikita or demanding money from her as a condition for continuing the marriage. The exact circumstances of this date should be verified using WhatsApp conversations, financial transactions and any contemporaneous evidence.',
        status: 'Denied',
        evidence: [],
    },
    {
        id: 'A-08',
        title: 'Mother’s medical treatment and relatives’ visit',
        raisedBy: 'Nikita',
        source: NOTICE,
        allegation:
            'During the period of my mother’s medical treatment and visits by her relatives, I mistreated Nikita and her family members and threatened divorce.',
        response:
            'My mother was experiencing serious health difficulties and underwent medical examinations and treatment. During this difficult period, I expected emotional support and understanding. Instead, disagreements involving Nikita and her relatives continued. I dispute the allegation that I deliberately mistreated them.',
        status: 'Disputed',
        evidence: [],
    },
    {
        id: 'A-09',
        title: 'Threat during train journey on 6 June 2026',
        raisedBy: 'Nikita',
        raisedOn: '2026-06-06',
        source: NOTICE,
        allegation: 'During a train journey on 6 June 2026, I threatened to throw her from the train.',
        response:
            'There was an argument during the journey concerning our marital disagreements. Divorce was discussed, and I became angry. My mother intervened to stop the argument. I dispute the alleged threat to throw Nikita from the train. The complete circumstances and exact words used should be verified.',
        status: 'Partly admitted',
        evidence: [],
    },
    {
        id: 'A-10',
        title: 'Denial of food, assault and forced departure',
        raisedBy: 'Nikita',
        source: NOTICE,
        allegation: 'I deprived her of food, assaulted her and forced her to leave our Bengaluru residence.',
        response:
            'I had arranged food for Nikita before her departure, but she did not eat it. She searched for and booked a flight ticket. I also had to arrange tickets for myself and my mother. We travelled from Bengaluru to Nagpur, where her brother came to receive her. I deny physically assaulting her or deliberately depriving her of food.',
        status: 'Denied',
        evidence: [],
    },
    {
        id: 'A-11',
        title: 'Family meeting on 12 June 2026',
        raisedBy: 'Nikita',
        raisedOn: '2026-06-12',
        source: NOTICE,
        allegation: 'At a meeting at Anand Vatika, Akola, I used insulting language, demanded divorce and made threats.',
        response:
            'I had expressed that I no longer wished to continue the marital relationship because of recurring disputes and the deterioration of mutual respect. I dispute the allegation that my intention was to threaten or intimidate Nikita. The full meeting discussion and statements of those present should be considered.',
        status: 'Partly admitted',
        evidence: [],
    },
    {
        id: 'A-12',
        title: 'Incident involving my mother on 3 July 2026',
        raisedBy: 'Nikita',
        raisedOn: '2026-07-03',
        source: `${NOTICE}, para 14`,
        allegation: 'My mother attempted to hit Nikita and threatened to kill her following a disagreement about divorce.',
        response:
            'I dispute the allegation as presented. There was a heated disagreement, and the exact words and actions of everyone involved must be examined. The earlier chronology refers to a statement concerning slapping, but this does not establish that my mother physically attacked Nikita or made the alleged death threat.',
        status: 'Disputed',
        evidence: [],
    },
    {
        id: 'A-13',
        title: 'Repeated harassment through calls',
        raisedBy: 'Nikita',
        source: `${NOTICE}, para 15`,
        allegation:
            'I repeatedly harassed and threatened her through telephone calls to pressure her into agreeing to divorce, adversely affecting her family’s health.',
        response:
            'Our telephone conversations involved disagreements about our marital relationship and its future. I had expressed that I did not wish to continue the marriage. However, I dispute the allegation that I deliberately harassed or threatened her. The complete call records and conversations should be examined.',
        status: 'Partly admitted',
        evidence: [],
    },
    {
        id: 'A-14',
        title: 'Interference by family members',
        raisedBy: 'Nikita',
        source: `${NOTICE}, para 3`,
        allegation:
            'My relatives interfered in household matters and restricted her communication and visits with her parental family.',
        response:
            'I never prohibited Nikita from communicating with her parents or brothers. She regularly spoke with them and visited her family. My concern was about the manner in which some family members treated me, not about preventing her from maintaining relationships with them.',
        status: 'Denied',
        evidence: [],
    },
    {
        id: 'A-15',
        title: 'Excessive household work and marriage for salary',
        raisedBy: 'Nikita',
        source: `${NOTICE}, para 4`,
        allegation:
            'She was made to perform excessive household work despite being employed, and statements were made suggesting that I married her for her salary.',
        response:
            'We had domestic help available for household work. I did not force Nikita to leave her employment and supported her continuing her professional career. I deny that I married her for financial gain.',
        status: 'Denied',
        evidence: [],
    },
    {
        id: 'A-16',
        title: 'Disputes involving relatives and children',
        raisedBy: 'Nikita',
        source: `${NOTICE}, paras 5–6`,
        allegation:
            'Disagreements involving my relatives, household responsibilities and money-related remarks resulted in insults and physical assault.',
        response:
            'I deny physically assaulting Nikita. There were disagreements involving relatives, but the specific allegations require examination of the dates, statements, people present and surrounding circumstances. I do not accept the allegation that these disagreements justify attributing physical violence to me.',
        status: 'Denied',
        evidence: [],
    },
];

export type EvidenceType = 'Chat export' | 'Document' | 'Screenshot' | 'Audio' | 'Video' | 'Receipt' | 'Photo';

export interface EvidenceItem {
    id: string;
    title: string;
    type: EvidenceType;
    date: string;
    source: string;
    fileName: string;
    sha256: string;
    status: 'Original' | 'Copy' | 'Certified copy';
    linkedTo: string[];
    /** People who appear in, created, or can speak to this exhibit. */
    people: string[];
    notes?: string;
}

export const EVIDENCE: EvidenceItem[] = [
    { id: 'E-01', title: 'WhatsApp chat export (full)', type: 'Chat export', date: '2026-08-08', source: 'Shailesh’s phone', fileName: '_chat.txt', sha256: '54a0aa2b3538ccc35f7fc3c6de4cf283025d5e9a2e8b3cbdee8c15c85e7a5151', status: 'Original', linkedTo: ['A-01', 'A-02', 'A-03'], people: ['Shailesh', 'Nikita'], notes: 'Exported without media. Fingerprint matches the copy loaded in Chats & Messages.' },
    { id: 'E-02', title: 'Marriage certificate', type: 'Document', date: '2024-07-20', source: 'Registrar office (dummy)', fileName: 'marriage-certificate.pdf', sha256: 'dummy0000000000000000000000000000000000000000000000000000000002', status: 'Certified copy', linkedTo: [], people: ['Shailesh', 'Nikita'] },
    { id: 'E-03', title: 'Bank statement Apr 2026', type: 'Document', date: '2026-05-01', source: 'Bank (dummy)', fileName: 'statement-apr-2026.pdf', sha256: 'dummy0000000000000000000000000000000000000000000000000000000003', status: 'Original', linkedTo: ['A-03'], people: ['Shailesh', 'Nikita'] },
    { id: 'E-04', title: 'Call recording 01 Jul 2026', type: 'Audio', date: '2026-07-01', source: 'Phone recorder', fileName: 'call-2026-07-01.m4a', sha256: 'dummy0000000000000000000000000000000000000000000000000000000004', status: 'Original', linkedTo: ['A-02'], people: ['Shailesh', 'Nikita'] },
    { id: 'E-05', title: 'Engagement photographs', type: 'Photo', date: '2024-01-14', source: 'Photographer (dummy)', fileName: 'engagement/*.jpg', sha256: 'dummy0000000000000000000000000000000000000000000000000000000005', status: 'Copy', linkedTo: [], people: ['Both families'] },
    { id: 'E-06', title: 'Wedding expense receipts', type: 'Receipt', date: '2024-07-15', source: 'Vendors (dummy)', fileName: 'wedding-receipts.pdf', sha256: 'dummy0000000000000000000000000000000000000000000000000000000006', status: 'Copy', linkedTo: ['A-01'], people: ['Shailesh’s father', 'Nikita’s family'] },
    { id: 'E-07', title: 'Screenshot of status update', type: 'Screenshot', date: '2026-08-04', source: 'WhatsApp status', fileName: 'status-2026-08-04.png', sha256: 'dummy0000000000000000000000000000000000000000000000000000000007', status: 'Original', linkedTo: ['A-02'], people: ['Nikita'] },
];

export interface MediaClip {
    id: string;
    title: string;
    /** Start offset within the full recording, e.g. "03:05". */
    at?: string;
    /** Path to the clip under public/; a generated placeholder is played when absent. */
    url?: string;
}

export interface MediaItem {
    id: string;
    title: string;
    kind: 'Audio' | 'Video';
    date: string;
    duration: string;
    participants: string[];
    recordedBy: string;
    fileName: string;
    summary: string;
    transcript: { time: string; speaker: string; text: string }[];
    clips: MediaClip[];
    evidenceId?: string;
    /** Path to the real recording under public/; a generated placeholder clip is used when absent. */
    url?: string;
}

export const MEDIA: MediaItem[] = [
    {
        id: 'M-01', title: 'Phone call about family meeting', kind: 'Audio', date: '2026-07-01', duration: '12:40', participants: ['Shailesh', 'Nikita'], recordedBy: 'Shailesh', fileName: 'call-2026-07-01.m4a', evidenceId: 'E-04',
        summary: 'Discussion about arranging a meeting between both families (dummy summary).',
        transcript: [
            { time: '00:12', speaker: 'Shailesh', text: '(dummy) Let our parents talk first and sort it out.' },
            { time: '03:05', speaker: 'Nikita', text: '(dummy) I need some time.' },
        ],
        clips: [
            { id: 'M-01-c1', title: 'Proposal for parents to talk', at: '00:12' },
            { id: 'M-01-c2', title: '“I need some time”', at: '03:05' },
            { id: 'M-01-c3', title: 'Offer to return money', at: '09:40' },
        ],
    },
    {
        id: 'M-02', title: 'Family meeting recording', kind: 'Audio', date: '2026-07-03', duration: '48:10', participants: ['Both families'], recordedBy: 'Shailesh’s father', fileName: 'meeting-2026-07-03.m4a',
        summary: 'Meeting between families at Nagpur (dummy summary).',
        transcript: [{ time: '05:20', speaker: 'Elder (dummy)', text: '(dummy) Both should take time and decide calmly.' }],
        clips: [
            { id: 'M-02-c1', title: 'Opening statements', at: '00:45' },
            { id: 'M-02-c2', title: 'Elder’s advice to decide calmly', at: '05:20' },
        ],
    },
    {
        id: 'M-03', title: 'Wedding video highlights', kind: 'Video', date: '2024-07-14', duration: '06:30', participants: ['Both families'], recordedBy: 'Photographer (dummy)', fileName: 'wedding-highlights.mp4',
        summary: 'Highlights of the wedding ceremony (dummy summary).',
        transcript: [],
        clips: [
            { id: 'M-03-c1', title: 'Varmala ceremony', at: '01:10' },
            { id: 'M-03-c2', title: 'Both families together', at: '04:30' },
        ],
    },
];

export interface Transaction {
    id: string;
    date: string;
    from: string;
    to: string;
    amount: number;
    mode: 'UPI' | 'Bank transfer' | 'Cash' | 'Card';
    category: 'Loan' | 'Repayment' | 'Household' | 'Wedding' | 'Gift' | 'Travel';
    purpose: string;
    reference: string;
    evidence?: string[];
}

export const TRANSACTIONS: Transaction[] = [
    { id: 'F-01', date: '2024-03-10', from: 'Shailesh', to: 'Photographer (dummy)', amount: 80000, mode: 'Bank transfer', category: 'Wedding', purpose: 'Wedding photography advance (groom side share)', reference: 'UTR-DUMMY01', evidence: ['E-06'] },
    { id: 'F-02', date: '2024-05-06', from: 'Shailesh', to: 'Nikita', amount: 20000, mode: 'UPI', category: 'Household', purpose: 'Shared expenses', reference: 'UPI-DUMMY02' },
    { id: 'F-03', date: '2024-07-12', from: 'Shailesh’s father', to: 'Hall (dummy)', amount: 200000, mode: 'Bank transfer', category: 'Wedding', purpose: 'Hall rent', reference: 'UTR-DUMMY03', evidence: ['E-06'] },
    { id: 'F-04', date: '2025-01-10', from: 'Shailesh', to: 'Airline (dummy)', amount: 11200, mode: 'Card', category: 'Travel', purpose: 'Flight for Nikita to Akola', reference: 'CARD-DUMMY04' },
    { id: 'F-05', date: '2025-06-01', from: 'Shailesh', to: 'Nikita', amount: 15000, mode: 'UPI', category: 'Household', purpose: 'Monthly contribution', reference: 'UPI-DUMMY05' },
    { id: 'F-06', date: '2026-04-10', from: 'Nikita', to: 'Shailesh', amount: 250000, mode: 'Bank transfer', category: 'Loan', purpose: 'Personal loan, to be returned', reference: 'UTR-DUMMY06', evidence: ['E-03', 'L45738'] },
    { id: 'F-07', date: '2026-05-15', from: 'Shailesh', to: 'Nikita', amount: 25000, mode: 'UPI', category: 'Repayment', purpose: 'Part repayment of loan', reference: 'UPI-DUMMY07', evidence: ['E-03'] },
];

export interface PropertyItem {
    id: string;
    item: string;
    category: 'Jewellery' | 'Stridhan' | 'Electronics' | 'Furniture' | 'Household goods' | 'Documents' | 'Vehicle';
    givenBy: string;
    owner: string;
    acquired: string;
    value: number;
    possession: string;
    status: 'With wife' | 'With husband' | 'Disputed' | 'Returned' | 'Unknown';
    evidence?: string[];
    notes?: string;
}

export const PROPERTY: PropertyItem[] = [
    { id: 'P-01', item: 'Gold mangalsutra, 12g', category: 'Jewellery', givenBy: 'Not specified', owner: 'Not specified', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'Weight and current possession recorded from user report; purchaser, owner, date, value and supporting receipt not specified.' },
    { id: 'P-03', item: 'Gold chain, 15g', category: 'Jewellery', givenBy: 'Purchased by Nikita using funds sent by Shailesh', owner: 'Shailesh', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports sending Nikita money to purchase this item for him. Purchase date, value and receipt not specified; verify against transfer and purchase records.' },
    { id: 'P-07', item: 'Long gold mangalsutra, 35g', category: 'Jewellery', givenBy: 'Not specified', owner: 'Not specified', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'Weight and current possession recorded from user report; purchaser, owner, date, value and supporting receipt not specified.' },
    { id: 'P-08', item: 'Necklace and earrings set, 12g total', category: 'Jewellery', givenBy: 'Not specified', owner: 'Not specified', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'Combined weight and current possession recorded from user report; purchaser, owner, date, value and supporting receipt not specified.' },
    { id: 'P-09', item: 'Engagement ring, 4g', category: 'Jewellery', givenBy: 'Purchased by Shailesh for Nikita', owner: 'Nikita', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports purchasing this 4g engagement ring for Nikita. Purchase date, value and receipt not specified.' },
    { id: 'P-10', item: 'Nathni, 1g', category: 'Jewellery', givenBy: 'Not specified', owner: 'Not specified', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'Weight and current possession recorded from user report; purchaser, owner, date, value and supporting receipt not specified.' },
    { id: 'P-11', item: 'Engagement ring, 6-7g', category: 'Jewellery', givenBy: 'Purchased by Nikita for Shailesh', owner: 'Shailesh', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports this 6-7g engagement ring was purchased for Shailesh by Nikita and is currently with Nikita. Exact weight, purchase date, value and receipt not specified.' },
    { id: 'P-12', item: 'Diamond ring', category: 'Jewellery', givenBy: 'Purchased by Shailesh for Nikita', owner: 'Nikita', acquired: '—', value: 0, possession: 'Not specified', status: 'Unknown', notes: 'User reports purchasing this ring for Nikita on her birthday. Birthday date, weight, value, receipt and current possession not specified.' },
    { id: 'P-13', item: 'Television', category: 'Electronics', givenBy: 'Purchased by Nikita', owner: 'Nikita', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports Nikita purchased and took this item. Chronology event 25 reports belongings removal in September 2026 but does not specifically identify the television or confirm the exact date. Purchase date, value and receipt not specified.' },
    { id: 'P-14', item: 'Refrigerator', category: 'Electronics', givenBy: 'Purchased by Nikita', owner: 'Nikita', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports Nikita purchased and took this item. Chronology event 26 mentions refrigerator removal reported on 5 October 2026; the exact removal date is unconfirmed. Bank records contain two shared refrigerator/washing-machine EMI reimbursements of INR 5,000 each.' },
    { id: 'P-15', item: 'Washing machine', category: 'Electronics', givenBy: 'Purchased by Nikita', owner: 'Nikita', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports Nikita purchased and took this item. Chronology event 25 reports belongings removal in September 2026 but does not specifically identify the washing machine or confirm the exact date. Bank records contain two shared refrigerator/washing-machine EMI reimbursements of INR 5,000 each.' },
    { id: 'P-16', item: 'Bed with mattress', category: 'Furniture', givenBy: 'Purchased by Shailesh using INR 40,000 from Nikita’s father; shared across three items', owner: 'Not specified', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports Nikita’s father provided INR 40,000 for this and two other household items, which Shailesh purchased. Per-item cost is unknown. User reports Nikita took it; chronology event 25 reports general belongings removal in September 2026 but does not itemize this item or confirm the exact date.' },
    { id: 'P-17', item: 'Gas stove', category: 'Household goods', givenBy: 'Purchased by Shailesh using INR 40,000 from Nikita’s father; shared across three items', owner: 'Not specified', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports Nikita’s father provided INR 40,000 for this and two other household items, which Shailesh purchased. Per-item cost is unknown. User reports Nikita took it; chronology event 25 reports general belongings removal in September 2026 but does not itemize this item or confirm the exact date.' },
    { id: 'P-18', item: 'Gas set', category: 'Household goods', givenBy: 'Purchased by Shailesh using INR 40,000 from Nikita’s father; shared across three items', owner: 'Not specified', acquired: '—', value: 0, possession: 'Nikita', status: 'With wife', notes: 'User reports Nikita’s father provided INR 40,000 for this and two other household items, which Shailesh purchased. Per-item cost is unknown. User reports Nikita took it; chronology event 25 reports general belongings removal in September 2026 but does not itemize this item or confirm the exact date.' },
];

export interface Witness {
    id: string;
    name: string;
    relation: string;
    contact: string;
    canSpeakTo: string;
    events: string[];
    statement: 'Not contacted' | 'Agreed' | 'Statement recorded' | 'Declined';
    notes?: string;
}

export const WITNESSES: Witness[] = [
    { id: 'W-01', name: 'Friend A (dummy)', relation: 'Common friend', contact: '+91 9•••• ••001', canSpeakTo: 'Couple’s relationship in Bengaluru, 2024–2026', events: ['ev5'], statement: 'Agreed' },
    { id: 'W-02', name: 'Relative B (dummy)', relation: 'Husband’s uncle', contact: '+91 9•••• ••002', canSpeakTo: 'Family meeting and argument on 29 Jun 2026', events: ['ev7'], statement: 'Statement recorded' },
    { id: 'W-03', name: 'Neighbour C (dummy)', relation: 'Neighbour, Bengaluru', contact: '+91 9•••• ••003', canSpeakTo: 'No disturbances observed at home', events: [], statement: 'Not contacted' },
    { id: 'W-04', name: 'Mediator D (dummy)', relation: 'Community elder', contact: '+91 9•••• ••004', canSpeakTo: 'Family meeting at Nagpur on 03 Jul 2026', events: ['ev9'], statement: 'Declined' },
];

export interface LegalNotice {
    id: string;
    date: string;
    type: 'Legal notice' | 'Reply' | 'Complaint' | 'Summons' | 'Petition' | 'Hearing';
    from: string;
    to: string;
    reference: string;
    status: 'Received' | 'Sent' | 'Pending' | 'Scheduled' | 'Closed';
    summary: string;
    nextDate?: string;
    documents?: string[];
}

export const NOTICES: LegalNotice[] = [
    { id: 'N-01', date: '2026-08-20', type: 'Legal notice', from: 'Advocate for Nikita (dummy)', to: 'Shailesh', reference: 'LN/2026/DUMMY/01', status: 'Received', summary: 'Notice alleging harassment and dowry demand; seeks return of stridhan (dummy).', documents: ['notice-2026-08-20.pdf'] },
    { id: 'N-02', date: '2026-09-05', type: 'Reply', from: 'Advocate for Shailesh (dummy)', to: 'Advocate for Nikita', reference: 'LN/2026/DUMMY/02', status: 'Sent', summary: 'Reply denying allegations point-wise with references to evidence (dummy).', documents: ['reply-2026-09-05.pdf'] },
    { id: 'N-03', date: '2026-09-28', type: 'Complaint', from: 'Nikita (dummy)', to: 'Police station (dummy)', reference: 'CMP/2026/DUMMY/03', status: 'Pending', summary: 'Complaint filed; husband called for counselling (dummy).', nextDate: '2026-10-20' },
    { id: 'N-04', date: '2026-10-20', type: 'Hearing', from: 'Women’s cell (dummy)', to: 'Both parties', reference: 'WC/2026/DUMMY/04', status: 'Scheduled', summary: 'Counselling session for both parties (dummy).', nextDate: '2026-10-20' },
];
