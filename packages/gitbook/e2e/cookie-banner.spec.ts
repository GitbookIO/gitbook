import { expect } from '@playwright/test';

import { type TestsCase, getCustomizationURL, runTestCases } from './util';

const testCases: TestsCase[] = [
    {
        name: 'Cookie Banner',
        contentBaseURL: 'https://gitbook.com/docs/',
        tests: [
            {
                name: 'should show built-in banner when no custom banner is registered',
                url: getCustomizationURL({
                    privacyPolicy: {
                        url: 'https://policies.gitbook.com/privacy/cookies',
                    },
                }),
                screenshot: false,
                run: async (page) => {
                    // Check that built-in banner is visible
                    const dialog = page.getByTestId('cookies-dialog');
                    await expect(dialog).toBeVisible({ timeout: 5000 });
                },
            },
            {
                name: 'should not show built-in banner when custom banner is registered',
                url: getCustomizationURL({
                    privacyPolicy: {
                        url: 'https://policies.gitbook.com/privacy/cookies',
                    },
                }),
                screenshot: false,
                run: async (page) => {
                    // Register a custom cookie banner handler
                    await page.waitForFunction(() => {
                        return typeof window !== 'undefined' && window.GitBook !== undefined;
                    });
                    await page.evaluate(() => {
                        window.GitBook?.registerCookieBanner(({ onApprove }) => {
                            // Custom cookie banner handler - just approve for testing
                            onApprove();
                        });
                    });

                    // Check that built-in banner is not visible
                    const dialog = page.getByTestId('cookies-dialog');
                    await expect(dialog).not.toBeVisible({ timeout: 5000 });
                },
            },
        ],
    },
];

runTestCases(testCases);
