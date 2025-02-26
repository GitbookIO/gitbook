import type React from 'react';

export type AsProp<Tag extends React.ElementType> = { as?: Tag };

export type PolymorphicComponentProp<
    Tag extends React.ElementType,
    Props extends Record<string, unknown> = Record<string, never>,
> = React.PropsWithChildren<Props & AsProp<Tag>> &
    Omit<React.ComponentPropsWithoutRef<Tag>, keyof (AsProp<Tag> & Props)>;

export type PolymorphicComponentPropWithRef<
    Tag extends React.ElementType,
    Props extends Record<string, unknown> = Record<string, never>,
> = PolymorphicComponentProp<Tag, Props> & { ref?: PolymorphicRef<Tag> };

/*
 * Handle forwarding ref to a polymorphic component type.
 */
export type PolymorphicRef<Tag extends React.ElementType> = React.ComponentPropsWithRef<Tag>['ref'];
