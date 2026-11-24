import type { GitBookSiteContext } from '@/lib/context';
import { getAdvertisedMcpEndpoint, getLLMsTxtURL } from '@/lib/llms-directive';

/**
 * Agent-facing pointer to the site index, the Markdown versions of pages and the MCP server.
 */
export function LLMsTxtDirective(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const mcpEndpoint = getAdvertisedMcpEndpoint(context);

    return (
        <div className="sr-only">
            For the complete documentation index, see <a href={getLLMsTxtURL(context)}>llms.txt</a>.
            Markdown versions of documentation pages are available by appending <code>.md</code> to
            page URLs.
            {mcpEndpoint ? (
                <>
                    {' '}
                    Agents can also search and read this documentation through its{' '}
                    <a href={mcpEndpoint}>MCP server</a>.
                </>
            ) : null}
        </div>
    );
}
