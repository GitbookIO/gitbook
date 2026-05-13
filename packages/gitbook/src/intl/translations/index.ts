import { ar } from './ar';
import { bg } from './bg';
import { cs } from './cs';
import { da } from './da';
import { de } from './de';
import { el } from './el';
import { en } from './en';
import { es } from './es';
import { et } from './et';
import { fi } from './fi';
import { fr } from './fr';
import { he } from './he';
import { hi } from './hi';
import { hr } from './hr';
import { hu } from './hu';
import { id } from './id';
import { it } from './it';
import { ja } from './ja';
import { ko } from './ko';
import { lt } from './lt';
import { lv } from './lv';
import { ms } from './ms';
import { nl } from './nl';
import { no } from './no';
import { pl } from './pl';
import { pt } from './pt';
import { pt_br } from './pt-br';
import { ro } from './ro';
import { ru } from './ru';
import { sk } from './sk';
import { sl } from './sl';
import { sv } from './sv';
import { th } from './th';
import { tr } from './tr';
import type { TranslationLanguage } from './types';
import { uk } from './uk';
import { vi } from './vi';
import { yue } from './yue';
import { zh } from './zh';
import { zh_tw } from './zh-tw';

export * from './types';

export const languages = {
    en,
    fr,
    de,
    es,
    it,
    pt,
    'pt-br': pt_br,
    ru,
    ja,
    zh,
    'zh-tw': zh_tw,
    yue,
    ko,
    ar,
    hi,
    nl,
    pl,
    tr,
    sv,
    no,
    da,
    fi,
    el,
    cs,
    hu,
    ro,
    th,
    vi,
    id,
    ms,
    he,
    uk,
    sk,
    bg,
    hr,
    lt,
    lv,
    et,
    sl,
} satisfies {
    [key: string]: TranslationLanguage;
};
