import type { RouteLayoutParams } from '@/app/utils';
import type { NextRequest } from 'next/server';
import { handleMcpRequest } from '../handler';

async function handler(
    rawRequest: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    return handleMcpRequest(rawRequest, await params, '~gitbook/mcp/auth');
}

export { handler as GET, handler as POST };
