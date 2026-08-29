import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex no-underline text-neutral-200 items-center p-4 border transition-colors duration-150 overflow-hidden`};
    position: relative;
    border-color: #262626;
    border-radius: 8px;
    background: #0a0a0a;
    box-shadow: none;

    ${(props) =>
        props.$hoverable !== false &&
        `
            &:hover {
                border-color: #3f3f3f;
                background: #111111;
            }
        `};

    & .icon {
        ${tw`w-16 flex items-center justify-center p-3`};
        color: #a1a1a1;
        border: 1px solid #262626;
        border-radius: 8px;
        background: #111111;
    }
`;
