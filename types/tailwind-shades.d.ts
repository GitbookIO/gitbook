declare module 'tailwind-shades' {
    export type Shade = {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };

    function shadesOf(color: string): Shade;

    export default shadesOf;
}
