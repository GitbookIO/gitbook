import { type NextRequest, NextResponse } from 'next/server';

import { getIconSymbol } from '@/lib/icons/symbols';

function getSymbolId(style: string, icon: string) {
    const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');
    return `gb-icon-${sanitize(style)}-${sanitize(icon)}`;
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ style: string; icon: string }> }
) {
    const { style, icon } = await params;
    const symbol = await getIconSymbol(style, icon, getSymbolId(style, icon));

    if (!symbol) {
        return NextResponse.json(
            {
                error: 'Symbol not found',
            },
            { status: 404 }
        );
    }

    return new NextResponse(symbol.document, {
        headers: {
            'content-type': 'image/svg+xml; charset=utf-8',
            'cache-control': 'public, max-age=31536000, immutable',
        },
    });
}
