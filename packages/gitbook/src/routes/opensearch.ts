import type { GitBookSiteContext } from '@/lib/context';
import { escapeHTML } from '@/lib/html';

/**
 * Return the URL of the site's OpenSearch description, shared by every section and variant.
 */
export function getOpenSearchURL(context: GitBookSiteContext): string {
    return context.linker.toAbsoluteURL(context.linker.toPathInSite('~gitbook/opensearch.xml'));
}

/**
 * Serve an OpenSearch description so browsers can search the site from the address bar.
 */
export function serveOpenSearchDescription(context: GitBookSiteContext): Response {
    const { linker, site } = context;
    const title = escapeHTML(site.title);
    const searchURL = escapeHTML(`${linker.toAbsoluteURL(linker.toPathInSite(''))}?q=`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
    <ShortName>${title}</ShortName>
    <Description>Search ${title}</Description>
    <InputEncoding>UTF-8</InputEncoding>
    <Url type="text/html" method="get" template="${searchURL}{searchTerms}"/>
</OpenSearchDescription>
`;

    return new Response(xml, {
        headers: { 'Content-Type': 'application/opensearchdescription+xml; charset=utf-8' },
    });
}
