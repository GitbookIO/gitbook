import clsx from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

export function Section(props: ComponentPropsWithoutRef<'div'>) {
    return <div {...props} className={clsx('openapi-section', props.className)} />;
}

export function SectionHeader(props: ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            {...props}
            className={clsx(
                'openapi-section-header',
                props.className && `${props.className}-header`
            )}
        />
    );
}

export function SectionHeaderContent(props: ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            {...props}
            className={clsx(
                'openapi-section-header-content',
                props.className && `${props.className}-header-content`
            )}
        />
    );
}

export const SectionBody = forwardRef(function SectionBody(
    props: ComponentPropsWithoutRef<'div'>,
    ref: React.ForwardedRef<HTMLDivElement>
) {
    return (
        <div
            ref={ref}
            {...props}
            className={clsx('openapi-section-body', props.className && `${props.className}-body`)}
        />
    );
});

export function StaticSection(props: {
    className: string;
    header: React.ReactNode;
    children: React.ReactNode;
}) {
    const { className, header, children } = props;
    return (
        <Section className={className}>
            <SectionHeader className={className}>
                <SectionHeaderContent className={className}>{header}</SectionHeaderContent>
            </SectionHeader>
            <SectionBody className={className}>{children}</SectionBody>
        </Section>
    );
}
