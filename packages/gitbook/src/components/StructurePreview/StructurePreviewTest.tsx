'use client';

import * as React from 'react';

import type { SiteSection, SiteSectionGroup } from '@gitbook/api';
import type { StructurePreviewMessage, StructurePreviewSnapshot } from './types';

type EditableSection = {
    id: string;
    object: SiteSection['object'] | SiteSectionGroup['object'];
    title: string;
    depth: number;
};

export function StructurePreviewTest(props: { initialSnapshot: StructurePreviewSnapshot }) {
    const { initialSnapshot } = props;
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const latestSnapshotRef = React.useRef(initialSnapshot);
    const [iframeSrc, setIframeSrc] = React.useState<string>();
    const [siteTitle, setSiteTitle] = React.useState(initialSnapshot.site.title);
    const [sectionTitles, setSectionTitles] = React.useState(() =>
        Object.fromEntries(
            listEditableSections(initialSnapshot.visibleSections?.list ?? [], initialSnapshot).map(
                (section) => [getEditableSectionKey(section), section.title]
            )
        )
    );

    const editableSections = React.useMemo(
        () => listEditableSections(initialSnapshot.visibleSections?.list ?? [], initialSnapshot),
        [initialSnapshot]
    );

    const postSnapshot = React.useCallback((snapshot: StructurePreviewSnapshot) => {
        const targetWindow = iframeRef.current?.contentWindow;
        if (!targetWindow) {
            return;
        }

        const message: StructurePreviewMessage = {
            type: 'gitbook.structure.update',
            payload: snapshot,
        };
        targetWindow.postMessage(message, window.location.origin);
    }, []);

    React.useEffect(() => {
        const url = new URL(window.location.href);
        url.pathname = url.pathname.replace(/\/test\/?$/, '');
        setIframeSrc(url.toString());
    }, []);

    const updatePreview = React.useCallback(
        (input: { siteTitle: string; sectionTitles: Record<string, string> }) => {
            const snapshot = updateSnapshotTitles(initialSnapshot, input);
            latestSnapshotRef.current = snapshot;
            postSnapshot(snapshot);
        },
        [initialSnapshot, postSnapshot]
    );

    const handleSiteTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextSiteTitle = event.target.value;
        setSiteTitle(nextSiteTitle);
        updatePreview({ siteTitle: nextSiteTitle, sectionTitles });
    };

    const handleSectionTitleChange = (section: EditableSection, title: string) => {
        const nextSectionTitles = {
            ...sectionTitles,
            [getEditableSectionKey(section)]: title,
        };

        setSectionTitles(nextSectionTitles);
        updatePreview({ siteTitle, sectionTitles: nextSectionTitles });
    };

    return (
        <main className="flex h-screen min-h-[720px] flex-col bg-tint-base text-tint">
            <header className="flex shrink-0 items-center justify-between gap-4 border-tint-subtle border-b px-4 py-3">
                <div>
                    <h1 className="font-semibold text-base text-tint-strong">
                        Structure preview test
                    </h1>
                    <p className="text-sm text-tint-subtle">
                        Update the site title and visible section titles in realtime.
                    </p>
                </div>
                <div className="rounded-md bg-success-subtle/10 px-2 py-1 font-medium text-success-subtle text-xs">
                    Synced
                </div>
            </header>
            <div className="grid min-h-0 grow grid-rows-[minmax(360px,45%)_minmax(360px,1fr)] lg:grid-cols-[minmax(420px,42%)_minmax(0,1fr)] lg:grid-rows-1">
                <section className="min-h-0 overflow-y-auto border-tint-subtle border-b lg:border-r lg:border-b-0">
                    <div className="space-y-6 p-4">
                        <label className="block space-y-2">
                            <span className="font-medium text-sm text-tint-strong">Site title</span>
                            <input
                                type="text"
                                value={siteTitle}
                                onChange={handleSiteTitleChange}
                                className="h-10 w-full rounded-md border border-tint bg-tint-subtle px-3 text-sm text-tint-strong outline-none ring-primary-hover transition-shadow focus:border-primary-hover focus:ring-2"
                            />
                        </label>

                        <div className="space-y-3">
                            <h2 className="font-medium text-sm text-tint-strong">
                                Visible sections
                            </h2>
                            {editableSections.length > 0 ? (
                                <div className="space-y-3">
                                    {editableSections.map((section) => (
                                        <label
                                            key={getEditableSectionKey(section)}
                                            className="block space-y-2"
                                            style={{ paddingLeft: section.depth * 16 }}
                                        >
                                            <span className="text-sm text-tint-subtle">
                                                {section.object === 'site-section-group'
                                                    ? 'Group'
                                                    : 'Section'}
                                            </span>
                                            <input
                                                type="text"
                                                value={
                                                    sectionTitles[getEditableSectionKey(section)] ??
                                                    ''
                                                }
                                                onChange={(event) =>
                                                    handleSectionTitleChange(
                                                        section,
                                                        event.target.value
                                                    )
                                                }
                                                className="h-10 w-full rounded-md border border-tint bg-tint-subtle px-3 text-sm text-tint-strong outline-none ring-primary-hover transition-shadow focus:border-primary-hover focus:ring-2"
                                            />
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-tint-subtle">
                                    This site does not expose visible sections.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
                <section className="min-h-0 bg-tint-subtle">
                    <iframe
                        ref={iframeRef}
                        src={iframeSrc ?? 'about:blank'}
                        title="Structure preview"
                        className="h-full w-full border-0 bg-tint-base"
                        onLoad={() => postSnapshot(latestSnapshotRef.current)}
                    />
                </section>
            </div>
        </main>
    );
}

function updateSnapshotTitles(
    snapshot: StructurePreviewSnapshot,
    input: {
        siteTitle: string;
        sectionTitles: Record<string, string>;
    }
): StructurePreviewSnapshot {
    const updateSections = (sections: StructurePreviewSnapshot['sections']) => {
        if (!sections) {
            return sections;
        }

        return {
            list: updateSectionItems(sections.list, snapshot, input.sectionTitles),
            current: updateSectionItem(sections.current, snapshot, input.sectionTitles),
        };
    };

    return {
        ...snapshot,
        site: {
            ...snapshot.site,
            title: input.siteTitle,
        },
        sections: updateSections(snapshot.sections),
        visibleSections: updateSections(snapshot.visibleSections),
    };
}

function updateSectionItems(
    items: (SiteSection | SiteSectionGroup)[],
    snapshot: StructurePreviewSnapshot,
    sectionTitles: Record<string, string>
) {
    return items.map((item) => updateSectionItem(item, snapshot, sectionTitles));
}

function updateSectionItem<T extends SiteSection | SiteSectionGroup>(
    item: T,
    snapshot: StructurePreviewSnapshot,
    sectionTitles: Record<string, string>
): T {
    const key = getEditableSectionKey(item);
    const title = sectionTitles[key];
    const itemWithTitle =
        typeof title === 'string' ? updateLocalizedTitle(item, snapshot, title) : item;

    if (itemWithTitle.object === 'site-section-group') {
        return {
            ...itemWithTitle,
            children: updateSectionItems(itemWithTitle.children, snapshot, sectionTitles),
        } as T;
    }

    return itemWithTitle;
}

function updateLocalizedTitle<T extends SiteSection | SiteSectionGroup>(
    item: T,
    snapshot: StructurePreviewSnapshot,
    title: string
): T {
    if (snapshot.locale) {
        return {
            ...item,
            title,
            localizedTitle: {
                ...item.localizedTitle,
                [snapshot.locale]: title,
            },
        };
    }

    return {
        ...item,
        title,
    };
}

function listEditableSections(
    items: (SiteSection | SiteSectionGroup)[],
    snapshot: StructurePreviewSnapshot,
    depth = 0
): EditableSection[] {
    return items.flatMap((item) => {
        const section: EditableSection = {
            id: item.id,
            object: item.object,
            title: getDisplayTitle(item, snapshot),
            depth,
        };

        if (item.object === 'site-section-group') {
            return [section, ...listEditableSections(item.children, snapshot, depth + 1)];
        }

        return [section];
    });
}

function getDisplayTitle(item: SiteSection | SiteSectionGroup, snapshot: StructurePreviewSnapshot) {
    return snapshot.locale && item.localizedTitle?.[snapshot.locale]
        ? item.localizedTitle[snapshot.locale]
        : item.title;
}

function getEditableSectionKey(
    section: Pick<EditableSection, 'id' | 'object'> | SiteSection | SiteSectionGroup
) {
    return `${section.object}:${section.id}`;
}
