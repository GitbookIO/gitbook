'use client';

import React from 'react';
import { RecoilRoot } from 'recoil';

export function ClientLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    return <RecoilRoot>{children}</RecoilRoot>;
}
