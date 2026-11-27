import type { ButtonProps } from '../primitives';
import { CountryPickerClient } from './CountryPickerClient';
import { getContentLocale } from '@/intl/server';
import type { GitBookSiteContext } from '@/lib/context';
import { tcls } from '@/lib/tailwind';
import { VISITOR_COUNTRY_PATH } from '@/lib/visitor-country';

/**
 * Dropdown letting the visitor override the country detected for them.
 */
export function CountryPicker(props: {
    context: GitBookSiteContext;
    className?: string;
    variant?: ButtonProps['variant'];
}) {
    const { context, className, variant = 'blank' } = props;
    if (!context.countryPicker) {
        return null;
    }

    return (
        <CountryPickerClient
            locale={getContentLocale(context)}
            regions={context.countryPicker}
            visitorCountryURL={context.linker.toPathInSite(VISITOR_COUNTRY_PATH)}
            variant={variant}
            className={tcls(
                'bg-transparent lg:max-w-64 max-md:[&_.button-content]:hidden',
                className
            )}
        />
    );
}
