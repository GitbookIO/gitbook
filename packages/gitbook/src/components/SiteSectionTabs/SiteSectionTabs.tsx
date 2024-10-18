'use client';
import { SiteSection } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { Button, Link } from '../primitives';

/**
 * A set of tabs representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: { sections: SiteSection[]; section: SiteSection }) {
    const { sections, section: currentSection } = props;

    const tabs = sections.map((section) => ({
        id: section.id,
        label: section.title,
        path: section.urls.published ?? '',
    }));

    const currentTabRef = React.useRef<HTMLAnchorElement>(null);
    const navRef = React.useRef<HTMLDivElement>(null);

    const [currentIndex, setCurrentIndex] = React.useState(
        sections.findIndex((section) => section.id === currentSection?.id),
    );
    const [tabDimensions, setTabDimensions] = React.useState<{
        left: number;
        width: number;
    } | null>(null);

    React.useEffect(() => {
        if (currentTabRef.current && navRef.current) {
            const rect = currentTabRef.current.getBoundingClientRect();
            const navRect = navRef.current.getBoundingClientRect();
            setTabDimensions({ left: rect.left - navRect.left, width: rect.width });
        }
    }, [currentIndex]);

    React.useLayoutEffect(() => {
        function onResize() {
            if (currentTabRef.current && navRef.current) {
                const rect = currentTabRef.current.getBoundingClientRect();
                const navRect = navRef.current.getBoundingClientRect();
                setTabDimensions({ left: rect.left - navRect.left, width: rect.width });
            }
        }
        window.addEventListener('resize', onResize);
        () => window.removeEventListener('resize', onResize);
    }, []);

    const scale = (tabDimensions?.width ?? 0) * 0.01;
    const startPos = `${tabDimensions?.left ?? 0}px`;

    const hasMoreSections = false; /** TODO: determine whether we need to show the more button */

    return tabs.length > 0 ? (
        <nav
            ref={navRef}
            className="flex flex-nowrap items-center max-w-screen mb-px"
            style={
                {
                    '--tab-scale': `${scale}`,
                    '--tab-start': `${startPos}`,
                } as React.CSSProperties
            }
        >
            <div
                className={tcls(
                    'relative flex gap-2 bg-transparent',
                    /* add a pseudo element for active tab indicator */
                    "after:block after:content-[''] after:origin-left after:absolute after:-bottom-px after:left-0 after:scale-x-[--tab-scale] after:transition-transform after:translate-x-[var(--tab-start)] after:h-0.5 after:w-[100px] after:bg-primary dark:after:bg-primary-500",
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
            {hasMoreSections ? <MoreSectionsButton /> : null}
        </nav>
    ) : null;
}

/**
 * The tab item - a link to a site section
 */
const Tab = React.forwardRef<
    HTMLSpanElement,
    { active: boolean; href: string; label: string; onClick?: () => void }
>(function Tab(props, ref) {
    const { active, href, label, onClick } = props;
    return (
        <Link
            className={tcls(
                'px-3 py-3.5 rounded',
                active && 'text-primary dark:text-primary-500',
                !active && 'hover:text-primary dark:hover:text-primary-500 transition-colors',
            )}
            role="tab"
            href={href}
            onClick={onClick}
        >
            <span ref={ref} className={tcls('inline-flex w-full truncate')}>
                {label}
            </span>
        </Link>
    );
});

/**
 * Dropdown trigger for when there are too many sections to show them all
 */
function MoreSectionsButton() {
    return (
        <div>
            <Button variant="secondary" size="small">
                <Icon icon="ellipsis-h" size={12} />
            </Button>
        </div>
    );
}
