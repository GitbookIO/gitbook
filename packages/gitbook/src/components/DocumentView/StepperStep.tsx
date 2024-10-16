import { DocumentBlockStepperStep } from '@gitbook/api';
import { assert } from 'ts-essentials';

import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function StepperStep(props: BlockProps<DocumentBlockStepperStep>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    const ancestor = ancestorBlocks[ancestorBlocks.length - 1];
    assert(ancestor.type === 'stepper', 'Ancestor block must be a stepper');

    const index = ancestor.nodes.indexOf(block);

    const firstChild = block.nodes[0];
    const marginAdjustClassName = (() => {
        if (!firstChild) {
            return '';
        }
        switch (firstChild.type) {
            case 'heading-1':
                return '-mt-9';
            case 'heading-2':
                return '-mt-[calc(1.25rem+1px)]';
            default:
                return '';
        }
    })();

    return (
        <div className="flex flex-row gap-4 md:gap-8 max-w-3xl w-full mx-auto">
            <div className="relative select-none">
                <div
                    className={tcls(
                        'flex size-[calc(1.75rem+1px)] items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900 tabular-nums',
                        'font-medium text-primary-800 dark:text-primary-200',
                    )}
                >
                    {index + 1}
                </div>
                <div className="absolute bottom-2 left-[0.875rem] top-9 w-px bg-primary-50 dark:bg-primary-900" />
            </div>
            <Blocks
                {...contextProps}
                nodes={block.nodes}
                ancestorBlocks={[...ancestorBlocks, block]}
                style={['flex-1 pb-6 [&>*+*]:mt-5', marginAdjustClassName]}
            />
        </div>
    );
}
