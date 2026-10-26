import { createContext, useContext, useSyncExternalStore } from 'react';

/** Pages within this distance of a focused page render their content; others stay empty shells. */
export const PAGE_WINDOW = 6;

export interface PageWindowStore {
    setFocus(...pages: number[]): void;
    subscribe(listener: () => void): () => void;
    isNear(index: number): boolean;
}

export function createPageWindowStore(initial = 0): PageWindowStore {
    let focus = [initial];
    const listeners = new Set<() => void>();
    return {
        setFocus(...pages) {
            focus = pages;
            listeners.forEach((l) => l());
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        isNear(index) {
            return focus.some((f) => Math.abs(f - index) <= PAGE_WINDOW);
        },
    };
}

export const PageWindowContext = createContext<PageWindowStore | null>(null);

/** Re-renders only when this page enters or leaves the window. */
export function useIsPageNear(index: number): boolean {
    const store = useContext(PageWindowContext);
    return useSyncExternalStore(
        store ? store.subscribe : noopSubscribe,
        () => (store ? store.isNear(index) : true),
    );
}

const noopSubscribe = () => () => { };
