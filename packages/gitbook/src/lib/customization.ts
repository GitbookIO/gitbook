import { SiteCustomizationSettings } from '@gitbook/api';
import { MiddlewareHeaders } from '@v2/lib/middleware';
import { headers } from 'next/headers';
import rison from 'rison';

/**
 * Selects the customization settings from the x-gitbook-customization header if present,
 * otherwise returns the original API-provided settings.
 */
export async function getDynamicCustomizationSettings(
    settings: SiteCustomizationSettings,
): Promise<SiteCustomizationSettings> {
    const headersList = await headers();
    const extend = headersList.get(MiddlewareHeaders.Customization);
    if (extend) {
        try {
            const parsedSettings = rison.decode_object<SiteCustomizationSettings>(extend);

            return parsedSettings;
        } catch (error) {
            console.error(
                `Failed to parse ${MiddlewareHeaders.Customization} header (ignored): ${
                    (error as Error).stack ?? (error as Error).message ?? error
                }`,
            );
        }
    }

    return settings;
}

/**
 * Validate that the customization settings passed are valid.
 */
export function validateSerializedCustomization(raw: string): boolean {
    try {
        rison.decode_object(raw);
        return true;
    } catch {
        return false;
    }
}
