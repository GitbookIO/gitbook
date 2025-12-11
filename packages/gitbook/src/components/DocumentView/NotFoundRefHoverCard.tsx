import { getSpaceLanguage, tString } from '@/intl/server';
import { languages } from '@/intl/translations';
import { Icon } from '@gitbook/icons';
import type { DocumentContextProps } from '../DocumentView';
import { HoverCard, HoverCardRoot, HoverCardTrigger } from '../primitives';

/**
 * Hover card displayed for a link not found.
 */
export function NotFoundRefHoverCard(
    props: DocumentContextProps & {
        children: React.ReactNode;
    }
) {
    const {
        context: { contentContext },
        children,
    } = props;
    const language = contentContext ? getSpaceLanguage(contentContext) : languages.en;
    return (
        <HoverCardRoot>
            <HoverCardTrigger>{children}</HoverCardTrigger>
            <HoverCard className="flex flex-col gap-1 p-4">
                <div className="flex items-center gap-2">
                    <Icon icon="ban" className="size-4 text-tint-subtle" />
                    <h5 className="font-semibold">{tString(language, 'notfound_title')}</h5>
                </div>
                <p className="text-sm text-tint">{tString(language, 'notfound_link')}</p>
            </HoverCard>
        </HoverCardRoot>
    );
}
