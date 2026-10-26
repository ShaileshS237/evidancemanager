import { useEffect, useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavBarProps {
    current: number;
    total: number;
    label: string;
    canPrev: boolean;
    canNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    onJump: (page: number) => void;
}

export function NavBar({ current, total, label, canPrev, canNext, onPrev, onNext, onJump }: NavBarProps) {
    const [value, setValue] = useState(String(current));
    useEffect(() => setValue(String(current)), [current]);

    const submit = (e?: FormEvent) => {
        e?.preventDefault();
        const n = parseInt(value, 10);
        if (Number.isFinite(n)) onJump(Math.min(total, Math.max(1, n)));
        else setValue(String(current));
    };

    return (
        <nav className="flex items-center gap-2" aria-label="Book navigation">
            <Button variant="outline" size="sm" onClick={onPrev} disabled={!canPrev} aria-label="Previous page">
                <ChevronLeft />
                <span className="hidden sm:inline">Previous</span>
            </Button>

            <form className="flex items-center gap-2 px-1 text-sm text-muted-foreground" onSubmit={submit}>
                <span className="hidden sm:inline">{label}</span>
                <Input
                    className="h-7 w-14 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    type="number"
                    min={1}
                    max={total}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={() => submit()}
                    aria-label="Go to page"
                />
                <span className="tabular-nums">of {total}</span>
            </form>

            <Button variant="outline" size="sm" onClick={onNext} disabled={!canNext} aria-label="Next page">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight />
            </Button>
        </nav>
    );
}
