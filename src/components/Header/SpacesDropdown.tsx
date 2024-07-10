'use client';

import { Space } from '@gitbook/api';
import { useSelectedLayoutSegment } from 'next/navigation';

import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownChevron, DropdownMenu, DropdownMenuItem } from './Dropdown';


export function SpacesDropdown(props: { space: Space; spaces: Space[] }) {
    const { space, spaces } = props;
    const currentPathname = useSelectedLayoutSegment() ?? '';

    return (
        <Dropdown
            button={(buttonProps) => (
                <div
                    {...buttonProps}
                    data-testid="space-dropdown-button"
                    className={tcls(
                        'justify-self-start',
                        'flex',
                        'flex-row',
                        'items-center',
                        'px-3',
                        'py-1.5',
                        'text-header-link-500',
                    )}
                >
                    {space.title}
                    <DropdownChevron />
                </div>
            )}
        >
            <DropdownMenu>
                {spaces.map((otherSpace) => {
                    const targetUrl = new URL(otherSpace.urls.published ?? otherSpace.urls.app);
                    targetUrl.pathname += `/${currentPathname}`;
                    return (
                        <DropdownMenuItem
                            key={otherSpace.id}
                            href={targetUrl.toString()}
                            active={otherSpace.id === space.id}
                        >
                            {otherSpace.title}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenu>
        </Dropdown>
    );
}
