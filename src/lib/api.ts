import 'server-only';

import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { ContentVisibility, GitBookAPI, JSONDocument } from '@gitbook/api';

/**
 * Create an API client for the current request.
 */
export function api(): GitBookAPI {
    const headersList = headers();
    const apiToken = headersList.get('x-gitbook-token');

    const gitbook = new GitBookAPI({
        authToken: apiToken || process.env.GITBOOK_TOKEN,
        endpoint: process.env.GITBOOK_API_URL,
    });

    return gitbook;
}

/**
 * Get a space by its ID.
 */
export const getSpace = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().spaces.getSpaceById(spaceId);
        return data;
    },
    ['api', 'spaces'],
    {
        tags: ['api', 'spaces'],
    },
);

/**
 * Get the current revision of a space
 */
export const getCurrentRevision = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().spaces.getCurrentRevision(spaceId);
        return data;
    },
    ['api', 'revisions'],
    {
        tags: ['api', 'revisions'],
    },
);

/**
 * Get the document for a page.
 */
export const getPageDocument = unstable_cache(
    async (spaceId: string, revisionId: string, pageId: string) => {
        const { data } = await api().spaces.getPageInRevisionById(spaceId, revisionId, pageId);
        // @ts-ignore
        return data.document as JSONDocument;
    },
    ['api', 'documents'],
    {
        tags: ['api', 'documents'],
    },
);

/**
 * Get the customization settings for a space.
 */
export const getSpaceCustomization = unstable_cache(
    async (spaceId: string) => {
        // TODO: use function from API client once updated
        try {
            throw new Error('test');
            const { data } = await api().request({
                method: 'GET',
                path: `/spaces/${spaceId}/publishing/customization`,
                secure: true,
                format: 'json',
            });
            return data;
        } catch (error) {
            // TODO: remove hardcoded value as soon as we ship the PAI
            return {
                inherit: false,
                internationalization: { inherit: false, locale: 'en' },
                styling: {
                    font: 'Inter',
                    corners: 'rounded',
                    primaryColor: { light: '#b93d92', dark: '#346DDB' },
                },
                favicon: {
                    emoji: '1f525',
                },
                header: {
                    preset: 'bold',
                    // logo: {
                    //     light: 'https://mintlify.s3-us-west-1.amazonaws.com/flatfileinc/logo/light.svg',
                    //     dark: 'https://mintlify.s3-us-west-1.amazonaws.com/flatfileinc/logo/dark.svg',
                    // },
                    links: [
                        {
                            links: [
                                {
                                    to: { kind: 'url', url: 'https://www.google.com' },
                                    title: 'Sub-link',
                                },
                                {
                                    to: { kind: 'url', url: 'https://www.google.com' },
                                    title: 'Sub-link 2',
                                },
                            ],
                            to: { kind: 'url', url: 'https://www.google.fr' },
                            title: 'Link 1',
                        },
                        {
                            links: [],
                            to: { kind: 'url', url: 'https://www.google.com' },
                            title: 'Link 2',
                        },
                    ],
                },
                footer: {
                    copyright: 'GitBook 2023',
                    logo: {
                        light: 'https://mintlify.s3-us-west-1.amazonaws.com/flatfileinc/logo/light.svg',
                        dark: 'https://mintlify.s3-us-west-1.amazonaws.com/flatfileinc/logo/dark.svg',
                    },
                    groups: [
                        {
                            title: 'Group 1',
                            links: [
                                {
                                    to: { kind: 'url', url: 'https://www.google.com' },
                                    title: 'Sub-link 1',
                                },
                                {
                                    to: { kind: 'url', url: 'https://www.google.com' },
                                    title: 'Sub-link 2',
                                },
                            ],
                        },
                        {
                            title: 'Group 2',
                            links: [
                                {
                                    to: { kind: 'url', url: 'https://www.google.com' },
                                    title: 'Sub-link 3',
                                },
                                {
                                    to: { kind: 'url', url: 'https://www.google.com' },
                                    title: 'Sub-link 4',
                                },
                            ],
                        },
                    ],
                },
                themes: { default: 'light', toggeable: true },
                trademark: { enabled: true },
                feedback: { enabled: false },
                pdf: { enabled: false },
                aiSearch: { enabled: false },
                pagination: { enabled: false },
                privacyPolicy: {},
                socialPreview: {},
                git: { showEditLink: false },
            };
        }
    },
    ['api', 'customization'],
    {
        tags: ['api', 'customization'],
    },
);

/**
 * Get the infos about a collection by its ID.
 */
export const getCollection = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().collections.getCollectionById(spaceId);
        return data;
    },
    ['api', 'collections'],
    {
        tags: ['api', 'collections'],
    },
);

/**
 * List all the spaces variants published in a collection.
 */
export const getCollectionSpaces = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().collections.listSpacesInCollectionById(spaceId);
        // TODO: do this filtering on the API side
        return data.items.filter((space) => space.visibility === ContentVisibility.InCollection);
    },
    ['api', 'collections', 'spaces'],
    {
        tags: ['api', 'collections'],
    },
);
