import React from 'react';
import ReactDOM from 'react-dom';

const root = document.getElementById('app');

const showFatal = (error: unknown) => {
    const message = error instanceof Error ? `${error.name}: ${error.message}\n\n${error.stack || ''}` : String(error);
    console.error(error);

    if (!root) return;

    root.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
        'min-height:100vh',
        'padding:32px',
        'background:#000',
        'color:#ededed',
        'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
        'white-space:pre-wrap',
        'overflow-wrap:anywhere',
    ].join(';');

    const title = document.createElement('div');
    title.textContent = 'PANEL BOOT ERROR';
    title.style.cssText = 'margin-bottom:16px;color:#e5484d;font-weight:700;font-size:18px';

    const body = document.createElement('pre');
    body.textContent = message;
    body.style.cssText = 'margin:0;font:inherit;line-height:1.55';

    wrapper.appendChild(title);
    wrapper.appendChild(body);
    root.appendChild(wrapper);
};

window.addEventListener('error', (event) => {
    if (event.error) showFatal(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    showFatal(event.reason);
});

if (root) {
    root.innerHTML = '<div style="min-height:100vh;display:grid;place-items:center;background:#000;color:#737373;font:13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace">Starting panel…</div>';
}

Promise.all([import('./i18n'), import('@/components/App')])
    .then(([, module]) => {
        ReactDOM.render(React.createElement(module.default), root);
    })
    .catch(showFatal);
