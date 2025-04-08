import jwt from 'jsonwebtoken';
import { type TestsCase, runTestCases } from './util';

/**
 * This test suite is designed to run tests for the site subdirectory
 * feature using a proxy.
 */
const testCases: TestsCase[] = [
    {
        name: 'Site subdirectory (proxy)',
        skip:
            process.env.ARGOS_BUILD_NAME !== 'v2-vercel' &&
            typeof process.env.X_FORWARDED_HOST === 'undefined',
        contentBaseURL: 'https://nextjs-gbo-proxy.vercel.app/documentation/',
        tests: [
            {
                name: 'Main',
                url: '',
                fullPage: true,
            },
        ],
    },
    {
        name: 'Site subdirectory (proxy) with VA',
        skip:
            process.env.ARGOS_BUILD_NAME !== 'v2-vercel' &&
            typeof process.env.X_FORWARDED_HOST === 'undefined',
        contentBaseURL: 'https://nextjs-gbo-proxy-va.vercel.app/va/docs/',
        tests: [
            {
                name: 'Main',
                url: () => {
                    const privateKey =
                        'rqSfA6x7eAKx1qDRCDq9aCXwivpUvQ8YkXeDdFvCCUa9QchIcM7pF1iJ4o7AGOU49spmOWjKoIPtX0pVUVQ81w==';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `?jwt_token=${token}`;
                },
                fullPage: true,
            },
        ],
    },
];

runTestCases(testCases);
