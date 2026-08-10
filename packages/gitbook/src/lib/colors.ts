import type { ClassValue } from '@/lib/tailwind';
import type { DocumentMarkColor } from '@gitbook/api';

type DocumentTextColor = DocumentMarkColor['data']['text'] | 'pink' | 'violet' | 'cyan' | '$tint';

export const textColorToStyle = {
    default: [],
    blue: ['text-[#0067d1] dark:text-[#7dbcff]'],
    red: ['text-[#c01d27] dark:text-[#fb9890]'],
    green: ['text-[#097f23] dark:text-[#8fc990]'],
    yellow: ['text-[#7d6700] dark:text-[#c7b77c]'],
    purple: ['text-[#4a5cc6] dark:text-[#9fb3fe]'],
    pink: ['text-[#ab278b] dark:text-[#ee95d1]'],
    violet: ['text-[#873fbb] dark:text-[#cda2f3]'],
    cyan: ['text-[#007c7c] dark:text-[#6bcac9]'],
    orange: ['text-[#ae4300] dark:text-[#eea471]'],
    $primary: ['text-primary-subtle contrast-more:text-primary'],
    $info: ['text-info-subtle contrast-more:text-info'],
    $success: ['text-success-subtle contrast-more:text-success'],
    $warning: ['text-warning-subtle contrast-more:text-warning'],
    $danger: ['text-danger-subtle contrast-more:text-danger'],
    $tint: ['text-tint-subtle contrast-more:text-tint'],
} satisfies Record<DocumentTextColor, ClassValue>;

export const backgroundColorToStyle = {
    default: [],
    blue: ['bg-[#dff4ff] dark:bg-[#183453]'],
    red: ['bg-[#ffe9e5] dark:bg-[#4f2422]'],
    green: ['bg-[#e4f9e4] dark:bg-[#203a21]'],
    yellow: ['bg-[#f8f2dc] dark:bg-[#3a3316]'],
    purple: ['bg-[#e9f1ff] dark:bg-[#283051]'],
    pink: ['bg-[#ffe8fa] dark:bg-[#4a233e]'],
    violet: ['bg-[#f9ebff] dark:bg-[#3c294c]'],
    cyan: ['bg-[#ddf8f8] dark:bg-[#093b3b]'],
    orange: ['bg-[#ffecdc] dark:bg-[#492a13]'],
    $primary: ['bg-primary'],
    $info: ['bg-info'],
    $success: ['bg-success'],
    $warning: ['bg-warning'],
    $danger: ['bg-danger'],
    $tint: ['bg-tint'],
} satisfies Record<DocumentTextColor, ClassValue>;
