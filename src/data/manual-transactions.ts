interface Transaction {
  id: string;
  date: string;
  dateDisplay: string;
  narration: string;
  referenceNumber: string;
  valueDate: string;
  withdrawalAmount: number;
  depositAmount: number;
  closingBalance: number | null;
  transactionType: string;
  month: string;
  monthLabel: string;
  year: number;
  duplicate: boolean;
  personOrMerchant: string;
  normalizedName: string;
  category: string;
  subcategory: string;
  partyType: string;
  vpa: string;
  needsReview: boolean;
  financialKind: string;
  computedBalance: number;
  note: string;
}

export const manualTransactions: Transaction[] = [
  {
    id: "manual-20240609-416173639057",
    date: "2024-06-09",
    dateDisplay: "09/06/2024",
    narration: "Google Pay receipt from VILAS PRALHAD INGLE to Shailesh Ganesh Sawale",
    referenceNumber: "416173639057",
    valueDate: "2024-06-09",
    withdrawalAmount: 0,
    depositAmount: 40000,
    closingBalance: null,
    transactionType: "Received",
    month: "2024-06",
    monthLabel: "Jun 2024",
    year: 2024,
    duplicate: false,
    personOrMerchant: "Vilas Ingle",
    normalizedName: "Vilas Ingle",
    category: "Person-to-Person",
    subcategory: "UPI · manually verified",
    partyType: "person",
    vpa: "••••le28@oksbi",
    needsReview: false,
    financialKind: "p2p",
    computedBalance: 0,
    note: "Verified from attached Google Pay receipt (Google transaction ID CICAgPCm1p6ocw)",
  },
];
