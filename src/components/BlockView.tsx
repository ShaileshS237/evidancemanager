import type { Block } from '../lib/paginate';

/** Must mirror createBlockElement() in lib/paginate.ts. */
export function BlockView({ block }: { block: Block }) {
    if (block.kind === 'day') {
        return (
            <div className="day">
                <span>{block.label}</span>
            </div>
        );
    }
    if (block.kind === 'sys') {
        return (
            <div className="sys">
                {block.showMeta && <span className="ref">{`L${block.line}`}</span>}
                {block.text}
            </div>
        );
    }
    return (
        <div
            className={`msg msg--c${block.color}${block.continued ? ' msg--cont' : ''}${block.highlight ? ' msg--hl' : ''}`}
        >
            {block.showMeta && (
                <div className="msg__meta">
                    <span className="msg__sender">{block.sender}</span>
                    <span className="msg__time">{block.time}</span>
                    <span className="ref">{`L${block.line}`}</span>
                </div>
            )}
            <p className="msg__text">{block.text}</p>
        </div>
    );
}
