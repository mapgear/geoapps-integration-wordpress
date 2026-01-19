/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';
import { Button, PanelBody, TextControl } from '@wordpress/components';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes, clientId }) {
	const [tenantUrl, setTenantUrl] = useState(attributes.tenant_url || '');
	const [mapId, setMapId] = useState(attributes.map_id || '');

	useEffect(() => {
		loadMap();

		return () => {
			// Clean up map instance if the library is available
			if (window?.geoapps?.RemoveMap) {
				window.geoapps.RemoveMap(domId);
			}
		};
	}, [tenantUrl, mapId, attributes.width, attributes.height]);

	const domId = 'mv_' + clientId;
	const loadMap = () => {
		const container = document.getElementById(domId);
		if (!container) {
			return;
		}

		// Nothing to load yet
		if (!tenantUrl || !mapId) {
			container.innerHTML = '';
			return;
		}

		// Clear map
		container.innerHTML = '';

		if (window?.geoapps?.RemoveMap) {
			window.geoapps.RemoveMap(domId);
		}

		// Verify external library availability
		if (window?.geoapps?.Initialize && window?.geoapps?.AddMap) {
			window.geoapps.Initialize(tenantUrl);
			const map = window.geoapps.AddMap(domId, mapId);
			if (map?.Controls?.AddZoomControls) {
				map.Controls.AddZoomControls();
			}
			return;
		}

		// If library is not yet loaded, retry shortly
		setTimeout(loadMap, 300);
	};

	const onChangeTenantUrl = (tenantUrl) => {
		setTenantUrl(tenantUrl);
	};
	const onChangeMapId = (mapId) => {
		setMapId(mapId);
	};
	const onChangeWidth = (width) => {
		setAttributes({ width: width });
	};
	const onChangeHeight = (height) => {
		setAttributes({ height: height });
	};
	const onConnect = () => {
		setAttributes({ tenant_url: tenantUrl });
		setAttributes({ map_id: mapId });

		loadMap();
	};

	return (
		<div {...useBlockProps()}>
			<InspectorControls key="settings">
				<PanelBody title={'Settings'}>
					<TextControl
						value={tenantUrl}
						label="Tenant Url"
						onChange={onChangeTenantUrl}
					/>
					<TextControl
						value={mapId}
						label="Map Id"
						onChange={onChangeMapId}
					/>
					<Button onClick={onConnect} isPrimary={true}>
						Connect
					</Button>
				</PanelBody>
				<PanelBody title={'Dimensions'}>
					<TextControl
						value={attributes.width}
						label="Width"
						onChange={onChangeWidth}
					/>
					<TextControl
						value={attributes.height}
						label="Height"
						onChange={onChangeHeight}
					/>
				</PanelBody>
			</InspectorControls>
			<div
				style={{
					width: attributes.width,
					height: attributes.height,
					border: '1px solid black',
				}}
				id={domId}
			></div>
		</div>
	);
}
