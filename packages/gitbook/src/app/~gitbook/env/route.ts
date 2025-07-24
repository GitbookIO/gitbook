import { type NextRequest, NextResponse } from 'next/server';

import {
    GITBOOK_API_PUBLIC_URL,
    GITBOOK_API_TOKEN,
    GITBOOK_API_URL,
    GITBOOK_APP_URL,
    GITBOOK_ASSETS_URL,
    GITBOOK_DISABLE_TRACKING,
    GITBOOK_FONTS_URL,
    GITBOOK_ICONS_URL,
    GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
    GITBOOK_INTEGRATIONS_HOST,
    GITBOOK_SECRET,
    GITBOOK_URL,
    GITBOOK_USER_AGENT,
} from '@/lib/env';

/**
 * Output the public environment variables for this deployment
 */
export async function GET(_req: NextRequest) {
    return NextResponse.json({
        GITBOOK_URL,
        GITBOOK_APP_URL,
        GITBOOK_API_URL,
        GITBOOK_API_PUBLIC_URL,
        GITBOOK_ASSETS_URL,
        GITBOOK_FONTS_URL,
        GITBOOK_ICONS_URL,
        GITBOOK_USER_AGENT,
        GITBOOK_INTEGRATIONS_HOST,
        GITBOOK_DISABLE_TRACKING,

        // Secret envs
        GITBOOK_SECRET: !!GITBOOK_SECRET,
        GITBOOK_API_TOKEN: !!GITBOOK_API_TOKEN,
        GITBOOK_IMAGE_RESIZE_SIGNING_KEY: !!GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
    });
}
