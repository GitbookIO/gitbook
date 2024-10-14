import { tcls } from "@/lib/tailwind";

export function SiteSectionTabs() {
    return <nav>
        <div className={tcls('flex gap-4')} role="tablist">
            <Tab label="API Management" href="#" />
            <Tab label="Access Management" href="#" />
            <Tab label="Alert Engine" href="#" />
            <Tab label="API Designer" href="#" />
            <Tab label="Gravitee Cloud" href="#" />
            <Tab label="Gravitee Kubernetes Operator" href="#" />
        </div>
    </nav>;
}

function Tab(props: { href: string; label: string; }) {
    const { href, label } = props;
    return <a className={tcls('text-red-500 inline-block', "py-2", "px-1", "mb-0.5")} role="tab" href={href}>{label}</a>;
}