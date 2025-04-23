'use client';

import { stagger, useAnimate } from 'framer-motion';
import React, { useLayoutEffect } from 'react';

const show = {
    opacity: 1,
    height: 'auto',
    display: 'block',
};

const hide = {
    opacity: 0,
    height: 0,
    transitionEnd: {
        display: 'none',
    },
};

const staggerMenuItems = stagger(0.02, { ease: (p) => p ** 2 });

export function useToggleAnimation(isVisible: boolean) {
    const [scope, animate] = useAnimate();
    const previousIsVisibleRef = React.useRef<boolean | undefined>(undefined);
    useLayoutEffect(() => {
        previousIsVisibleRef.current = isVisible;
    });
    const previousIsVisible = previousIsVisibleRef.current;

    // Animate the visibility of the children
    // only after the initial state.
    React.useEffect(() => {
        if (previousIsVisible === undefined || previousIsVisible === isVisible) {
            return;
        }

        try {
            animate(scope.current, isVisible ? show : hide, { duration: 0.1 });

            const selector = '& > ul > li';
            if (isVisible) {
                animate(selector, { opacity: 1 }, { delay: staggerMenuItems });
            } else {
                animate(selector, { opacity: 0 });
            }
        } catch (error) {
            // The selector can crash in some browsers, we ignore it as the animation is not critical.
            console.error(error);
        }
    }, [previousIsVisible, isVisible, animate, scope]);

    return { show, hide, scope };
}
