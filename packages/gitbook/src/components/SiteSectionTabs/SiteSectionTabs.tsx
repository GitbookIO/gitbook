'use client';
import { SiteSection } from '@gitbook/api';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { getContainerHorizontalPaddingStyle } from '../layout';
import { Link } from '../primitives';

/**
 * A set of navigational tabs representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: {
    list: SiteSection[];
    section: SiteSection;
    index: number;
}) {
    const { list: sections, section: currentSection, index: currentIndex } = props;

    const tabs = sections.map((section) => ({
        id: section.id,
        label: section.title,
        path: section.urls.published ?? '',
    }));

    const currentTabRef = React.useRef<HTMLAnchorElement>(null);
    const navRef = React.useRef<HTMLDivElement>(null);

    const [tabDimensions, setTabDimensions] = React.useState<{
        left: number;
        width: number;
    } | null>(null);

    const updateTabDimensions = React.useCallback(() => {
        if (currentTabRef.current && navRef.current) {
            const rect = currentTabRef.current.getBoundingClientRect();
            const navRect = navRef.current.getBoundingClientRect();

            setTabDimensions({
                left: rect.left - navRect.left,
                width: rect.width,
            });
        }
    }, []);

    React.useEffect(() => {
        updateTabDimensions();
    }, [currentIndex, updateTabDimensions]);

    React.useLayoutEffect(() => {
        window.addEventListener('load', updateTabDimensions);
        window.addEventListener('resize', updateTabDimensions);
        () => {
            window.removeEventListener('resize', updateTabDimensions);
            window.removeEventListener('load', updateTabDimensions);
        };
    }, [updateTabDimensions]);

    const opacity = Boolean(tabDimensions) ? 1 : 0.0;
    const scale = (tabDimensions?.width ?? 0) * 0.01;
    const startPos = `${tabDimensions?.left ?? 0}px`;

    return tabs.length > 0 ? (
        <nav
            aria-label="Sections"
            ref={navRef}
            className="flex flex-nowrap items-center mb-px"
            style={
                {
                    '--tab-opacity': `${opacity}`,
                    '--tab-scale': `${scale}`,
                    '--tab-start': `${startPos}`,
                } as React.CSSProperties
            }
        >
            <div
                className={tcls(
                    'relative',
                    'flex',
                    'gap-2',
                    'bg-transparent',

                    // Horizontal padding, which is the layout padding minus the padding of the tabs themselves.
                    'px-1',
                    'sm:px-3',
                    'md:px-5',

                    /* add a pseudo element for active tab indicator */
                    'after:block',
                    "after:content-['']",
                    'after:origin-left',
                    'after:absolute',
                    'after:-bottom-px',
                    'after:left-0',
                    'after:opacity-[--tab-opacity]',
                    'after:scale-x-[--tab-scale]',
                    'after:[transition:_opacity_150ms_25ms,transform_150ms]',
                    'after:motion-reduce:transition-none',
                    'after:translate-x-[var(--tab-start)]',
                    'after:will-change-transform',
                    'after:h-0.5',
                    'after:w-[100px]',
                    'after:bg-primary',
                    'dark:after:bg-primary-400',
                )}
                role="tablist"
            >
                {tabs.map((tab, index) => (
                    <Tab
                        active={currentIndex === index}
                        key={index + tab.path}
                        label={tab.label}
                        href={tab.path}
                        ref={currentIndex === index ? currentTabRef : null}
                    />
                ))}
            </div>
        </nav>
    ) : null;
}

/**
 * Horizontal padding for the tabs. Gives a nice hover effect and is used to calculate the padding of the container.
 */
const TAB_HORIZONTAL_PADDING = 3;

/**
 * The tab item - a link to a site section
 */
const Tab = React.forwardRef<HTMLSpanElement, { active: boolean; href: string; label: string }>(
    function Tab(props, ref) {
        const { active, href, label } = props;
        return (
            <Link
                className={tcls(
                    'px-3 py-1 my-2 rounded straight-corners:rounded-none transition-colors',
                    active && 'text-primary dark:text-primary-400',
                    !active &&
                        'text-dark/8 hover:bg-dark/1 hover:text-dark/9 dark:text-light/8 dark:hover:bg-light/2 dark:hover:text-light/9',
                )}
                role="tab"
                href={href}
            >
                <span ref={ref} className={tcls('inline-flex w-full truncate')}>
                    {label}
                </span>
            </Link>
        );
    },
);
