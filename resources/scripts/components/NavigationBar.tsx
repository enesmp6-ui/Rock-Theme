import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const RightNavigation = styled.div`
    flex: 0 0 auto;

    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center justify-center no-underline cursor-pointer`};
        width: 2rem;
        height: 2rem;
        margin-left: 0.3rem;
        color: #a1a1a1;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
        transition: color 120ms ease, background 120ms ease, border-color 120ms ease;

        &:active,
        &:hover {
            color: #fff;
            border-color: var(--shell-border);
            background: #111;
        }
    }

    & > a.active {
        color: #fff;
        border-color: var(--shell-border);
        background: #111;
    }

    & > .search-trigger {
        width: 15rem;
        padding: 0 0.7rem;
        justify-content: flex-start;
        gap: 0.6rem;
        color: #737373;
        border-color: var(--shell-border);
        background: #0a0a0a;

        .search-copy {
            overflow: hidden;
            flex: 1;
            font-size: 0.75rem;
            text-align: left;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        kbd {
            padding: 0.12rem 0.36rem;
            color: #737373;
            border: 1px solid var(--shell-border);
            border-radius: 5px;
            background: #111;
            font-family: var(--font-geist-mono);
            font-size: 0.6rem;
        }
    }

    @media (max-width: 800px) {
        & > .search-trigger {
            width: 2rem;
            padding: 0;
            justify-content: center;

            .search-copy,
            kbd {
                display: none;
            }
        }
    }

    @media (max-width: 420px) {
        & > a,
        & > button,
        & > .navigation-link,
        & > .search-trigger {
            width: 1.9rem;
            height: 1.9rem;
            margin-left: 0.2rem;
        }
    }
`;

const Topbar = styled.div`
    position: relative;
    border-bottom: 1px solid var(--shell-border);
    background: #000;

    &::after {
        display: none;
    }

    .brand-mark {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        width: 1.7rem;
        height: 1.7rem;
        margin-right: 0.6rem;
        color: #000;
        border: 1px solid #fff;
        border-radius: 5px;
        background: #fff;
        font-family: var(--font-geist-mono);
        font-size: 0.7rem;
        font-weight: 700;
    }

    .brand-logo {
        width: 1.7rem;
        height: 1.7rem;
        margin-right: 0.6rem;
        flex: 0 0 auto;
        border-radius: 5px;
        object-fit: contain;
    }

    .brand-name {
        min-width: 0;
        color: var(--shell-text);
        font-family: var(--font-geist);
        font-weight: 600;
        letter-spacing: -0.03em;
    }

    #logo,
    #logo > a {
        min-width: 0;
    }

    #logo > a {
        max-width: 100%;
    }

    .user-copy {
        margin: 0 0.65rem 0 0.9rem;
        text-align: right;
    }

    .user-copy p:first-child {
        color: #ededed;
    }

    .user-copy p:last-child {
        color: #666;
        font-family: var(--font-geist-mono);
    }

    @media (max-width: 640px) {
        .user-copy,
        .optional-nav {
            display: none;
        }

        .brand-name {
            font-size: 0.95rem;
        }

        .brand-mark,
        .brand-logo {
            width: 1.6rem;
            height: 1.6rem;
            margin-right: 0.45rem;
        }
    }

    @media (max-width: 420px) {
        & > div {
            padding-right: 0.75rem;
            padding-left: 0.75rem;
        }

        .brand-name {
            max-width: 6.75rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
`;

const onTriggerNavButton = () => {
    const sidebar = document.getElementById('sidebar');

    if (sidebar) {
        sidebar.classList.toggle('active-nav');
    }
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);
    const username = useStoreState((state: ApplicationStore) => state.user.data!.username);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();

    useEffect(() => {
        document.getElementById('sidebar')?.classList.remove('active-nav');
    }, [location.pathname]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <Topbar className={'topbar'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'w-full flex items-center h-full px-4 sm:px-6'}>
                <button
                    type={'button'}
                    className={'navbar-button'}
                    onClick={onTriggerNavButton}
                    aria-label={'Toggle navigation'}
                    aria-controls={'sidebar'}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <div id={'logo'} className={'flex-1'}>
                    <Link to={'/'} className={'inline-flex items-center no-underline'}>
                        {branding.logo ? (
                            <img className={'brand-logo'} src={branding.logo} alt={''} aria-hidden={'true'} />
                        ) : (
                            <span className={'brand-mark'}>{branding.mark}</span>
                        )}
                        <span className={'brand-name text-lg'}>{name}</span>
                    </Link>
                </div>

                <RightNavigation className={'flex items-center justify-center'}>
                    <SearchContainer />
                    <NotificationCenter />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact className={'optional-nav'}>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'} className={'optional-nav'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <div className={'user-copy'}>
                        <p className={'text-xs font-semibold leading-tight'}>{username}</p>
                        <p className={'text-2xs leading-tight'}>Control panel</p>
                    </div>
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span className={'flex items-center w-5 h-5'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </Topbar>
    );
};
