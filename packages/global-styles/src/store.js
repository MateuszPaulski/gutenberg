/**
 * External dependencies
 */
import { camelCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { useContext, createContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useRenderedGlobalStyles } from './renderer';

/**
 * TODO: Replace everything below with wp.data store mechanism
 */

const GlobalStylesContext = createContext( {} );
export const useGlobalStylesContext = () => useContext( GlobalStylesContext );

export function GlobalStylesProvider( { children, baseStyles, userEntityId } ) {
	// Trigger entity retrieval.
	useSelect( ( select ) =>
		select( 'core' ).getEntityRecord(
			'postType',
			'wp_global_styles',
			userEntityId
		)
	);
	const globalStyles = useGlobalStyles( baseStyles, userEntityId );

	return (
		<GlobalStylesContext.Provider value={ globalStyles }>
			{ children }
		</GlobalStylesContext.Provider>
	);
}

function toCamelCase( tree ) {
	if ( ! ( tree instanceof Object ) ) {
		return tree;
	}

	const newTree = {};
	for ( const key in tree ) {
		if ( ! tree.hasOwnProperty( key ) ) continue;

		if ( tree[ key ] instanceof Object ) {
			newTree[ camelCase( key ) ] = toCamelCase( tree[ key ] );
		} else {
			newTree[ camelCase( key ) ] = tree[ key ];
		}
	}
	return newTree;
}

function useGlobalStyles( baseStyles, userEntityId ) {
	let styles = {
		...toCamelCase( baseStyles ),
	};

	const setColor = () => {};
	const setTypography = () => {};

	// Add user styles if any.
	const userStyles = useSelect( ( select ) =>
		select( 'core' ).getEditedEntityRecord(
			'postType',
			'wp_global_styles',
			userEntityId
		)
	);
	if ( Object.keys( userStyles ).length > 0 ) {
		styles = {
			...styles,
			...toCamelCase( JSON.parse( userStyles.content ) ),
		};
	}

	// Add generated styles.
	styles = {
		...styles,
		typography: {
			...styles.typography,
			...generateFontSizesHeading( styles.typography ),
			...generateLineHeightHeading( styles.typography ),
		},
	};

	// Convert styles to CSS props.
	useRenderedGlobalStyles( styles );

	// Return context value.
	return {
		...styles,
		setColor,
		setTypography,
	};
}

/**
 * NOTE: Generators for extra computed values.
 */

function generateLineHeightHeading( { lineHeight } ) {
	return {
		lineHeightHeading: ( lineHeight * 0.8 ).toFixed( 2 ),
	};
}

function generateFontSizesHeading( { fontSize, fontScale } ) {
	const fontBase = fromPx( fontSize );
	const toScale = ( size ) =>
		( Math.pow( fontScale, size ) * fontBase ).toFixed( 2 );

	return {
		fontSize,
		fontSizeHeading1: toPx( toScale( 5 ) ),
		fontSizeHeading2: toPx( toScale( 4 ) ),
		fontSizeHeading3: toPx( toScale( 3 ) ),
		fontSizeHeading4: toPx( toScale( 2 ) ),
		fontSizeHeading5: toPx( toScale( 1 ) ),
		fontSizeHeading6: toPx( toScale( 0.5 ) ),
	};
}

function toPx( value ) {
	return `${ value }px`;
}

function fromPx( value ) {
	return +value.replace( 'px', '' );
}
