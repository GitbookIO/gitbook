import type { GitBookFrameClient, GitBookFrameEvents } from '../client';

const FRAME_EVENTS: (keyof GitBookFrameEvents)[] = ['close', 'escape', 'navigate'];

/**
 * Hold the host's listeners outside any one frame: the widget rebuilds its iframe on a new `init`
 * and only creates it once opened, but `GitBook('on', …)` can be called at any time.
 */
export function createFrameEventRelay() {
    const listeners = new Map<keyof GitBookFrameEvents, Set<(...args: any[]) => void>>();
    let detachFrame: (() => void) | undefined;

    const detach = () => {
        detachFrame?.();
        detachFrame = undefined;
    };

    return {
        on<E extends keyof GitBookFrameEvents>(event: E, listener: GitBookFrameEvents[E]) {
            const set = listeners.get(event) ?? new Set();
            set.add(listener);
            listeners.set(event, set);
            return () => {
                set.delete(listener);
            };
        },

        attach(frame: GitBookFrameClient) {
            detach();
            const unsubscribes = FRAME_EVENTS.map((event) =>
                frame.on(event, (...args: any[]) => {
                    listeners.get(event)?.forEach((listener) => listener(...args));
                })
            );
            detachFrame = () => unsubscribes.forEach((unsubscribe) => unsubscribe());
        },

        detach,
    };
}
