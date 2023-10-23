import React from 'react';

import { NextRequest, ImageResponse } from 'next/server';
import { PageIdParams, fetchPageData } from '../../../fetch';

export const runtime = 'edge';

/**
 * Render the OpenGraph image for a space.
 */
export async function GET(req: NextRequest, { params }: { params: PageIdParams }) {
    const { space, page } = await fetchPageData(params);

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                }}
            >
                <div tw="bg-gray-50 flex flex-1">
                    <div tw="flex flex-col w-full py-16 px-14">
                        <h2 tw="text-7xl font-bold tracking-tight text-gray-900 text-left">
                            {space.title}
                        </h2>
                        <p tw="text-4xl text-indigo-600">{page ? page.title : 'Not found'}</p>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
