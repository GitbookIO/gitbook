import { getIconSymbol } from '@/lib/icons/symbols';
import {
    type RegisteredIconSymbol,
    clearRegisteredServerIconSymbols,
    getRegisteredServerIconSymbols,
} from '@gitbook/icons';

/**
 * Emits the subset of icon symbols that were rendered during the current request.
 */
export async function IconSpriteDefinitions() {
    const registered: Map<string, RegisteredIconSymbol> = new Map(
        getRegisteredServerIconSymbols().map((symbol: RegisteredIconSymbol) => [
            `${symbol.style}/${symbol.icon}`,
            symbol,
        ])
    );

    if (registered.size === 0) {
        return null;
    }

    const definitions = (
        await Promise.all(
            [...registered.values()].map((symbol) => {
                return getIconSymbol(symbol.style, symbol.icon, symbol.symbolId);
            })
        )
    ).filter((symbol): symbol is NonNullable<typeof symbol> => !!symbol);

    clearRegisteredServerIconSymbols();

    if (!definitions.length) {
        return null;
    }

    return (
        <svg
            id="gb-icon-sprite-root"
            data-testid="icon-sprite-root"
            aria-hidden="true"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                position: 'absolute',
                width: 0,
                height: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
            dangerouslySetInnerHTML={{
                __html: definitions.map((symbol) => symbol.symbol).join(''),
            }}
        />
    );
}
