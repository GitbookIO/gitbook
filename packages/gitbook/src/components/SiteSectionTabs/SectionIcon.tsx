import type { SiteSection } from "@gitbook/api";
import { Icon, type IconName } from "@gitbook/icons";

import { type ClassValue, tcls } from "@/lib/tailwind";

export function SectionIcon(props: { section: SiteSection; className?: ClassValue }) {
    const { section, className } = props;

    return section.icon ? <Icon icon={section.icon as IconName} className={tcls('size-[1em]', className)} /> : null;
}