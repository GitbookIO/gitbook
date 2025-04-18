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
                props.className ? `${props.className}-header` : undefined
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

export function SectionFooter(props: ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            {...props}
            className={clsx(
                'openapi-section-footer',
                props.className && `${props.className}-footer`
            )}
        />
    );
}

export function SectionFooterContent(props: ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            {...props}
            className={clsx(
                'openapi-section-footer-content',
                props.className && `${props.className}-footer-content`
            )}
        />
    );
}

export function StaticSection(props: {
    className: string;
    header?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    const { className, header, children, footer } = props;
    return (
        <Section className={className}>
            {header ? (
                <SectionHeader className={className}>
                    <SectionHeaderContent className={className}>{header}</SectionHeaderContent>
                </SectionHeader>
            ) : null}
            <SectionBody className={className}>{children}</SectionBody>
            {footer ? (
                <SectionFooter className={className}>
                    <SectionFooterContent className={className}>{footer}</SectionFooterContent>
                </SectionFooter>
            ) : null}
        </Section>
    );
}
