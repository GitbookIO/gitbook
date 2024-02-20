import fs from 'node:fs/promises';
import puppeteer, { Page } from 'puppeteer';
import { argosScreenshot } from '@argos-ci/puppeteer';
import { getContentTestURL, getTargetURL } from './utils';

interface Test {
    name: string;
    url: string;
    wait?: (page: Page) => Promise<any>;
}

interface TestsCase {
    name: string;
    baseUrl: string;
    tests: Array<Test>;
}

const testCases: TestsCase[] = [
    {
        name: 'GitBook',
        baseUrl: 'https://docs.gitbook.com',
        tests: [
            {
                name: 'Home',
                url: '',
            },
            {
                name: 'Search',
                url: '?q=',
            },
            {
                name: 'Search Results',
                url: '?q=gitsync',
                wait: (page) => page.waitForSelector('[data-test="search-results"]'),
            },
            {
                name: 'AI Search',
                url: '?q=What+is+GitBook%3F&ask=true',
                wait: (page) => page.waitForSelector('[data-test="search-ask-answer"]'),
            },
            {
                name: 'Not found',
                url: 'content-not-found',
            },
        ],
    },
    {
        name: 'GitBook Examples',
        baseUrl: 'https://examples.gitbook.com',
        tests: [
            {
                name: 'Landing page',
                url: '',
            },
        ],
    },
    {
        name: 'Snyk',
        baseUrl: 'https://docs.snyk.io',
        tests: [
            {
                name: 'Home',
                url: '',
            },
            {
                name: 'PDF',
                url: '~gitbook/pdf?limit=10',
            },
            // TODO: It currently crash with an error from puppeteer
            // {
            //     name: 'Encoded URL',
            //     url: 'scan-using-snyk/supported-languages-and-frameworks/c-c++',
            // },
            {
                name: 'Revision',
                url: '~/revisions/H41VQ6cIvd5hyUwcnwbC',
            },
        ],
    },
    {
        name: 'Rocket.Chat',
        baseUrl: 'https://docs.rocket.chat',
        tests: [
            {
                name: 'Home',
                url: '',
            },
            {
                name: 'PDF',
                url: '~gitbook/pdf?limit=10',
            },
        ],
    },
    {
        name: 'Commerce Layer',
        baseUrl: 'https://docs.commercelayer.io/core/',
        tests: [
            {
                name: 'Home',
                url: '',
            },
            {
                name: 'API Reference',
                url: 'v/api-reference/',
            },
        ],
    },
    {
        name: 'Naviga',
        baseUrl: 'https://docs.navigaglobal.com/naviga-dashboard-overview/',
        tests: [
            {
                name: 'Home',
                url: 'v/dashboard-5.4/',
            },
        ],
    },
    {
        name: 'Mattermost',
        baseUrl: 'https://handbook.mattermost.com/',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'Tile DB',
        baseUrl: 'https://docs.tiledb.com/main/',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'Castordoc',
        baseUrl: 'https://docs.castordoc.com/',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'Nimbleway',
        baseUrl: 'https://docs.nimbleway.com/',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'Parcellab',
        baseUrl: 'https://how.parcellab.works/docs/',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'CitrusAd',
        baseUrl: 'https://help.citrusad.com/citrus-ads/',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'ThousandEyes',
        baseUrl: 'https://docs.thousandeyes.com/',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'Content tests',
        baseUrl: 'https://gitbook.gitbook.io/test-1-1/',
        tests: [
            {
                name: 'Images',
                url: 'blocks/block-images',
            },
            {
                name: 'Inline Images',
                url: 'blocks/inline-images',
            },
            {
                name: 'Tabs',
                url: 'blocks/tabs',
            },
            {
                name: 'Expandables',
                url: 'blocks/expandables',
            },
            {
                name: 'Headings',
                url: 'blocks/headings',
            },
            {
                name: 'Marks',
                url: 'blocks/marks',
            },
            {
                name: 'Emojis',
                url: 'blocks/emojis',
            },
        ],
    },
    {
        name: 'Share links',
        baseUrl: 'https://gitbook.gitbook.io/test-share-links/',
        tests: [
            {
                name: 'Valid link',
                url: 'Fc6mMII9FKgnwm7qqynx/',
            },
            {
                name: 'Invalid link',
                url: 'invalid/',
            },
        ],
    },
];

console.log(`Starting visual testing with ${getTargetURL()}...`);

const browser = await puppeteer.launch({
    headless: 'new',
});

for (const testCase of testCases) {
    for (const test of testCase.tests) {
        const page = await browser.newPage();
        const contentUrl = new URL(test.url, testCase.baseUrl);
        const url = getContentTestURL(contentUrl.toString());
        const start = Date.now();

        console.log(`Testing ${testCase.name} - ${test.name} (${url})...`);

        const screenshotName = `${testCase.name} - ${test.name}.png`;

        try {
            await page.goto(url, { waitUntil: test.wait ? 'load' : 'networkidle2' });

            if (test.wait) {
                await test.wait(page);
            }
        } catch (error) {
            await fs.mkdir('screenshots/errors', {
                recursive: true,
            });

            await page.screenshot({ path: `screenshots/errors/${screenshotName}` });
            console.log(`❌ Failed in ${((Date.now() - start) / 1000).toFixed(2)}s`);
            throw error;
        }

        await argosScreenshot(page, screenshotName, {
            viewports: ['macbook-13', 'iphone-x', 'ipad-2'],
        });
        console.log(`✅ Done in ${((Date.now() - start) / 1000).toFixed(2)}s`);
        console.log('');
        await page.close();
    }
}
await browser.close();

console.log('All done!');
