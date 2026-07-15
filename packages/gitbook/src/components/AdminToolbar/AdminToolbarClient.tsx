'use client';
import dynamic from 'next/dynamic';
import { useVisitor } from '../Insights';
import type { AdminToolbarClientProps } from './types';

// Loaded on demand so its Framer Motion + toolbar UI never ship in the main client chunk.
// Anonymous public visitors — who can never see the toolbar — pay nothing.
const AdminToolbarFull = dynamic(
    () => import('./AdminToolbarFull').then((mod) => mod.AdminToolbarFull),
    { ssr: false }
);

/**
 * Lightweight gate deciding whether the admin toolbar can appear for this viewer, before
 * loading any of its heavy UI. It renders for editor contexts (change request / prior revision)
 * and for authenticated members of the organization owning the site; for everyone else it renders
 * nothing and the full toolbar bundle is never requested.
 */
export function AdminToolbarClient(props: AdminToolbarClientProps) {
    const { context } = props;
    const visitor = useVisitor();

    const isEditorContext =
        Boolean(context.changeRequest) || context.revisionId !== context.space.revision;
    const isOrgMember = visitor?.organizationId === context.organizationId;

    if (!isEditorContext && !isOrgMember) {
        return null;
    }

    return <AdminToolbarFull {...props} />;
}
