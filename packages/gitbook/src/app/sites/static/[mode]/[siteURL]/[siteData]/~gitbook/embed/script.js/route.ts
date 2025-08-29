import type { RouteLayoutParams } from '@/app/utils';
import { getAssetURL } from '@/lib/assets';
import { buildVersion } from '@/lib/build';
import { getEmbeddableStaticContext } from '@/lib/embeddable';
import type { CreateGitBookOptions } from '@gitbook/embed';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

/**
 * This route is used to serve the assistant.js script.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getEmbeddableStaticContext(await params);
    const initOptions: CreateGitBookOptions = {
        siteURL: context.linker.toAbsoluteURL(context.linker.toPathInSite('')),
    };

    return new Response(
        `
(function () {
  const w = window;
  const gb = w.GitBook;
  const initOptions = window.gitbookSettings || ${JSON.stringify(initOptions)};

  if (typeof gb === "function") {
    gb('init', initOptions);
  } else {
    var d = document;

    var g = function () {
      g.c(arguments);
    };
    g.q = [];
    g.c = function (args) {
      g.q.push(args);
    };
    w.GitBook = g;

    g('init', initOptions);

    const load = function () {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = ${JSON.stringify(getAssetURL(`embed/index.css?v=${buildVersion()}`))};
      document.head.appendChild(style);

      const script = d.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = ${JSON.stringify(getAssetURL(`embed/index.js?v=${buildVersion()}`))};

      var latestScript = d.getElementsByTagName('script')[0];
      latestScript.parentNode.insertBefore(script, latestScript);
    };

    if (document.readyState === 'complete') {
      load();
    } else if (w.attachEvent) {
      w.attachEvent('onload', load);
    } else {
      w.addEventListener('load', load, false);
    }
  }
})();
        `,
        {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            },
        }
    );
}
