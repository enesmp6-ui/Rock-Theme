import React, { useEffect, useRef, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import QuickServerDrawer from '@/components/dashboard/QuickServerDrawer';
import { ServerStats } from '@/api/server/getServerResourceUsage';
import { getRockAccountData, saveServerPreferences, ServerPreference } from '@/api/account/rockData';

const DashboardHero = styled.section`
    position: relative;
    margin-bottom: 1.5rem;
    padding: 2rem 0 1.75rem;
    border-bottom: 1px solid var(--shell-border);
    background: #000;

    .hero-content {
        max-width: 48rem;
    }

    .eyebrow,
    .hero-stat {
        font-family: var(--font-geist-mono);
    }

    .eyebrow {
        margin-bottom: 0.7rem;
        color: #737373;
        font-size: 0.68rem;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .hero-title {
        margin: 0;
        color: #ededed;
        font-family: var(--font-geist);
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 600;
        letter-spacing: -0.05em;
        line-height: 1.05;
    }

    .hero-copy {
        max-width: 38rem;
        margin-top: 0.85rem;
        color: var(--shell-muted);
        font-size: 0.9rem;
        line-height: 1.6;
    }

    .hero-stats {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1.35rem;
    }

    .hero-stat {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        min-height: 30px;
        padding: 0 0.65rem;
        color: #a1a1a1;
        border: 1px solid var(--shell-border);
        border-radius: 6px;
        background: #0a0a0a;
        font-size: 0.68rem;
    }

    .hero-dot {
        width: 0.38rem;
        height: 0.38rem;
        color: var(--shell-success);
    }

    @media (max-width: 640px) {
        padding: 1.5rem 0;
        margin-bottom: 1.2rem;

        .hero-title {
            font-size: 2rem;
        }
    }
`;

const DashboardToolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    margin-bottom: 1rem;

    @media (max-width: 640px) {
        align-items: flex-start;
        flex-direction: column;
    }
`;

const FilterBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 0.7rem;
    border: 1px solid var(--shell-border);
    border-radius: 8px;
    background: #0a0a0a;

    .filters {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.35rem;
    }

    .filter-label {
        margin-right: 0.35rem;
        color: #666;
        font-family: var(--font-geist-mono);
        font-size: 0.65rem;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    button {
        min-height: 30px;
        padding: 0 0.65rem;
        color: #a1a1a1;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
    }

    button:hover {
        color: #ededed;
        border-color: var(--shell-border);
        background: #111;
    }

    button.active {
        color: #fff;
        border-color: var(--shell-border-strong);
        background: #171717;
    }
`;

const ServerGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const SkeletonCard = styled.div`
    position: relative;
    min-height: 14rem;
    overflow: hidden;
    border: 1px solid var(--shell-border);
    border-radius: var(--shell-radius);
    background: #0a0a0a;

    &::after {
        position: absolute;
        inset: 0;
        content: '';
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.035), transparent);
        transform: translateX(-100%);
        animation: skeleton-wave 1.6s ease-in-out infinite;
    }

    @keyframes skeleton-wave {
        to {
            transform: translateX(100%);
        }
    }
`;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const username = useStoreState((state) => state.user.data!.username);
    const branding = useStoreState((state) => state.settings.data!.branding);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const [preferences, setPreferences] = usePersistedState<Record<string, ServerPreference>>(
        `${uuid}:server_preferences`,
        {}
    );
    const [activeGroup, setActiveGroup] = useState('All');
    const [quickServer, setQuickServer] = useState<{ server: Server; stats: ServerStats | null } | null>(null);
    const preferencesReady = useRef(false);
    const saveTimer = useRef<number>();
    const { data: accountData } = useSWR('/api/client/account/rock', getRockAccountData);
    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => setPage(1), [showOnlyAdmin]);
    useEffect(() => {
        if (servers && servers.pagination.currentPage > 1 && !servers.items.length) setPage(1);
    }, [servers?.pagination.currentPage]);
    useEffect(() => {
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);
    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);
    useEffect(() => {
        if (!accountData || preferencesReady.current) return;
        const local = preferences || {};
        const merged = { ...local, ...accountData.serverPreferences };
        setPreferences(merged);
        preferencesReady.current = true;
        if (Object.keys(local).length && !Object.keys(accountData.serverPreferences).length) {
            saveServerPreferences(merged).catch(() => undefined);
        }
    }, [accountData]);
    useEffect(() => {
        if (!preferencesReady.current) return;
        window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(
            () => saveServerPreferences(preferences || {}).catch(() => undefined),
            500
        );
        return () => window.clearTimeout(saveTimer.current);
    }, [preferences]);

    const dashboardSubtitle = branding.dashboardSubtitle.replace(/\{username\}/gi, username);
    const serverPreferences = preferences || {};
    const updatePreference = (serverId: string, next: Partial<ServerPreference>) =>
        setPreferences((current) => ({
            ...(current || {}),
            [serverId]: {
                favorite: (current || {})[serverId]?.favorite || false,
                group: (current || {})[serverId]?.group || '',
                ...next,
            },
        }));
    const groups = Array.from(
        new Set((servers?.items || []).map((server) => serverPreferences[server.id]?.group?.trim()).filter(Boolean))
    ) as string[];

    return (
        <PageContentBlock className='content-dashboard' title={'Dashboard'} showFlashKey={'dashboard'}>
            <DashboardHero>
                <div className={'hero-content'}>
                    <p className={'eyebrow'}>{branding.owner} / Control</p>
                    <h1 className={'hero-title'}>{branding.dashboardTitle}</h1>
                    {!!dashboardSubtitle && <p className={'hero-copy'}>{dashboardSubtitle}</p>}
                    <div className={'hero-stats'}>
                        <div className={'hero-stat'}>
                            <FontAwesomeIcon icon={faCircle} className={'hero-dot'} />
                            {servers ? servers.pagination.total : '—'} total
                        </div>
                        <div className={'hero-stat'}>{rootAdmin ? 'Administrator' : 'Member'}</div>
                    </div>
                </div>
            </DashboardHero>
            {rootAdmin && (
                <DashboardToolbar>
                    <div css={tw`flex items-center`}>
                        <FontAwesomeIcon icon={faShieldAlt} css={tw`text-neutral-500 mr-2`} />
                        <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                            {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
                        </p>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </div>
                </DashboardToolbar>
            )}
            <FilterBar>
                <div className={'filters'}>
                    <span className={'filter-label'}>Filters</span>
                    {['All', 'Favorites', ...groups].map((group) => (
                        <button
                            key={group}
                            onClick={() => setActiveGroup(group)}
                            className={activeGroup === group ? 'active' : undefined}
                        >
                            {group === 'All' ? 'All Servers' : group}
                        </button>
                    ))}
                </div>
            </FilterBar>
            {!servers ? (
                <ServerGrid>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </ServerGrid>
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) => {
                        const visibleItems = items
                            .filter(
                                (server) =>
                                    activeGroup === 'All' ||
                                    (activeGroup === 'Favorites'
                                        ? serverPreferences[server.id]?.favorite
                                        : serverPreferences[server.id]?.group === activeGroup)
                            )
                            .sort(
                                (left, right) =>
                                    Number(!!serverPreferences[right.id]?.favorite) -
                                    Number(!!serverPreferences[left.id]?.favorite)
                            );
                        return visibleItems.length ? (
                            <ServerGrid>
                                {visibleItems.map((server) => (
                                    <ServerRow
                                        key={server.uuid}
                                        server={server}
                                        favorite={!!serverPreferences[server.id]?.favorite}
                                        onToggleFavorite={() =>
                                            updatePreference(server.id, {
                                                favorite: !serverPreferences[server.id]?.favorite,
                                            })
                                        }
                                        onOpenQuick={(selected, stats) => setQuickServer({ server: selected, stats })}
                                    />
                                ))}
                            </ServerGrid>
                        ) : (
                            <p css={tw`text-center text-sm text-neutral-400`}>
                                {showOnlyAdmin
                                    ? 'There are no other servers to display.'
                                    : 'There are no servers associated with your account.'}
                            </p>
                        );
                    }}
                </Pagination>
            )}
            {quickServer && (
                <QuickServerDrawer
                    server={quickServer.server}
                    stats={quickServer.stats}
                    group={serverPreferences[quickServer.server.id]?.group || ''}
                    onGroupChange={(group) => updatePreference(quickServer.server.id, { group })}
                    onClose={() => setQuickServer(null)}
                />
            )}
        </PageContentBlock>
    );
};
