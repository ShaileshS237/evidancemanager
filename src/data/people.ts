// Marathi names for the people referenced across the case data.
export const PEOPLE_MR: Record<string, string> = {
    Nikita: 'निकिता',
    Shailesh: 'शैलेश',
    'Nikita’s family': 'निकिताचे कुटुंब',
    'Nikita’s side': 'निकिताची बाजू',
    'Nikita’s brother': 'निकिताचा भाऊ',
    'Nikita’s brothers': 'निकिताचे भाऊ',
    'Nikita’s mother': 'निकिताची आई',
    'Nikita’s father': 'निकिताचे वडील',
    'Nikita’s maternal uncle': 'निकिताचे मामा',
    'Nikita’s advocate': 'निकिताचे वकील',
    'Shailesh’s father': 'शैलेशचे वडील',
    'Shailesh’s mother': 'शैलेशची आई',
    'Shailesh’s sister': 'शैलेशची बहीण',
    'Shailesh’s family': 'शैलेशचे कुटुंब',
    'Both families': 'दोन्ही कुटुंबे',
    'Mahila and Bal Kalyan section': 'महिला व बाल कल्याण विभाग',
};

export const personName = (name: string, lang: string) => (lang === 'mr' ? (PEOPLE_MR[name] ?? name) : name);
