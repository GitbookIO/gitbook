import { Icon } from '@gitbook/icons';

import { CONTAINER_STYLE } from '../layout';
import { Input } from '../primitives';
import { ConsentForm } from './ConsentForm';
import { HeaderLogo } from '@/components/Header/HeaderLogo';
import { StyledLink } from '@/components/primitives/StyledLink';
import { getSpaceLanguage, t, tString } from '@/intl/server';
import type { TranslationLanguage } from '@/intl/translations';
import type { GitBookSiteContext } from '@/lib/context';
import type { SiteOAuthConsentStart } from '@/lib/site-oauth';
import { tcls } from '@/lib/tailwind';

/**
 * Consent screen shown to a visitor when an MCP client requests authorization to a published site.
 */
export async function ConsentScreen(props: {
    siteId: string;
    context: GitBookSiteContext;
    consent: SiteOAuthConsentStart;
}) {
    const { siteId, context, consent } = props;
    const siteTitle = context.site.title;
    const { client, redirectUri, consentSessionId } = consent;
    const redirectParts = parseRedirectURI(redirectUri);
    const redirectDisplayed = redirectParts
        ? `${redirectParts.prefix}${redirectParts.host}${redirectParts.rest}`
        : redirectUri;
    const language = await getSpaceLanguage(context);

    return (
        <ConsentLayout>
            <div className="my-auto flex min-w-0 flex-col items-start gap-8 lg:flex-row">
                <div className="animate-blur-in-slow lg:w-sm flex min-w-0 max-w-lg grow-0 flex-col gap-6">
                    <div className="lg:mt-8">
                        <HeaderLogo context={context} />
                    </div>

                    {/* Request statement — toned down, with the client and site names emphasized. */}
                    <h1 className="text-xl leading-snug text-tint sm:text-2xl">
                        {t(
                            language,
                            'auth_consent_request',
                            <span className="font-semibold text-tint-strong">{client.name}</span>,
                            <span className="font-semibold text-tint-strong">{siteTitle} MCP</span>
                        )}
                    </h1>
                </div>
                <ConsentCard
                    style={{
                        animationDelay: '100ms',
                    }}
                >
                    <div className="flex flex-col gap-4 p-6 sm:p-8">
                        {/* Client identity */}
                        <div className="flex items-center gap-3">
                            {client.logoUri ? (
                                <img
                                    src={client.logoUri}
                                    alt=""
                                    className="size-12 shrink-0 border border-tint-subtle object-contain rounded-corners:rounded-xl circular-corners:rounded-3xl"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <span className="flex size-12 shrink-0 items-center justify-center bg-tint text-tint rounded-corners:rounded-xl circular-corners:rounded-3xl">
                                    <Icon icon="key" className="size-5" />
                                </span>
                            )}

                            <div className="flex min-w-0 flex-col gap-0.5">
                                <div className="flex items-center gap-x-2 gap-y-1">
                                    <h2 className="text-base font-semibold text-tint-strong">
                                        {client.name}
                                    </h2>
                                    <ClientTrustBadge
                                        language={language}
                                        verified={client.verified}
                                    />
                                </div>
                                {client.uri ? (
                                    <StyledLink
                                        href={client.uri}
                                        className="inline-flex w-fit items-center gap-1 text-tint"
                                    >
                                        {t(language, 'auth_client_website')}
                                        <Icon icon="arrow-up-right" className="size-3" />
                                    </StyledLink>
                                ) : null}
                            </div>
                        </div>

                        {/* Redirect URI, shown in full with the destination host emphasized. */}
                        <div className="mt-2 flex flex-col gap-2">
                            <span className="text-tint">{t(language, 'auth_code_preamble')}</span>

                            <Input
                                leading="link"
                                label={tString(language, 'auth_redirect_uri_label')}
                                readOnly
                                value={redirectDisplayed}
                                displayValue={
                                    redirectParts ? (
                                        <>
                                            <span className="text-tint">
                                                {redirectParts.prefix}
                                            </span>
                                            <span className="font-semibold text-tint-strong">
                                                {redirectParts.host}
                                            </span>
                                            <span className="text-tint">{redirectParts.rest}</span>
                                        </>
                                    ) : (
                                        redirectUri
                                    )
                                }
                            />
                        </div>

                        {client.verified ? null : (
                            <div
                                className={tcls(
                                    'flex gap-3',
                                    'rounded-corners:rounded-xl circular-corners:rounded-3xl',
                                    'bg-warning p-4 text-warning'
                                )}
                            >
                                <Icon
                                    icon="circle-exclamation"
                                    className="ml-1 mt-0.5 size-4 shrink-0 text-warning-strong"
                                />
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-warning-strong">
                                        {t(language, 'auth_unverified_title')}
                                    </span>
                                    <span>
                                        {t(language, 'auth_unverified_description', siteTitle)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer: trust acknowledgement + decision */}
                    <div className="border-t border-tint-subtle p-6 sm:px-8">
                        <ConsentForm
                            siteId={siteId}
                            consentSessionId={consentSessionId}
                            verified={client.verified}
                        />
                    </div>
                </ConsentCard>
            </div>
        </ConsentLayout>
    );
}

export function ConsentLayout(props: React.HTMLAttributes<HTMLDivElement>) {
    const { children, className, ...rest } = props;

    return (
        <main className="site-background flex min-h-screen flex-col" {...rest}>
            <div
                className={tcls(
                    'flex w-full flex-1 items-center justify-center',
                    CONTAINER_STYLE,
                    className
                )}
            >
                {children}
            </div>
        </main>
    );
}

/**
 * Centered, branded card shell shared by the consent screen and its error state.
 */
export function ConsentCard(props: React.HTMLAttributes<HTMLDivElement>) {
    const { children, className, ...rest } = props;

    return (
        <div
            className={tcls(
                'lg:basis-xl w-full min-w-0',
                'flex flex-col',
                'rounded-corners:rounded-xl circular-corners:rounded-3xl',
                'border border-tint-subtle bg-tint-base text-sm',
                'depth-subtle:shadow-lg',
                'animate-blur-in-slow',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
}

/**
 * Error state shown when the consent flow cannot be started (e.g. a refreshed or expired link).
 */
export async function ConsentError(props: {
    context: GitBookSiteContext;
    title?: string;
    message?: string;
}) {
    const { context } = props;
    const language = await getSpaceLanguage(context);
    const {
        title = tString(language, 'auth_expired_title'),
        message = tString(language, 'auth_expired_description'),
    } = props;

    return (
        <ConsentLayout>
            <ConsentCard className="flex-row flex-wrap gap-4 p-6 sm:p-8">
                <span className="flex size-12 items-center justify-center bg-danger text-danger rounded-corners:rounded-xl circular-corners:rounded-3xl">
                    <Icon icon="circle-exclamation" className="size-6" />
                </span>
                <div className="flex flex-col gap-1">
                    <h1 className="text-lg font-semibold text-tint-strong">{title}</h1>
                    <p className="text-tint">{message}</p>
                </div>
            </ConsentCard>
        </ConsentLayout>
    );
}

/**
 * Split a redirect URI so the destination host (the trust-relevant part) can be emphasized while
 * the scheme and path are shown muted. Returns null if the URI can't be parsed.
 */
function parseRedirectURI(uri: string): { prefix: string; host: string; rest: string } | null {
    try {
        const url = new URL(uri);
        return {
            prefix: `${url.protocol}//`,
            host: url.host,
            rest: `${url.pathname}${url.search}${url.hash}`,
        };
    } catch {
        return null;
    }
}

/**
 * Inline verified/unverified indicator shown next to the client name.
 */
function ClientTrustBadge(props: { language: TranslationLanguage; verified: boolean }) {
    const { language, verified } = props;

    return (
        <div
            className={tcls(
                'flex items-center gap-1 font-medium text-xs px-2 py-1 not-straight-corners:rounded-xl',
                verified ? 'text-success bg-success' : 'text-warning bg-warning'
            )}
        >
            <Icon icon={verified ? 'badge-check' : 'circle-exclamation'} className="size-3" />
            {t(language, verified ? 'auth_verified' : 'auth_unverified')}
        </div>
    );
}
