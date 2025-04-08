import type { SiteStructure } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import { AIPageJourneySuggestions } from './AIPageJourneySuggestions';

export function AdaptivePane(props: { context: GitBookSiteContext }) {
    const { context } = props;

    return (
        <div>
            <AIPageJourneySuggestions spaces={getSpaces(context.structure)} />
        </div>
    );
}

function getSpaces(structure: SiteStructure) {
    if (structure.type === 'siteSpaces') {
        return structure.structure.map((siteSpace) => ({
            id: siteSpace.space.id,
            title: siteSpace.space.title,
        }));
    }

    const sections = structure.structure.flatMap((item) =>
        item.object === 'site-section-group' ? item.sections : item
    );

    return sections.flatMap((section) =>
        section.siteSpaces.map((siteSpace) => ({
            id: siteSpace.space.id,
            title: siteSpace.space.title,
        }))
    );
}
