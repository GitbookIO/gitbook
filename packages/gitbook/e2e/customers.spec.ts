import { runTestCases, TestsCase, waitForCookiesDialog } from './util';

/** A list of test cases to run on the customers' docs sites. */
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
    {
        name: 'Nexthink',
        baseUrl: 'https://docs.nexthink.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'asiksupport-stg.dto.kemkes.go.id',
        baseUrl: 'https://asiksupport-stg.dto.kemkes.go.id',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'jasons-tutorials.gitbook.io',
        baseUrl: 'https://jasons-tutorials.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'faq.deltaemulator.com',
        baseUrl: 'https://faq.deltaemulator.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.dify.ai',
        baseUrl: 'https://docs.dify.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'seeddao.gitbook.io',
        baseUrl: 'https://seeddao.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'faq.altstore.io',
        baseUrl: 'https://faq.altstore.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'support.audacityteam.org',
        baseUrl: 'https://support.audacityteam.org',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.gmgn.ai',
        baseUrl: 'https://docs.gmgn.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.spicychat.ai',
        baseUrl: 'https://docs.spicychat.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.portainer.io',
        baseUrl: 'https://docs.portainer.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.chirptoken.io',
        baseUrl: 'https://docs.chirptoken.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.dexscreener.com',
        baseUrl: 'https://docs.dexscreener.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.pancakeswap.finance',
        baseUrl: 'https://docs.pancakeswap.finance',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'book.character.ai',
        baseUrl: 'https://book.character.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.tradeonnova.io',
        baseUrl: 'https://docs.tradeonnova.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'azcoiner.gitbook.io',
        baseUrl: 'https://azcoiner.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.midas.app',
        baseUrl: 'https://docs.midas.app',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.keeper.io',
        baseUrl: 'https://docs.keeper.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'adiblar.gitbook.io',
        baseUrl: 'https://adiblar.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.gradient.network',
        baseUrl: 'https://docs.gradient.network',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'mygate-network.gitbook.io',
        baseUrl: 'https://mygate-network.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'treasurenft.gitbook.io',
        baseUrl: 'https://treasurenft.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'browndust2.gitbook.io',
        baseUrl: 'https://browndust2.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'junookyo.gitbook.io',
        baseUrl: 'https://junookyo.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'meshnet.nordvpn.com',
        baseUrl: 'https://meshnet.nordvpn.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'manual.bubble.io',
        baseUrl: 'https://manual.bubble.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.tickettool.xyz',
        baseUrl: 'https://docs.tickettool.xyz',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'wiki.redmodding.org',
        baseUrl: 'https://wiki.redmodding.org',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.cherry-ai.com',
        baseUrl: 'https://docs.cherry-ai.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.snyk.io',
        baseUrl: 'https://docs.snyk.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'grass-foundation.gitbook.io',
        baseUrl: 'https://grass-foundation.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.realapp.link',
        baseUrl: 'https://docs.realapp.link',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.plaza.finance',
        baseUrl: 'https://docs.plaza.finance',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.publicai.io',
        baseUrl: 'https://docs.publicai.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'hyperliquid.gitbook.io',
        baseUrl: 'https://hyperliquid.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.umbraco.com',
        baseUrl: 'https://docs.umbraco.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'pies-organization.gitbook.io',
        baseUrl: 'https://pies-organization.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'sosovalue-white-paper.gitbook.io',
        baseUrl: 'https://sosovalue-white-paper.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.revrobotics.com',
        baseUrl: 'https://docs.revrobotics.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'chartschool.stockcharts.com',
        baseUrl: 'https://chartschool.stockcharts.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.soniclabs.com',
        baseUrl: 'https://docs.soniclabs.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.meshchain.ai',
        baseUrl: 'https://docs.meshchain.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.thousandeyes.com',
        baseUrl: 'https://docs.thousandeyes.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.raydium.io',
        baseUrl: 'https://docs.raydium.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.solv.finance',
        baseUrl: 'https://docs.solv.finance',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'help.joinsuperset.com',
        baseUrl: 'https://help.joinsuperset.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.fluentbit.io',
        baseUrl: 'https://docs.fluentbit.i',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
];

runTestCases(testCases);
