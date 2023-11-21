declare module 'tailwind-shades' {
    import { shades } from '../tailwind.config';

    export type Shade = Record<(typeof shades)[number], string>;

    function shadesOf(color: string): Shade;

    export default shadesOf;
}
