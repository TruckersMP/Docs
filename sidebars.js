// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    sdk: [
        {
            type: 'category',
            label: 'Basics',
            collapsed: false,
            items: [
                'index',
                'getting-started',
            ],
        },
        {
            type: 'category',
            label: 'Core Concepts',
            collapsed: false,
            items: [
                'concepts/architecture',
                'concepts/events',
                'concepts/data-and-handles',
                'concepts/threading',
                'concepts/results',
                'concepts/versioning',
            ],
        },
        {
            type: 'category',
            label: 'Modules',
            collapsed: true,
            items: [
                'modules/core',
                'modules/account',
                'modules/player',
                'modules/vehicles-and-trailers',
                'modules/input',
                'modules/render',
                'modules/network',
                'modules/gameplay',
                'modules/user-interface',
            ],
        },
        {
            type: 'category',
            label: 'How to',
            collapsed: true,
            items: [
                'how-to/bus-job-tracking',
            ],
        },
        {
            type: 'category',
            label: 'Advanced',
            collapsed: true,
            items: [
                'advanced/intents',
                'advanced/bus',
                'advanced/best-practices',
            ],
        },
        'changelog',
    ],
};

module.exports = sidebars;
