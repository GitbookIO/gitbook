'use client';

import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnnouncementStoreState {
    visible: boolean;
    at: number;
}

type AnnouncementStoreActions = {
    setVisible: (newVisible: AnnouncementStoreState['visible']) => void;
};

type AnnouncementStore = AnnouncementStoreState & AnnouncementStoreActions;

export const announcementStore = createStore<AnnouncementStore>()(
    persist(
        (set) => ({
            visible: true,
            at: Date.now(),
            setVisible: (visible) => set((state) => ({ ...state, visible, at: Date.now() })),
        }),
        { name: '__gitbook_site_announcement' }
    )
);
