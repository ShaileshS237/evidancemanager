// Shailesh's focused chronology of reported conduct by Nikita and her family, prepared for counsel on 6 Oct 2026.
// Records allegations and recollections, not findings. Paraphrases unless checked against originals.

export type EventCategory = 'Relationship' | 'Marriage' | 'Dispute' | 'Legal' | 'Financial' | 'Travel';
export type EventPhase = 'beforeMarriage' | 'duringMarriage' | 'breakdown' | 'afterSeparation';

export interface TimelineEvent {
    id: string;
    no: number;
    phase: EventPhase;
    /** As stated in the account, e.g. "Approximately late January to June 2026". */
    period: string;
    /** Only set when the account gives a specific date (still subject to verification). */
    date?: string;
    title: string;
    account: string[];
    verification: string;
    category: EventCategory;
    people: string[];
    evidence?: string[];
}

export const CHRONOLOGY_META = {
    preparedFor: 'Private consultation with counsel',
    accountOf: 'Shailesh Sawale',
    preparedOn: '2026-10-06',
    coverage: 'Before engagement through reports made on 5 October 2026',
    note: 'This is a focused account of my complaints concerning Nikita and her family, rather than a complete account of both parties’ conduct. It records allegations and recollections, not judicial findings. Undated events are grouped by period; their order does not establish an exact sequence. Recalled statements are paraphrases unless checked against the original message or recording. The full chronology and original records should remain available to counsel for context.',
    source:
        'Adapted from Marital_Chronology_For_Counsel.docx (prepared 5 October 2026), together with the earlier reported non-return of the ₹50,000 payment. Events should be matched to original messages, full recordings, direct witnesses, bank records, invoices and official papers; exact names, dates and words should be confirmed before this account is adopted in a signed statement.',
};

export const EVENTS: TimelineEvent[] = [
    {
        id: 'ev1', no: 1, phase: 'beforeMarriage', category: 'Marriage', people: ['Nikita’s family', 'Shailesh'],
        period: 'Before the engagement on 14 January 2024; exact date unconfirmed.',
        title: 'Comments during engagement ring shopping',
        account: [
            'During ring shopping, a design I liked was subsequently described as approximately 10 grams. According to my account, the budget was not clearly explained, several shops were visited, and a different ring was selected.',
            'Statements were made about me to the effect that I was young or did not understand such matters. I experienced these comments as belittling. My complaint concerns the manner in which I was spoken about, rather than an entitlement to a particular ring or expenditure.',
        ],
        verification: 'Identify the speaker, accompanying persons, shop and approximate date. The weight alone does not prove that anyone made an insulting statement.',
    },
    {
        id: 'ev2', no: 2, phase: 'beforeMarriage', category: 'Financial', people: ['Nikita’s side', 'Shailesh’s father'],
        period: 'Approximately late January to June 2024.',
        title: 'Pressure to improve the family home before marriage',
        account: [
            'My earlier account describes pressure from Nikita’s side to improve the family home before marriage, including language about ending the proposed marriage if the improvements were not made. The exact person responsible for each statement is not established in the current brief and should not be attributed collectively to every relative.',
            'The earlier chronology records an estimated ₹15 lakh arranged by my father, including reference to GPF funds, and substantial work completed by late June 2024. I experienced the reported insistence as financial and emotional pressure during wedding preparations.',
        ],
        verification: 'Messages, direct witnesses, construction payments and the precise words used. Expenditure on the home does not by itself establish that it was demanded by Nikita or her family.',
    },
    {
        id: 'ev3', no: 3, phase: 'beforeMarriage', category: 'Marriage', people: ['Nikita’s family', 'Shailesh'],
        period: 'Before the marriage on 14 July 2024; exact date unconfirmed.',
        title: 'Exclusion from a wedding shopping discussion',
        account: [
            'During wedding-clothes shopping, a discount of approximately ₹2,000–₹3,000 was being discussed. According to my account, I was asked to go outside or taken outside the shop during that discussion.',
            'I experienced this as being treated like a child and excluded from a discussion concerning my wedding. The person who asked me to leave and the circumstances should be identified before making a specific allegation against anyone.',
        ],
        verification: 'Persons present and any contemporaneous messages about the incident.',
    },
    {
        id: 'ev4', no: 4, phase: 'beforeMarriage', category: 'Relationship', people: ['Nikita’s family', 'Shailesh'],
        period: 'A summer visit before marriage, as placed in the earlier chronology; exact date unconfirmed.',
        title: 'Sleeping arrangements during a visit to her home',
        account: [
            'My sleeping arrangement at Nikita’s home was in a hot area without a cooler, while another household member was accommodated in a room with a cooler. I felt that insufficient consideration was given to my comfort as a guest.',
            'This records my experience of the arrangement. It does not establish that the arrangement was deliberately intended to humiliate me.',
        ],
        verification: 'Date, persons present and the actual arrangements available in the house.',
    },
    {
        id: 'ev5', no: 5, phase: 'duringMarriage', category: 'Financial', people: ['Nikita’s brother'],
        period: 'July 2024; exact date unresolved (14 or 17 July 2024).',
        title: 'Reported receipt of ₹50,000 by Nikita’s brother',
        account: [
            'My earlier account records that Nikita’s brother received ₹50,000. One reference gives 17 July 2024, while another describes the payment as occurring on the wedding day, 14 July 2024. My prior account also reports that it was not returned.',
            'The recipient, reason for payment, whether repayment was agreed, and any later repayment must be checked. Receipt of money alone should not be described as fraud or unlawful retention.',
        ],
        verification: 'Bank or UPI entry, recipient details, messages concerning the payment and any repayment request. The current counsel brief identifies the amount and date conflict but leaves repayment status for confirmation.',
    },
    {
        id: 'ev6', no: 6, phase: 'duringMarriage', category: 'Relationship', people: ['Nikita', 'Nikita’s mother', 'Nikita’s brothers'],
        period: 'During married life in Bengaluru; individual dates unconfirmed.',
        title: 'Comments about me during family telephone conversations',
        account: [
            'According to my account, I heard comments or jokes about me during some of Nikita’s telephone conversations with her mother or brothers. I experienced the remarks as mocking or disrespectful.',
            'My complaint concerns the content of particular remarks, not the fact that Nikita maintained contact with her family. The earlier account says she later used headphones, but using headphones does not establish that further insulting remarks occurred.',
        ],
        verification: 'Identify the actual words, speaker, date and whether I heard the remark directly. A general impression should not substitute for a specific incident.',
    },
    {
        id: 'ev7', no: 7, phase: 'duringMarriage', category: 'Dispute', people: ['Nikita', 'Nikita’s brother'],
        period: 'During cohabitation in Bengaluru; exact date unconfirmed.',
        title: 'Her brother asking her to come to Pune during a dispute',
        account: [
            'After a marital disagreement, Nikita contacted her brother. According to my account, he asked her to come to Pune without first hearing the situation from me.',
            'I perceived this as outside involvement in a dispute between spouses. The earlier chronology also records that a journey to Akot was already planned for the following week. Counsel should examine the complete conversation before treating the invitation as an attempt to break the marriage.',
        ],
        verification: 'Messages or call-related communications concerning the proposed Pune journey and the planned Akot trip.',
    },
    {
        id: 'ev8', no: 8, phase: 'duringMarriage', category: 'Travel', people: ['Nikita’s brother'],
        period: 'Various journeys during the marriage; dates unconfirmed.',
        title: 'Repeated enquiries while Nikita travelled with me',
        account: [
            'According to my account, her brother repeatedly called to ask where she was and how far she had travelled, including while she was travelling with me. I experienced the frequency of the enquiries as indicating a lack of trust in me.',
            'The calls could also have reflected concern for her welfare. My complaint is the pattern as I experienced it; motive cannot be established from call frequency alone.',
        ],
        verification: 'Specific journeys, approximate number of calls and any accompanying messages.',
    },
    {
        id: 'ev9', no: 9, phase: 'duringMarriage', category: 'Relationship', people: ['Nikita’s father', 'Nikita’s maternal uncle', 'Shailesh’s father'],
        period: 'Family visits during the relationship; exact dates unconfirmed.',
        title: 'Encouragement of my father to consume alcohol',
        account: [
            'According to my recollection, Nikita’s father encouraged my father to drink on two or three occasions. One reported occasion involved a visit with friends to my father’s Head Office or Camp, where alcohol had been brought.',
            'I was separately informed that Nikita’s maternal uncle attempted to take my father for drinking. That part is information conveyed to me, rather than a fact I necessarily witnessed. Nikita reportedly responded that I should have adjusted to or handled the situation.',
            'My complaint concerns the reported encouragement or pressure directed at my father. The account does not establish that he was forced to consume alcohol.',
        ],
        verification: 'My father’s account, other persons present, dates and the distinction between direct observation and later information.',
    },
    {
        id: 'ev10', no: 10, phase: 'duringMarriage', category: 'Dispute', people: ['Nikita', 'Nikita’s brother'],
        period: 'A video call before the major June 2026 breakdown; exact date unconfirmed.',
        title: 'Body-related comment by Nikita’s brother',
        account: [
            'During a video call, Nikita commented to her brother about his size or appearance. According to my recollection, he replied in substance that he was still less big than both of us, bringing my appearance into the exchange.',
            'I experienced the remark as body shaming. Nikita initially treated it as a joke rather than a serious matter, which left me feeling that my concern was being dismissed.',
            'The earlier account also records that she subsequently told her brother not to make such jokes and that he said sorry to her. The remaining complaint was that he did not address the matter directly with me.',
        ],
        verification: 'The actual words and any recording or subsequent messages. The paraphrase should not be presented as a verified transcript.',
    },
    {
        id: 'ev11', no: 11, phase: 'duringMarriage', category: 'Dispute', people: ['Nikita’s brother'],
        period: 'Before the train dispute; exact date unconfirmed.',
        title: 'Brother’s subsequent position on an apology',
        account: [
            'During a later telephone conversation concerning the disagreement, Nikita’s brother reportedly took the position that he should not have to apologise for something he did not consider a mistake.',
            'I experienced that response as dismissive of the hurt caused by the earlier comment. The exact wording, date and relationship between this conversation and the earlier apology through Nikita require checking.',
        ],
        verification: 'Recording if available, messages before and after the call, and identification of the brother concerned.',
    },
    {
        id: 'ev12', no: 12, phase: 'duringMarriage', category: 'Dispute', people: ['Nikita', 'Nikita’s father', 'Shailesh’s mother'],
        period: 'After a sinus-treatment journey to Akola; exact date unconfirmed.',
        title: 'Raised voice towards my mother after a treatment visit',
        account: [
            'After treatment, Nikita stayed at her parental home with agreement. The following day, her father brought her back. According to my account, after he left she spoke to my mother in a raised voice and said words to the effect that she would not do this from then onwards.',
            'My complaint concerns the reported manner of speaking and the resulting distress. The exact issue referred to by “this” is not established in the current record. Her agreed stay with her parents is not presented as an unauthorised departure.',
        ],
        verification: 'Treatment dates, persons present and the full conversation.',
    },
    {
        id: 'ev13', no: 13, phase: 'duringMarriage', category: 'Relationship', people: ['Nikita', 'Shailesh’s mother'],
        period: 'Before the June 2026 train journey; exact dates unconfirmed.',
        title: 'Disagreement over support during my mother’s illness',
        account: [
            'During my mother’s serious heart-related illness, Nikita went to her parental home to spend time with visiting relatives. I felt unsupported because I expected her presence during the family medical difficulty.',
            'For accuracy, the earlier account also records that Nikita later offered to come back, and was told that household and cooking assistance were available and that her return was not necessary. The complaint is therefore about my experience of the earlier priorities, not a claim that she refused all assistance.',
        ],
        verification: 'Medical and travel dates and messages concerning the visits. The precise diagnosis must be taken from medical records.',
    },
    {
        id: 'ev14', no: 14, phase: 'duringMarriage', category: 'Dispute', people: ['Nikita’s brother', 'Shailesh’s sister'],
        period: 'Around Diwali; the year of this particular contact remains unconfirmed.',
        title: 'Her brother contacting my sister with allegations about me',
        account: [
            'According to my account, Nikita’s brother contacted my sister and communicated allegations about my treatment of Nikita, using words to the effect of “Shaileshrao torture…” and asking my sister to speak to me.',
            'I was also later told that he discussed property, future disputes, my behaviour and maturity with her. These additional subjects are second-hand information unless confirmed by my sister or the original messages.',
            'I experienced the communication as extending the marital dispute to another family member and damaging her impression of me. Whether the allegations were false requires examination of their actual content and evidence.',
        ],
        verification: 'My sister’s original messages and her direct account. Do not assign the contact automatically to Diwali 2024 merely because a separate notice allegation concerns that period.',
    },
    {
        id: 'ev15', no: 15, phase: 'breakdown', category: 'Dispute', date: '2026-06-06', people: ['Nikita', 'Shailesh', 'Shailesh’s mother'],
        period: '6 June 2026 as attributed to the notice in the earlier timeline; ticket verification pending.',
        title: 'Personal remarks during the train argument',
        account: [
            'During the Akola–Bengaluru train argument, Nikita reportedly made statements to the effect that she had never seen a person like me and that nobody would be able to live with me. She also reportedly said that she did not want to live with me.',
            'I experienced the remarks as personal rejection and an attack on my ability to maintain a relationship. They occurred during an escalating argument, and this focused extract does not reproduce the entire exchange.',
        ],
        verification: 'Train tickets, witnesses, the complete later discussion on 1 July 2026 and any recording. The recalled wording should not be treated as a verbatim quotation without checking.',
    },
    {
        id: 'ev16', no: 16, phase: 'breakdown', category: 'Dispute', people: ['Nikita', 'Nikita’s brother'],
        period: 'After arrival from the train journey; exact date unconfirmed.',
        title: 'Reported remarks and self-harm statement in Bengaluru',
        account: [
            'According to my account, during a further argument in the Bengaluru flat, Nikita called her brother and said words to the effect that she could not live with me and that I was useless.',
            'During the same conversation, she reportedly said that she would commit suicide. I experienced this as a serious and distressing statement. The account does not establish an attempt, diagnosis or the motive behind the statement.',
        ],
        verification: 'Date, persons present, any recording and subsequent communications. The statement should be attributed as my recollection unless independently supported.',
    },
    {
        id: 'ev17', no: 17, phase: 'breakdown', category: 'Travel', people: ['Nikita', 'Nikita’s brother', 'Shailesh’s mother'],
        period: 'Following the Bengaluru argument in June 2026; exact date unconfirmed.',
        title: 'Departure and collection by her brother',
        account: [
            'My account says that Nikita searched for a flight ticket, packed her belongings and travelled onwards. Her brother collected her at the destination airport, identified in later accounts as Nagpur. I felt that he did not engage with my mother about the situation.',
            'The accounts of the departure are disputed. This entry does not establish that Nikita voluntarily abandoned the marriage, and it should not be used to infer her legal intention from ticket booking alone. The shared-cab and subsequent travel sequence also remain to be reconciled.',
        ],
        verification: 'Tickets, booking records, airport and cab chronology and relevant messages.',
    },
    {
        id: 'ev18', no: 18, phase: 'breakdown', category: 'Dispute', date: '2026-06-12', people: ['Nikita', 'Nikita’s brother', 'Both families'],
        period: '12 June 2026, Anand Watika, Washim Road, Akola, as recorded in the earlier timeline; verification pending.',
        title: 'Remarks about maturity at the first family meeting',
        account: [
            'During the family meeting, Nikita’s brother reportedly questioned my maturity and behaviour. I experienced the manner of the discussion as belittling rather than an attempt to understand my complaints.',
            'According to my recollection, Nikita also made a statement to the effect that she could leave her husband but could not leave her brothers. I understood this as placing the marriage below those family relationships. The precise meaning depends on the question and discussion surrounding the statement.',
        ],
        verification: 'Identify the meeting and participants, preserve the complete audio, and locate the timestamp. A recording has been reported, but this extract does not authenticate its contents.',
    },
    {
        id: 'ev19', no: 19, phase: 'breakdown', category: 'Dispute', date: '2026-07-03', people: ['Nikita', 'Shailesh’s mother', 'Nikita’s maternal uncle'],
        period: '3 July 2026, Prerna Nagar, Khadki, as attributed to the earlier notice summary; verification pending.',
        title: 'Remarks towards my mother at the maternal uncle’s meeting',
        account: [
            'At the meeting at Nikita’s maternal uncle’s home, she reportedly told my mother in substance not to speak. I experienced the manner of speaking as disrespectful.',
            'Later in the escalating exchange, she reportedly accused my mother of breaking her children’s marriages, referring to a daughter’s marriage and then to mine. I experienced those remarks as hurtful towards my mother and family.',
            'These remarks formed part of a reciprocal argument. This focused account lists the conduct complained of and does not reproduce the preceding statements by other participants. The full recording and chronology are necessary to assess the exchange fairly.',
        ],
        verification: 'Full audio, sequence of speakers, exact wording and participants. A separate message requesting a meeting on 5 July does not by itself settle the date of this meeting.',
    },
    {
        id: 'ev20', no: 20, phase: 'breakdown', category: 'Dispute', people: ['Nikita’s father', 'Shailesh’s mother'],
        period: 'In connection with family discussions; exact date unconfirmed.',
        title: 'Reported comment by her father about my mother',
        account: [
            'I was told that Nikita’s father referred to my mother, in her absence, using a word to the effect of “uneducated.” I experienced this reported description as derogatory.',
            'I did not personally hear the statement. It is included as information conveyed to me, not as a directly witnessed incident.',
        ],
        verification: 'Identify who heard it, where and when it was said, and the actual wording and context.',
    },
    {
        id: 'ev21', no: 21, phase: 'breakdown', category: 'Dispute', people: ['Nikita', 'Shailesh', 'Shailesh’s family'],
        period: 'A family meeting around July 2026; precise occasion to confirm.',
        title: 'Proposal that cohabitation depend on living separately from my family',
        account: [
            'Nikita reportedly proposed that she could live with me if we lived separately from my mother or family. I experienced this as a condition affecting my relationship with my family and as a further source of marital conflict.',
            'This records the proposal and my experience of it. A request for a separate household does not, by itself, establish that she demanded complete abandonment of my parents or that the proposal was unlawful.',
        ],
        verification: 'Full recording or messages establishing the terms of the proposal and the living arrangement then under discussion.',
    },
    {
        id: 'ev22', no: 22, phase: 'breakdown', category: 'Dispute', people: ['Nikita', 'Nikita’s brothers'],
        period: 'Continuing into August 2026.',
        title: 'Continuing disagreement about her brothers’ conduct',
        account: [
            'My recurring complaint was that Nikita dismissed or minimised remarks by her brothers that I experienced as disrespectful and that disputes about those remarks continued between us.',
            'Earlier messages dated 15 April 2025 and 5 August 2026 are identified in the counsel brief as records of this complaint. Their significance is that they record the concern at those times; my messages do not independently prove the conduct complained of.',
        ],
        verification: 'The specific remarks by each brother and the complete responses from Nikita, rather than only my description of them.',
        evidence: ['L37185', 'L45724'],
    },
    {
        id: 'ev23', no: 23, phase: 'afterSeparation', category: 'Legal', people: ['Nikita', 'Nikita’s advocate'],
        period: 'Approximately August 2026; 24 August appears in the earlier timeline but the notice and service dates require checking.',
        title: 'Advocate notice containing allegations and monetary demands',
        account: [
            'Nikita, through her advocate, sent a notice alleging mental, physical and economic cruelty and seeking resumption of cohabitation. The demands recorded in the earlier brief include: ₹10 lakh as compensation; ₹10 lakh as an alleged repayment; ₹5,000 as notice expenses; and a demand that I take her back for cohabitation and stop the alleged harassment.',
            'The earlier brief attributes allegations concerning Diwali 2024, an incident on 30 November 2025, and the June 2026 departure to the notice. It also refers to disputed descriptions of household work, family contact, finances, gifts, outings and telephone calls.',
            'I dispute the allegations and describe the notice as having caused further distress and damage to trust. This account does not represent the allegations as judicially determined to be false or the act of sending a notice as inherently wrongful.',
        ],
        verification: 'Complete signed notice, service record and exact paragraphs. The previous proposed reply is not a substitute for the original notice.',
    },
    {
        id: 'ev24', no: 24, phase: 'afterSeparation', category: 'Financial', people: ['Nikita’s family', 'Shailesh'],
        period: 'Notice and subsequent dispute in 2026.',
        title: 'Disputed claims concerning expenditure and property',
        account: [
            'The earlier reply draft addresses claimed figures including approximately ₹40 lakh wedding expenditure, ₹9 lakh spent on or for me, and ₹5 lakh household articles. Other earlier accounts refer to different totals.',
            'My complaint is that disputed expenditure and property claims have been advanced without a reconciled item-wise account available in the brief. The figures must not be combined into one total or treated as admitted amounts. Nor does lack of documents in this brief establish that the other side possesses no supporting records.',
        ],
        verification: 'Each claimed payment or article, the claimant, invoice or transfer, purpose, gift circumstances, present possession and any alleged repayment obligation.',
    },
    {
        id: 'ev25', no: 25, phase: 'afterSeparation', category: 'Dispute', people: ['Nikita', 'Nikita’s brother'],
        period: 'September 2026; exact incident date unconfirmed.',
        title: 'Reported entry and removal of belongings from the Bengaluru home',
        account: [
            'I reported that Nikita and her brother came to the Bengaluru residence without my permission, that the lock was broken and that belongings were removed. The identity of the brother and the actions of each person need to be specified; the allegation should not be assigned to both brothers without evidence.',
            'The items previously reported as taken included: ₹10,000 cash; an Apple Watch; a mixer described as table-top (precise description to confirm); a chair; and one credit card.',
            'This is my account of the incident and the articles I claim. Ownership, gift history, access arrangements and any agreed collection must be established separately. Articles belonging to Nikita should not be included automatically as my property.',
        ],
        verification: 'Building entry records, CCTV, witnesses, photographs of the lock, repair records, messages about collection, purchase records and serial numbers. Any complaint actually submitted should be identified by its acknowledgment.',
    },
    {
        id: 'ev26', no: 26, phase: 'afterSeparation', category: 'Dispute', date: '2026-10-05', people: ['Nikita'],
        period: 'Reported on 5 October 2026; exact removal date unconfirmed.',
        title: 'Refrigerator removal and spoiled chicken left on the counter',
        account: [
            'I reported that Nikita took the refrigerator and left chicken on the kitchen counter. According to my account, the chicken remained there for approximately ten days, became rotten and caused a strong smell throughout the home. I reported that the smell persisted after cleaning.',
            'My complaint concerns the condition in which food was left and the resulting inconvenience and unpleasant living conditions. The account does not establish that the food was deliberately left to rot or to harm me. Ownership of the refrigerator is a separate question.',
        ],
        verification: 'Photographs, messages, the date the refrigerator was removed, the date the food was discovered and any direct witness. “About ten days” should not be converted into a precise date without confirmation.',
    },
    {
        id: 'ev27', no: 27, phase: 'afterSeparation', category: 'Legal', date: '2026-10-04', people: ['Nikita', 'Mahila and Bal Kalyan section'],
        period: 'Reported on 4 October 2026; complaint date unconfirmed.',
        title: 'Complaint before a women’s and child welfare body',
        account: [
            'I reported that Nikita had approached a Mahila and Bal Kalyan section in a matter I described as a “498 case,” and that I was called for mediation or counselling.',
            'The existence of an FIR, the provisions invoked, persons named and procedural status have not been established from the documents underlying this extract. The event is included as part of the sequence of proceedings arising from the dispute, not as proof that making the complaint was unlawful or malicious.',
        ],
        verification: 'Original complaint, any FIR, attendance notice, authority’s name and address, acknowledgment and case reference.',
    },
];
