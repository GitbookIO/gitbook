import { type NextRequest, NextResponse } from 'next/server';

import { getIconSymbol } from '@/lib/icons/symbols';
import { getIconSymbolId } from '@gitbook/icons';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ style: string; icon: string }> }
) {
    const { style, icon } = await params;
    const symbol = await getIconSymbol(style, icon, getIconSymbolId(style, icon));

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
