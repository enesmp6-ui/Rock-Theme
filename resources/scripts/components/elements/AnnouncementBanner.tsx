import React, { useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBullhorn,
    faExclamationTriangle,
    faInfoCircle,
    faTimes,
    faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';

type AnnouncementType = 'notice' | 'warning' | 'critical';

const DISMISSED_ANNOUNCEMENT_KEY = 'rock:dismissed-announcement';

const BannerContainer = styled.div<{ $severity: AnnouncementType }>`
    position: relative;
    z-index: 40;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.65rem 1.25rem;
    font-size: 0.82rem;
    color: ${(props) => (props.$severity === 'critical' ? '#ff8b8f' : props.$severity === 'warning' ? '#f5a623' : '#a1a1a1')};
    border-bottom: 1px solid #262626;
    background: #0a0a0a;

    .banner-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }

    .banner-text {
        min-width: 0;
        font-weight: 400;
        line-height: 1.4;
        overflow-wrap: anywhere;
    }

    .banner-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-left: 0.5rem;
        color: #ededed;
        font-weight: 500;
        text-decoration: none;
    }

    .banner-link:hover {
        color: #fff;
        text-decoration: underline;
    }

    .dismiss-btn {
        display: flex;
        width: 1.8rem;
        height: 1.8rem;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        color: #737373;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
    }

    .dismiss-btn:hover {
        color: #fff;
        border-color: #262626;
        background: #171717;
    }

    @media (max-width: 560px) {
        align-items: flex-start;
        padding: 0.7rem 0.85rem;
        font-size: 0.78rem;

        .banner-content {
            align-items: flex-start;
            gap: 0.55rem;
        }

        .banner-link {
            display: flex;
            width: max-content;
            margin: 0.35rem 0 0;
        }
    }
`;

export const AnnouncementBanner: React.FC = () => {
    const branding = useStoreState((state: ApplicationStore) => state.settings.data?.branding);
    const fingerprint = branding
        ? [branding.announcementType, branding.announcementMessage, branding.announcementLink].join('|')
        : '';
    const [dismissedAnnouncement, setDismissedAnnouncement] = useState(
        () => sessionStorage.getItem(DISMISSED_ANNOUNCEMENT_KEY) || ''
    );

    if (!branding || !branding.announcementEnabled || !branding.announcementMessage || dismissedAnnouncement === fingerprint) {
        return null;
    }

    const severity: AnnouncementType = branding.announcementType || 'notice';
    const icon = severity === 'critical' ? faExclamationTriangle : severity === 'warning' ? faBullhorn : faInfoCircle;
    const externalLink = /^https?:\/\//i.test(branding.announcementLink);

    const handleDismiss = () => {
        sessionStorage.setItem(DISMISSED_ANNOUNCEMENT_KEY, fingerprint);
        setDismissedAnnouncement(fingerprint);
    };

    return (
        <BannerContainer $severity={severity}>
            <div className={'banner-content'}>
                <FontAwesomeIcon icon={icon} className={'text-base flex-shrink-0'} />
                <span className={'banner-text'}>
                    {branding.announcementMessage}
                    {branding.announcementLink && (
                        <a
                            href={branding.announcementLink}
                            target={externalLink ? '_blank' : undefined}
                            rel={externalLink ? 'noreferrer' : undefined}
                            className={'banner-link'}
                        >
                            Learn details <FontAwesomeIcon icon={faExternalLinkAlt} className={'text-xs'} />
                        </a>
                    )}
                </span>
            </div>
            <button type={'button'} onClick={handleDismiss} className={'dismiss-btn'} aria-label={'Dismiss announcement'}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
        </BannerContainer>
    );
};

export default AnnouncementBanner;
