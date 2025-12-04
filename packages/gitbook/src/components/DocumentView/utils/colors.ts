import type { ClassValue } from '@/lib/tailwind';
import type { DocumentMarkColor } from '@gitbook/api';

export const textColorToStyle: { [color in DocumentMarkColor['data']['text']]: ClassValue } = {
    default: [],
    blue: ['text-blue-500 contrast-more:text-blue-800'],
    red: ['text-red-500 contrast-more:text-red-800'],
    green: ['text-green-500 contrast-more:text-green-800'],
    yellow: ['text-yellow-600 contrast-more:text-yellow-800'],
    purple: ['text-purple-500 contrast-more:text-purple-800'],
    orange: ['text-orange-500 contrast-more:text-orange-800'],
    $primary: ['text-primary-subtle contrast-more:text-primary'],
    $info: ['text-info-subtle contrast-more:text-info'],
    $success: ['text-success-subtle contrast-more:text-success'],
    $warning: ['text-warning-subtle contrast-more:text-warning'],
    $danger: ['text-danger-subtle contrast-more:text-danger'],
};

export const backgroundColorToStyle: {
    [color in DocumentMarkColor['data']['background']]: ClassValue;
} = {
    default: [],
    blue: ['bg-mark-blue'],
    red: ['bg-mark-red'],
    green: ['bg-mark-green'],
    yellow: ['bg-mark-yellow'],
    purple: ['bg-mark-purple'],
    orange: ['bg-mark-orange'],
    $primary: ['bg-primary'],
    $info: ['bg-info'],
    $success: ['bg-success'],
    $warning: ['bg-warning'],
    $danger: ['bg-danger'],
};
