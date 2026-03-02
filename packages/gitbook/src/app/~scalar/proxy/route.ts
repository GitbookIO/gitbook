import { handleOpenAPIProxyOptions, handleOpenAPIProxyRequest } from '@/routes/openapi-proxy';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return handleOpenAPIProxyRequest(request);
}

export async function POST(request: NextRequest) {
    return handleOpenAPIProxyRequest(request);
}

export async function PUT(request: NextRequest) {
    return handleOpenAPIProxyRequest(request);
}

export async function DELETE(request: NextRequest) {
    return handleOpenAPIProxyRequest(request);
}

export async function PATCH(request: NextRequest) {
    return handleOpenAPIProxyRequest(request);
}

export async function HEAD(request: NextRequest) {
    return handleOpenAPIProxyRequest(request);
}

export async function OPTIONS() {
    return handleOpenAPIProxyOptions();
}
