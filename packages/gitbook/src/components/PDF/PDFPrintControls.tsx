import { Icon } from '@gitbook/icons';

import { PrintButton } from './PrintButton';
import { tString } from '@/intl/translate';
import type { TranslationLanguage } from '@/intl/translations';

export function PDFPrintControls(props: { language: TranslationLanguage }) {
    const { language } = props;

    return (
        <PrintButton
            title={tString(language, 'pdf_print')}
            className="shadow-xs flex items-center justify-center rounded-full border border-slate-300 bg-white p-4 text-sm text-tint hover:text-primary hover:shadow-md"
        >
            <Icon icon="print" className="size-6" />
        </PrintButton>
    );
}
