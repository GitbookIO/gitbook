'use client';

import { Combobox } from '@base-ui/react/combobox';
import * as React from 'react';

import { Icon } from '@gitbook/icons';

import { Button, type ButtonProps, ToggleChevron } from '../primitives';
import { DROPDOWN_POPUP_CLASS, DROPDOWN_POSITIONER_CLASS } from '../primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import {
    COUNTRY_CODES,
    getCountryFlag,
    getCountryLocales,
    getCountryName,
    groupCountriesByRegion,
    normalizeCountryCode,
    parseCountryChoice,
} from '@/lib/countries';
import { type ClassValue, tcls } from '@/lib/tailwind';
import { type SiteRegions, VISITOR_COUNTRY_PARAM } from '@/lib/visitor-country';

/** An entry of the picker. An empty value is the automatic choice. */
type CountryOption = { value: string; label: string; flag?: string };

/** A group of entries, under a heading unless it is the automatic choice's. */
type CountryOptionGroup = { value: string; label: string | null; items: CountryOption[] };

/** The visitor's countries, as returned by the middleware. */
type VisitorCountries = { detected: string | undefined; chosen: string | undefined };

const visitorCountriesRequests = new Map<string, Promise<VisitorCountries | null>>();

function fetchVisitorCountries(url: string): Promise<VisitorCountries | null> {
    let request = visitorCountriesRequests.get(url);
    if (!request) {
        request = (async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    return null;
                }
                const data = await response.json<{
                    detected?: string | null;
                    chosen?: string | null;
                }>();
                return {
                    detected: normalizeCountryCode(data.detected),
                    chosen: parseCountryChoice(data.chosen),
                };
            } catch {
                return null;
            }
        })();
        visitorCountriesRequests.set(url, request);
        // Retry on the next mount rather than keeping a transient failure.
        request.then((result) => {
            if (!result) {
                visitorCountriesRequests.delete(url);
            }
        });
    }
    return request;
}

/**
 * The visitor's detected and chosen countries: undefined while loading, null if they couldn't be fetched.
 */
function useVisitorCountries(url: string): VisitorCountries | null | undefined {
    const [countries, setCountries] = React.useState<VisitorCountries | null | undefined>(
        undefined
    );
    React.useEffect(() => {
        let cancelled = false;
        fetchVisitorCountries(url).then((result) => {
            if (!cancelled) {
                setCountries(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [url]);
    return countries;
}

export function CountryPickerClient(props: {
    locale: string;
    regions: SiteRegions;
    visitorCountryURL: string;
    variant: ButtonProps['variant'];
    className?: ClassValue;
}) {
    const { locale, regions, visitorCountryURL, variant, className } = props;
    const language = useLanguage();
    // Fetched rather than rendered, so static routes stay shared across countries.
    const visitorCountries = useVisitorCountries(visitorCountryURL);
    const isLoading = visitorCountries === undefined;
    const chosen = visitorCountries?.chosen;
    const detected = visitorCountries?.detected;
    const detectedName = detected ? getCountryName(detected, locale) : undefined;
    const locales = React.useMemo(() => getCountryLocales(locale), [locale]);
    const filter = Combobox.useFilter({ locale: locales });

    const otherLabel = tString(language, 'country_picker_other');
    const countryGroups = React.useMemo(
        () =>
            groupCountriesByRegion(regions, COUNTRY_CODES, locale).map(
                (group): CountryOptionGroup => ({
                    value: group.type === 'region' ? `region:${group.name}` : 'other',
                    label: group.type === 'region' ? group.label : otherLabel,
                    items: group.countries.map(({ code, name }) => ({
                        value: code,
                        label: name,
                        flag: getCountryFlag(code),
                    })),
                })
            ),
        [regions, locale, otherLabel]
    );
    const detectedRegion = detected
        ? countryGroups.find(
              (group) =>
                  group.value !== 'other' && group.items.some((item) => item.value === detected)
          )?.label
        : undefined;

    const automaticOption: CountryOption = {
        value: '',
        label:
            detected && detectedName
                ? tString(
                      language,
                      'country_picker_automatic_detected',
                      `${getCountryFlag(detected)} ${detectedName}${detectedRegion ? ` · ${detectedRegion}` : ''}`
                  )
                : tString(language, 'country_picker_automatic'),
    };
    const options: CountryOptionGroup[] = [
        { value: 'automatic', label: null, items: [automaticOption] },
        ...countryGroups,
    ];
    const selected =
        (chosen &&
            countryGroups
                .flatMap((group) => group.items)
                .find((option) => option.value === chosen)) ||
        automaticOption;

    const currentCountry = chosen ?? detected;
    const currentName = chosen ? getCountryName(chosen, locale) : detectedName;
    const buttonLabel = currentName ?? tString(language, 'country_picker_automatic');

    const selectCountry = (option: CountryOption | null) => {
        const country = option?.value || undefined;
        if (!option || country === chosen) {
            return;
        }
        // The middleware stores the choice in the site's cookie, then redirects to the URL without the param.
        const url = new URL(window.location.href);
        url.searchParams.set(VISITOR_COUNTRY_PARAM, country ?? '');
        window.location.assign(url);
    };

    return (
        <Combobox.Root
            items={options}
            value={selected}
            onValueChange={selectCountry}
            isItemEqualToValue={(item, value) => item.value === value.value}
            filter={(option: CountryOption, query) =>
                option.value
                    ? filter.contains(option.label, query) ||
                      option.value === query.trim().toUpperCase()
                    : // The automatic entry names the detected country, which shouldn't match it.
                      query.trim() === ''
            }
        >
            <Combobox.Trigger
                render={
                    <Button
                        icon="location-dot"
                        data-testid="country-picker-button"
                        size="small"
                        variant={variant}
                        trailing={<ToggleChevron />}
                        className={tcls('group/dropdown bg-tint-base', className)}
                        aria-label={tString(language, 'country_picker_label', buttonLabel)}
                        aria-busy={isLoading || undefined}
                    >
                        <span className="button-content">
                            {isLoading ? (
                                // Until the countries are known, so the label doesn't flash "Automatic".
                                <span
                                    aria-hidden
                                    className="inline-block h-3 w-24 animate-[pulse_2s_infinite] rounded-sm bg-tint-solid/2 align-middle circular-corners:rounded-2xl"
                                />
                            ) : (
                                <>
                                    {currentCountry && currentName ? (
                                        <span aria-hidden className="me-1.5">
                                            {getCountryFlag(currentCountry)}
                                        </span>
                                    ) : null}
                                    {buttonLabel}
                                    {!chosen && currentName ? (
                                        <span className="ms-1.5 text-xs text-tint-subtle">
                                            {tString(language, 'country_picker_auto_hint')}
                                        </span>
                                    ) : null}
                                </>
                            )}
                        </span>
                    </Button>
                }
            />
            <Combobox.Portal>
                <Combobox.Positioner
                    collisionPadding={8}
                    align="start"
                    className={DROPDOWN_POSITIONER_CLASS}
                >
                    <Combobox.Popup
                        data-testid="country-picker-popup"
                        className={tcls(
                            DROPDOWN_POPUP_CLASS,
                            'w-80 max-w-[calc(100vw-1rem)] overflow-hidden'
                        )}
                    >
                        <div className="relative flex shrink-0 items-center">
                            <Icon
                                icon="magnifying-glass"
                                className="pointer-events-none absolute start-2.5 size-3.5 text-tint-subtle"
                            />
                            <Combobox.Input
                                placeholder={tString(language, 'country_picker_search')}
                                aria-label={tString(language, 'country_picker_search')}
                                // Under 16px, iOS zooms into the page when the input gets focus.
                                className="outline-hidden w-full rounded-sm border border-tint bg-tint-base py-1.5 pe-3 ps-8 text-base text-tint-strong placeholder:text-tint-subtle focus:border-primary straight-corners:rounded-none circular-corners:rounded-lg md:text-sm"
                            />
                        </div>
                        <Combobox.Empty className="px-3 py-1 text-sm text-tint-subtle empty:hidden">
                            {tString(language, 'country_picker_no_results')}
                        </Combobox.Empty>
                        <Combobox.List className="flex min-h-0 flex-col gap-1 overflow-y-auto empty:hidden">
                            {(group: CountryOptionGroup) => (
                                <Combobox.Group
                                    key={group.value}
                                    items={group.items}
                                    className="flex flex-col gap-1"
                                >
                                    {group.label ? (
                                        <Combobox.GroupLabel className="px-3 pb-0.5 pt-2 text-xs font-semibold uppercase text-tint-subtle">
                                            {group.label}
                                        </Combobox.GroupLabel>
                                    ) : null}
                                    <Combobox.Collection>
                                        {(option: CountryOption) => (
                                            <Combobox.Item
                                                key={option.value}
                                                value={option}
                                                className="data-selected:text-primary-strong data-highlighted:bg-tint-hover flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1 text-sm straight-corners:rounded-none circular-corners:rounded-lg"
                                            >
                                                {option.flag ? (
                                                    <span aria-hidden className="shrink-0">
                                                        {option.flag}
                                                    </span>
                                                ) : (
                                                    <Icon
                                                        icon="location-crosshairs"
                                                        className="size-4 shrink-0 text-tint-subtle"
                                                    />
                                                )}
                                                <span
                                                    className="min-w-0 flex-1 truncate"
                                                    title={option.label}
                                                >
                                                    {option.label}
                                                </span>
                                                <Combobox.ItemIndicator>
                                                    <Icon
                                                        icon="check"
                                                        className="size-3.5 shrink-0 text-primary"
                                                    />
                                                </Combobox.ItemIndicator>
                                            </Combobox.Item>
                                        )}
                                    </Combobox.Collection>
                                </Combobox.Group>
                            )}
                        </Combobox.List>
                    </Combobox.Popup>
                </Combobox.Positioner>
            </Combobox.Portal>
        </Combobox.Root>
    );
}
