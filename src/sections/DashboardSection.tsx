import { ArrowRight } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { SECTIONS, type SectionId } from './registry';
import { PageHeader, SectionPage } from './common';

export function DashboardSection({ onNavigate }: { onNavigate: (id: SectionId) => void }) {
    const { t } = useI18n();

    return (
        <SectionPage>
            <PageHeader title={t('section.dashboard')} description={t('section.dashboard.desc')} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SECTIONS.filter((s) => s.id !== 'dashboard').map((s) => (
                    <button key={s.id} type="button" className="text-left" onClick={() => onNavigate(s.id)}>
                        <Card className="h-full gap-2 py-4 transition-colors hover:bg-muted/50">
                            <CardHeader className="px-4">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <s.icon className="size-4 text-muted-foreground" />
                                    {t(`section.${s.id}`)}
                                    <ArrowRight className="size-3.5 text-muted-foreground" />
                                </CardTitle>
                                <CardDescription className="text-xs">{t(`section.${s.id}.desc`)}</CardDescription>
                            </CardHeader>
                        </Card>
                    </button>
                ))}
            </div>
        </SectionPage>
    );
}
