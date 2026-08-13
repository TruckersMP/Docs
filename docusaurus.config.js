// @ts-check
const { themes: prismThemes } = require( 'prism-react-renderer' );

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'TruckersMP Developers',
    tagline: 'Build plugins and tools for the TruckersMP platform',
    favicon: 'img/favicon.png',

    stylesheets: [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Barlow:ital,wght@0,600;0,700;0,800;1,700&family=JetBrains+Mono:wght@400;500&display=swap',
    ],

    url: 'https://docs.truckersmp.com',
    baseUrl: '/',

    organizationName: 'TruckersMP',
    projectName: 'docs',

    onBrokenLinks: 'throw',

    i18n: {
        defaultLocale: 'en',
        locales: [ 'en' ],
    },

    markdown: {
        mermaid: true,
    },

    themes: [
        '@docusaurus/theme-mermaid',
        [
            '@easyops-cn/docusaurus-search-local',
            {
                hashed: true,
                language: [ 'en' ],
                docsRouteBasePath: 'client-sdk',
                docsDir: 'client-sdk',
                indexBlog: false,
                highlightSearchTermsOnTargetPage: true,
            },
        ],
    ],

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ( {
                docs: {
                    path: 'client-sdk',
                    routeBasePath: 'client-sdk',
                    sidebarPath: require.resolve( './sidebars.js' ),
                },
                blog: false,
                theme: {
                    customCss: require.resolve( './src/css/custom.css' ),
                },
            } ),
        ],
        [
            'redocusaurus',
            {
                specs: [
                    {
                        id: 'web-api-v2',
                        spec: 'https://raw.githubusercontent.com/TruckersMP/API-Documentation/main/OpenAPI-v2.yml',
                        route: '/web-api/',
                    },
                ],
                theme: {
                    primaryColor: '#b92025',
                },
            },
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ( {
            colorMode: {
                defaultMode: 'dark',
                respectPrefersColorScheme: true,
            },
            announcementBar: {
                id: 'sdk-1-0-0',
                content: 'The TruckersMP Client SDK 1.0.0 documentation is live.',
                backgroundColor: '#b92025',
                textColor: '#ffffff',
                isCloseable: true,
            },
            navbar: {
                style: 'dark',
                logo: {
                    alt: 'TruckersMP',
                    src: 'img/truckersmp-logo.png',
                },
                items: [
                    {
                        type: 'docSidebar',
                        sidebarId: 'sdk',
                        position: 'left',
                        label: 'Client SDK',
                    },
                    {
                        to: '/web-api/',
                        label: 'Web API',
                        position: 'left',
                    },
                    {
                        href: 'https://truckersmp.com/knowledge-base',
                        label: 'Knowledge Base',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Documentation',
                        items: [
                            { label: 'Client SDK', to: '/client-sdk/' },
                            { label: 'Web API', to: '/web-api/' },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            { label: 'Forum', href: 'https://forum.truckersmp.com' },
                            { label: 'Discord', href: 'https://discord.gg/truckersmp' },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            { label: 'TruckersMP', href: 'https://truckersmp.com' },
                            { label: 'GitHub', href: 'https://github.com/TruckersMP' },
                        ],
                    },
                ],
                copyright: `Copyright © ${ new Date().getFullYear() } TruckersMP. Built with Docusaurus.`,
            },
            prism: {
                theme: prismThemes.github,
                darkTheme: prismThemes.dracula,
                additionalLanguages: [ 'c', 'cpp', 'cmake', 'powershell', 'json', 'yaml' ],
            },
        } ),
};

module.exports = config;
