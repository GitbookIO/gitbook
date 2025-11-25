import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

/**
 * This route serves a quick demo to test the script.js script.
 * It is not used in production.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);

    return new Response(
        `
<html>
    <head>
        <meta name="color-scheme" content="light dark">
    </head>
    <body>
        <svg style="position: absolute; bottom: 6rem; right: 4rem;" width="719" height="644" viewBox="0 0 719 644" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect opacity="0.1" x="0.566895" y="208" width="529.567" height="228" rx="16" fill="#A4A7B0"/>
            <g opacity="0.2">
                <line x1="141.567" y1="472" x2="4.56689" y2="472" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="416.067" y1="472" x2="165.567" y2="472" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="526.567" y1="472" x2="440.067" y2="472" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="194.567" y1="496" x2="4.56689" y2="496" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="324.067" y1="496" x2="218.567" y2="496" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="473.567" y1="496" x2="348.067" y2="496" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="231.901" y1="520" x2="4.56689" y2="520" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="291.186" y1="520" x2="255.901" y2="520" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="442.058" y1="520" x2="315.186" y2="520" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="526.567" y1="520" x2="466.058" y2="520" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="141.567" y1="544" x2="4.56689" y2="544" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="348.191" y1="544" x2="165.567" y2="544" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="184.017" y1="592" x2="4.56689" y2="592" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="312.848" y1="592" x2="208.017" y2="592" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="386.574" y1="592" x2="336.848" y2="592" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="448.401" y1="592" x2="410.574" y2="592" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="126.633" y1="616" x2="4.56689" y2="616" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="401.133" y1="616" x2="150.633" y2="616" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="526.567" y1="616" x2="425.133" y2="616" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="179.457" y1="640" x2="4.56689" y2="640" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="329.569" y1="640" x2="203.457" y2="640" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="141.567" y1="4" x2="4.56689" y2="4" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="416.067" y1="4" x2="165.567" y2="4" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="526.567" y1="4" x2="440.067" y2="4" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="194.567" y1="28" x2="4.56689" y2="28" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="324.067" y1="28" x2="218.567" y2="28" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="473.567" y1="28" x2="348.067" y2="28" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="231.901" y1="52" x2="4.56689" y2="52" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="291.186" y1="52" x2="255.901" y2="52" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="442.058" y1="52" x2="315.186" y2="52" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="526.567" y1="52" x2="466.058" y2="52" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="141.567" y1="76" x2="4.56689" y2="76" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="348.191" y1="76" x2="165.567" y2="76" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="184.017" y1="124" x2="4.56689" y2="124" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="312.848" y1="124" x2="208.017" y2="124" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="386.574" y1="124" x2="336.848" y2="124" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="448.401" y1="124" x2="410.574" y2="124" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="126.633" y1="148" x2="4.56689" y2="148" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="401.133" y1="148" x2="150.633" y2="148" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="526.567" y1="148" x2="425.133" y2="148" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="179.457" y1="172" x2="4.56689" y2="172" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="329.569" y1="172" x2="203.457" y2="172" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
                <rect x="563" y="208" width="156" height="256" rx="16" fill="#A4A7B0" opacity="0.05"/>
            <g opacity="0.2">
                <line x1="682.214" y1="228" x2="583" y2="228" stroke="#656973" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="638.472" y1="252" x2="583" y2="252" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="681.396" y1="252" x2="654.472" y2="252" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="617.989" y1="276" x2="583" y2="276" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="699" y1="276" x2="633.989" y2="276" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="603.168" y1="300" x2="583" y2="300" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="657.873" y1="300" x2="619.168" y2="300" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="637" y1="324" x2="583" y2="324" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="688.836" y1="324" x2="653" y2="324" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="657.474" y1="372" x2="583" y2="372" stroke="#656973" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="633" y1="396" x2="583" y2="396" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="699" y1="396" x2="649" y2="396" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="585.416" y1="420" x2="583" y2="420" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="621.731" y1="420" x2="601.416" y2="420" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="699" y1="420" x2="637.731" y2="420" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
            <g opacity="0.2">
                <line x1="619.471" y1="444" x2="583" y2="444" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
                <line x1="658.186" y1="444" x2="635.471" y2="444" stroke="#A4A7B0" stroke-width="8" stroke-linecap="round"/>
            </g>
        </svg>
    </body>
    <script src="${context.linker.toAbsoluteURL(context.linker.toPathInSite('~gitbook/embed/script.js'))}"></script>
    <script>
    window.GitBook('configure', {
        suggestions: [
            'Help me get started',
            'What can I ask you?',
            'Show me tips and tricks',
        ],
    });
        window.GitBook('open');
    </script>
</html>
`,
        {
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        }
    );
}
