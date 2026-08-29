import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
    :root {
        color-scheme: dark;
        --shell-bg: #000000;
        --shell-panel: #0a0a0a;
        --shell-panel-strong: #111111;
        --shell-panel-soft: #171717;
        --shell-border: #262626;
        --shell-border-strong: #3f3f3f;
        --shell-text: #ededed;
        --shell-muted: #a1a1a1;
        --shell-accent: #ffffff;
        --shell-accent-rgb: 255, 255, 255;
        --shell-accent-bright: #ffffff;
        --shell-accent-soft: rgba(255, 255, 255, 0.08);
        --shell-success: #46a758;
        --shell-warning: #f5a623;
        --shell-danger: #e5484d;
        --shell-radius: 8px;
        --shell-shadow: 0 12px 32px rgba(0, 0, 0, 0.32);
        --shell-grid: transparent;
        --shell-glass: 0px;
        --font-geist: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --font-geist-mono: 'Geist Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
    }

    :root[data-rock-motion='reduced'] *,
    :root[data-rock-motion='reduced'] *::before,
    :root[data-rock-motion='reduced'] *::after {
        scroll-behavior: auto !important;
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
    }

    @font-face {
        font-family: 'Geist';
        font-style: normal;
        font-display: swap;
        font-weight: 100 900;
        src: url('https://cdn.jsdelivr.net/npm/@fontsource-variable/geist@5.3.0/files/geist-latin-wght-normal.woff2') format('woff2-variations');
    }

    @font-face {
        font-family: 'Geist Mono';
        font-style: normal;
        font-display: swap;
        font-weight: 100 900;
        src: url('https://cdn.jsdelivr.net/npm/@fontsource-variable/geist-mono@5.3.0/files/geist-mono-latin-wght-normal.woff2') format('woff2-variations');
    }

    html,
    body,
    #app {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
        overflow-x: clip;
    }

    html {
        background: #000;
    }

    body {
        ${tw`text-neutral-200`};
        min-height: 100vh;
        margin: 0;
        color: var(--shell-text);
        background: var(--shell-bg);
        font-family: var(--font-geist);
        font-feature-settings: 'kern';
        letter-spacing: -0.01em;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }

    .nook-container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 100%;
        min-height: 100vh;
        background: #000;
    }

    .nook-container::before {
        display: none;
    }

    .rock-page {
        position: relative;
        min-height: calc(100vh - 10rem);
    }

    .rock-footer p {
        margin: 0 auto;
        color: #666;
        background: transparent;
        border: 0;
        border-radius: 0;
        backdrop-filter: none;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        ${tw`tracking-normal`};
        color: var(--shell-text);
        font-family: var(--font-geist);
        font-weight: 600;
        letter-spacing: -0.035em;
    }

    p {
        ${tw`leading-snug`};
        color: var(--shell-text);
        font-family: var(--font-geist);
    }

    code,
    pre,
    kbd,
    samp {
        font-family: var(--font-geist-mono);
    }

    form {
        ${tw`m-0`};
    }

    textarea,
    select,
    input,
    button {
        font-family: inherit;
    }

    textarea,
    select,
    input,
    button,
    button:focus,
    button:focus-visible {
        ${tw`outline-none`};
    }

    ::selection {
        color: #000;
        background: #fff;
    }

    ::placeholder {
        color: #666;
        opacity: 1;
    }

    :focus-visible {
        outline: 2px solid #ededed;
        outline-offset: 2px;
    }

    hr {
        border-color: var(--shell-border);
    }

    [role='tooltip'] {
        color: var(--shell-text);
        border: 1px solid var(--shell-border);
        border-radius: 6px;
        background: #111;
        box-shadow: var(--shell-shadow);
        backdrop-filter: none;
    }

    a,
    button {
        -webkit-tap-highlight-color: transparent;
    }

    .spotlight-card {
        position: relative;
        overflow: hidden;
        --spotlight-color: transparent;
    }

    .spotlight-card::before {
        display: none !important;
    }

    .activity-feed {
        overflow: hidden;
        border: 1px solid var(--shell-border);
        border-radius: var(--shell-radius);
        background: var(--shell-panel);
    }

    .activity-feed .rb-fluid-content > div {
        border-color: var(--shell-border);
        transition: background 120ms ease, border-color 120ms ease;
    }

    .activity-feed .rb-fluid-content > div:hover {
        border-color: var(--shell-border-strong);
        background: #111;
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
        background: #000;
    }

    ::-webkit-scrollbar-thumb {
        border: 3px solid #000;
        border-radius: 999px;
        background: #3f3f3f;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #525252;
    }

    ::-webkit-scrollbar-corner {
        background: #000;
    }

    @media (max-width: 640px) {
        .rock-page {
            min-height: calc(100vh - 8rem);
            padding-bottom: 4.5rem;
        }
    }
`;
