import type { SiteSection } from '@gitbook/api';
import { type IconName } from '@gitbook/icons';
import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import { SectionIcon } from './SectionIcon';
import { Dropdown, DropdownChevron, DropdownMenu, DropdownMenuItem } from '../Header/Dropdown';

const MAX_ITEMS = 5; // If there are more sections than this, they'll be shown in an overflow menu.

/**
 * A list of items representing site sections for multi-section sites
 */
export function SiteSectionList(props: {
    list: SiteSection[];
    section: SiteSection;
    index: number;
    className: ClassValue;
}) {
    const { list: sections, index: currentIndex, className } = props;

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
                    className,
                )}
            >
                <ul>
                    {sections
                        .slice(0, sections.length > MAX_ITEMS ? MAX_ITEMS - 1 : MAX_ITEMS)
                        .map((section, index) => {
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
                                            'contrast-more:hover:ring-1',
                                            'contrast-more:hover:ring-dark',
                                            'dark:hover:bg-light/1',
                                            'contrast-more:dark:hover:ring-light',

                                            'hover:text-dark/9',
                                            'dark:hover:text-light/9',

                                            'rounded-md',
                                            'straight-corners:rounded-none',
                                            'transition-all',
                                            'group/section-link',

                                            isActive && [
                                                'text-primary',
                                                'hover:text-primary',
                                                'contrast-more:text-primary-700',
                                                'contrast-more:hover:text-primary-700',
                                                'contrast-more:font-semibold',

                                                'dark:text-primary-400',
                                                'dark:hover:text-primary-400',
                                                'dark:contrast-more:text-primary-300',
                                                'dark:contrast-more:hover:text-primary-300',

                                                'hover:bg-primary/3',
                                                'contrast-more:hover:ring-1',
                                                'contrast-more:hover:ring-primary-700',
                                                'dark:hover:bg-primary-400/3',
                                                'contrast-more:dark:hover:ring-primary-300',
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
                                                'contrast-more:text-dark',
                                                'dark:text-light/6',
                                                'contrast-more:dark:text-light',

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

                                                    'contrast-more:ring-2',
                                                    'contrast-more:ring-primary-700',
                                                    'contrast-more:dark:ring-primary-300',

                                                    'text-primary-600',
                                                    'contrast-more:text-primary-700',
                                                    'dark:text-primary-400',
                                                    'dark:contrast-more:text-primary-300',
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
                    {sections.length > MAX_ITEMS && (
                        <Dropdown
                            className={tcls(
                                'group-hover/dropdown:invisible', // Prevent hover from opening the dropdown, as it's annoying in this context
                                'group-focus-within/dropdown:group-hover/dropdown:visible', // When the dropdown is already open, it should remain visible when hovered
                            )}
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
                                        'grow',
                                        'cursor-pointer',

                                        'hover:bg-dark/1',
                                        'dark:hover:bg-light/1',
                                        'group-focus-within/dropdown:bg-dark/1',
                                        'dark:group-focus-within/dropdown:bg-light/1',

                                        'transition-colors',
                                        'group/section-link',
                                        'hover:text-dark/9',
                                        'dark:hover:text-light/9',

                                        currentIndex >= MAX_ITEMS - 1 && [
                                            'text-primary',
                                            'dark:text-primary-400',
                                            'hover:text-primary',
                                            'dark:hover:text-primary-400',
                                            'hover:bg-primary/3',
                                            'dark:hover:bg-primary-400/3',
                                            'group-focus-within/dropdown:bg-primary/3',
                                            'dark:group-focus-within/dropdown:bg-primary-400/3',
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
                                            'group-focus-within/dropdown:scale-110',

                                            'transition-transform',
                                            'text-lg',

                                            currentIndex >= MAX_ITEMS - 1 && [
                                                'bg-primary-50',
                                                'dark:bg-primary-900',

                                                'ring-primary-600/6',
                                                'dark:ring-primary-400/6',

                                                'shadow-md',
                                                'shadow-primary-600/4',

                                                'text-primary',
                                                'dark:text-primary-400',
                                            ],
                                        )}
                                    >
                                        <SectionIcon icon="ellipsis-h" isActive={false} />
                                    </div>
                                    <span className="grow">
                                        View {sections.slice(MAX_ITEMS - 1).length} more
                                    </span>
                                    <DropdownChevron />
                                </div>
                            )}
                        >
                            <DropdownMenu>
                                {sections.slice(MAX_ITEMS - 1).map((section, index) => (
                                    <DropdownMenuItem
                                        href={section.urls.published ?? ''}
                                        key={section.id}
                                        active={index + MAX_ITEMS - 1 === currentIndex}
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
