import React from 'react';
import ReactDOM from 'react-dom';
import App from '@/components/App';

// Enable language support.
import './i18n';

const root = document.getElementById('app');

if (!root) {
    throw new Error('Pterodactyl application root (#app) was not found.');
}

ReactDOM.render(<App />, root);
