$(function() {

	var DEFAULT_PUBLIC_ID = 'placeholder';
	var widget;
	var publicId = DEFAULT_PUBLIC_ID;

	function updateDeleteButton(imageInfo) {
		var btnDelete = $('#btnDelete');
		var deleteToken = imageInfo.delete_token;
		btnDelete.off();
		btnDelete.click(function() {
			$.cloudinary.delete_by_token(deleteToken);
			publicId = DEFAULT_PUBLIC_ID;
			updateImage();
			btnDelete.css('display', 'none');
			$('#colorInfo').css('display', 'none');
		});
		btnDelete.css('display', 'inline');
	}

	function getOverlay() {
		var text = $('#txtOverlay').val();
		var fontSize = $('#txtFontSize').val();
		var color = $('#txtColor').val();
		var position = $('#selOverlayPosition').val().toLowerCase();
		if (text !== '') {
			return {
				overlay: 'text:Arial_' + fontSize + ':' + text,
				color: color,
				gravity: position,
				flags: ['no_overflow']};
		}
		return {};
	}

	function getEffects() {
		var effects = [];
		if ($('#cbSepia').prop('checked')) {
			effects.push({effect: 'sepia'})
		}
		if ($('#cbNegate').prop('checked')) {
			effects.push({effect: 'negate'})
		}
		if ($('#cbGrayscale').prop('checked')) {
			effects.push({effect: 'grayscale'})
		}
		if ($('#cbBlackWhite').prop('checked')) {
			effects.push({effect: 'blackwhite'})
		}
		return effects;
	}

	function getTransformations() {
		var transformations = [{
				width: 200,
				height: 200,
				crop: 'thumb',
				gravity: 'custom',
			},
			getOverlay()
		];
		var effects = getEffects();
		transformations = transformations.concat(effects);
		transformations.push({
			quality: 'auto',
			fetch_format: 'auto'
		});
		return transformations;
	}

	function updateImage() {
		var transformations = getTransformations();
		var cldUrl = $.cloudinary.url(publicId, {transformation: transformations});
		$('img').attr('src', cldUrl);
	}

	function getPredomColorElement(colorInfo) {
		var color = colorInfo[0];
		var percent = colorInfo[1];
		return '<div> <div style="display: inline-block; min-width: 85%; background-color: ' + color + ';">&nbsp;</div> <div style="display: inline-block;">' + percent + '</div> </div>';
	}

	function getTopColorElement(colorInfo) {
		var color = colorInfo[0];
		var percent = colorInfo[1];
		return '<div style="display: inline-block; width: 25%;"><div style="display: inline-block; min-width: 50%; background-color: ' + color + ';">&nbsp;</div>&nbsp;' + percent + '</div>';
	}

	function updateColorInfo(imageData) {
		var colorInfoDiv = $('#colorInfo');
		var pcDiv = $('#predominantColors');
		var tcDiv = $('#topColors');
		var predominantColors = imageData.predominant.google;
		var topColors = imageData.colors;
		var i;
		colorInfoDiv.css('display', 'block');
		pcDiv.empty();
		tcDiv.empty();

		for (i = 0; i < predominantColors.length; i++) {
			pcDiv.append(getPredomColorElement(predominantColors[i]));
		}

		for (i = 0; i < topColors.length; i++) {
			tcDiv.append(getTopColorElement(topColors[i]));
		}

	}

	function handleImageResult(result) {
		publicId = result.public_id;
		updateDeleteButton(result);
		updateImage();
		updateColorInfo(result);
	}

	function widgetCallback(error, result) {
		if (error === null) {
			widget.close();
			handleImageResult(result[0]);
		} else {
			console.log(error);
		}
	}

	function btnUploadClick() {
		widget.open();
	}

	function btnApplyClick() {
		updateImage();
		return false;				
	}

	function setup() {
		var cloudName = 'rich';
		var uploadPreset = 'qrlbo2ed';
		var widgetOptions = {
			upload_preset: uploadPreset,
			cropping: 'server',
			cropping_aspect_ratio: 1,
			min_image_width: 200,
			min_image_height: 200,
			cropping_validate_dimensions: true,
			theme: 'minimal',
			keep_widget_open: true
		};

		cloudinary.setCloudName(cloudName);
		$.cloudinary.config({cloud_name: cloudName});
		widget = cloudinary.createUploadWidget(widgetOptions, widgetCallback);
		$('#btnUpload').click(btnUploadClick);
		$('#btnUpdate').click(btnApplyClick);
		$('#fileUpload').unsigned_cloudinary_upload(
			uploadPreset, {cloud_name: cloudName}
		).bind('cloudinarydone', function(e, data) {
			handleImageResult(data.result);
		});
	}

	function main() {
		setup();
		updateImage();
	}

	main();

});
