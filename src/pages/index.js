import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

const cards = [
    {
        title: 'Client SDK',
        description:
            'Write native plugins for the TruckersMP client. Guides for setup, events, players, vehicles, input, rendering, and bus jobs.',
        to: '/client-sdk/',
        linkText: 'Read the guides',
    },
    {
        title: 'Web API',
        description:
            'Query players, bans, servers, game time, and events over HTTPS. Full reference generated from the OpenAPI specification.',
        to: '/web-api/',
        linkText: 'Browse the reference',
    },
    {
        title: 'Knowledge Base',
        description:
            'Player-facing articles about the mod: installation, rules, troubleshooting, and frequently asked questions.',
        to: 'https://truckersmp.com/knowledge-base',
        linkText: 'Open the Knowledge Base',
    },
];

function HomeCard( { title, description, to, linkText } ) {
    return (
        <div className="col col--4 margin-bottom--lg">
            <div className="home-card">
                <h3>{ title }</h3>
                <p>{ description }</p>
                <Link className="button button--primary" to={ to }>
                    { linkText }
                </Link>
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Layout description="Documentation for the TruckersMP Client SDK and Web API.">
            <header className="hero hero--truckersmp">
                <div className="container">
                    <img
                        src="/img/truckersmp-logo.png"
                        alt="TruckersMP"
                        style={ { height: '3.5rem', marginBottom: '1.25rem' } }
                    />
                    <h1 className="hero__title">Developer Documentation</h1>
                    <p className="hero__subtitle">
                        One home for everything you need to build on TruckersMP:
                        the native Client SDK and the public Web API.
                    </p>
                    <Link className="button button--primary button--lg" to="/client-sdk/getting-started">
                        Get started with the SDK
                    </Link>
                </div>
            </header>
            <main className="container margin-vert--xl">
                <div className="row">
                    { cards.map( ( props ) => (
                        <HomeCard key={ props.title } { ...props } />
                    ) ) }
                </div>
            </main>
        </Layout>
    );
}
