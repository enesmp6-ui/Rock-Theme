import { useEffect } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

export default () => {
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);

    useEffect(() => {
        const root = document.documentElement;

        root.dataset.rockTheme = 'vercel';
        root.dataset.rockMotion = branding.motionEnabled ? 'full' : 'reduced';
        root.style.setProperty('--shell-bg', '#000000');
        root.style.setProperty('--shell-panel', '#0a0a0a');
        root.style.setProperty('--shell-panel-strong', '#111111');
        root.style.setProperty('--shell-panel-soft', '#171717');
        root.style.setProperty('--shell-border', '#262626');
        root.style.setProperty('--shell-border-strong', '#3f3f3f');
        root.style.setProperty('--shell-text', '#ededed');
        root.style.setProperty('--shell-muted', '#a1a1a1');
        root.style.setProperty('--shell-accent', '#ffffff');
        root.style.setProperty('--shell-accent-rgb', '255, 255, 255');
        root.style.setProperty('--shell-accent-bright', '#ffffff');
        root.style.setProperty('--shell-accent-soft', 'rgba(255, 255, 255, 0.08)');
        root.style.setProperty('--shell-radius', '8px');
        root.style.setProperty('--shell-glass', '0px');

        const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        themeColor?.setAttribute('content', '#000000');

        return () => {
            delete root.dataset.rockTheme;
            delete root.dataset.rockMotion;
            [
                '--shell-bg',
                '--shell-panel',
                '--shell-panel-strong',
                '--shell-panel-soft',
                '--shell-border',
                '--shell-border-strong',
                '--shell-text',
                '--shell-muted',
                '--shell-accent',
                '--shell-accent-rgb',
                '--shell-accent-bright',
                '--shell-accent-soft',
                '--shell-radius',
                '--shell-glass',
            ].forEach((property) => root.style.removeProperty(property));
        };
    }, [branding.motionEnabled]);

    return null;
};
