<?php
/**
 * Bootstraping Global Styles.
 *
 * @package gutenberg
 */

/**
 * Whether the current theme has support for Global Styles.
 *
 * @return boolean
 */
function gutenberg_experimental_global_styles_has_theme_support() {
	return is_readable( locate_template( 'experimental-theme.json' ) );
}

/**
 * Given a Global Styles tree, it creates a flattened tree
 * whose keys are the CSS custom properties
 * and its values the CSS custom properties' values.
 *
 * @param array  $global_styles Global Styles object to process.
 * @param string $prefix Prefix to prepend to each variable.
 * @param string $token Token to use between levels.
 *
 * @return array The flattened tree.
 */
function gutenberg_experimental_global_styles_get_css_vars( $global_styles, $prefix = '', $token = '--' ) {
	$result = array();
	foreach ( $global_styles as $key => $value ) {
		$new_key = $prefix . str_replace( '/', '-', $key );

		if ( is_array( $value ) ) {
			$new_prefix = $new_key . $token;
			$result     = array_merge(
				$result,
				gutenberg_experimental_global_styles_get_css_vars( $value, $new_prefix, $token )
			);
		} else {
			$result[ $new_key ] = $value;
		}
	}
	return $result;
}

/**
 * Returns an array containing the Global Styles
 * found in a file, or a void array if none found.
 *
 * @param string $global_styles_path Path to file.
 * @return array Global Styles tree.
 */
function gutenberg_experimental_global_styles_get_from_file( $global_styles_path ) {
	$global_styles = array();
	if ( file_exists( $global_styles_path ) ) {
		$decoded_file = json_decode(
			file_get_contents( $global_styles_path ),
			true
		);
		if ( is_array( $decoded_file ) ) {
			$global_styles = $decoded_file;
		}
	}
	return $global_styles;
}

/**
 * Returns an array containing the user's Global Styles
 * or a void array if none.
 *
 * @return array Global Styles tree.
 */
function gutenberg_experimental_global_styles_get_user() {
	$global_styles = array();
	$user_cpt      = gutenberg_experimental_global_styles_get_user_cpt( array( 'publish' ) );
	if ( array_key_exists( 'post_content', $user_cpt ) ) {
		$decoded_data = json_decode( $user_cpt['post_content'], true );
		if ( is_array( $decoded_data ) ) {
			$global_styles = $decoded_data;
		}
	}

	return $global_styles;
}

/**
 * Returns the CPT that contains the user's Global Styles
 * for the current theme or a void array if none found.
 * It can also create and return a new draft CPT.
 *
 * @param array $post_status_filter Filter CPT by post status.
 *                                  By default, only fetches published posts.
 * @param bool  $should_create_cpt Whether a new draft should be created
 *                                 if no CPT was found. False by default.
 * @return array Custom Post Type for the user's Global Styles.
 */
function gutenberg_experimental_global_styles_get_user_cpt( $post_status_filter = array( 'publish' ), $should_create_cpt = false ) {
	$user_cpt         = array();
	$post_type_filter = 'wp_global_styles';
	$post_name_filter = 'wp-global-styles-' . strtolower( wp_get_theme()->get( 'TextDomain' ) );
	$recent_posts     = wp_get_recent_posts(
		array(
			'numberposts' => 1,
			'orderby'     => 'date',
			'order'       => 'desc',
			'post_type'   => $post_type_filter,
			'post_status' => $post_status_filter,
			'name'        => $post_name_filter,
		)
	);

	if ( is_array( $recent_posts ) && ( count( $recent_posts ) === 1 ) ) {
		$user_cpt = $recent_posts[0];
	} elseif ( $should_create_cpt ) {
		$cpt_post_id = wp_insert_post(
			array(
				'post_content' => '{}',
				'post_status'  => 'publish',
				'post_type'    => $post_type_filter,
				'post_name'    => $post_name_filter,
			),
			true
		);
		$user_cpt    = get_post( $cpt_post_id, ARRAY_A );
	}

	return $user_cpt;
}

/**
 * Returns the post ID of the CPT containing the user's Global Styles.
 *
 * @return integer Custom Post Type ID for the user's Global Styles.
 */
function gutenberg_experimental_global_styles_get_user_cpt_id() {
	$user_cpt_id = null;
	$user_cpt    = gutenberg_experimental_global_styles_get_user_cpt( array( 'publish', 'draft' ), true );
	if ( array_key_exists( 'ID', $user_cpt ) ) {
		$user_cpt_id = $user_cpt['ID'];
	}
	return $user_cpt_id;
}

/**
 * Return core's Global Styles.
 *
 * @return array Global Styles tree.
 */
function gutenberg_experimental_global_styles_get_core() {
	return gutenberg_experimental_global_styles_get_from_file(
		dirname( dirname( __FILE__ ) ) . '/experimental-default-global-styles.json'
	);
}

/**
 * Return theme's Global Styles.
 *
 * @return array Global Styles tree.
 */
function gutenberg_experimental_global_styles_get_theme() {
	return gutenberg_experimental_global_styles_get_from_file(
		locate_template( 'experimental-theme.json' )
	);
}

/**
 * Given a base line height and a multiplier, generates a new line height.
 *
 * @param integer $line_height Base line height.
 * @param integer $multiplier Multiplier.
 * @return float New line height.
 */
function gutenberg_experimental_global_styles_generate_line_height( $line_height, $multiplier ) {
	return round( $line_height * $multiplier, 2 );
}

/**
 * Given a base font weight and a multiplier, generates a new font weight.
 *
 * @param integer $font_weight Base font weight.
 * @param integer $multiplier Multiplier.
 * @return integer New font weight.
 */
function gutenberg_experimental_global_styles_generate_font_weight( $font_weight, $multiplier ) {
	return intval( $font_weight * $multiplier );
}

/**
 * Given a font size, scale, and multiplier,
 * generates a new font size.
 *
 * @param string  $font_base Base font size in pixels.
 * @param integer $font_scale Base scale.
 * @param integer $multiplier Multiplier.
 * @return float Font size in pixels.
 */
function gutenberg_experimental_global_styles_generate_font_size( $font_base, $font_scale, $multiplier ) {
	$font_base_unitless = intval( str_replace( 'px', '', $font_base ) );
	return round( pow( $font_scale, $multiplier ) * $font_base_unitless, 2 ) . 'px';
}

/**
 * Given a global styles tree, generates the value of some
 * design tokens.
 *
 * @param array $global_styles Global Styles tree.
 * @return array Global Styles tree with the new values.
 */
function gutenberg_experimental_global_styles_generate_styles( $global_styles ) {
	$line_height = $global_styles['typography']['line-height'];
	$font_size   = $global_styles['typography']['font-size'];
	$font_scale  = $global_styles['typography']['font-scale'];
	$font_weight = $global_styles['typography']['font-weight'];

	$tree = array_replace_recursive(
		$global_styles,
		array(
			'typography' => array(
				'line-height-heading' => gutenberg_experimental_global_styles_generate_line_height( $line_height, 0.8 ),
				'font-size-heading-1' => gutenberg_experimental_global_styles_generate_font_size( $font_size, $font_scale, 5 ),
				'font-size-heading-2' => gutenberg_experimental_global_styles_generate_font_size( $font_size, $font_scale, 4 ),
				'font-size-heading-3' => gutenberg_experimental_global_styles_generate_font_size( $font_size, $font_scale, 3 ),
				'font-size-heading-4' => gutenberg_experimental_global_styles_generate_font_size( $font_size, $font_scale, 2 ),
				'font-size-heading-5' => gutenberg_experimental_global_styles_generate_font_size( $font_size, $font_scale, 1 ),
				'font-size-heading-6' => gutenberg_experimental_global_styles_generate_font_size( $font_size, $font_scale, 0.5 ),
				'font-weight-heading' => gutenberg_experimental_global_styles_generate_font_weight( $font_weight, 1.5 ),
			),
		)
	);
	return $tree;
}

/**
 * Takes core, theme, and user preferences,
 * builds a single global styles tree and returns a CSS rule
 * that contains the corresponding CSS custom properties.
 *
 * @return string CSS rule.
 */
function gutenberg_experimental_global_styles_resolver() {
	$css_rule = '';

	$base = array_replace_recursive(
		gutenberg_experimental_global_styles_get_core(),
		gutenberg_experimental_global_styles_get_theme(),
		gutenberg_experimental_global_styles_get_user()
	);

	$global_styles = gutenberg_experimental_global_styles_generate_styles( $base );

	$token    = '--';
	$prefix   = '--wp' . $token;
	$css_vars = gutenberg_experimental_global_styles_get_css_vars( $global_styles, $prefix, $token );
	if ( empty( $css_vars ) ) {
		return $css_rule;
	}

	$css_rule = ":root {\n";
	foreach ( $css_vars as $var => $value ) {
		$css_rule .= "\t" . $var . ': ' . $value . ";\n";
	}
	$css_rule .= '}';

	return $css_rule;
}

/**
 * Fetches the Global Styles for each level (core, theme, user)
 * and enqueues the resulting CSS custom properties for the editor.
 */
function gutenberg_experimental_global_styles_enqueue_assets_editor() {
	if ( gutenberg_experimental_global_styles_is_site_editor() ) {
		gutenberg_experimental_global_styles_enqueue_assets();
	}
}

/**
 * Fetches the Global Styles for each level (core, theme, user)
 * and enqueues the resulting CSS custom properties.
 */
function gutenberg_experimental_global_styles_enqueue_assets() {
	if ( ! gutenberg_experimental_global_styles_has_theme_support() ) {
		return;
	}

	$inline_style = gutenberg_experimental_global_styles_resolver();
	if ( empty( $inline_style ) ) {
		return;
	}

	wp_register_style( 'global-styles', false, array(), true, true );
	wp_add_inline_style( 'global-styles', $inline_style );
	wp_enqueue_style( 'global-styles' );
}

/**
 * Adds class wp-gs to the frontend body class.
 *
 * @param array $classes Existing body classes.
 * @return array The filtered array of body classes.
 */
function gutenberg_experimental_global_styles_wp_gs_class_front_end( $classes ) {
	if ( ! gutenberg_experimental_global_styles_has_theme_support() ) {
		return $classes;
	}

	return array_merge( $classes, array( 'wp-gs' ) );
}

/**
 * Adds class wp-gs to the block-editor body class.
 *
 * @param string $classes Existing body classes separated by space.
 * @return string The filtered string of body classes.
 */
function gutenberg_experimental_global_styles_wp_gs_class_editor( $classes ) {
	if (
		! gutenberg_experimental_global_styles_has_theme_support() ||
		! gutenberg_experimental_global_styles_is_site_editor()
	) {
		return $classes;
	}

	return $classes . ' wp-gs';
}

/**
 * Whether the loaded page is the site editor.
 *
 * @return boolean Whether the loaded page is the site editor.
 */
function gutenberg_experimental_global_styles_is_site_editor() {
	if ( ! function_exists( 'get_current_screen' ) ) {
		return false;
	}

	$screen = get_current_screen();
	return ! empty( $screen ) && gutenberg_is_edit_site_page( $screen->id );
}

/**
 * Makes the base Global Styles (core, theme)
 * and the ID of the CPT that stores the user's Global Styles
 * available to the client, to be used for live rendering the styles.
 *
 * @param array $settings Existing block editor settings.
 * @return array New block editor settings
 */
function gutenberg_experimental_global_styles_settings( $settings ) {
	if (
		! gutenberg_experimental_global_styles_has_theme_support() ||
		! gutenberg_experimental_global_styles_is_site_editor()
	) {
		return $settings;
	}

	$settings['__experimentalGlobalStylesUserEntityId'] = gutenberg_experimental_global_styles_get_user_cpt_id();

	$global_styles = array_merge(
		gutenberg_experimental_global_styles_get_core(),
		gutenberg_experimental_global_styles_get_theme()
	);

	$settings['__experimentalGlobalStylesBase'] = $global_styles;

	return $settings;
}

/**
 * Registers a Custom Post Type to store the user's Global Styles.
 */
function gutenberg_experimental_global_styles_register_cpt() {
	if ( ! gutenberg_experimental_global_styles_has_theme_support() ) {
		return;
	}

	$args = array(
		'label'        => __( 'Global Styles', 'gutenberg' ),
		'description'  => 'CPT to store user design tokens',
		'public'       => false,
		'show_ui'      => false,
		'show_in_rest' => true,
		'rest_base'    => '__experimental/global-styles',
		'capabilities' => array(
			'read'                   => 'edit_theme_options',
			'create_posts'           => 'edit_theme_options',
			'edit_posts'             => 'edit_theme_options',
			'edit_published_posts'   => 'edit_theme_options',
			'delete_published_posts' => 'edit_theme_options',
			'edit_others_posts'      => 'edit_theme_options',
			'delete_others_posts'    => 'edit_theme_options',
		),
		'map_meta_cap' => true,
		'supports'     => array(
			'editor',
			'revisions',
		),
	);
	register_post_type( 'wp_global_styles', $args );
}

if ( gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
	add_action( 'init', 'gutenberg_experimental_global_styles_register_cpt' );
	add_filter( 'body_class', 'gutenberg_experimental_global_styles_wp_gs_class_front_end' );
	add_filter( 'admin_body_class', 'gutenberg_experimental_global_styles_wp_gs_class_editor' );
	add_filter( 'block_editor_settings', 'gutenberg_experimental_global_styles_settings' );
	// enqueue_block_assets is not fired in edit-site, so we use separate back/front hooks instead.
	add_action( 'wp_enqueue_scripts', 'gutenberg_experimental_global_styles_enqueue_assets' );
	add_action( 'admin_enqueue_scripts', 'gutenberg_experimental_global_styles_enqueue_assets_editor' );
}
