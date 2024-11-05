'use client';
import { SiteSection } from '@gitbook/api';
import React from 'react';

import { tcls } from '@/lib/tailwind';

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
            className="flex flex-nowrap items-center mb-px max-w-screen-2xl mx-auto page-full-width:max-w-full"
            style={
                {
                    '--tab-opacity': `${opacity}`,
                    '--tab-scale': `${scale}`,
                    '--tab-start': `${startPos}`,
                } as React.CSSProperties
            }
        >
            <div className="flex flex-col bg-transparent">
                {/* An element for the tabs which includes the page padding */}
                <div
                    role="tablist"
                    className={tcls(
                        'flex flex-row gap-2',
                        // Horizontal padding, which is the layout padding minus the padding of the tabs themselves.
                        'px-1',
                        'sm:px-3',
                        'md:px-5',
                    )}
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
                {/* A container for a pseudo element for active tab indicator. A container is needed so we can set
                    a relative position without breaking the z-index of other parts of the header. */}
                <div
                    className={tcls(
                        'flex',
                        'relative',
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
                ></div>
            </div>
        </nav>
    ) : null;
}

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
