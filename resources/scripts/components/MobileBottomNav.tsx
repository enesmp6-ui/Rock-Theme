import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faLayerGroup, faSlidersH, faTerminal, faUser } from '@fortawesome/free-solid-svg-icons';

const Bar = styled.nav`
    display: none;

    @media (max-width: 700px) {
        position: fixed;
        right: 0.65rem;
        bottom: calc(0.65rem + env(safe-area-inset-bottom, 0px));
        left: 0.65rem;
        z-index: 120;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 0.35rem;
        border: 1px solid #262626;
        border-radius: 10px;
        background: #0a0a0a;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
    }

    a {
        display: flex;
        min-width: 0;
        min-height: 3rem;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        color: #737373;
        border: 1px solid transparent;
        border-radius: 7px;
        font-size: 0.59rem;
        text-decoration: none;
        transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
    }

    a:hover {
        color: #ededed;
        background: #111;
    }

    && a.active {
        color: #fff;
        border-color: #262626;
        background: #171717;
    }

    svg {
        font-size: 0.9rem;
    }

    @media (max-width: 380px) {
        right: 0.45rem;
        left: 0.45rem;
        padding: 0.3rem;
    }
`;

export default ({ serverId }: { serverId?: string }) => {
    const items = serverId
        ? [
              { to: `/server/${serverId}`, label: 'Console', icon: faTerminal, exact: true },
              { to: `/server/${serverId}/files`, label: 'Files', icon: faFolder },
              { to: `/server/${serverId}/settings`, label: 'Settings', icon: faSlidersH },
              { to: '/', label: 'Servers', icon: faLayerGroup, exact: true },
          ]
        : [
              { to: '/', label: 'Servers', icon: faLayerGroup, exact: true },
              { to: '/account', label: 'Account', icon: faUser, exact: true },
              { to: '/account/api', label: 'API', icon: faSlidersH },
              { to: '/status', label: 'Status', icon: faTerminal },
          ];

    return (
        <Bar aria-label={'Mobile navigation'}>
            {items.map((item) => (
                <NavLink key={item.to} to={item.to} exact={item.exact}>
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </Bar>
    );
};
