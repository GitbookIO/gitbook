import { getSearchBaseProps } from '@/components/Search/search-props';
import type { GitBookSiteContext } from '@/lib/context';
import { EmbeddableSearch } from './EmbeddableSearch';

type EmbeddableSearchPageProps = {
    context: GitBookSiteContext;
};

/**
 * Reusable page component for the embed search page.
 */
export function EmbeddableSearchPage(props: EmbeddableSearchPageProps) {
    const { context } = props;

    return (
        <EmbeddableSearch
            baseURL={context.linker.toPathInSite('~gitbook/embed/')}
            siteTitle={context.site.title}
            searchProps={getSearchBaseProps(context)}
        />
    );
}
