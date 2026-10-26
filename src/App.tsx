import { useCallback, useState } from 'react';
import { Languages, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { Separator } from '@/components/ui/separator';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SECTION_GROUPS, SECTIONS, type SectionId } from './sections/registry';
import { ChatSection } from './sections/chat/ChatSection';
import { TravelSection } from './sections/travel/TravelSection';
import { FinancialSection } from './sections/FinancialSection';
import { DashboardSection } from './sections/DashboardSection';
import { ChronologySection } from './sections/ChronologySection';
import { AllegationsSection } from './sections/AllegationsSection';
import {
    EvidenceSection,
    LegalSection,
    MediaSection,
    PropertySection,
    WitnessesSection,
} from './sections/RecordSections';
import { loadChatExhibit, type ChatExhibit } from './lib/evidence';
import { CHATS } from './sections/chat/chats';
import { EvidenceRefProvider } from './sections/EvidenceRef';

export default function App() {
    const [active, setActive] = useState<SectionId>('dashboard');
    const [chatCache, setChatCache] = useState<Record<string, ChatExhibit>>({});
    const [financialSearchRequest, setFinancialSearchRequest] = useState<string | null>(null);
    const { t, lang, setLang } = useI18n();
    const mainChat = CHATS[0];

    const openTvEmiTransactions = useCallback(() => {
        setFinancialSearchRequest('TV EMI');
        setActive('financial');
    }, []);
    const openSharedApplianceEmiTransactions = useCallback(() => {
        setFinancialSearchRequest('FRIDGE');
        setActive('financial');
    }, []);
    const clearFinancialSearchRequest = useCallback(() => setFinancialSearchRequest(null), []);

    const loadMainChat = useCallback(async () => {
        const res = await fetch(`${import.meta.env.BASE_URL}${mainChat.file}`, { cache: 'no-store' });
        if (!res.ok || !res.headers.get('content-type')?.includes('text/plain')) return;
        const exhibit = await loadChatExhibit(await res.arrayBuffer(), mainChat.file.split('/').pop()!, {});
        setChatCache((c) => (c[mainChat.id] ? c : { ...c, [mainChat.id]: exhibit }));
    }, [mainChat]);

    const views: Record<SectionId, () => JSX.Element> = {
        dashboard: () => <DashboardSection onNavigate={setActive} />,
        chronology: () => <ChronologySection />,
        allegations: () => <AllegationsSection />,
        legal: () => <LegalSection />,
        witnesses: () => <WitnessesSection />,
        evidence: () => <EvidenceSection />,
        chat: () => (
            <ChatSection cache={chatCache} onLoaded={(id, ex) => setChatCache((c) => ({ ...c, [id]: ex }))} />
        ),
        media: () => <MediaSection />,
        travel: () => <TravelSection />,
        financial: () => <FinancialSection initialSearch={financialSearchRequest} onInitialSearchConsumed={clearFinancialSearchRequest} />,
        property: () => <PropertySection onViewTvEmi={openTvEmiTransactions} onViewSharedApplianceEmi={openSharedApplianceEmiTransactions} />,
    };

    return (
        <TooltipProvider>
            <EvidenceRefProvider chat={chatCache[mainChat.id]} loadChat={loadMainChat} onNavigate={setActive}>
                <SidebarProvider>
                    <Sidebar collapsible="icon">
                        <SidebarHeader>
                            <div className="flex items-center gap-2 p-1">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Scale className="size-4" />
                                </div>
                                <div className="grid min-w-0 text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-semibold">{t('appTitle')}</span>
                                    <span className="truncate text-xs text-muted-foreground">{t('appSubtitle')}</span>
                                </div>
                            </div>
                        </SidebarHeader>
                        <SidebarContent>
                            {SECTION_GROUPS.map((group) => (
                                <SidebarGroup key={group}>
                                    <SidebarGroupLabel>{t(`group${group}`)}</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {SECTIONS.filter((s) => s.group === group).map(({ id, icon: Icon }) => (
                                                <SidebarMenuItem key={id}>
                                                    <SidebarMenuButton
                                                        isActive={id === active}
                                                        tooltip={t(`section.${id}`)}
                                                        onClick={() => setActive(id)}
                                                    >
                                                        <Icon />
                                                        <span>{t(`section.${id}`)}</span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            ))}
                        </SidebarContent>
                        <SidebarRail />
                    </Sidebar>

                    <SidebarInset className="h-svh min-w-0 overflow-hidden">
                        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{t(`section.${active}`)}</h1>
                            <div className="flex shrink-0 items-center gap-1 rounded-lg border p-0.5" role="group" aria-label={t('language')}>
                                <Languages className="mx-1 size-4 text-muted-foreground" />
                                {(
                                    [
                                        ['en', 'EN'],
                                        ['mr', 'मराठी'],
                                    ] as const
                                ).map(([code, label]) => (
                                    <Button
                                        key={code}
                                        size="sm"
                                        variant={lang === code ? 'secondary' : 'ghost'}
                                        className="h-7"
                                        aria-pressed={lang === code}
                                        onClick={() => setLang(code)}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </header>
                        <div className="flex min-h-0 flex-1 flex-col bg-muted/40">{views[active]()}</div>
                    </SidebarInset>
                </SidebarProvider>
            </EvidenceRefProvider>
        </TooltipProvider>
    );
}
