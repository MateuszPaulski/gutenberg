/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ColorControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { GlobalStylesPanelBody } from '../global-styles-panel-body';
import { useGlobalStylesState } from '../store';

export default function ColorControls() {
	const {
		colorText,
		colorBackground,
		colorPrimary,
		setStyles,
	} = useGlobalStylesState();

	return (
		<GlobalStylesPanelBody title={ __( 'Colors' ) } initialOpen={ false }>
			<ColorControl
				label={ __( 'Text' ) }
				value={ colorText }
				onChange={ ( value ) => setStyles( { colorText: value } ) }
			/>
			<ColorControl
				label={ __( 'Background' ) }
				value={ colorBackground }
				onChange={ ( value ) =>
					setStyles( { colorBackground: value } )
				}
			/>
			<ColorControl
				label={ __( 'Primary' ) }
				value={ colorPrimary }
				onChange={ ( value ) => setStyles( { colorPrimary: value } ) }
			/>
		</GlobalStylesPanelBody>
	);
}
