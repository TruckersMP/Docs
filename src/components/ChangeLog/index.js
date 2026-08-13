import React from 'react';
import styles from './styles.module.css';

export function ChangeLogEntry( { date, title, children } ) {
    const anchor = title.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /(^-|-$)/g, '' );

    return (
        <article className={ styles.entry }>
            <div className={ styles.meta }>
                <span className={ styles.date }>{ date }</span>
            </div>
            <div className={ styles.content }>
                <h2 id={ anchor }>
                    { title }
                    <a className="hash-link" href={ `#${ anchor }` } aria-label={ `Direct link to ${ title }` }></a>
                </h2>
                { children }
            </div>
        </article>
    );
}
