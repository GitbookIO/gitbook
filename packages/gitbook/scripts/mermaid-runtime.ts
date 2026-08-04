import zenuml from '@mermaid-js/mermaid-zenuml';
import mermaid from 'mermaid';

let registration: Promise<void> | null = null;

export async function loadMermaid() {
    if (!registration) {
        registration = mermaid.registerExternalDiagrams([zenuml]).catch((error) => {
            registration = null;
            throw error;
        });
    }

    await registration;
    return mermaid;
}
