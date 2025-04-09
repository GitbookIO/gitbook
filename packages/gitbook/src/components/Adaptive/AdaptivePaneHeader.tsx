'use client';

import { tcls } from '@/lib/tailwind';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Loading } from '../primitives';
import { useAdaptiveContext } from './AdaptiveContext';

export function AdaptivePaneHeader() {
    const { loading, open, setOpen } = useAdaptiveContext();

    return (
        <div
            className={tcls(
                'flex flex-row items-center gap-3 rounded-md straight-corners:rounded-none transition-all duration-500',
                open ? '' : ''
            )}
        >
            <div className="flex grow flex-col">
                <h4 className="flex items-center gap-1.5 font-semibold ">
                    <Loading className="size-4 text-tint-subtle" busy={loading} />
                    For you
                </h4>
                <AnimatePresence initial={false} mode="wait">
                    <motion.h5
                        key={loading ? 'loading' : 'loaded'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-tint-subtle text-xs"
                    >
                        {loading ? 'Basing on your context...' : 'Based on your context'}
                    </motion.h5>
                </AnimatePresence>
            </div>
            <Button
                variant="blank"
                className={tcls('px-2 *:transition-transform', !open && '*:-rotate-45')}
                iconOnly
                label="Close"
                icon="close"
                onClick={() => setOpen(!open)}
            />
        </div>
    );
}
