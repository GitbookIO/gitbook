import { createLogger } from '@/lib/logger';
import { cache } from 'react';

const getRequestId = (fallbackRequestId?: string) => {
    // We are in OpenNext and we should have access to the request ID.
    if ((globalThis as any).__openNextAls) {
        return (globalThis as any).__openNextAls.getStore()?.requestId;
    }
    return fallbackRequestId;
};

// We don't want to use react cache in the edge runtime, so we use a different logger creation method.
// It is treeshaken by Next.js.
export const getLogger =
    process.env.NEXT_RUNTIME === 'edge'
        ? () =>
              createLogger('GBO', {
                  requestId: getRequestId(),
              })
        : cache(() => {
              // This is not cryptographically secure, but it's fine for logging purposes.
              // It allows us to identify logs from the same request.
              const requestId = getRequestId(Math.random().toString(36).substring(2, 15));
              return createLogger('GBOV2', { requestId });
          });
