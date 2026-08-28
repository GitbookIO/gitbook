import type { ComputedPageResult } from './search-types';

type PageResultPresentation = {
    href: string;
    description?: string;
    preview?: {
        title?: string;
        body?: string;
    };
};

/** Keep the displayed preview consistent with the result's single click destination. */
export function getPageResultPresentation(
    result: Pick<ComputedPageResult, 'bestSection' | 'description' | 'href' | 'resultType'>
): PageResultPresentation {
    const { bestSection } = result;

    if (result.resultType === 'page') {
        return {
            href: result.href,
            description: result.description,
        };
    }

    return {
        href: bestSection?.href ?? result.href,
        description: bestSection ? undefined : result.description,
        preview: bestSection
            ? {
                  title: bestSection.title,
                  body: bestSection.body,
              }
            : undefined,
    };
}

export function getPageResultHref(
    result: Pick<ComputedPageResult, 'bestSection' | 'description' | 'href' | 'resultType'>
): string {
    return getPageResultPresentation(result).href;
}
