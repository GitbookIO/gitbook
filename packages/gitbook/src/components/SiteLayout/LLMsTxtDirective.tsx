import type { GitBookSiteContext } from '@/lib/context';
import { getLLMsTxtURL } from '@/lib/llms-directive';

/**
 * Agent-facing pointer to the site index and the Markdown versions of pages.
 */
export function LLMsTxtDirective(props: { context: GitBookSiteContext }) {
    const { context } = props;

    return (
        <div className="sr-only">
            For the complete documentation index, see <a href={getLLMsTxtURL(context)}>llms.txt</a>.
            Markdown versions of documentation pages are available by appending <code>.md</code> to
            page URLs.
        </div>
    );
}
