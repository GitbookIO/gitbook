import React from 'react';
import { redirect } from 'next/navigation';
import { NextRequest, ImageResponse } from 'next/server';
import { PageIdParams, fetchPageData } from '../../../fetch';

export const runtime = 'edge';

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
