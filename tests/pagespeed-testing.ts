import psi from 'psi';

import { getContentTestURL, getTargetURL } from './utils';

interface Test {
    url: string;
    strategy: 'mobile' | 'desktop';
    threshold: number;
}

const tests: Array<Test> = [
    {
        url: 'https://docs.gitbook.com',
        strategy: 'desktop',
        threshold: 90,
    },

    {
        url: 'https://docs.gitbook.com',
        strategy: 'mobile',
        threshold: 80,
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
