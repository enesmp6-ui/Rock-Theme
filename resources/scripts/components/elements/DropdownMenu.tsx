import React, { createRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';

interface Props {
    children: React.ReactNode;
    renderToggle: (onClick: (e: React.MouseEvent<any, MouseEvent>) => void) => React.ReactChild;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    ${tw`p-2 flex items-center w-full`};
    min-height: 2.25rem;
    color: ${(props) => (props.danger ? '#ff8b8f' : '#a1a1a1')};
    border-radius: 6px;
    font-size: 0.8rem;
    transition: color 120ms ease, background 120ms ease;

    &:hover {
        color: ${(props) => (props.danger ? '#fff' : '#ededed')};
        background: ${(props) => (props.danger ? '#3b1114' : '#171717')};
    }
`;

const Menu = styled.div`
    ${tw`fixed p-1.5`};
    z-index: 10000;
    color: #a1a1a1;
    border: 1px solid #262626;
    border-radius: 8px;
    background: #0a0a0a;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
`;

interface State {
    posX: number;
    visible: boolean;
}

class DropdownMenu extends React.PureComponent<Props, State> {
    menu = createRef<HTMLDivElement>();
    root = createRef<HTMLDivElement>();

    state: State = { posX: 0, visible: false };

    componentWillUnmount() {
        this.removeListeners();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        const menu = this.menu.current;
        const root = this.root.current;

        if (this.state.visible && !prevState.visible && menu && root) {
            document.addEventListener('click', this.windowListener);
            document.addEventListener('contextmenu', this.contextMenuListener);
            window.addEventListener('resize', this.closeMenu);
            window.addEventListener('scroll', this.closeMenu, true);

            const rootRect = root.getBoundingClientRect();
            const viewportPadding = 8;
            const maximumLeft = Math.max(viewportPadding, window.innerWidth - viewportPadding - menu.clientWidth);
            const left = Math.min(maximumLeft, Math.max(viewportPadding, Math.round(this.state.posX - menu.clientWidth)));
            const below = rootRect.bottom + 4;
            const above = rootRect.top - menu.clientHeight - 4;
            const top = below + menu.clientHeight <= window.innerHeight - viewportPadding ? below : Math.max(viewportPadding, above);

            menu.style.left = `${left}px`;
            menu.style.top = `${Math.round(top)}px`;
        }

        if (!this.state.visible && prevState.visible) this.removeListeners();
    }

    removeListeners = () => {
        document.removeEventListener('click', this.windowListener);
        document.removeEventListener('contextmenu', this.contextMenuListener);
        window.removeEventListener('resize', this.closeMenu);
        window.removeEventListener('scroll', this.closeMenu, true);
    };

    closeMenu = () => this.setState({ visible: false });

    onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerMenu(e.clientX);
    };

    contextMenuListener = () => this.setState({ visible: false });

    windowListener = (e: MouseEvent) => {
        const menu = this.menu.current;
        if (e.button === 2 || !this.state.visible || !menu) return;
        if (e.target === menu || menu.contains(e.target as Node)) return;
        this.setState({ visible: false });
    };

    triggerMenu = (posX: number) => this.setState((s) => ({ posX: !s.visible ? posX : s.posX, visible: !s.visible }));

    render() {
        const portalTarget = typeof document !== 'undefined' ? document.body : null;
        return (
            <div ref={this.root} style={{ position: 'relative', display: 'inline-block' }}>
                {this.props.renderToggle(this.onClickHandler)}
                {portalTarget &&
                    createPortal(
                        <Fade timeout={150} in={this.state.visible} unmountOnExit>
                            <Menu
                                ref={this.menu}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.setState({ visible: false });
                                }}
                                style={{ width: '12rem' }}
                            >
                                {this.props.children}
                            </Menu>
                        </Fade>,
                        portalTarget
                    )}
            </div>
        );
    }
}

export default DropdownMenu;
