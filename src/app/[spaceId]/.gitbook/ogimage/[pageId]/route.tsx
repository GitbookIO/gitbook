import React from 'react';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { PageIdParams, fetchPageData } from '../../../fetch';

// Should be edge, but there is an error with the middleware
// https://github.com/vercel/next.js/issues/48295
export const runtime = 'nodejs';

/**
 * Render the OpenGraph image for a space.
 */
export async function GET(req: NextRequest, { params }: { params: PageIdParams }) {
    const { space, page, customization } = await fetchPageData(params);
    const url = new URL(space.urls.published);

    if (customization.socialPreview.url) {
        // If user configured a custom social preview, we redirect to it.
        redirect(customization.socialPreview.url);
    }

    return new ImageResponse(
        (
            <div
                tw="bg-gray-50 py-16 px-14"
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <h2 tw="text-7xl font-bold tracking-tight text-gray-900 text-left">
                    {space.title}
                </h2>
                <div tw="flex flex-1">
                    <p tw="text-4xl text-indigo-600">{page ? page.title : 'Not found'}</p>
                </div>
                <div tw="flex">
                    <p tw="text-4xl text-slate-500">
                        {url.hostname + (url.pathname.length > 1 ? url.pathname : '')}
                    </p>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
