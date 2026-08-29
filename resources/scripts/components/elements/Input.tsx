import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    isLight?: boolean;
    hasError?: boolean;
}

const light = css<Props>`
    color: #111;
    border-color: #d4d4d4;
    background: #fff;

    &:focus {
        border-color: #111;
    }

    &:disabled {
        color: #737373;
        background: #f5f5f5;
    }
`;

const checkboxStyle = css<Props>`
    ${tw`cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4`};
    color-adjust: exact;
    border: 1px solid #3f3f3f;
    border-radius: 4px;
    background: #0a0a0a;
    transition: border-color 120ms ease, background 120ms ease;

    &:checked {
        border-color: #fff;
        background-color: #fff;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 100%;
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
    }

    &:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 2px;
    }
`;

const inputStyle = css<Props>`
    resize: none;
    ${tw`appearance-none outline-none w-full min-w-0 p-3 text-sm shadow-none focus:ring-0`};
    min-height: 2.5rem;
    color: #ededed;
    border: 1px solid #262626;
    border-radius: 6px;
    background: #0a0a0a;
    font-family: var(--font-geist);
    transition: border-color 120ms ease, background 120ms ease;

    &::placeholder {
        color: #666;
    }

    &:hover:not(:disabled):not(:read-only) {
        border-color: #3f3f3f;
    }

    & + .input-help {
        ${tw`mt-1 text-xs`};
        color: ${(props) => (props.hasError ? '#ff8b8f' : '#737373')};
    }

    &:required,
    &:invalid {
        ${tw`shadow-none`};
    }

    &:not(:disabled):not(:read-only):focus {
        border-color: #666;
        box-shadow: 0 0 0 1px #666;
        ${(props) => props.hasError && css`border-color: #e5484d; box-shadow: 0 0 0 1px #e5484d;`};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    ${(props) => props.isLight && light};
    ${(props) => props.hasError && css`color: #ffd1d3; border-color: #e5484d;`};
`;

const Input = styled.input<Props>`
    &:not([type='checkbox']):not([type='radio']) {
        ${inputStyle};
    }

    &[type='checkbox'],
    &[type='radio'] {
        ${checkboxStyle};

        &[type='radio'] {
            ${tw`rounded-full`};
        }
    }
`;

const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
