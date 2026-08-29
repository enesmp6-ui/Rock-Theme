import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${tw`w-full mx-auto px-4`};
    max-width: 920px;

    ${breakpoint('sm')`${tw`px-8`}`};

    form {
        width: 100%;
    }

    .auth-shell {
        display: grid;
        width: 100%;
        grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
        min-height: 32rem;
        overflow: hidden;
        border: 1px solid #262626;
        border-radius: 8px;
        background: #0a0a0a;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
    }

    .auth-brand {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2.25rem;
        overflow: hidden;
        border-right: 1px solid #262626;
        background: #000;
    }

    .auth-mark {
        position: absolute;
        top: 2rem;
        left: 2rem;
        z-index: 2;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #ededed;
        font-family: var(--font-geist-mono);
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.04em;
    }

    .auth-logo {
        width: 2rem;
        height: 2rem;
        border-radius: 6px;
        object-fit: contain;
    }

    .auth-brand-copy {
        position: relative;
        z-index: 1;
    }

    .auth-media {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.22;
        filter: grayscale(1) contrast(1.05);
    }

    .auth-brand::after {
        position: absolute;
        inset: 0;
        content: '';
        pointer-events: none;
        background: rgba(0, 0, 0, 0.45);
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2.5rem;
        background: #0a0a0a;
    }

    .auth-form input {
        border-color: #262626 !important;
        border-radius: 6px !important;
        background: #0a0a0a !important;
        color: #ededed !important;
        caret-color: #fff;
        box-shadow: none !important;
    }

    .auth-form input:hover {
        border-color: #3f3f3f !important;
    }

    .auth-form input:focus {
        border-color: #666 !important;
        box-shadow: 0 0 0 1px #666 !important;
    }

    .auth-form button[type='submit'] {
        border: 1px solid #fff;
        border-radius: 6px;
        background: #fff;
        color: #000;
        box-shadow: none;
        text-transform: none;
        font-weight: 500;
        letter-spacing: -0.01em;
        transition: background 120ms ease, border-color 120ms ease;
    }

    .auth-form button[type='submit']:hover,
    .auth-form button[type='submit']:focus {
        border-color: #d4d4d4;
        background: #eaeaea;
        transform: none;
        filter: none;
        box-shadow: none;
    }

    @media (max-width: 760px) {
        .auth-shell {
            grid-template-columns: 1fr;
        }

        .auth-brand {
            min-height: 12rem;
            justify-content: flex-end;
            padding: 5rem 1.5rem 1.5rem;
            border-right: 0;
            border-bottom: 1px solid #262626;
        }

        .auth-form {
            padding: 1.75rem 1.4rem 2rem;
        }
    }
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);
    const loginMedia = branding.loginMedia.trim();
    const isVideo = /\.(mp4|webm|ogg|ogv|mov)(?:[?#].*)?$/i.test(loginMedia);

    return (
        <Container>
            <FlashMessageRender css={tw`mb-2 px-1`} />
            <Form {...props} ref={ref}>
                <div className={'auth-shell'}>
                    <div className={'auth-brand'}>
                        {!!loginMedia &&
                            (isVideo ? (
                                <video className={'auth-media'} src={loginMedia} autoPlay muted loop playsInline />
                            ) : (
                                <span
                                    className={'auth-media'}
                                    style={{ backgroundImage: `url("${loginMedia}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                />
                            ))}
                        <span className={'auth-mark'}>
                            {branding.logo ? (
                                <img className={'auth-logo'} src={branding.logo} alt={''} aria-hidden={'true'} />
                            ) : (
                                <>{branding.mark} {name.toUpperCase()}</>
                            )}
                        </span>
                        <div className={'auth-brand-copy'}>
                            <p css={tw`text-xs text-neutral-500 mb-4`}>{branding.owner}</p>
                            <h1 css={tw`text-4xl text-white leading-tight`}>{branding.loginTitle}</h1>
                        </div>
                    </div>
                    <div className={'auth-form'}>
                        {title && <h2 css={tw`text-2xl text-neutral-100 font-semibold mb-2`}>{title}</h2>}
                        {!!branding.loginSubtitle && <p css={tw`text-sm text-neutral-400 mb-7`}>{branding.loginSubtitle}</p>}
                        {props.children}
                    </div>
                </div>
            </Form>
            <p css={tw`text-center text-neutral-500 text-xs mt-4`}>
                {branding.owner} &copy; {branding.startYear} - {new Date().getFullYear()}
            </p>
        </Container>
    );
});
