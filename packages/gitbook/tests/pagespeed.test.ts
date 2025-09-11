import { it } from 'bun:test';
import psi from 'psi';

import { getContentTestURL } from './utils';

interface Test {
    url: string;
    strategy: 'mobile' | 'desktop';
    threshold: number;
}

// We use low values for now to avoid failing the tests
// and to be able to see the results, and only catch major regressions.
const tests: Array<Test> = [
    {
        url: 'https://gitbook.com/docs',
        strategy: 'desktop',
        threshold: 60,
    },

    {
        url: 'https://gitbook.com/docs',
        strategy: 'mobile',
        threshold: 30,
    },
];

for (const test of tests) {
    if (!process.env.PAGESPEED_API_KEY && !process.env.CI) {
        continue;
    }

    it(`${test.url} - ${test.strategy}`, async () => {
        const url = getContentTestURL(test.url);
        await psi.output(url, {
            strategy: test.strategy,
            threshold: test.threshold,
            key: process.env.PAGESPEED_API_KEY,
        });
    });
}
