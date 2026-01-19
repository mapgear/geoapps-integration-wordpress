<?php
/**
 * Plugin Name:       GeoApps
 * Description:       GeoApps Wordpress plugin
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Version:           1.1.0
 * Author:            MapGear B.V.
 * License:           GPLv2
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       geoapps
 *
 * @package           geoapps
 */

/**
 * Register external GeoApps assets once so they can be enqueued in both the editor and the frontend.
 */
function geoapps_register_assets() {
    wp_register_script(
        'geoapps-script',
        'https://mapgear.geoapps.nl/scripts/geoapps/v1/geoapps.min.js',
        array(),
        null,
        true
    );

    wp_register_style(
        'geoapps-style',
        'https://mapgear.geoapps.nl/scripts/geoapps/v1/geoapps.min.css',
        array(),
        null
    );

    register_block_type(
        __DIR__,
        array(
            'render_callback' => 'geoapps_render_map_block',
        )
    );
}
add_action( 'init', 'geoapps_register_assets' );

/**
 * Ensure GeoApps assets are available inside the block editor preview (iframe).
 */
function geoapps_enqueue_editor_assets() {
    wp_enqueue_script( 'geoapps-script' );
    wp_enqueue_style( 'geoapps-style' );
}
add_action( 'enqueue_block_editor_assets', 'geoapps_enqueue_editor_assets' );

/**
 * Implement the frontend rendering for this block. It generates a div, configured with the styling
 * properties. After that, it initialized the map object into this specific div through the GeoApps API
 *
 * Details of the GeoApps API can be found at: https://docs.geoapps.dev/
 */
function geoapps_render_map_block($settings) {
	wp_enqueue_script( 'geoapps-script' );
	wp_enqueue_style( 'geoapps-style' );

    $id = uniqid('mv_');
	$width = isset( $settings['width'] ) ? $settings['width'] : '100%';
	$height = isset( $settings['height'] ) ? $settings['height'] : '200px';
	$tenant_url = isset( $settings['tenant_url'] ) ? $settings['tenant_url'] : '';
	$map_id = isset( $settings['map_id'] ) ? $settings['map_id'] : '';

    $output = "";

    $output .= "<div style=\"width: " . esc_attr( $width ) . "; height: " . esc_attr( $height ) . "; border: 1px solid black;\" id=\""  . esc_attr( $id ) . "\"></div>";

    $output .= "<script type=\"text/javascript\">";
    $output .= "(function() {";
    $output .= "if (window.geoapps) {";
    $output .= "geoapps.Initialize(\"" . esc_js( $tenant_url ) . "\");";
    $output .= "var map = geoapps.AddMap(\"" . esc_js( $id ) . "\", \"" . esc_js( $map_id ) . "\");";
    $output .= "if (map) {";
    $output .= "map.Controls.AddZoomControls && map.Controls.AddZoomControls();";
    $output .= "map.Interactions && map.Interactions.DisableMouseWheelZoom && map.Interactions.DisableMouseWheelZoom();";
    $output .= "}";
    $output .= "}";
    $output .= "})();";
    $output .= "</script>";

    return $output;
}

/**
 * Configure a new block category, specific for GeoApps. This shows up in the
 * Gutenberg editor when creating a new page or post, so the block(s) provided
 * through this plugin are clearly distuingished.
 */
function geoapps_block_category( $categories ) {
	return array_merge(
		$categories,
		[
			[
				'slug'  => 'geoapps',
				'title' => __( 'GeoApps', 'geoapps' ),
			],
		]
	);
}
add_action( 'block_categories', 'geoapps_block_category', 10, 2 );
