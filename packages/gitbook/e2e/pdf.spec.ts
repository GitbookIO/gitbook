import { argosScreenshot } from '@argos-ci/playwright';
import { expect, test } from '@playwright/test';
import { getContentTestURL } from '../tests/utils';
import { waitForIcons } from './util';

test.describe('PDF export', () => {
    test('export all pages as PDF (e2e)', async ({ page }) => {
        // Set the header to disable the Vercel toolbar
        // But only on the main document as it'd cause CORS issues on other resources
        await page.route('**/*', async (route, request) => {
            if (request.resourceType() === 'document') {
                await route.continue({
                    headers: {
                        ...request.headers(),
                        'x-vercel-skip-toolbar': '1',
                    },
                });
            } else {
                await route.continue();
            }
        });

        await page.goto(
            getContentTestURL(
                'https://gitbook-open-e2e-sites.gitbook.io/gitbook-doc/~gitbook/pdf?limit=10'
            )
        );

        const printBtn = page.getByTestId('print-button');
        await expect(printBtn).toBeVisible();

        await argosScreenshot(page, 'pdf - all pages', {
            viewports: ['macbook-13'],
            argosCSS: `
                            /* Hide Intercom */
                            .intercom-lightweight-app {
                                display: none !important;
                            }
                            `,
            threshold: undefined,
            fullPage: true,
            beforeScreenshot: async ({ runStabilization }) => {
                await runStabilization();
                await waitForIcons(page);
            },
        });
    });

    test('export all pages as PDF (GitBook docs)', async ({ page }) => {
        // Set the header to disable the Vercel toolbar
        // But only on the main document as it'd cause CORS issues on other resources
        await page.route('**/*', async (route, request) => {
            if (request.resourceType() === 'document') {
                await route.continue({
                    headers: {
                        ...request.headers(),
                        'x-vercel-skip-toolbar': '1',
                    },
                });
            } else {
                await route.continue();
            }
        });

        await page.goto(getContentTestURL('https://gitbook.com/docs/~gitbook/pdf?limit=10'));

        const printBtn = page.getByTestId('print-button');
        await expect(printBtn).toBeVisible();

        await argosScreenshot(page, 'pdf - all pages', {
            viewports: ['macbook-13'],
            argosCSS: `
                            /* Hide Intercom */
                            .intercom-lightweight-app {
                                display: none !important;
                            }
                            `,
            threshold: undefined,
            fullPage: true,
            beforeScreenshot: async ({ runStabilization }) => {
                await runStabilization();
                await waitForIcons(page);
            },
        });
    });

    test('export a single page as PDF (e2e)', async ({ page }) => {
        // Set the header to disable the Vercel toolbar
        // But only on the main document as it'd cause CORS issues on other resources
        await page.route('**/*', async (route, request) => {
            if (request.resourceType() === 'document') {
                await route.continue({
                    headers: {
                        ...request.headers(),
                        'x-vercel-skip-toolbar': '1',
                    },
                });
            } else {
                await route.continue();
            }
        });

        await page.goto(
            getContentTestURL(
                'https://gitbook-open-e2e-sites.gitbook.io/gitbook-doc/~gitbook/pdf?page=Bw7LjWwgTjV8nIV4s7rs&only=yes&limit=2'
            )
        );

        const printBtn = page.getByTestId('print-button');
        await expect(printBtn).toBeVisible();

        await argosScreenshot(page, 'pdf - all pages', {
            viewports: ['macbook-13'],
            argosCSS: `
                            /* Hide Intercom */
                            .intercom-lightweight-app {
                                display: none !important;
                            }
                            `,
            threshold: undefined,
            fullPage: true,
            beforeScreenshot: async ({ runStabilization }) => {
                await runStabilization();
                await waitForIcons(page);
            },
        });
    });

    test('export a single page as PDF (GitBook docs)', async ({ page }) => {
        // Set the header to disable the Vercel toolbar
        // But only on the main document as it'd cause CORS issues on other resources
        await page.route('**/*', async (route, request) => {
            if (request.resourceType() === 'document') {
                await route.continue({
                    headers: {
                        ...request.headers(),
                        'x-vercel-skip-toolbar': '1',
                    },
                });
            } else {
                await route.continue();
            }
        });

        await page.goto(
            getContentTestURL(
                'https://gitbook.com/docs/~gitbook/pdf?page=DfnNkU49mvLe2ythHAyx&only=yes&limit=2'
            )
        );

        const printBtn = page.getByTestId('print-button');
        await expect(printBtn).toBeVisible();

        await argosScreenshot(page, 'pdf - all pages', {
            viewports: ['macbook-13'],
            argosCSS: `
                            /* Hide Intercom */
                            .intercom-lightweight-app {
                                display: none !important;
                            }
                            `,
            threshold: undefined,
            fullPage: true,
            beforeScreenshot: async ({ runStabilization }) => {
                await runStabilization();
                await waitForIcons(page);
            },
        });
    });
});
