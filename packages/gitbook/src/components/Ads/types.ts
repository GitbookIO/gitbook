export interface AdGeneric {
    active: string;
    ad_via_link: string;
    bannerid: string;
    creativeid: string;
    evenodd: string;
    external_id: string;
    height: string;
    i: string;
    identifier: string;
    longimp: string;
    longlink: string;
    num_slots: string;
    statimp: string;
    statlink: string;
    timestamp: string;
    width: string;
    zoneid: string;
    zonekey: string;
    rendering: 'carbon';
    pixel?: string;
}

export interface AdClassic extends AdGeneric {
    description: string;
    smallImage: string;
}

export interface AdCover extends AdGeneric {
    backgroundColor: string;
    backgroundHoverColor?: string;
    textColor?: string;
    textColorHover?: string;
    callToAction: string;
    company: string;
    companyTagline: string;
    description: string;
    largeImage: string;
    image?: string;
    logo: string;
    ctaBackgroundColor?: string;
    ctaBackgroundHoverColor?: string;
    ctaTextColor?: string;
    ctaTextColorHover?: string;
}

export type AdItem = AdClassic | AdCover;

export interface AdsResponse {
    ads: Array<AdItem | {}>;
}
