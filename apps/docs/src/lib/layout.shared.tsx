import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(_locale: string): BaseLayoutProps {
  return {
    nav: {
      title: 'VidBee',
    },
    // The i18n config holds functions, which cannot cross into client components.
    i18n: true,
  };
}
