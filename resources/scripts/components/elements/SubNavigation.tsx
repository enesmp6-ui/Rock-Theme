import styled from 'styled-components/macro';
import tw from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full overflow-x-auto`};
    border-bottom: 1px solid #262626;
    background: #000;
    box-shadow: none;

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 no-underline whitespace-nowrap transition-colors duration-150`};
            color: #737373;

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                color: #ededed;
                background: #0a0a0a;
            }

            &:active,
            &.active {
                color: #fff;
                box-shadow: inset 0 -1px #fff;
                background: transparent;
            }
        }
    }
`;

export default SubNavigation;
