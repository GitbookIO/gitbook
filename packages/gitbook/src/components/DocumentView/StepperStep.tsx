import { assert } from 'ts-essentials';

import type { DocumentBlockStepperStep } from '@gitbook/api';

import type { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getCommentAnchorProps } from './utils';
import { cx } from '@/lib/classnames';
import { tcls } from '@/lib/tailwind';

export function StepperStep(props: BlockProps<DocumentBlockStepperStep>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;
    const { context } = contextProps;

    const ancestor = ancestorBlocks[ancestorBlocks.length - 1];
    assert(ancestor?.type === 'stepper', 'Ancestor block must be a stepper');

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
            case 'heading-3':
                return '-mt-[calc(0.50rem+1px)]';
            default:
                return '';
        }
    })();

    return (
        <div
            {...getCommentAnchorProps(context, block.key)}
            className={cx('stepper-item', tcls(style))}
        >
            <div className="stepper-step-marker">
                <div className="can-override-bg can-override-text stepper-step-number">
                    {index + 1}
                </div>
                <div className="can-override-bg stepper-step-line" />
            </div>
            <Blocks
                {...contextProps}
                nodes={block.nodes}
                ancestorBlocks={[...ancestorBlocks, block]}
                style={['stepper-step-body', marginAdjustClassName]}
            />
        </div>
    );
}
