import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';
import styled from 'styled-components/macro';
import FluidGlass from '@/components/elements/reactbits/FluidGlass';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const Shell = styled(FluidGlass)`
    overflow: hidden;
    border-color: #262626;
    border-radius: 8px;
    background: #0a0a0a;
    box-shadow: none;

    .box-heading {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid #262626;
        background: #0f0f0f;
    }

    .box-heading p {
        color: #a1a1a1;
        font-family: var(--font-geist-mono);
        font-size: 0.68rem;
        font-weight: 500;
        letter-spacing: 0.02em;
    }

    .box-heading svg {
        color: #737373;
    }

    .box-body {
        padding: 1rem;
    }
`;

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <Shell className={className}>
        <div className={'box-heading'}>
            {typeof title === 'string' ? (
                <p css={tw`text-sm`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-neutral-400`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div className={'box-body'}>{children}</div>
    </Shell>
);

export default memo(TitledGreyBox, isEqual);
