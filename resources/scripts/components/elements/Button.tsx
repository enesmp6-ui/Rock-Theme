import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${tw`relative inline-flex items-center justify-center text-sm transition-colors duration-150 border`};
    min-height: 2.25rem;
    border-radius: 6px;
    font-family: var(--font-geist);
    font-weight: 500;
    letter-spacing: -0.01em;
    text-transform: none;
    box-shadow: none;

    ${(props) =>
        ((!props.isSecondary && !props.color) || props.color === 'primary') &&
        css<Props>`
            color: #000;
            border-color: #fff;
            background: #fff;

            &:hover:not(:disabled) {
                border-color: #d4d4d4;
                background: #eaeaea;
            }
        `};

    ${(props) =>
        props.color === 'grey' &&
        css`
            color: #ededed;
            border-color: #262626;
            background: #111;

            &:hover:not(:disabled) {
                border-color: #3f3f3f;
                background: #171717;
            }
        `};

    ${(props) =>
        props.color === 'green' &&
        css`
            color: #fff;
            border-color: #2f7d4c;
            background: #238636;

            &:hover:not(:disabled) {
                background: #2ea043;
            }
        `};

    ${(props) =>
        props.color === 'red' &&
        css`
            color: #fff;
            border-color: #8f2d31;
            background: #da3633;

            &:hover:not(:disabled) {
                background: #f85149;
            }
        `};

    ${(props) => props.size === 'xsmall' && tw`px-2 py-1 text-xs`};
    ${(props) => (!props.size || props.size === 'small') && tw`px-4 py-2`};
    ${(props) => props.size === 'large' && tw`px-5 py-3 text-sm`};
    ${(props) => props.size === 'xlarge' && tw`px-5 py-3 w-full`};

    ${(props) =>
        props.isSecondary &&
        css<Props>`
            color: #ededed;
            border-color: #262626;
            background: #0a0a0a;

            &:hover:not(:disabled) {
                color: #fff;
                border-color: #3f3f3f;
                background: #111;
            }

            ${props.color === 'red' &&
            css`
                color: #ff8b8f;
                &:hover:not(:disabled) {
                    color: #fff;
                    border-color: #8f2d31;
                    background: #3b1114;
                }
            `};
        `};

    &:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 2px;
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, ...props }) => (
    <ButtonStyle {...props}>
        {isLoading && (
            <div css={tw`flex absolute justify-center items-center w-full h-full left-0 top-0`}>
                <Spinner size={'small'} />
            </div>
        )}
        <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
    </ButtonStyle>
);

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;
const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;
