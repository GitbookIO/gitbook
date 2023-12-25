import { DocumentBlockSwagger } from '@gitbook/api';
// import OpenAPIParser from '@readme/openapi-parser';

import { tcls } from '@/lib/tailwind';

import { BlockProps } from '../Block';

/**
 * Render a Swagger block.
 */
export async function Swagger(props: BlockProps<DocumentBlockSwagger>) {
    const { block, context, style } = props;
    const resolved = block.data.ref ? await context.resolveContentRef(block.data.ref) : null;

    if (!resolved) {
        return <div>failed</div>;
    }

    // const api = await OpenAPIParser.validate(resolved.href);
    // const operation =
    //     block.data.path && block.data.method
    //         ? api.paths?.[block.data.path]?.[block.data.method]
    //         : null;

    const operation = {
        summary: '',
    };

    return (
        <div
            className={tcls(
                'w-full',
                'flex',
                'flex-row',
                style,
                block.data.fullWidth ? ['max-w-full', 'large:flex-column'] : null,
            )}
        >
            <div>
                <div className={tcls('flex', 'items-center', 'gap-x-3')}>
                    <span
                        className={tcls(
                            'font-mono text-[0.625rem] font-semibold leading-6 rounded-lg px-1.5 ring-1 ring-inset ring-emerald-300 dark:ring-emerald-400/30 bg-emerald-400/10 text-emerald-500 dark:text-emerald-400',
                        )}
                    >
                        {block.data.method?.toUpperCase()}
                    </span>
                    <span
                        className={tcls('h-0.5 w-0.5 rounded-full bg-zinc-300 dark:bg-zinc-600')}
                    ></span>
                    <span className={tcls('font-mono text-xs text-zinc-400')}>
                        {block.data.path}
                    </span>
                </div>
                <h2 className={tcls('mt-2 scroll-mt-32')}>{operation.summary}</h2>
            </div>
            <div>
                <div />
            </div>
        </div>
    );
}
