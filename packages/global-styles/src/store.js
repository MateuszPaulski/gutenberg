/**
 * External dependencies
 */
import { camelCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState, useContext, createContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useRenderedGlobalStyles } from './renderer';

/**
 * TODO: Replace everything below with wp.data store mechanism
 */

const GlobalStylesContext = createContext( {} );
export const useGlobalStylesState = () => useContext( GlobalStylesContext );

export function GlobalStylesStateProvider( { children, baseStyle } ) {
	const state = useGlobalStylesStore( baseStyle );

	return (
		<GlobalStylesContext.Provider value={ state }>
			{ children }
		</GlobalStylesContext.Provider>
	);
}

function useGlobalStylesDataState( initialState ) {
	const toCamelCase = ( tree ) => {
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
	};

	const [ state, _setState ] = useState( toCamelCase( initialState ) );

	const setState = ( nextState = {} ) => {
		const mergedState = { ...state, ...nextState };
		_setState( mergedState );
	};

	return [ state, setState ];
}

function useGlobalStylesStore( initialState ) {
	// TODO: Replace with data/actions from wp.data
	const [ styleState, setStyles ] = useGlobalStylesDataState( initialState );

	const styles = {
		color: {
			...styleState.color,
		},
		typography: {
			...styleState.typography,
			...generateFontSizesHeading( styleState.typography ),
			...generateLineHeightHeading( styleState.typography ),
		},
	};

	useRenderedGlobalStyles( styles );

	return {
		...styleState,
		setStyles,
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
