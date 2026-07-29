import { Icon } from '@gitbook/icons';

import { StyledLink } from '@/components/primitives/StyledLink';
import type { SiteOAuthConsentStart } from '@/lib/site-oauth';
import { tcls } from '@/lib/tailwind';

import { ConsentForm } from './ConsentForm';

/**
 * Consent screen shown to a visitor when an MCP client requests authorization to a published site.
 */
export function ConsentScreen(props: {
    siteId: string;
    siteTitle: string;
    consent: SiteOAuthConsentStart;
}) {
    const { siteId, siteTitle, consent } = props;
    const { client, redirectUri, consentSessionId } = consent;
    const redirectParts = parseRedirectURI(redirectUri);

    return (
        <ConsentCard>
            <div className="flex flex-col gap-6 p-6 sm:p-8">
                {/* Client identity */}
                <div className="flex items-start gap-3">
                    {client.logoUri ? (
                        <img
                            src={client.logoUri}
                            alt=""
                            className="size-10 shrink-0 rounded-corners:rounded-lg straight-corners:rounded-none object-contain"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-corners:rounded-lg straight-corners:rounded-none bg-tint-subtle text-tint">
                            <Icon icon="key" className="size-5" />
                        </span>
                    )}

                    <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h1 className="font-semibold text-tint-strong">{client.name}</h1>
                            <ClientTrustBadge verified={client.verified} />
                        </div>
                        {client.uri ? (
                            <StyledLink
                                href={client.uri}
                                className="inline-flex w-fit items-center gap-1 text-sm text-tint"
                            >
                                Website
                                <Icon icon="arrow-up-right" className="size-3" />
                            </StyledLink>
                        ) : null}
                    </div>
                </div>

                {/* Request statement — toned down, with the client and site names emphasized. */}
                <p className="text-base text-tint leading-snug">
                    <span className="font-semibold text-tint-strong">{client.name}</span> wants to
                    access <span className="font-semibold text-tint-strong">{siteTitle} MCP</span>{' '}
                    on your behalf.
                </p>

                {/* Redirect URI, shown in full with the destination host emphasized. */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-tint">
                        After approving, an authorization code will be sent to:
                    </span>
                    <div
                        className={tcls(
                            'flex items-center gap-2.5',
                            'rounded-corners:rounded-md straight-corners:rounded-none',
                            'border border-tint-subtle bg-tint-subtle px-3 py-2'
                        )}
                    >
                        <Icon icon="link" className="size-4 shrink-0 text-tint" />
                        <code className="break-all font-mono text-sm">
                            {redirectParts ? (
                                <>
                                    <span className="text-tint">{redirectParts.prefix}</span>
                                    <span className="font-semibold text-tint-strong">
                                        {redirectParts.host}
                                    </span>
                                    <span className="text-tint">{redirectParts.rest}</span>
                                </>
                            ) : (
                                <span className="text-tint-strong">{redirectUri}</span>
                            )}
                        </code>
                    </div>
                </div>

                {client.verified ? null : (
                    <div
                        className={tcls(
                            'flex gap-3',
                            'rounded-corners:rounded-md straight-corners:rounded-none',
                            'bg-warning p-3 text-sm text-warning-strong'
                        )}
                    >
                        <Icon icon="triangle-exclamation" className="mt-0.5 size-4 shrink-0" />
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold">
                                GitBook has not verified this client
                            </span>
                            <span>
                                Only approve if you recognize this application and trust it with
                                access to {siteTitle}.
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer: trust acknowledgement + decision */}
            <div className="border-tint-subtle border-t p-4 sm:px-8">
                <ConsentForm
                    siteId={siteId}
                    consentSessionId={consentSessionId}
                    verified={client.verified}
                />
            </div>
        </ConsentCard>
    );
}

/**
 * Centered, branded card shell shared by the consent screen and its error state.
 */
function ConsentCard(props: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-tint-subtle p-4">
            <div
                className={tcls(
                    'w-full max-w-lg',
                    'flex flex-col',
                    'rounded-corners:rounded-lg straight-corners:rounded-none',
                    'border border-tint-subtle bg-tint-base',
                    'shadow-lg'
                )}
            >
                {props.children}
            </div>
        </main>
    );
}

/**
 * Error state shown when the consent flow cannot be started (e.g. a refreshed or expired link).
 */
export function ConsentError(props: { title?: string; message?: string }) {
    const {
        title = 'This authorization link has expired',
        message = 'Please start the sign-in again from the application.',
    } = props;

    return (
        <ConsentCard>
            <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
                <span className="flex size-12 items-center justify-center rounded-corners:rounded-full straight-corners:rounded-none bg-danger text-danger-strong">
                    <Icon icon="circle-exclamation" className="size-6" />
                </span>
                <h1 className="font-semibold text-lg text-tint-strong">{title}</h1>
                <p className="text-tint">{message}</p>
            </div>
        </ConsentCard>
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
function ClientTrustBadge(props: { verified: boolean }) {
    const { verified } = props;

    return (
        <span
            className={tcls(
                'inline-flex items-center gap-1 font-medium text-xs',
                verified ? 'text-success-strong' : 'text-warning-strong'
            )}
        >
            <Icon icon={verified ? 'circle-check' : 'triangle-exclamation'} className="size-3" />
            {verified ? 'Verified' : 'Unverified'}
        </span>
    );
}
