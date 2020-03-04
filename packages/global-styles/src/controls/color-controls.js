/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ColorControl, PanelBody } from '@wordpress/components';

export default function ColorControls( {
	color: {
		text: colorText,
		background: colorBackground,
		primary: colorPrimary,
	},
	setColor,
} ) {
	return (
		<PanelBody title={ __( 'Colors' ) } initialOpen={ false }>
			<ColorControl
				label={ __( 'Text' ) }
				value={ colorText }
				onChange={ ( value ) => setColor( { text: value } ) }
			/>
			<ColorControl
				label={ __( 'Background' ) }
				value={ colorBackground }
				onChange={ ( value ) => setColor( { background: value } ) }
			/>
			<ColorControl
				label={ __( 'Primary' ) }
				value={ colorPrimary }
				onChange={ ( value ) => setColor( { primary: value } ) }
			/>
		</PanelBody>
	);
}
