import { type TestsCase, runTestCases, waitForCookiesDialog } from './util';

/** A list of test cases to run on the customers' docs sites. */
const testCases: TestsCase[] = [
    {
        name: 'Snyk',
        contentBaseURL: 'https://docs.snyk.io',
        tests: [
            { name: 'Home', url: '/', run: waitForCookiesDialog },
            { name: 'OpenAPI', url: '/snyk-api/reference/apps', run: waitForCookiesDialog },
        ],
    },
    // {
    //     name: 'Nexthink',
    //     contentBaseURL: 'https://docs.nexthink.com',
    //     tests: [
    //         {
    //             name: 'Home',
    //             url: '/',
    //             screenshot: { waitForTOCScrolling: false },
    //             run: waitForCookiesDialog,
    //         },
    //     ],
    // },
    {
        name: 'asiksupport-stg.dto.kemkes.go.id',
        contentBaseURL: 'https://asiksupport-stg.dto.kemkes.go.id',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'jasons-tutorials.gitbook.io',
        contentBaseURL: 'https://jasons-tutorials.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'faq.deltaemulator.com',
        contentBaseURL: 'https://faq.deltaemulator.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.dify.ai',
        contentBaseURL: 'https://docs.dify.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'seeddao.gitbook.io',
        contentBaseURL: 'https://seeddao.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'faq.altstore.io',
        contentBaseURL: 'https://faq.altstore.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'support.audacityteam.org',
        contentBaseURL: 'https://support.audacityteam.org',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.gmgn.ai',
        contentBaseURL: 'https://docs.gmgn.ai',
        tests: [{ name: 'Home', url: '/' }],
    },
    // {
    //     name: 'docs.spicychat.ai',
    //     contentBaseURL: 'https://docs.spicychat.ai',
    //     tests: [{ name: 'Home', url: '/' }],
    // },
    {
        name: 'docs.portainer.io',
        contentBaseURL: 'https://docs.portainer.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.chirptoken.io',
        contentBaseURL: 'https://docs.chirptoken.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.dexscreener.com',
        contentBaseURL: 'https://docs.dexscreener.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.pancakeswap.finance',
        contentBaseURL: 'https://docs.pancakeswap.finance',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'book.character.ai',
        contentBaseURL: 'https://book.character.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'azcoiner.gitbook.io',
        contentBaseURL: 'https://azcoiner.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.midas.app',
        contentBaseURL: 'https://docs.midas.app',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.keeper.io',
        contentBaseURL: 'https://docs.keeper.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'adiblar.gitbook.io',
        contentBaseURL: 'https://adiblar.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.gradient.network',
        contentBaseURL: 'https://docs.gradient.network',
        tests: [{ name: 'Home', url: '/' }],
    },
    // {
    //     name: 'mygate-network.gitbook.io',
    //     contentBaseURL: 'https://mygate-network.gitbook.io',
    //     tests: [{ name: 'Home', url: '/' }],
    // },
    {
        name: 'treasurenft.gitbook.io',
        contentBaseURL: 'https://treasurenft.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'browndust2.gitbook.io',
        contentBaseURL: 'https://browndust2.gitbook.io',
        tests: [{ name: 'Home', url: '/', screenshot: { waitForTOCScrolling: false } }],
    },
    {
        name: 'junookyo.gitbook.io',
        contentBaseURL: 'https://junookyo.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'meshnet.nordvpn.com',
        contentBaseURL: 'https://meshnet.nordvpn.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'manual.bubble.io',
        contentBaseURL: 'https://manual.bubble.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.tickettool.xyz',
        contentBaseURL: 'https://docs.tickettool.xyz',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'wiki.redmodding.org',
        contentBaseURL: 'https://wiki.redmodding.org',
        tests: [{ name: 'Home', url: '/' }],
    },
    // {
    //     name: 'docs.cherry-ai.com',
    //     contentBaseURL: 'https://docs.cherry-ai.com',
    //     tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    // },
    {
        name: 'docs.snyk.io',
        contentBaseURL: 'https://docs.snyk.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.realapp.link',
        contentBaseURL: 'https://docs.realapp.link',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.plaza.finance',
        contentBaseURL: 'https://docs.plaza.finance',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.publicai.io',
        contentBaseURL: 'https://docs.publicai.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'hyperliquid.gitbook.io',
        contentBaseURL: 'https://hyperliquid.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.umbraco.com',
        contentBaseURL: 'https://docs.umbraco.com',
        tests: [
            {
                name: 'Home',
                url: '/welcome',
                run: waitForCookiesDialog,
                screenshot: { waitForTOCScrolling: false },
            },
        ],
    },
    {
        name: 'sosovalue-white-paper.gitbook.io',
        contentBaseURL: 'https://sosovalue-white-paper.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    // {
    //     name: 'docs.revrobotics.com',
    //     contentBaseURL: 'https://docs.revrobotics.com',
    //     tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    // },
    {
        name: 'chartschool.stockcharts.com',
        contentBaseURL: 'https://chartschool.stockcharts.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.soniclabs.com',
        contentBaseURL: 'https://docs.soniclabs.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.meshchain.ai',
        contentBaseURL: 'https://docs.meshchain.ai',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.thousandeyes.com',
        contentBaseURL: 'https://docs.thousandeyes.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.raydium.io',
        contentBaseURL: 'https://docs.raydium.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.fluentbit.io',
        contentBaseURL: 'https://docs.fluentbit.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'run-ai-docs.nvidia.com',
        contentBaseURL: 'https://run-ai-docs.nvidia.com',
        skip: process.env.ARGOS_BUILD_NAME !== 'customers-v2',
        tests: [
            { name: 'Home', url: '/' },
            { name: 'OG Image', url: '/~gitbook/ogimage/h17zQIFwy3MaafVNmItO', mode: 'image' },
        ],
    },
];

runTestCases(testCases);
