import { Icon } from '@gitbook/icons';

import type { DocumentContextProps } from '../DocumentView';
import { HoverCard, HoverCardRoot, HoverCardTrigger } from '../primitives';
import { getSpaceLanguage, t, tString } from '@/intl/server';
import { defaultLanguage } from '@/intl/translations';
import type { ResolvedContentRef } from '@/lib/references';
import { checkIsExternalURL } from '@/lib/urls';

/**
 * Hover card displayed for a link not found.
 */
export async function NotFoundRefHoverCard(
    props: DocumentContextProps & {
        children: React.ReactNode;
        /** Where the link goes instead, named in the card when it stays on the site. */
        fallback?: ResolvedContentRef | null;
    }
) {
    const {
        context: { contentContext },
        children,
        fallback,
    } = props;
    const language = contentContext ? await getSpaceLanguage(contentContext) : defaultLanguage;
    const destination = fallback && !checkIsExternalURL(fallback.href) ? fallback.text : null;
    return (
        <HoverCardRoot>
            <HoverCardTrigger>{children}</HoverCardTrigger>
            <HoverCard className="flex flex-col gap-1 p-4">
                <div className="flex items-center gap-2">
                    <Icon icon="ban" className="size-4 text-tint-subtle" />
                    <h5 className="font-semibold">{tString(language, 'notfound_title')}</h5>
                </div>
                <p className="text-sm text-tint">{tString(language, 'notfound_link')}</p>
                {destination ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-tint">
                        <Icon icon="arrow-right" className="size-3 shrink-0 text-tint-subtle" />
                        <span>
                            {t(
                                language,
                                'notfound_link_opens',
                                <span className="font-semibold text-tint-strong">
                                    {destination}
                                </span>
                            )}
                        </span>
                    </p>
                ) : null}
            </HoverCard>
        </HoverCardRoot>
    );
}
