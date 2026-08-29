import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBolt, faCircle, faEthernet, faSlidersH, faStar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import { pushRockNotification } from '@/components/notifications/rockNotifications';

const Card = styled.div`
    min-height: 14rem;
    border: 1px solid var(--shell-border);
    border-radius: 8px;
    background: #0a0a0a;
    transition: border-color 120ms ease, background 120ms ease;

    &:hover {
        border-color: var(--shell-border-strong);
        background: #0c0c0c;
    }

    .card-link {
        display: flex;
        min-height: 14rem;
        flex-direction: column;
        padding: 1.1rem;
        color: var(--shell-text);
        text-decoration: none;
    }

    .server-title {
        color: var(--shell-text);
        text-decoration: none;
    }

    .server-title:hover {
        color: #fff;
    }

    .card-actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .icon-button {
        display: grid;
        width: 2rem;
        height: 2rem;
        place-items: center;
        color: #737373;
        border: 1px solid var(--shell-border);
        border-radius: 6px;
        background: #111;
        transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
    }

    .icon-button:hover,
    .icon-button.active {
        color: #fff;
        border-color: var(--shell-border-strong);
        background: #171717;
    }

    .micro {
        color: #737373;
        font-family: var(--font-geist-mono);
        font-size: 0.61rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .status {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.5rem;
        color: var(--status-color);
        border: 1px solid var(--shell-border);
        border-radius: 6px;
        background: #111;
    }

    .status svg {
        width: 0.38rem;
        height: 0.38rem;
    }

    .allocation {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        margin-top: 0.45rem;
        color: var(--shell-muted);
        font-family: var(--font-geist-mono);
        font-size: 0.7rem;
    }

    .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.65rem;
        margin-top: auto;
        padding-top: 1.25rem;
    }

    .metrics > div {
        min-width: 0;
        padding: 0.65rem;
        border: 1px solid var(--shell-border);
        border-radius: 6px;
        background: #111;
    }

    .metric-value {
        margin-top: 0.3rem;
        color: #ededed;
        font-family: var(--font-geist-mono);
        font-size: 0.78rem;
    }

    .rail {
        height: 2px;
        margin-top: 0.55rem;
        overflow: hidden;
        border-radius: 999px;
        background: #262626;
    }

    .rail > span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: #ededed;
    }

    .footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-top: 1rem;
        padding-top: 0.8rem;
        border-top: 1px solid var(--shell-border);
    }

    .manage {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        min-height: 2rem;
        padding: 0 0.7rem;
        color: #a1a1a1;
        border: 1px solid var(--shell-border);
        border-radius: 6px;
        background: #111;
        font-family: var(--font-geist-mono);
        font-size: 0.6rem;
        font-weight: 500;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
    }

    .manage:hover {
        color: #fff;
        border-color: var(--shell-border-strong);
        background: #171717;
    }

    @media (max-width: 480px) {
        min-height: 13rem;

        .card-link {
            min-height: 13rem;
            padding: 1rem;
        }

        .metrics {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.45rem;
            padding-top: 1rem;
        }

        .micro {
            font-size: 0.56rem;
        }

        .metric-value {
            font-size: 0.7rem;
        }
    }
`;

type Timer = ReturnType<typeof setInterval>;

interface Props {
    server: Server;
    className?: string;
    favorite?: boolean;
    onToggleFavorite?: () => void;
    onOpenQuick?: (server: Server, stats: ServerStats | null) => void;
}

export default ({ server, className, favorite = false, onToggleFavorite, onOpenQuick }: Props) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const previousStatus = useRef<string>();
    const lastHighCpuAlert = useRef(0);
    const [stats, setStats] = useState<ServerStats | null>(null);
    const isSuspended = stats?.isSuspended || server.status === 'suspended';

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then(setStats)
            .catch((error) => console.error(error));

    useEffect(() => {
        if (isSuspended || server.isNodeUnderMaintenance) return;
        getStats().then(() => {
            interval.current = setInterval(getStats, 30000);
        });
        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended, server.isNodeUnderMaintenance]);

    useEffect(() => {
        if (!stats) return;
        if (previousStatus.current && previousStatus.current !== stats.status) {
            pushRockNotification({
                title: server.name,
                message: `Server changed from ${previousStatus.current} to ${stats.status}.`,
                tone: stats.status === 'offline' ? 'danger' : 'success',
                href: `/server/${server.id}`,
            });
        }
        previousStatus.current = stats.status;
        if (stats.cpuUsagePercent >= 90 && Date.now() - lastHighCpuAlert.current > 15 * 60 * 1000) {
            lastHighCpuAlert.current = Date.now();
            pushRockNotification({
                title: `${server.name} resource alert`,
                message: `CPU usage reached ${stats.cpuUsagePercent.toFixed(1)}%.`,
                tone: 'warning',
                href: `/server/${server.id}`,
            });
        }
    }, [stats?.status, stats?.cpuUsagePercent]);

    const statusLabel = isSuspended
        ? 'Suspended'
        : server.isNodeUnderMaintenance
        ? 'Maintenance'
        : server.isTransferring
        ? 'Transferring'
        : server.status === 'installing'
        ? 'Installing'
        : stats?.status || 'Offline';
    const color =
        stats?.status === 'running'
            ? 'var(--shell-success)'
            : stats?.status === 'starting'
            ? 'var(--shell-warning)'
            : 'var(--shell-danger)';
    const metric = (value: number, limit: number, fallback: number) =>
        Math.min(100, limit > 0 ? (value / mbToBytes(limit)) * 100 : (value / mbToBytes(fallback)) * 100);

    return (
        <Card className={className} style={{ '--status-color': color } as React.CSSProperties}>
            <div className={'card-link'}>
                <div className={'flex items-start justify-between gap-4'}>
                    <div className={'min-w-0'}>
                        <Link className={'server-title'} to={`/server/${server.id}`}>
                            <h3 className={'text-lg font-medium truncate'}>{server.name}</h3>
                        </Link>
                    </div>
                    <div className={'card-actions'}>
                        <button
                            className={`icon-button ${favorite ? 'active' : ''}`}
                            onClick={onToggleFavorite}
                            aria-label={favorite ? 'Remove favorite' : 'Add favorite'}
                        >
                            <FontAwesomeIcon icon={faStar} />
                        </button>
                        <span className={'micro status'}>
                            <FontAwesomeIcon icon={faCircle} /> {statusLabel}
                        </span>
                    </div>
                </div>
                <div className={'allocation'}>
                    <FontAwesomeIcon icon={faEthernet} />
                    {server.allocations
                        .filter((allocation) => allocation.isDefault)
                        .map((allocation) => (
                            <React.Fragment key={allocation.ip + allocation.port}>
                                {allocation.alias || ip(allocation.ip)}:{allocation.port}
                            </React.Fragment>
                        ))}
                </div>
                {!stats || isSuspended || server.isNodeUnderMaintenance ? (
                    <div className={'flex flex-1 items-center justify-center'}>
                        {!stats && !isSuspended && !server.isNodeUnderMaintenance ? (
                            <Spinner size={'small'} />
                        ) : (
                            <p className={'micro'}>Telemetry unavailable</p>
                        )}
                    </div>
                ) : (
                    <div className={'metrics'}>
                        <div>
                            <p className={'micro'}>CPU</p>
                            <p className={'metric-value'}>{stats.cpuUsagePercent.toFixed(1)}%</p>
                            <div className={'rail'}>
                                <span style={{ width: `${Math.min(100, stats.cpuUsagePercent)}%` }} />
                            </div>
                        </div>
                        <div>
                            <p className={'micro'}>Memory</p>
                            <p className={'metric-value'}>{bytesToString(stats.memoryUsageInBytes)}</p>
                            <div className={'rail'}>
                                <span style={{ width: `${metric(stats.memoryUsageInBytes, server.limits.memory, 16384)}%` }} />
                            </div>
                        </div>
                        <div>
                            <p className={'micro'}>Storage</p>
                            <p className={'metric-value'}>{bytesToString(stats.diskUsageInBytes)}</p>
                            <div className={'rail'}>
                                <span style={{ width: `${metric(stats.diskUsageInBytes, server.limits.disk, 65536)}%` }} />
                            </div>
                        </div>
                    </div>
                )}
                <div className={'footer micro'}>
                    <button className={'manage'} onClick={() => onOpenQuick?.(server, stats)}>
                        <FontAwesomeIcon icon={faBolt} /> Quick view
                    </button>
                    <Link className={'manage'} to={`/server/${server.id}`}>
                        <FontAwesomeIcon icon={faSlidersH} />
                        Manage server
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
            </div>
        </Card>
    );
};
