/**
 * WordPress dependencies
 */
import { useEffect, useLayoutEffect } from '@wordpress/element';

export function useRenderedGlobalStyles( styles = {} ) {
	useGlobalStylesEnvironment();
	const generatedStyles = compileStyles( styles );

	useEffect( () => {
		// styleNodeId should match server ID, see global-styles.php
		const styleNodeId = 'global-styles-inline-css';
		let styleNode = document.getElementById( styleNodeId );

		if ( ! styleNode ) {
			styleNode = document.createElement( 'style' );
			styleNode.id = styleNodeId;
			document
				.getElementsByTagName( 'head' )[ 0 ]
				.appendChild( styleNode );
		}

		styleNode.innerText = generatedStyles;
	}, [ generatedStyles ] );
}

function useGlobalStylesEnvironment() {
	useLayoutEffect( () => {
		// Adding a slight async delay to give the Gutenberg editor time to render.
		window.requestAnimationFrame( () => {
			// Getting the Gutenberg editor content wrapper DOM node.
			const editorNode = document.getElementsByClassName(
				'editor-styles-wrapper'
			)[ 0 ];

			const targetNode = editorNode || document.documentElement;

			if ( ! targetNode.classList.contains( 'wp-gs' ) ) {
				targetNode.classList.add( 'wp-gs' );
			}
		} );
	}, [] );
}

function flattenObject( ob, token = '' ) {
	const toReturn = {};

	for ( const i in ob ) {
		if ( ! ob.hasOwnProperty( i ) ) continue;

		if ( typeof ob[ i ] === 'object' ) {
			const flatObject = flattenObject( ob[ i ], token );
			for ( const x in flatObject ) {
				if ( ! flatObject.hasOwnProperty( x ) ) continue;

				toReturn[ i + token + x ] = flatObject[ x ];
			}
		} else {
			toReturn[ i ] = ob[ i ];
		}
	}
	return toReturn;
}

function compileStyles( styles = {} ) {
	const prefix = '--wp';
	const token = '--';
	const flattenedStyles = { ...flattenObject( styles, token ) };
	const html = [];
	html.push( ':root {' );

	for ( const key in flattenedStyles ) {
		const value = flattenedStyles[ key ];
		if ( value ) {
			const style = `${ prefix + token + key }: ${ value };`;
			html.push( style );
		}
	}
	html.push( '}' );

	return html.join( '\n' );
}
