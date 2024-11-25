// We put this page to enable parallel routing and being able to use a `loading.tsx` component
// only for in-app navigation.
export * from '../[[...pathname]]/page';
export { default } from '../[[...pathname]]/page';
