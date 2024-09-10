import { Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownChevron, DropdownMenu } from './Dropdown';
import { SpacesDropdownMenuItem } from './SpacesDropdownMenuItem';

export function SpacesDropdown(props: {
    space: Space;
    spaces: Space[];
    buttonKind?: 'default' | 'bordered';
}) {
    const { space, spaces, buttonKind = 'default' } = props;

    return (
        <Dropdown
            className={buttonKind === 'bordered' ? tcls('w-full') : undefined}
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
                        buttonKind === 'bordered'
                            ? [
                                  'ring-1',
                                  'ring-inset',
                                  'ring-dark/2',
                                  'pointer-events-auto',
                                  'justify-between',
                                  'bg-light',
                                  'dark:bg-dark',
                                  'rounded-lg',
                                  'straight-corners:rounded-none',
                                  'lg:ring-0',
                                  'border',
                                  'border-dark/2',
                                  'dark:border-light/2',
                              ]
                            : [],
                    )}
                >
                    {space.title}
                    <DropdownChevron />
                </div>
            )}
        >
            <DropdownMenu>
                {spaces.map((otherSpace, index) => (
                    <SpacesDropdownMenuItem
                        key={`${otherSpace.id}-${index}`}
                        variantSpace={{
                            id: otherSpace.id,
                            title: otherSpace.title,
                            url: otherSpace.urls.published ?? otherSpace.urls.app,
                        }}
                        active={otherSpace.id === space.id}
                    />
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
