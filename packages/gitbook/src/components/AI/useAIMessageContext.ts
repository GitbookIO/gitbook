import type { AIMessageContext } from '@gitbook/api';
import React from 'react';
import { useCurrentPage } from '../hooks';

/**
 * Return the context for the AI message.
 */
export function useAIMessageContext(): AIMessageContext {
    const currentPage = useCurrentPage();

    return React.useMemo(() => {
        return {
            location: currentPage
                ? {
                      spaceId: currentPage.spaceId,
                      pageId: currentPage.pageId,
                  }
                : undefined,
        };
    }, [currentPage]);
}

/**
 * Return the context for the AI message as a mutable React ref
 */
export function useAIMessageContextRef(): React.MutableRefObject<AIMessageContext> {
    const context = useAIMessageContext();
    const ref = React.useRef(context);

    React.useEffect(() => {
        ref.current = context;
    }, [context]);

    return ref;
}
