import type { ClassValue } from '@/lib/tailwind';
import type { DocumentMarkColor } from '@gitbook/api';

export const textColorToStyle: { [color in DocumentMarkColor['data']['text']]: ClassValue } = {
    default: [],
    blue: ['text-blue-500'],
    red: ['text-red-500'],
    green: ['text-green-500'],
    yellow: ['text-yellow-600'],
    purple: ['text-purple-500'],
    orange: ['text-orange-500'],
    $primary: ['text-primary'],
    $info: ['text-info'],
    $success: ['text-success'],
    $warning: ['text-warning'],
    $danger: ['text-danger'],
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
