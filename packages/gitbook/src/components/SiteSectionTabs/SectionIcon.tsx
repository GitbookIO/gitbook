import type { SiteSection } from "@gitbook/api";
import { Icon } from "@gitbook/icons";

import { type ClassValue, tcls } from "@/lib/tailwind";

export function SectionIcon(props: { section: SiteSection; style?: ClassValue }) {
    const { section, style } = props;

    return section.icon ? <Icon icon={section.icon} className={tcls('size-[1em]', style)} /> : null;
}