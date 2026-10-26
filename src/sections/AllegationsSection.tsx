import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ALLEGATIONS } from '@/data/caseData';
import { ALLEGATIONS_MR } from '@/data/allegations.mr';
import { useI18n } from '@/i18n';
import { PageHeader, RefChips, SectionPage, fmtDate } from './common';

export function AllegationsSection() {
    const { t, lang } = useI18n();

    return (
        <SectionPage>
            <PageHeader title={t('section.allegations')} description={t('allegationsDesc')} dummy={false} />

            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {t('allegationsNote')}
                {lang === 'mr' && <span className="mt-1 block font-medium">{t('translationNote')}</span>}
            </p>

            {ALLEGATIONS.map((a) => {
                const text = (lang === 'mr' && ALLEGATIONS_MR[a.id]) || a;
                return (
                    <Card key={a.id} className="gap-3">
                        <CardHeader>
                            <span className="font-mono text-xs text-muted-foreground">{a.id}</span>
                            <CardTitle>{text.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {t('raisedBy')} {a.raisedBy}
                                {a.raisedOn ? ` · ${t('incident')} ${fmtDate(a.raisedOn)}` : ''} · {a.source}
                            </p>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border bg-muted/40 p-3">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">{t('herAllegation')}</div>
                                <p className="text-sm">{text.allegation}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">{t('myAnswer')}</div>
                                <p className="text-sm">{text.response}</p>
                            </div>
                            {a.evidence.length > 0 && (
                                <div className="md:col-span-2">
                                    <div className="mb-1.5 text-xs font-medium text-muted-foreground">{t('supportingEvidence')}</div>
                                    <RefChips refs={a.evidence} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </SectionPage>
    );
}
