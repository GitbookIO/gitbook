import { SELECT_LIST_CAP, SELECT_STORAGE_KEY } from '@/lib/select';
import { applySelectStateScript } from './script';

/**
 * Inline `<head>` script that applies the visitor's `select` state to `<html>` before first paint,
 * so the right content variant renders with no flash. Mounted once in the root layout head.
 */
export function SelectStateScript() {
    const scriptArgs = JSON.stringify([SELECT_STORAGE_KEY, SELECT_LIST_CAP]).slice(1, -1);

    return (
        <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
                __html: `(${applySelectStateScript.toString()})(${scriptArgs})`,
            }}
        />
    );
}
