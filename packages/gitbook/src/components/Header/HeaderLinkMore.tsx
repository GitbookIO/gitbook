import { CustomizationHeaderLink } from '@gitbook/api';
import React from 'react';

//import { useLanguage, tString } from '@/intl/client';
import { ContentRefContext, resolveContentRef } from '@/lib/references';


import {
    Dropdown,
    DropdownChevron,
    DropdownMenu,
    DropdownMenuItem,
} from './Dropdown';
import styles from './headerLinks.module.css';


export function HeaderLinkMore({ links, context }: { links: CustomizationHeaderLink[]; context: ContentRefContext; }) {

    //const language = useLanguage();
    const renderButton = () => (
        <button 
            aria-label='More' /* TODO: translation */
        ><DropdownChevron /></button>
    );
   
    return (
        <div className={`${styles.linkEllipsis} items-center`}>
            <Dropdown button={renderButton}
            >
                <DropdownMenu>
                    {links.map((link, index) => (
                        <MoreMenuLink key={index} link={link} context={context} />
                    ))}    
                </DropdownMenu>
            </Dropdown>
        </div>);
}

async function MoreMenuLink(props: { context: ContentRefContext; link: CustomizationHeaderLink }) {
    const { context, link } = props;

    const target = await resolveContentRef(link.to, context);

    if (!target) {
        return null;
    }

    return <DropdownMenuItem href={target.href}>{link.title}</DropdownMenuItem>;
}