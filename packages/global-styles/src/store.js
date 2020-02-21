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

export const GlobalStylesContext = createContext( {} );
export const useGlobalStylesState = () => useContext( GlobalStylesContext );

export function GlobalStylesStateProvider( { children } ) {
	const state = useGlobalStylesStore();

	return (
		<GlobalStylesContext.Provider value={ state }>
			{ children }
		</GlobalStylesContext.Provider>
	);
}

export function useGlobalStylesDataState() {
	const initialState = {
		colorBackground: '#ffffff',
		colorPrimary: '#0000ff',
		colorText: '#000000',
		fontScale: 1.2,
		fontSize: 16,
		fontSizeQuote: 24,
		fontWeight: 400,
		fontWeightHeading: 600,
		lineHeight: 1.5,
	};

	const [ state, _setState ] = useState( initialState );

	const setState = ( nextState = {} ) => {
		const mergedState = { ...state, ...nextState };
		_setState( mergedState );
	};

	return [ state, setState ];
}

export function useGlobalStylesStore() {
	// TODO: Replace with data/actions from wp.data
	const [ styleState, setStyles ] = useGlobalStylesDataState();
	const {
		colorBackground,
		colorPrimary,
		colorText,
		fontScale,
		fontSize,
		fontSizeQuote,
		fontWeight,
		fontWeightHeading,
		lineHeight,
	} = styleState;

	const styles = {
		color: {
			background: colorBackground,
			primary: colorPrimary,
			text: colorText,
		},
		typography: {
			fontScale,
			...generateFontSizes( { fontSize, fontScale } ),
			fontSizeQuote: toPx( fontSizeQuote ),
			fontWeight,
			fontWeightHeading,
			...generateLineHeight( { lineHeight } ),
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

function generateLineHeight( { lineHeight = 1.5 } ) {
	return {
		lineHeight,
		lineHeightHeading: ( lineHeight * 0.8 ).toFixed( 2 ),
	};
}

function generateFontSizes( { fontSize = 16, fontScale = 1.2 } ) {
	const toScaledPx = ( size ) => {
		const value = ( Math.pow( fontScale, size ) * fontSize ).toFixed( 2 );
		return toPx( value );
	};

	return {
		fontSize: `${ fontSize }px`,
		fontSizeH1: toScaledPx( 5 ),
		fontSizeH2: toScaledPx( 4 ),
		fontSizeH3: toScaledPx( 3 ),
		fontSizeH4: toScaledPx( 2 ),
		fontSizeH5: toScaledPx( 1 ),
		fontSizeH6: toScaledPx( 0.5 ),
	};
}

function toPx( value ) {
	return `${ value }px`;
}
