import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import {
    clearRockNotifications,
    getRockNotifications,
    markRockNotificationRead,
    mergeRockNotifications,
    RockNotification,
    setRockNotifications,
} from './rockNotifications';
import { clearServerNotifications, getRockAccountData, markServerNotificationRead } from '@/api/account/rockData';

const Center = styled.div`
    position: relative;
    z-index: 140;

    & > .notification-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.35rem;
        height: 2.35rem;
        margin-left: 0.35rem;
        color: #a1a1a1;
        border: 1px solid #262626;
        border-radius: 6px;
        background: #0a0a0a;
    }

    & > .notification-trigger:hover {
        color: #fff;
        border-color: #3f3f3f;
        background: #111;
    }

    .notification-trigger {
        position: relative;
    }

    .notification-count {
        position: absolute;
        top: -0.3rem;
        right: -0.3rem;
        display: grid;
        min-width: 1rem;
        height: 1rem;
        place-items: center;
        padding: 0 0.2rem;
        color: #000;
        border: 1px solid #000;
        border-radius: 999px;
        background: #fff;
        font-size: 0.58rem;
        font-weight: 600;
    }
`;

const NotificationBackdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 998;
    background: rgba(0, 0, 0, 0.64);
`;

const NotificationPanel = styled.div`
    position: fixed;
    z-index: 999;
    display: flex;
    width: min(23rem, calc(100vw - 1.5rem));
    max-height: calc(100dvh - 5.75rem);
    overflow: hidden;
    flex-direction: column;
    color: #ededed;
    border: 1px solid #262626;
    border-radius: 8px;
    background: #0a0a0a;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);

    .notification-head {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid #262626;
        background: #0a0a0a;
    }

    .notification-head strong {
        color: #ededed;
        font-size: 0.84rem;
        font-weight: 500;
    }

    .notification-head small {
        display: block;
        margin-top: 0.12rem;
        color: #737373;
        font-size: 0.64rem;
    }

    .notification-actions {
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }

    .notification-actions button {
        display: grid;
        width: 2rem;
        height: 2rem;
        place-items: center;
        color: #a1a1a1;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
    }

    .notification-actions button:hover {
        color: #fff;
        border-color: #262626;
        background: #171717;
    }

    .notification-list {
        min-height: 0;
        max-height: min(27rem, calc(100dvh - 9rem));
        overflow-y: auto;
        overscroll-behavior: contain;
    }

    .notification-item {
        position: relative;
        display: block;
        padding: 0.9rem 1rem 0.9rem 1.25rem;
        color: #ededed;
        text-decoration: none;
        border-bottom: 1px solid #262626;
        background: #0a0a0a;
    }

    .notification-item:last-child {
        border-bottom: 0;
    }

    .notification-item::before {
        position: absolute;
        top: 1rem;
        left: 0.65rem;
        width: 0.32rem;
        height: 0.32rem;
        content: '';
        border-radius: 999px;
        background: #a1a1a1;
    }

    .notification-item[data-tone='success']::before { background: #46a758; }
    .notification-item[data-tone='warning']::before { background: #f5a623; }
    .notification-item[data-tone='danger']::before { background: #e5484d; }

    .notification-item strong {
        display: block;
        overflow: hidden;
        font-size: 0.78rem;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .notification-item:hover {
        background: #111;
    }

    .notification-item small {
        display: block;
        margin-top: 0.25rem;
        color: #737373;
        overflow-wrap: anywhere;
    }

    .notification-time {
        color: #666;
        font-family: var(--font-geist-mono);
        font-size: 0.58rem;
        letter-spacing: 0;
    }

    .empty {
        padding: 2rem 1rem;
        color: #737373;
        text-align: center;
    }

    @media (max-width: 700px) {
        width: auto;
        border-radius: 8px;

        .notification-head { padding: 0.9rem 1rem; }
        .notification-head strong { font-size: 0.9rem; }
        .notification-actions button { width: 2.25rem; height: 2.25rem; }
        .notification-list { max-height: none; }
        .notification-item { padding: 1rem 1rem 1rem 1.3rem; }
        .notification-item strong { white-space: normal; }
    }
`;

interface PanelPosition {
    top: number;
    right: number;
    mobile: boolean;
    maxHeight: number;
}

const getPanelPosition = (trigger?: HTMLButtonElement | null): PanelPosition => {
    const mobile = window.innerWidth <= 700;
    const rect = trigger?.getBoundingClientRect();
    const top = Math.max(12, (rect?.bottom || 64) + 10);

    return {
        top,
        right: mobile ? 12 : Math.max(12, window.innerWidth - (rect?.right || window.innerWidth - 12)),
        mobile,
        maxHeight: Math.max(220, window.innerHeight - top - (mobile ? 12 : 16)),
    };
};

const relativeTime = (value: RockNotification['createdAt']) => {
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    if (!Number.isFinite(timestamp)) return 'Now';
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return 'Now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
};

export default () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<RockNotification[]>(getRockNotifications);
    const [panelPosition, setPanelPosition] = useState<PanelPosition>(() => getPanelPosition());
    const center = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);

    const sync = useCallback(() => {
        return getRockAccountData()
            .then((data) => {
                const remote: RockNotification[] = data.notifications.map((item) => ({
                    ...item,
                    remote: true,
                    tone: item.type === 'offline' ? 'danger' : item.type === 'recovered' ? 'success' : 'warning',
                }));
                setRockNotifications(mergeRockNotifications(remote));
            })
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        const refresh = () => setItems(getRockNotifications());
        window.addEventListener('rock:notification', refresh);
        window.addEventListener('rock:notifications-cleared', refresh);
        return () => {
            window.removeEventListener('rock:notification', refresh);
            window.removeEventListener('rock:notifications-cleared', refresh);
        };
    }, []);

    useEffect(() => {
        sync();
        const timer = window.setInterval(sync, 60000);
        return () => window.clearInterval(timer);
    }, [sync]);

    useEffect(() => {
        if (!open) return;
        sync();
        const close = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!center.current?.contains(target) && !panel.current?.contains(target)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open, sync]);

    useLayoutEffect(() => {
        if (!open) return;
        const updatePosition = () => setPanelPosition(getPanelPosition(trigger.current));
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        window.visualViewport?.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
            window.visualViewport?.removeEventListener('resize', updatePosition);
        };
    }, [open]);

    useEffect(() => {
        if (!open || !panelPosition.mobile) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open, panelPosition.mobile]);

    return (
        <Center ref={center}>
            <button
                ref={trigger}
                type={'button'}
                className={'navigation-link notification-trigger'}
                onClick={() => setOpen((value) => !value)}
                aria-label={'Notifications'}
                aria-expanded={open}
                aria-controls={'rock-notification-panel'}
            >
                <FontAwesomeIcon icon={faBell} />
                {!!items.length && <span className={'notification-count'}>{items.length > 9 ? '9+' : items.length}</span>}
            </button>
            {open &&
                createPortal(
                    <>
                        {panelPosition.mobile && <NotificationBackdrop aria-hidden={'true'} onClick={() => setOpen(false)} />}
                        <NotificationPanel
                            ref={panel}
                            id={'rock-notification-panel'}
                            role={'dialog'}
                            aria-label={'Notifications'}
                            aria-modal={panelPosition.mobile || undefined}
                            style={
                                panelPosition.mobile
                                    ? { top: panelPosition.top, right: 12, left: 12, maxHeight: panelPosition.maxHeight }
                                    : { top: panelPosition.top, right: panelPosition.right, maxHeight: panelPosition.maxHeight }
                            }
                        >
                            <div className={'notification-head'}>
                                <div>
                                    <strong>Notifications</strong>
                                    <small>{items.length ? `${items.length} recent` : 'You are all caught up'}</small>
                                </div>
                                <div className={'notification-actions'}>
                                    {!!items.length && (
                                        <button
                                            type={'button'}
                                            onClick={() => {
                                                clearRockNotifications();
                                                clearServerNotifications().catch(() => undefined);
                                            }}
                                            aria-label={'Clear notifications'}
                                        >
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>
                                    )}
                                    <button type={'button'} onClick={() => setOpen(false)} aria-label={'Close notifications'}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            </div>
                            {!items.length ? (
                                <div className={'empty'}>All quiet.</div>
                            ) : (
                                <div className={'notification-list'}>
                                    {items.map((item) => (
                                        <Link
                                            key={item.id}
                                            className={'notification-item'}
                                            data-tone={item.tone}
                                            to={item.href || '/'}
                                            onClick={() => {
                                                markRockNotificationRead(item.id);
                                                if (item.remote) markServerNotificationRead(item.id).catch(() => undefined);
                                                setOpen(false);
                                            }}
                                        >
                                            <strong>{item.title}</strong>
                                            <small>{item.message}</small>
                                            <span className={'notification-time'}>{relativeTime(item.createdAt)}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </NotificationPanel>
                    </>,
                    document.getElementById('modal-portal') || document.body
                )}
        </Center>
    );
};
