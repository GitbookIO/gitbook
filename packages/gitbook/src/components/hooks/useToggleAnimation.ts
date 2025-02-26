import { stagger, useAnimate } from 'framer-motion';
import React from 'react';

import { useIsMounted } from '.';

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

export function useToggleAnimation({
    hasDescendants,
    isVisible,
}: {
    hasDescendants: boolean;
    isVisible: boolean;
}) {
    const isMounted = useIsMounted();
    const [scope, animate] = useAnimate();

    // Animate the visibility of the children
    // only after the initial state.
    React.useEffect(() => {
        if (!isMounted || !hasDescendants) {
            return;
        }
        try {
            animate(scope.current, isVisible ? show : hide, {
                duration: 0.1,
            });

            const selector = '& > ul > li';
            if (isVisible)
                animate(
                    selector,
                    { opacity: 1 },
                    {
                        delay: staggerMenuItems,
                    }
                );
            else {
                animate(selector, { opacity: 0 });
            }
        } catch (error) {
            // The selector can crash in some browsers, we ignore it as the animation is not critical.
            console.error(error);
        }
    }, [isVisible, isMounted, hasDescendants, animate, scope]);

    return { show, hide, scope };
}
