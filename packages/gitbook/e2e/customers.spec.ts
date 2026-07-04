import { type TestsCase, runTestCases, waitForCookiesDialog } from './util';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const CLOSED_ONETRUST_COOKIE_BANNER = [
    {
        name: '__gitbook_cookie_granted',
        value: 'no',
    },
    {
        name: 'OptanonAlertBoxClosed',
        value: new Date(Date.now() - ONE_HOUR_IN_MS).toISOString(),
    },
];

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
    {
        name: 'Nexthink',
        contentBaseURL: 'https://docs.nexthink.com',
        tests: [
            {
                name: 'Home',
                url: '/',
                screenshot: { waitForTOCScrolling: false },
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'asiksupport-stg.dto.kemkes.go.id',
        contentBaseURL: 'https://asiksupport-stg.dto.kemkes.go.id',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'faq.deltaemulator.com',
        contentBaseURL: 'https://faq.deltaemulator.com',
        tests: [{ name: 'Home', url: '/' }],
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
        name: 'adiblar.gitbook.io',
        contentBaseURL: 'https://adiblar.gitbook.io',
        tests: [{ name: 'Home', url: '/' }],
    },
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
    {
        name: 'docs.realapp.link',
        contentBaseURL: 'https://docs.realapp.link',
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
    {
        name: 'chartschool.stockcharts.com',
        contentBaseURL: 'https://chartschool.stockcharts.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.soniclabs.com',
        contentBaseURL: 'https://docs.soniclabs.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
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
        tests: [
            {
                name: 'Home',
                url: '/',
                cookies: CLOSED_ONETRUST_COOKIE_BANNER,
            },
            { name: 'OG Image', url: '/~gitbook/ogimage/h17zQIFwy3MaafVNmItO', mode: 'image' },
        ],
    },

    // Additional customer docs sites.
    {
        name: 'unsloth.ai/docs',
        contentBaseURL: 'https://unsloth.ai',
        tests: [{ name: 'Home', url: '/docs', run: waitForCookiesDialog }],
    },
    {
        name: 'mariadb.com/docs',
        contentBaseURL: 'https://mariadb.com',
        tests: [{ name: 'Home', url: '/docs' }],
    },
    {
        name: 'docs.n8n.io',
        contentBaseURL: 'https://docs.n8n.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.cherry-ai.com',
        contentBaseURL: 'https://docs.cherry-ai.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'library.zoom.com',
        contentBaseURL: 'https://library.zoom.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'help.verkada.com',
        contentBaseURL: 'https://help.verkada.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.overleaf.com',
        contentBaseURL: 'https://docs.overleaf.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'wiki.tiltedphoques.com/tilted-online',
        contentBaseURL: 'https://wiki.tiltedphoques.com',
        tests: [{ name: 'Home', url: '/tilted-online' }],
    },
    {
        name: 'handbook.musescore.org',
        contentBaseURL: 'https://handbook.musescore.org',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'kakaobusiness.gitbook.io/main',
        contentBaseURL: 'https://kakaobusiness.gitbook.io',
        tests: [{ name: 'Home', url: '/main' }],
    },
    {
        name: 'docs.maestro.dev',
        contentBaseURL: 'https://docs.maestro.dev',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'developers.oxylabs.io',
        contentBaseURL: 'https://developers.oxylabs.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.parallels.com/landing',
        contentBaseURL: 'https://docs.parallels.com',
        tests: [{ name: 'Home', url: '/landing', run: waitForCookiesDialog }],
    },
    {
        name: 'help.impact.com',
        contentBaseURL: 'https://help.impact.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.9proxy.com',
        contentBaseURL: 'https://docs.9proxy.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'vimeo.com/legal',
        contentBaseURL: 'https://vimeo.com',
        tests: [{ name: 'Home', url: '/legal' }],
    },
    {
        name: 'help.platipomiru.com',
        contentBaseURL: 'https://help.platipomiru.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'help.aikido.dev',
        contentBaseURL: 'https://help.aikido.dev',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'doc.demarche.numerique.gouv.fr',
        contentBaseURL: 'https://doc.demarche.numerique.gouv.fr',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.adapta.org',
        contentBaseURL: 'https://docs.adapta.org',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'www.xabuxa.com',
        contentBaseURL: 'https://www.xabuxa.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.triumpharcade.com',
        contentBaseURL: 'https://docs.triumpharcade.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.nats.io',
        contentBaseURL: 'https://docs.nats.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'help.glpi-project.org',
        contentBaseURL: 'https://help.glpi-project.org',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.waydro.id',
        contentBaseURL: 'https://docs.waydro.id',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'bellingcat.gitbook.io/toolkit',
        contentBaseURL: 'https://bellingcat.gitbook.io',
        tests: [{ name: 'Home', url: '/toolkit' }],
    },
    {
        name: 'wiki.project-fika.com',
        contentBaseURL: 'https://wiki.project-fika.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.pinot.apache.org',
        contentBaseURL: 'https://docs.pinot.apache.org',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.devolutions.net',
        contentBaseURL: 'https://docs.devolutions.net',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'guides.gresb.com',
        contentBaseURL: 'https://guides.gresb.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.prestashop-project.org/welcome',
        contentBaseURL: 'https://docs.prestashop-project.org',
        tests: [{ name: 'Home', url: '/welcome' }],
    },
    {
        name: 'help.researchgate.net',
        contentBaseURL: 'https://help.researchgate.net',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.verifone.com',
        contentBaseURL: 'https://docs.verifone.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.roboflow.com',
        contentBaseURL: 'https://docs.roboflow.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'www.netexec.wiki',
        contentBaseURL: 'https://www.netexec.wiki',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'guide.strikepack.com',
        contentBaseURL: 'https://guide.strikepack.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'gitbook.com/docs',
        contentBaseURL: 'https://gitbook.com',
        tests: [
            { name: 'Home', url: '/docs', run: waitForCookiesDialog },
            {
                name: 'OpenAPI',
                url: '/docs/developers/gitbook-api/api-reference/docs-sites/site-ai-ask',
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'documentation.gravitee.io',
        contentBaseURL: 'https://documentation.gravitee.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'faq.wanttopay.net/wanttopay-app',
        contentBaseURL: 'https://faq.wanttopay.net',
        tests: [{ name: 'Home', url: '/wanttopay-app', run: waitForCookiesDialog }],
    },
    {
        name: 'guide.prismlive.com',
        contentBaseURL: 'https://guide.prismlive.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.ionos.com/cloud',
        contentBaseURL: 'https://docs.ionos.com',
        tests: [{ name: 'Home', url: '/cloud' }],
    },
    {
        name: 'support.evite.com',
        contentBaseURL: 'https://support.evite.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'knowledge.illumina.com',
        contentBaseURL: 'https://knowledge.illumina.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'wiki.retrobat.org',
        contentBaseURL: 'https://wiki.retrobat.org',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'wiki.polymaker.com',
        contentBaseURL: 'https://wiki.polymaker.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.ducks-services.com',
        contentBaseURL: 'https://docs.ducks-services.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.hex-rays.com',
        contentBaseURL: 'https://docs.hex-rays.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'whitepaper.interlinklabs.ai',
        contentBaseURL: 'https://whitepaper.interlinklabs.ai',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'help.openloyalty.io',
        contentBaseURL: 'https://help.openloyalty.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'retrozia.gitbook.io/retrozia',
        contentBaseURL: 'https://retrozia.gitbook.io',
        tests: [{ name: 'Home', url: '/retrozia' }],
    },
    {
        name: 'helpcenter.channable.com',
        contentBaseURL: 'https://helpcenter.channable.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'developerdocs.instructure.com',
        contentBaseURL: 'https://developerdocs.instructure.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'legal.jagex.com',
        contentBaseURL: 'https://legal.jagex.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'manual.edgetx.org',
        contentBaseURL: 'https://manual.edgetx.org',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.cortex.io',
        contentBaseURL: 'https://docs.cortex.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.mufy.ai',
        contentBaseURL: 'https://docs.mufy.ai',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.ndi.video/all',
        contentBaseURL: 'https://docs.ndi.video',
        tests: [{ name: 'Home', url: '/all', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.sevenpens.com/drawtab',
        contentBaseURL: 'https://docs.sevenpens.com',
        tests: [{ name: 'Home', url: '/drawtab' }],
    },
    {
        name: 'manuals.i-reporter.jp',
        contentBaseURL: 'https://manuals.i-reporter.jp',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.holybro.com',
        contentBaseURL: 'https://docs.holybro.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'help.tokenpocket.pro/en',
        contentBaseURL: 'https://help.tokenpocket.pro',
        tests: [{ name: 'Home', url: '/en' }],
    },
    {
        name: 'docs.bullmq.io',
        contentBaseURL: 'https://docs.bullmq.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'tools.osintnewsletter.com',
        contentBaseURL: 'https://tools.osintnewsletter.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'wiki.mmorealms.gg',
        contentBaseURL: 'https://wiki.mmorealms.gg',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.vectra.ai',
        contentBaseURL: 'https://docs.vectra.ai',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.cipp.app',
        contentBaseURL: 'https://docs.cipp.app',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'sinfa-com-co.gitbook.io/manual-de-usuario',
        contentBaseURL: 'https://sinfa-com-co.gitbook.io',
        tests: [{ name: 'Home', url: '/manual-de-usuario' }],
    },
    {
        name: 'support.skylum.com',
        contentBaseURL: 'https://support.skylum.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.jgscripts.com',
        contentBaseURL: 'https://docs.jgscripts.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.patchmypc.com',
        contentBaseURL: 'https://docs.patchmypc.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'guide.cryosparc.com',
        contentBaseURL: 'https://guide.cryosparc.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'guides.stellaraio.com/stellar',
        contentBaseURL: 'https://guides.stellaraio.com',
        tests: [{ name: 'Home', url: '/stellar', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.iyzico.com',
        contentBaseURL: 'https://docs.iyzico.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'help.wotnot.io',
        contentBaseURL: 'https://help.wotnot.io',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.sportmonks.com/v3',
        contentBaseURL: 'https://docs.sportmonks.com',
        tests: [{ name: 'Home', url: '/v3', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.payments.thalescloud.io',
        contentBaseURL: 'https://docs.payments.thalescloud.io',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'doc.anytype.io/anytype-docs',
        contentBaseURL: 'https://doc.anytype.io',
        tests: [{ name: 'Home', url: '/anytype-docs', run: waitForCookiesDialog }],
    },
    {
        name: 'help.blotato.com',
        contentBaseURL: 'https://help.blotato.com',
        tests: [{ name: 'Home', url: '/', run: waitForCookiesDialog }],
    },
    {
        name: 'docs.cartographer3d.com',
        contentBaseURL: 'https://docs.cartographer3d.com',
        tests: [{ name: 'Home', url: '/' }],
    },
    {
        name: 'docs.acestudio.ai',
        contentBaseURL: 'https://docs.acestudio.ai',
        tests: [{ name: 'Home', url: '/' }],
    },
];

runTestCases(testCases);
