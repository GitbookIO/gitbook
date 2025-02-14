import { runTestCases, TestsCase, waitForCookiesDialog } from './util';

const testCases: TestsCase[] = [
    {
        name: 'Snyk',
        baseUrl: 'https://docs.snyk.io',
        tests: [
            {
                name: 'Home',
                url: '/',
                run: waitForCookiesDialog,
            },
            {
                name: 'OpenAPI',
                url: '/snyk-api/reference/apps',
                run: waitForCookiesDialog,
            },
        ],
    },
];

runTestCases(testCases);
