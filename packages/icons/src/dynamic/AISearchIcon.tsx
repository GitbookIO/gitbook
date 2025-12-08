import type React from 'react';
import { Icon } from '../Icon';
import { IconStyle } from '../types';
import styles from './icons.module.css';

interface AISearchIconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
    state?: 'default' | 'intro' | 'thinking' | 'working' | 'done' | 'error' | 'confirm';
}

export function AISearchIcon({ className = styles.icon, state = 'default' }: AISearchIconProps) {
    return (
        <div
            style={{
                position: 'relative',
                animation: {
                    intro: `${styles.fadeIn} 1s both, ${styles.orbit} 1s cubic-bezier(0.16,1,0.3,1)`,
                    thinking: `${styles.fadeIn} 1s both, ${styles.orbit} 1s ease-out, ${styles.orbit} 2s 1s infinite forwards linear`,
                    working: '',
                    done: '',
                    confirm: '',
                    default: '',
                    error: '',
                }[state],
            }}
        >
            <Icon icon="search" className={className} />
            <Icon
                icon="sparkle"
                iconStyle={IconStyle.Solid}
                style={{
                    position: 'absolute',
                    top: '15.7%',
                    left: '15.6%',
                    width: '50%',
                    height: '50%',
                    animation: {
                        intro: `${styles.spin} 2s .5s forwards cubic-bezier(0.16,1,0.3,1)`,
                        thinking: `${styles.spin} 2s infinite forwards cubic-bezier(0.16,1,0.3,1)`,
                        working: `${styles.spin} 2s infinite forwards cubic-bezier(0.16,1,0.3,1)`,
                        done: '',
                        confirm: '',
                        default: '',
                        error: '',
                    }[state],
                }}
            />
        </div>
    );
}
