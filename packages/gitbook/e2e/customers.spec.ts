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
        baseUrl: 'asiksupport-stg.dto.kemkes.go.id',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'jasons-tutorials.gitbook.io',
        baseUrl: 'jasons-tutorials.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'faq.deltaemulator.com',
        baseUrl: 'faq.deltaemulator.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.dify.ai',
        baseUrl: 'docs.dify.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'seeddao.gitbook.io',
        baseUrl: 'seeddao.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'faq.altstore.io',
        baseUrl: 'faq.altstore.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'support.audacityteam.org',
        baseUrl: 'support.audacityteam.org',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.gmgn.ai',
        baseUrl: 'docs.gmgn.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.spicychat.ai',
        baseUrl: 'docs.spicychat.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.portainer.io',
        baseUrl: 'docs.portainer.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.chirptoken.io',
        baseUrl: 'docs.chirptoken.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.dexscreener.com',
        baseUrl: 'docs.dexscreener.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.pancakeswap.finance',
        baseUrl: 'docs.pancakeswap.finance',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'book.character.ai',
        baseUrl: 'book.character.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.tradeonnova.io',
        baseUrl: 'docs.tradeonnova.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'azcoiner.gitbook.io',
        baseUrl: 'azcoiner.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.midas.app',
        baseUrl: 'docs.midas.app',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.keeper.io',
        baseUrl: 'docs.keeper.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'adiblar.gitbook.io',
        baseUrl: 'adiblar.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.gradient.network',
        baseUrl: 'docs.gradient.network',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'mygate-network.gitbook.io',
        baseUrl: 'mygate-network.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'treasurenft.gitbook.io',
        baseUrl: 'treasurenft.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'browndust2.gitbook.io',
        baseUrl: 'browndust2.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'junookyo.gitbook.io',
        baseUrl: 'junookyo.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'meshnet.nordvpn.com',
        baseUrl: 'meshnet.nordvpn.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'manual.bubble.io',
        baseUrl: 'manual.bubble.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.tickettool.xyz',
        baseUrl: 'docs.tickettool.xyz',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'wiki.redmodding.org',
        baseUrl: 'wiki.redmodding.org',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.cherry-ai.com',
        baseUrl: 'docs.cherry-ai.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.snyk.io',
        baseUrl: 'docs.snyk.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'grass-foundation.gitbook.io',
        baseUrl: 'grass-foundation.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.realapp.link',
        baseUrl: 'docs.realapp.link',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.plaza.finance',
        baseUrl: 'docs.plaza.finance',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.publicai.io',
        baseUrl: 'docs.publicai.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'hyperliquid.gitbook.io',
        baseUrl: 'hyperliquid.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.umbraco.com',
        baseUrl: 'docs.umbraco.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'pies-organization.gitbook.io',
        baseUrl: 'pies-organization.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'sosovalue-white-paper.gitbook.io',
        baseUrl: 'sosovalue-white-paper.gitbook.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.revrobotics.com',
        baseUrl: 'docs.revrobotics.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'chartschool.stockcharts.com',
        baseUrl: 'chartschool.stockcharts.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.soniclabs.com',
        baseUrl: 'docs.soniclabs.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.meshchain.ai',
        baseUrl: 'docs.meshchain.ai',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.thousandeyes.com',
        baseUrl: 'docs.thousandeyes.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.raydium.io',
        baseUrl: 'docs.raydium.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.solv.finance',
        baseUrl: 'docs.solv.finance',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'help.joinsuperset.com',
        baseUrl: 'help.joinsuperset.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.fluentbit.io',
        baseUrl: 'docs.fluentbit.i',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
];

runTestCases(testCases);
