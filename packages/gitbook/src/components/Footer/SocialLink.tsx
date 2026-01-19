import type { SiteExternalLinksTarget, SiteSocialAccountPlatform } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import { Button } from '../primitives';

type SocialPlatformData = {
    label: string;
    icon: IconName;
    /** The href to the social platform. `$handle` will be replaced with the account handle. */
    href: string;
};

const SOCIAL_PLATFORMS: Record<SiteSocialAccountPlatform, SocialPlatformData> = {
    [SiteSocialAccountPlatform.Twitter]: {
        label: 'X/Twitter',
        icon: 'x-twitter',
        href: 'https://x.com/$handle',
    },
    [SiteSocialAccountPlatform.Instagram]: {
        label: 'Instagram',
        icon: 'instagram',
        href: 'https://instagram.com/$handle',
    },
    [SiteSocialAccountPlatform.Facebook]: {
        label: 'Facebook',
        icon: 'facebook',
        href: 'https://facebook.com/$handle',
    },
    [SiteSocialAccountPlatform.Linkedin]: {
        label: 'LinkedIn',
        icon: 'linkedin',
        href: 'https://linkedin.com/$handle',
    },
    [SiteSocialAccountPlatform.Github]: {
        label: 'GitHub',
        icon: 'github',
        href: 'https://github.com/$handle',
    },
    [SiteSocialAccountPlatform.Discord]: {
        label: 'Discord',
        icon: 'discord',
        href: 'https://discord.com/$handle',
    },
    [SiteSocialAccountPlatform.Slack]: {
        label: 'Slack',
        icon: 'slack',
        href: 'https://join.slack.com/t/$handle',
    },
    [SiteSocialAccountPlatform.Youtube]: {
        label: 'YouTube',
        icon: 'youtube',
        href: 'https://youtube.com/@$handle',
    },
    [SiteSocialAccountPlatform.Tiktok]: {
        label: 'TikTok',
        icon: 'tiktok',
        href: 'https://tiktok.com/@$handle',
    },
    [SiteSocialAccountPlatform.Reddit]: {
        label: 'Reddit',
        icon: 'reddit',
        href: 'https://reddit.com/@$handle',
    },
    [SiteSocialAccountPlatform.Medium]: {
        label: 'Medium',
        icon: 'medium',
        href: 'https://medium.com/@$handle',
    },
};

export function SocialLink(props: { account: SiteSocialAccount; target: SiteExternalLinksTarget }) {
    const { account, target } = props;
    const platform = SOCIAL_PLATFORMS[account.platform];

    return (
        <Button
            iconOnly
            label={platform.label}
            href={platform.href.replace('$handle', account.handle)}
            icon={platform.icon}
            variant="blank"
            size="large"
            target={target}
        />
    );
}
