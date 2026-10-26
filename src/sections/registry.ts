import {
  FolderOpen,
  Gavel,
  History,
  IndianRupee,
  LayoutDashboard,
  MessageSquareText,
  Package,
  Plane,
  Scale,
  UserRound,
  Video,
  type LucideIcon,
} from 'lucide-react';

export type SectionId =
  | 'dashboard'
  | 'chronology'
  | 'allegations'
  | 'evidence'
  | 'chat'
  | 'media'
  | 'travel'
  | 'financial'
  | 'property'
  | 'witnesses'
  | 'legal';

export interface SectionDef {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  description: string;
  group: 'Overview' | 'Case' | 'Evidence';
}

export const SECTION_GROUPS = ['Overview', 'Case', 'Evidence'] as const;

export const SECTIONS: SectionDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview', description: 'Case overview at a glance.' },
  { id: 'chronology', label: 'Chronology', icon: History, group: 'Overview', description: 'Dated timeline of key events, linked to evidence.' },
  { id: 'allegations', label: 'Allegations & Responses', icon: Scale, group: 'Case', description: 'Each allegation with the response and supporting evidence.' },
  { id: 'legal', label: 'Legal Notices', icon: Gavel, group: 'Case', description: 'Notices, replies, complaints and hearing dates.' },
  { id: 'witnesses', label: 'Witnesses', icon: UserRound, group: 'Case', description: 'People who can speak to specific events.' },
  { id: 'evidence', label: 'Evidence Library', icon: FolderOpen, group: 'Evidence', description: 'Every exhibit with its source and fingerprint.' },
  { id: 'chat', label: 'Chats & Messages', icon: MessageSquareText, group: 'Evidence', description: 'WhatsApp conversation presented as a book, with line references.' },
  { id: 'media', label: 'Audio & Video', icon: Video, group: 'Evidence', description: 'Recordings with participants and transcript notes.' },
  { id: 'travel', label: 'Travel', icon: Plane, group: 'Evidence', description: 'Tickets, bookings and journeys, arranged by date.' },
  { id: 'financial', label: 'Financial Records', icon: IndianRupee, group: 'Evidence', description: 'Transfers, loans and expenses between the parties.' },
  { id: 'property', label: 'Property & Belongings', icon: Package, group: 'Evidence', description: 'Jewellery, stridhan, gifts and household items.' },
];
