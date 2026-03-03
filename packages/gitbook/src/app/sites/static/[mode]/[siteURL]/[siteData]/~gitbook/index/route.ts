import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';

export const revalidate = 86400; // 1 day

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context, token, visitorAuthClaims } = await getStaticSiteContext(await params);
    const { organizationId, site } = context;
    console.log('Fetching static index for site', site.id, token);
    // TODO: Obviously switch to real API client 
    const result = await fetch(`http://localhost:6100/v1/orgs/${organizationId}/sites/${site.id}/index`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    if (!result.ok) {
        return new Response('Error fetching index', { status: 500 });
    }
    const index = await result.json();
    console.log('Fetched index for site', site.id, JSON.stringify(index).length, 'bytes', visitorAuthClaims, result.headers);
    return new Response(JSON.stringify(index), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
