import psi from 'psi';

import { getContentTestURL, getTargetURL } from './utils';

interface Test {
    url: string;
    strategy: 'mobile' | 'desktop';
    threshold: number;
}

// We use low values for now to avoid failing the tests
// and to be able to see the results, and only catch major regressions.
const tests: Array<Test> = [
    {
        url: 'https://docs.gitbook.com',
        strategy: 'desktop',
        threshold: 60,
    },

    {
        url: 'https://docs.gitbook.com',
        strategy: 'mobile',
        threshold: 30,
    },
];

console.log(`Starting PageSpeed testing with ${getTargetURL()}...`);

for (const test of tests) {
    const url = getContentTestURL(test.url);

    console.log(`Testing ${url} on ${test.strategy}...`);
    await psi.output(url, {
        strategy: test.strategy,
        threshold: test.threshold,
        key: process.env.PAGESPEED_API_KEY,
    });

    console.log('');
}
