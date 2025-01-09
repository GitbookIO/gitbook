import type { SiteSection } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import { SectionIcon } from './SectionIcon';
import { Dropdown, DropdownMenu, DropdownMenuItem } from '../Header/Dropdown';

const MAX_SECTIONS_TO_DISPLAY = 5; // If there are more sections than this, they'll be shown in an overflow menu.

/**
 * A list of items representing site sections for multi-section sites
 */
export function SiteSectionList(props: {
    list: SiteSection[];
    section: SiteSection;
    index: number;
}) {
    const { list: sections, index: currentIndex } = props;

    return (
        sections.length > 0 && (
            <nav
                aria-label="Sections"
                className={tcls(
                    'text-dark/8',
                    'dark:text-light/8',
                    'border-b',
                    'border-dark/2',
                    'dark:border-light/2',
                    'pb-6',
                    'text-sm',
                )}
            >
                <ul>
                    {sections.slice(0, 5).map((section, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <li key={section.id}>
                                <Link
                                    href={section.urls.published ?? ''}
                                    className={tcls(
                                        'flex',
                                        'flex-row',
                                        'items-center',
                                        'gap-3',
                                        'px-3',
                                        'py-2',
                                        '-mx-3',
                                        'hover:bg-dark/1',
                                        'dark:hover:bg-light/1',
                                        'rounded-md',
                                        'straight-corners:rounded-none',
                                        'transition-colors',
                                        'group/section-link',
                                        'hover:text-dark/9',
                                        'dark:hover:text-light/9',

                                        isActive && [
                                            'text-primary',
                                            'dark:text-primary-400',
                                            'hover:text-primary',
                                            'dark:hover:text-primary-400',
                                            'hover:bg-primary/3',
                                            'dark:hover:bg-primary-400/3',
                                        ],
                                    )}
                                >
                                    <div
                                        className={tcls(
                                            'size-8',
                                            'flex',
                                            'items-center',
                                            'justify-center',

                                            'bg-light-1',
                                            'dark:bg-dark-1',
                                            'shadow-sm',
                                            'shadow-dark/4',
                                            'dark:shadow-none',

                                            'rounded-md',
                                            'straight-corners:rounded-none',
                                            'leading-none',

                                            'ring-1',
                                            'ring-dark/1',
                                            'dark:ring-light/2',

                                            'text-dark/6',
                                            'dark:text-light/6',

                                            'group-hover/section-link:scale-110',
                                            'group-active/section-link:scale-90',
                                            'group-active/section-link:shadow-none',

                                            'transition-transform',
                                            isActive && [
                                                'bg-primary-50',
                                                'dark:bg-primary-900',

                                                'ring-primary-600/6',
                                                'dark:ring-primary-400/6',

                                                'shadow-md',
                                                'shadow-primary-600/4',

                                                'text-primary',
                                                'dark:text-primary-400',
                                            ],
                                            'text-lg',
                                        )}
                                    >
                                        {section.icon ? (
                                            <SectionIcon
                                                icon={section.icon as IconName}
                                                isActive={isActive}
                                            />
                                        ) : (
                                            <span
                                                className={tcls(
                                                    'opacity-8',
                                                    'text-sm',
                                                    'ordinal',
                                                    isActive && 'opacity-10',
                                                )}
                                            >
                                                {section.title.substring(0, 2)}
                                            </span>
                                        )}
                                    </div>
                                    {section.title}
                                </Link>
                            </li>
                        );
                    })}
                    {sections.length > MAX_SECTIONS_TO_DISPLAY && (
                        <Dropdown
                            button={(buttonProps) => (
                                <div
                                    {...buttonProps}
                                    data-testid="space-dropdown-button"
                                    className={tcls(
                                        'flex',
                                        'flex-row',
                                        'items-center',
                                        'gap-3',
                                        'px-3',
                                        'py-2',
                                        '-mx-3',
                                        'rounded-md',
                                        'straight-corners:rounded-none',
                                        'w-full',

                                        'hover:bg-dark/1',
                                        'group-focus-within/dropdown:bg-dark/1',
                                        'dark:hover:bg-light/1',

                                        'transition-colors',
                                        'group/section-link',
                                        'hover:text-dark/9',
                                        'dark:hover:text-light/9',
                                    )}
                                >
                                    <div
                                        className={tcls(
                                            'size-8',
                                            'flex',
                                            'items-center',
                                            'justify-center',

                                            'bg-light-1',
                                            'dark:bg-dark-1',
                                            'shadow-sm',
                                            'shadow-dark/4',
                                            'dark:shadow-none',

                                            'rounded-md',
                                            'straight-corners:rounded-none',
                                            'leading-none',

                                            'ring-1',
                                            'ring-dark/1',
                                            'dark:ring-light/2',

                                            'text-dark/6',
                                            'dark:text-light/6',

                                            'group-hover/section-link:scale-110',
                                            'group-active/section-link:scale-90',
                                            'group-active/section-link:shadow-none',

                                            'transition-transform',
                                            'text-lg',
                                        )}
                                    >
                                        <SectionIcon icon="ellipsis-h" isActive={false} />
                                    </div>
                                    <span>
                                        View {sections.slice(MAX_SECTIONS_TO_DISPLAY).length} more
                                    </span>
                                </div>
                            )}
                        >
                            <DropdownMenu>
                                {sections.slice(MAX_SECTIONS_TO_DISPLAY).map((section) => (
                                    <DropdownMenuItem
                                        href={section.urls.published ?? ''}
                                        key={section.id}
                                    >
                                        {section.title}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </ul>
            </nav>
        )
    );
}
