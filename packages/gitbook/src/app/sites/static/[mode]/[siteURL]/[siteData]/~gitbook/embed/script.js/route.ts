import type { NextRequest } from 'next/server';

import type { CreateGitBookOptions } from '@gitbook/embed';

import type { RouteLayoutParams } from '@/app/utils';
import { getAssetURL } from '@/lib/assets';
import { buildVersion } from '@/lib/build';
import { getEmbeddableStaticContext, resolveEmbeddableTheme } from '@/lib/embeddable';

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

    // The theme this site pins its embeds to, if it has one. The widget paints the panel around the
    // iframe, so it has to render in the same scheme as the docs inside it (RND-12558).
    const siteColorScheme = resolveEmbeddableTheme(context.customization).forcedTheme;

    return new Response(
        `
(function () {
  const w = window;
  const gb = w.GitBook;

  function getScriptSearchParams() {
    const script = document.currentScript;
    if (!script) return new URLSearchParams();

    const url = new URL(script.src);
    return url.searchParams;
  }

  const searchParams = getScriptSearchParams()
  const token = searchParams.get('jwt_token');
  const initOptions = { ...${JSON.stringify(initOptions)}, ...(window.gitbookSettings || {}) };
  const initFrameOptions = {};
  const theme = searchParams.get('theme');
  // The site's own theme first: it renders in that one whatever the embedder asks for.
  const colorScheme =
    ${JSON.stringify(siteColorScheme ?? null)} || (theme === 'light' || theme === 'dark' ? theme : null);
  if (colorScheme) {
    initFrameOptions.colorScheme = colorScheme;
  }
  if (token) {
    initFrameOptions.visitor = { token };
  }

  if (typeof gb === "function") {
    gb('init', initOptions, initFrameOptions);
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

    g('init', initOptions, initFrameOptions);

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
