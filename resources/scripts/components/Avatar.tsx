import React from 'react';
import styled from 'styled-components/macro';
import { useStoreState } from '@/state/hooks';

type AvatarVariant = 'beam' | 'marble' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';

interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'title'> {
    name?: string;
    size?: number | string;
    square?: boolean;
    title?: boolean | string;
    variant?: AvatarVariant;
    colors?: string[];
}

const AvatarShell = styled.span`
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: #ededed;
    border: 1px solid #3f3f3f;
    background: #171717;
    font-family: var(--font-geist);
    font-weight: 600;
    line-height: 1;
    user-select: none;
`;

const avatarLabel = (name?: string) => {
    const value = (name || 'U').trim();
    if (!value) return 'U';

    const parts = value.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
        return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
    }

    return value.slice(0, 2).toUpperCase();
};

const normalizeSize = (size?: number | string) => (typeof size === 'number' ? `${size}px` : size || '100%');

const _Avatar = ({ name, size, square, title, variant: _variant, colors: _colors, style, ...props }: AvatarProps) => {
    const resolvedSize = normalizeSize(size);
    const label = avatarLabel(name);

    return (
        <AvatarShell
            {...props}
            aria-label={typeof title === 'string' ? title : name || 'Avatar'}
            title={typeof title === 'string' ? title : title ? name : undefined}
            style={{
                width: resolvedSize,
                height: resolvedSize,
                minWidth: resolvedSize,
                borderRadius: square ? 6 : '50%',
                fontSize: `max(9px, calc(${resolvedSize} * 0.34))`,
                ...style,
            }}
        >
            {label}
        </AvatarShell>
    );
};

const _UserAvatar = ({ name: _name, ...props }: AvatarProps) => {
    const username = useStoreState((state) => state.user.data?.username);

    return <_Avatar name={username || 'User'} {...props} />;
};

_Avatar.displayName = 'Avatar';
_UserAvatar.displayName = 'Avatar.User';

const Avatar = Object.assign(_Avatar, {
    User: _UserAvatar,
});

export default Avatar;
