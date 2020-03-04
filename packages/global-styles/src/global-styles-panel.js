/**
 * WordPress dependencies
 */
import { Panel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ColorControls, TypographyControls } from './controls';
import { useGlobalStylesContext } from './provider';

export function GlobalStylesPanel() {
	const {
		typography,
		setTypography,
		color,
		setColor,
	} = useGlobalStylesContext();

	if ( color === undefined || typography === undefined ) {
		return null;
	}

	return (
		<Panel header={ __( 'Global Styles' ) }>
			<TypographyControls
				typography={ typography }
				setTypography={ setTypography }
			/>
			<ColorControls color={ color } setColor={ setColor } />
		</Panel>
	);
}
