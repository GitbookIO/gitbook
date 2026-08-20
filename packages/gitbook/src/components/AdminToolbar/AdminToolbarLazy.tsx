'use client';

import dynamic from 'next/dynamic';

import type { AdminToolbarClientProps } from './types';

// The toolbar only ever appears after hydration (`useToolbarVisibility` reads cookies and local
// storage), so nothing is lost by deferring it — and it takes its CSS modules out of the route's
// render-blocking stylesheets, where every published page was paying for them.
const AdminToolbarClient = dynamic(
    () => import('./AdminToolbarClient').then((mod) => mod.AdminToolbarClient),
    { ssr: false }
);

export function AdminToolbarLazy(props: AdminToolbarClientProps) {
    return <AdminToolbarClient {...props} />;
}
