import { Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';
import { Suspense } from 'react';
import { SearchButton } from '../Search';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '@/components/layout';
import { t } from '@/lib/intl';
import { HeaderLogo } from './HeaderLogo';

/**
 * Render the header for the space.
 */
export function Header(props: { space: Space; asFullWidth: boolean; customization: any }) {
    const { space, asFullWidth, customization } = props;

    return (
        <header
            className={tcls(
                'flex',
                'flex-row',
                'h-16',
                'sticky',
                'top-0',
                'z-10',
                'w-full',
                'backdrop-blur',
                'flex-none',
                'transition-colors',
                'duration-500',
                'lg:z-10',
                'lg:border-b',
                'lg:border-slate-900/10',
                'dark:border-slate-50/[0.06]',
                'bg-header-background-500',
                'supports-backdrop-blur:bg-white/60',
                'dark:bg-transparent',
            )}
        >
            <div
                className={tcls(
                    'flex',
                    'flex-1',
                    'flex-row',
                    'items-center',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],
                )}
            >
                <HeaderLogo
                    space={space}
                    customization={customization}
                    textStyle={[
                        'text-header-link-500',
                        'group-headerlogo/hover:text-header-link-700',
                    ]}
                />
                <div className={tcls('flex', 'basis-56', 'grow-0', 'shrink-0')}>
                    <Suspense fallback={null}>
                        <SearchButton style={['bg-header-background-300']}>
                            {t({ space }, 'search')}
                        </SearchButton>
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
