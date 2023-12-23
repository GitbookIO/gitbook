import puppeteer from 'puppeteer';
import { argosScreenshot } from '@argos-ci/puppeteer';
import { getContentTestURL, getTargetURL } from './utils';

interface Test {
    name: string;
    url: string;
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
            },
            {
                name: 'AI Search',
                url: '?q=What+is+GitBook%3F&ask=1',
            },
            {
                name: 'Not found',
                url: 'content-not-found',
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
];

console.log(`Starting visual testing with ${getTargetURL()}...`);

const browser = await puppeteer.launch({
    headless: 'new',
});
const page = await browser.newPage();

for (const testCase of testCases) {
    for (const test of testCase.tests) {
        const contentUrl = new URL(test.url, testCase.baseUrl);
        const url = getContentTestURL(contentUrl.toString());
        const start = Date.now();

        console.log(`Testing ${testCase.name} - ${test.name} (${url})...`);

        await page.goto(url, { waitUntil: 'networkidle2' });

        await argosScreenshot(page, `${testCase.name} - ${test.name}.png`, {
            viewports: ['iphone-x', 'ipad-2', 'macbook-13'],
        });
        console.log(`✅ Done in ${((Date.now() - start) / 1000).toFixed(2)}s`);
        console.log('');
    }
}
await page.close();
await browser.close();

console.log('All done!');
