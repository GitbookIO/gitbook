import { useParams } from 'next/navigation';
import React from 'react';

export function useHash() {
    const params = useParams();
    const [hash, setHash] = React.useState<string>(global.location?.hash?.slice(1));
    React.useEffect(() => {
        function updateHash() {
            setHash(global.location?.hash?.slice(1));
        }
        global.addEventListener('hashchange', updateHash);
        updateHash();
        return () => global.removeEventListener('hashchange', updateHash);
    // With next.js, the hashchange event is not triggered when the hash changes
    // Instead a hack is to use the `useParams` hook to listen to changes in the hash
    // https://github.com/vercel/next.js/discussions/49465#discussioncomment-5845312
    }, [params]);
    return hash;
}