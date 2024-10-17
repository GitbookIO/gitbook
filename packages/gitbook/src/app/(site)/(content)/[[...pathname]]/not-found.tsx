import { getSpaceLanguage, t } from '@/intl/server';
import { getSiteLayoutData } from '@/lib/api';
import { getSiteContentPointer } from '@/lib/pointer';
import { tcls } from '@/lib/tailwind';

export default async function NotFound() {
    const pointer = getSiteContentPointer();
    const { customization } = await getSiteLayoutData(pointer);

    const language = getSpaceLanguage(customization);

    return (
        <div
            className={tcls('flex-1', 'flex', 'flex-row', 'items-center', 'justify-center', 'py-9')}
        >
            <div className={tcls('max-w-80')}>
                <h2 className={tcls('text-2xl', 'font-semibold', 'mb-2')}>
                    {t(language, 'notfound_title')}
                </h2>
                <p className={tcls('text-base', 'mb-4')}>{t(language, 'notfound')}</p>
            </div>
        </div>
    );
}
