import type { SiteSection, SiteSectionGroup } from '@gitbook/api';
import type { GitBookSiteContext, SiteSections } from '@v2/lib/context';

export type ClientSiteSections = {
    list: (ClientSiteSection | ClientSiteSectionGroup)[];
    current: ClientSiteSection;
};

export type ClientSiteSection = Pick<
    SiteSection,
    'id' | 'title' | 'description' | 'icon' | 'object'
> & {
    url: string;
};

export type ClientSiteSectionGroup = Pick<SiteSectionGroup, 'id' | 'title' | 'icon' | 'object'> & {
    sections: ClientSiteSection[];
};

/**
 * Encode the list of site sections into the data to be rendered in the client.
 */
export function encodeClientSiteSections(context: GitBookSiteContext, sections: SiteSections) {
    const { list, current } = sections;

    const clientSections: (ClientSiteSection | ClientSiteSectionGroup)[] = [];

    for (const item of list) {
        if (item.object === 'site-section-group') {
            clientSections.push({
                id: item.id,
                title: item.title,
                icon: item.icon,
                object: item.object,
                sections: item.sections.map((section) => encodeSection(context, section)),
            });
        } else {
            clientSections.push(encodeSection(context, item));
        }
    }

    return {
        list: clientSections,
        current: encodeSection(context, current),
    };
}

function encodeSection(context: GitBookSiteContext, section: SiteSection) {
    const { linker } = context;
    return {
        id: section.id,
        title: section.title,
        description: section.description,
        icon: section.icon,
        object: section.object,
        url: section.urls.published ? linker.toLinkForContent(section.urls.published) : '',
    };
}
