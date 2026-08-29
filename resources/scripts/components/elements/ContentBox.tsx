import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const Surface = styled.div<{ $borderColor?: string }>`
    position: relative;
    padding: 1rem;
    color: #ededed;
    border: 1px solid #262626;
    border-top-color: ${(props) => props.$borderColor || '#262626'};
    border-radius: 8px;
    background: #0a0a0a;
`;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && <h2 css={tw`text-neutral-200 mb-3 px-1 text-xl font-medium`}>{title}</h2>}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <Surface className={'content-box-glass'} $borderColor={borderColor}>
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </Surface>
    </div>
);

export default ContentBox;
