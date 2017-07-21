goog.provide('anychart.exports.entry');

goog.require('acgraph.exporting');
goog.require('anychart');
goog.require('anychart.core.Chart');
goog.require('anychart.core.VisualBase');
goog.require('anychart.utils');
goog.require('goog.dom');


/**
 @namespace
 @name anychart.exports
 */


/**
 * File name for exported files.
 * @type {string}
 * @private
 */
anychart.exports.filename_ = 'anychart';


/**
 * Dimensions for exported images and pdf-s.
 * @type {Object}
 * @private
 */
anychart.exports.image_ = {
  'width': undefined,
  'height': undefined
};


/**
 * Facebook sharing settings.
 * @type {Object}
 * @private
 */
anychart.exports.facebook_ = {
  'caption': window['location']['hostname'],
  'link': undefined,
  'name': undefined,
  'description': undefined,
  'appId': 1167712323282103,
  'width': 1200,
  'height': 630
};


/**
 * Twitter sharing settings.
 * @type {Object}
 * @private
 */
anychart.exports.twitter_ = {
  'url': 'https://export.anychart.com/sharing/twitter',
  'width': 1024,
  'height': 800
};


/**
 * LinkedIn sharing settings.
 * @type {Object}
 * @private
 */
anychart.exports.linkedIn_ = {
  'caption': 'AnyChart',
  'description': undefined,
  'width': 1200,
  'height': 630
};


/**
 * Pinterest sharing settings.
 * @type {Object}
 * @private
 */
anychart.exports.pinterest_ = {
  'link': undefined,
  'description': undefined,
  'width': 1200,
  'height': 800
};


/**
 * Get/set file name for exported files.
 * @param {string=} opt_value New file name.
 * @return {string} Current file name.
 */
anychart.exports.filename = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.exports.filename_ = opt_value;
  }
  return anychart.exports.filename_;
};


/**
 * Get/set dimensions for exported images and pdf-s.
 * @param {(string|Object)=} opt_widthOrOptions New image or pdf width. Or object with options.
 * @param {string=} opt_height New image or pdf height.
 * @return {Object} Current image dimensions.
 */
anychart.exports.image = function(opt_widthOrOptions, opt_height) {
  anychart.exports.image_ = anychart.utils.decomposeArguments({
    'width': opt_widthOrOptions,
    'height': opt_height
  }, opt_widthOrOptions, anychart.exports.image_);

  return anychart.exports.image_;
};


/**
 * Get/set facebook sharing settings.
 * @param {(string|Object)=} opt_captionOrOptions Caption for main link or object with options.
 * @param {string=} opt_link Url of the link attached to publication.
 * @param {string=} opt_name Title for the attached link.
 * @param {string=} opt_description Description for the attached link.
 * @param {string=} opt_width Image width.
 * @param {string=} opt_height Image height.
 * @param {string=} opt_appId Facebook application id.
 * @return {Object} Current settings.
 */
anychart.exports.facebook = function(opt_captionOrOptions, opt_link, opt_name, opt_description, opt_width, opt_height, opt_appId) {
  anychart.exports.facebook_ = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'link': opt_link,
    'name': opt_name,
    'description': opt_description,
    'width': opt_width,
    'height': opt_height,
    'appId': opt_appId
  }, opt_captionOrOptions, anychart.exports.facebook_);

  return anychart.exports.facebook_;
};


/**
 * Get/set facebook sharing settings.
 * @param {(string|Object)=} opt_urlOrOptions Twitter sharing application export server url or object with options.
 * @param {string=} opt_width Image width.
 * @param {string=} opt_height Image height.
 * @return {Object} Current settings.
 */
anychart.exports.twitter = function(opt_urlOrOptions, opt_width, opt_height) {
  anychart.exports.twitter_ = anychart.utils.decomposeArguments({
    'url': opt_urlOrOptions,
    'width': opt_width,
    'height': opt_height
  }, opt_urlOrOptions, anychart.exports.twitter_);

  return anychart.exports.twitter_;
};


/**
 * Get/set LinkedIn sharing settings.
 * @param {(string|Object)=} opt_captionOrOptions Caption for publication or object with options.
 * @param {string=} opt_description Description.
 * @param {string=} opt_width Image width.
 * @param {string=} opt_height Image height.
 * @return {Object} Current settings.
 */
anychart.exports.linkedin = function(opt_captionOrOptions, opt_description, opt_width, opt_height) {
  anychart.exports.linkedIn_ = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'description': opt_description,
    'width': opt_width,
    'height': opt_height
  }, opt_captionOrOptions, anychart.exports.linkedIn_);

  return anychart.exports.linkedIn_;
};


/**
 * Get/set Pinterest sharing settings.
 * @param {(string|Object)=} opt_linkOrOptions Attached link or object with options.
 * @param {string=} opt_description Description.
 * @param {string=} opt_width Image width.
 * @param {string=} opt_height Image height.
 * @return {Object} Current settings.
 */
anychart.exports.pinterest = function(opt_linkOrOptions, opt_description, opt_width, opt_height) {
  anychart.exports.pinterest_ = anychart.utils.decomposeArguments({
    'link': opt_linkOrOptions,
    'description': opt_description,
    'width': opt_width,
    'height': opt_height
  }, opt_linkOrOptions, anychart.exports.pinterest_);

  return anychart.exports.pinterest_;
};


/**
 Sets and returns an address export server script, which is used to export to an image
 or PDF.
 @see acgraph.vector.Stage#saveAsPdf
 @see acgraph.vector.Stage#saveAsPng
 @see acgraph.vector.Stage#saveAsJpg
 @see acgraph.vector.Stage#saveAsSvg
 @param {string=} opt_address Export server script URL.
 @return {string} Export server script URL.
 */
anychart.exports.server = goog.global['acgraph']['server'];



//----------------------------------------------------------------------------------------------------------------------
//
//  Export.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Saves the current visual state into PNG file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.label()
 *   .background(true)
 *   .text('Save image')
 *   .fontColor('#fff')
 *   .padding(5)
 *   .offsetX(5)
 *   .listen('click', function(){
 *      chart.saveAsPng();
 *   });
 * @param {?acgraph.vector.ILayer} container
 * @param {(number|Object)=} opt_widthOrOptions Image width or object with options.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsPng = function(container, opt_widthOrOptions, opt_height, opt_quality, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments({
      'width': opt_widthOrOptions,
      'height': opt_height,
      'quality': opt_quality,
      'filename': opt_filename
    }, opt_widthOrOptions, {
      'width': anychart.exports.image()['width'],
      'height': anychart.exports.image()['height'],
      'filename': anychart.exports.filename()
    });

    stage.saveAsPng(args['width'], args['height'], args['quality'], args['filename']);
  }
};


/**
 * Saves the current visual state into JPEG file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.label()
 *   .background(true)
 *   .text('Save image')
 *   .fontColor('#fff')
 *   .padding(5)
 *   .offsetX(5)
 *   .listen('click', function(){
 *      chart.saveAsJpg();
 *   });
 * @param {?acgraph.vector.ILayer} container
 * @param {(number|Object)=} opt_widthOrOptions Image width or object with options.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsJpg = function(container, opt_widthOrOptions, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'width': opt_widthOrOptions,
          'height': opt_height,
          'quality': opt_quality,
          'forceTransparentWhite': opt_forceTransparentWhite,
          'filename': opt_filename
        },
        opt_widthOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height'],
          'filename': anychart.exports.filename()
        });

    stage.saveAsJpg(args['width'], args['height'], args['quality'], args['forceTransparentWhite'], args['filename']);
  }
};


/**
 * Saves the current visual state into PDF file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.label()
 *   .background(true)
 *   .text('Save image')
 *   .fontColor('#fff')
 *   .padding(5)
 *   .offsetX(5)
 *   .listen('click', function(){
 *      chart.saveAsPdf();
 *   });
 * @param {?acgraph.vector.ILayer} container
 * @param {(number|string|Object)=} opt_paperSizeOrWidthOrOptions Any paper format like 'a0', 'tabloid', 'b4', etc or width, or object with options.
 * @param {(number|boolean)=} opt_landscapeOrHeight Define, is landscape or pdf height.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsPdf = function(container, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrWidthOrOptions,
          'width': opt_paperSizeOrWidthOrOptions,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'x': opt_x,
          'y': opt_y,
          'filename': opt_filename
        },
        opt_paperSizeOrWidthOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height'],
          'filename': anychart.exports.filename()
        });

    stage.saveAsPdf(args['paperSize'] || args['width'], args['landscape'] || args['height'], args['x'], args['y'], args['filename']);
  }
};


/**
 * Saves the current visual state into SVG file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.label()
 *   .background(true)
 *   .text('Save image')
 *   .fontColor('#fff')
 *   .padding(5)
 *   .offsetX(5)
 *   .listen('click', function(){
 *      chart.saveAsSvg();
 *   });
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|number|Object)=} opt_paperSizeOrWidthOrOptions Paper Size or width or object with options.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsSvg = function(container, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrWidthOrOptions,
          'width': opt_paperSizeOrWidthOrOptions,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'filename': opt_filename
        },
        opt_paperSizeOrWidthOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height'],
          'filename': anychart.exports.filename()
        });

    stage.saveAsSvg(args['paperSize'] || args['width'], args['landscape'] || args['height'], args['filename']);
  }
};


/**
 * Returns SVG string if type of content SVG otherwise returns empty string.
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|number|Object)=} opt_paperSizeOrWidthOrOptions Paper Size or width or object of options.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @return {string}
 */
anychart.exports.toSvg = function(container, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrWidthOrOptions,
          'width': opt_paperSizeOrWidthOrOptions,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight
        },
        opt_paperSizeOrWidthOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height']
        });

    return stage.toSvg(args['paperSize'] || args['width'], args['landscape'] || args['height']);
  }
  return '';
};


//region --- SHARING ---
/**
 * Share container's stage as png and return link to shared image.
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.shareAsPng = function(container, onSuccessOrOptions, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'asBase64': opt_asBase64,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality,
          'filename': opt_filename
        },
        onSuccessOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height'],
          'filename': anychart.exports.filename()
        });

    stage.shareAsPng(args['onSuccess'], args['onError'], args['asBase64'], args['width'], args['height'], args['quality'], args['filename']);
  }
};


/**
 * Share container's stage as jpg and return link to shared image.
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.shareAsJpg = function(container, onSuccessOrOptions, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'asBase64': opt_asBase64,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality,
          'forceTransparentWhite': opt_forceTransparentWhite,
          'filename': opt_filename
        },
        onSuccessOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height'],
          'filename': anychart.exports.filename()
        });

    stage.shareAsJpg(args['onSuccess'], args['onError'], args['asBase64'], args['width'], args['height'], args['quality'], args['forceTransparentWhite'], args['filename']);
  }
};


/**
 * Share container's stage as svg and return link to shared image.
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.shareAsSvg = function(container, onSuccessOrOptions, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'asBase64': opt_asBase64,
          'paperSize': opt_paperSizeOrWidth,
          'width': opt_paperSizeOrWidth,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'filename': opt_filename
        },
        onSuccessOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height'],
          'filename': anychart.exports.filename()
        });

    stage.shareAsSvg(args['onSuccess'], args['onError'], args['asBase64'], args['paperSize'] || args['width'], args['landscape'] || args['height'], args['filename']);
  }
};


/**
 * Share container's stage as pdf and return link to shared pdf document.
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Define, is landscape.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.shareAsPdf = function(container, onSuccessOrOptions, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'asBase64': opt_asBase64,
          'paperSize': opt_paperSizeOrWidth,
          'width': opt_paperSizeOrWidth,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'x': opt_x,
          'y': opt_y,
          'filename': opt_filename
        }, onSuccessOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height'],
          'filename': anychart.exports.filename()
        });

    stage.shareAsPdf(
        args['onSuccess'],
        args['onError'],
        args['asBase64'],
        args['paperSize'] || args['width'],
        args['landscape'] || args['height'],
        args['x'],
        args['y'],
        args['filename']);
  }
};


/**
 * Returns base64 string for png.
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 */
anychart.exports.getPngBase64String = function(container, onSuccessOrOptions, opt_onError, opt_width, opt_height, opt_quality) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality
        },
        onSuccessOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height']
        });

    stage.getPngBase64String(args['onSuccess'], args['onError'], args['width'], args['height'], args['quality']);
  }
};


/**
 * Returns base64 string for jpg.
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 */
anychart.exports.getJpgBase64String = function(container, onSuccessOrOptions, opt_onError, opt_width, opt_height, opt_quality, opt_forceTransparentWhite) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality,
          'forceTransparentWhite': opt_forceTransparentWhite
        },
        onSuccessOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height']
        });

    stage.getJpgBase64String(args['onSuccess'], args['onError'], args['width'], args['height'], args['quality'], args['forceTransparentWhite']);
  }
};


/**
 * Returns base64 string for svg.
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 */
anychart.exports.getSvgBase64String = function(container, onSuccessOrOptions, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'paperSize': opt_paperSizeOrWidth,
          'width': opt_paperSizeOrWidth,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight
        },
        onSuccessOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height']
        });

    stage.getSvgBase64String(args['onSuccess'], args['onError'], args['paperSize'] || args['width'], args['landscape'] || args['height']);
  }
};


/**
 * Returns base64 string for pdf.
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Define, is landscape.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 */
anychart.exports.getPdfBase64String = function(container, onSuccessOrOptions, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    /**
     * @type {Object} args
     */
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'paperSize': opt_paperSizeOrWidth,
          'width': opt_paperSizeOrWidth,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'x': opt_x,
          'y': opt_y
        },
        onSuccessOrOptions, {
          'width': anychart.exports.image()['width'],
          'height': anychart.exports.image()['height']
        });

    stage.getPdfBase64String(args['onSuccess'], args['onError'], args['paperSize'] || args['width'], args['landscape'] || args['height'], args['x'], args['y']);
  }
};


//endregion
/**
 * Print all element on related stage.
 * @param {?acgraph.vector.ILayer} container
 * @param {(acgraph.vector.PaperSize|Object)=} opt_paperSizeOrOptions Paper size or object with options/
 * @param {boolean=} opt_landscape
 */
anychart.exports.print = function(container, opt_paperSizeOrOptions, opt_landscape) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrOptions,
          'landscape': opt_landscape
        },
        opt_paperSizeOrOptions);

    stage.print(args['paperSize'], args['landscape']);
  }
};


/**
 * Opens Facebook sharing dialog.
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|Object)=} opt_captionOrOptions Caption for main link. If not set hostname will be used. Or object with options.
 * @param {string=} opt_link Url of the link attached to publication.
 * @param {string=} opt_name Title for the attached link. If not set hostname or opt_link url will be used.
 * @param {string=} opt_description Description for the attached link.
 */
anychart.exports.shareWithFacebook = function(container, opt_captionOrOptions, opt_link, opt_name, opt_description) {
  var exportOptions = anychart.exports.facebook();
  var args = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'link': opt_link,
    'name': opt_name,
    'description': opt_description
  }, opt_captionOrOptions, exportOptions);

  var w = 550;
  var h = 550;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var window = goog.dom.getWindow();
  var popup = window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

  var onSuccess = function(imgUrl) {
    var urlBase = 'https://www.facebook.com/dialog/feed';

    // Dialog options described here https://developers.facebook.com/docs/sharing/reference/feed-dialog
    var urlOptions = {
      'app_id': exportOptions['appId'],
      'display': 'popup',
      'picture': imgUrl
    };

    urlOptions['caption'] = args['caption'];

    if (args['link']) {
      urlOptions['link'] = args['link'];

      if (args['name']) {
        urlOptions['name'] = args['name'];
      }
      if (args['description']) {
        urlOptions['description'] = args['description'];
      }
    }

    var options = '';
    for (var k in urlOptions) {
      options += options ? '&' : '';
      options += k + '=' + urlOptions[k];
    }
    popup.location.href = urlBase + '?' + options;
  };

  var imageWidth = exportOptions['width'];
  var imageHeight = exportOptions['height'];
  anychart.exports.shareAsPng(container, onSuccess, undefined, false, imageWidth, imageHeight);
};


/**
 * Opens Twitter sharing dialog.
 * @param {?acgraph.vector.ILayer} container
 */
anychart.exports.shareWithTwitter = function(container) {
  var exportOptions = anychart.exports.twitter();
  var w = 600;
  var h = 520;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var formClass = 'ac-share-twitter-form';
  var dataInputClass = 'ac-share-twitter-data-input';

  var mapForm;
  var dataInput;
  var el = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.INPUT, dataInputClass);
  if (el.length > 0) {
    dataInput = el[0];
    mapForm = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.FORM, formClass)[0];
  } else {
    mapForm = goog.dom.createElement(goog.dom.TagName.FORM);
    goog.dom.classlist.add(mapForm, formClass);
    mapForm.target = 'Map';
    mapForm.method = 'POST';
    mapForm.action = exportOptions['url'];

    dataInput = goog.dom.createElement(goog.dom.TagName.INPUT);
    goog.dom.classlist.add(dataInput, dataInputClass);
    dataInput.type = 'hidden';
    dataInput.name = 'data';

    var dataTypeInput = goog.dom.createElement(goog.dom.TagName.INPUT);
    dataTypeInput.type = 'hidden';
    dataTypeInput.name = 'dataType';
    dataTypeInput.value = 'svg';

    goog.dom.appendChild(mapForm, dataInput);
    goog.dom.appendChild(mapForm, dataTypeInput);
    goog.dom.appendChild(goog.dom.getElementsByTagName(goog.dom.TagName.BODY)[0], mapForm);
  }

  if (goog.isDef(mapForm) && goog.isDef(dataInput)) {
    dataInput.value = anychart.exports.toSvg(container, exportOptions['width'], exportOptions['height']);
    var window = goog.dom.getWindow();
    var mapWindow = window.open('', 'Map', 'status=0,title=0,height=520,width=600,scrollbars=1, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    if (mapWindow) mapForm.submit();
  }
};


/**
 * Opens LinkedIn sharing dialog.
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|Object)=} opt_captionOrOptions Caption for publication. If not set 'AnyChart' will be used. Or object with options.
 * @param {string=} opt_description Description. If not set opt_caption will be used.
 */
anychart.exports.shareWithLinkedIn = function(container, opt_captionOrOptions, opt_description) {
  var exportOptions = anychart.exports.linkedin();
  var args = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'description': opt_description
  }, opt_captionOrOptions, exportOptions);

  var w = 550;
  var h = 520;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var window = goog.dom.getWindow();
  var popup = window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

  var onSuccess = function(imgUrl) {
    var urlBase = 'https://www.linkedin.com/shareArticle';

    // Dialog options described here https://developer.linkedin.com/docs/share-on-linkedin
    var urlOptions = {
      'mini': 'true',
      'url': imgUrl
    };

    urlOptions['title'] = args['caption'];
    if (args['description']) {
      urlOptions['summary'] = args['description'];
    }

    var options = '';
    for (var k in urlOptions) {
      options += options ? '&' : '';
      options += k + '=' + urlOptions[k];
    }
    popup.location.href = urlBase + '?' + options;
  };

  anychart.exports.shareAsPng(container, onSuccess, undefined, false, exportOptions['width'], exportOptions['height']);
};


/**
 * Opens Pinterest sharing dialog.
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|Object)=} opt_linkOrOptions Attached link. If not set, the image url will be used. Or object with options.
 * @param {string=} opt_description Description.
 */
anychart.exports.shareWithPinterest = function(container, opt_linkOrOptions, opt_description) {
  var exportOptions = anychart.exports.pinterest();
  var args = anychart.utils.decomposeArguments({
    'link': opt_linkOrOptions,
    'description': opt_description
  }, opt_linkOrOptions, exportOptions);

  var w = 550;
  var h = 520;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var window = goog.dom.getWindow();
  var popup = window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

  var onSuccess = function(imgUrl) {
    var urlBase = 'https://pinterest.com/pin/create/link';
    var urlOptions = {
      'media': imgUrl
    };

    if (args['link']) {
      urlOptions['url'] = args['link'];
    }

    if (args['description']) {
      urlOptions['description'] = args['description'];
    }

    var options = '';
    for (var k in urlOptions) {
      options += options ? '&' : '';
      options += k + '=' + urlOptions[k];
    }

    popup.location.href = urlBase + '?' + options;
  };

  anychart.exports.shareAsPng(container, onSuccess, undefined, false, exportOptions['width'], exportOptions['height']);
};


/**
 * Saves chart config as XML document.
 * @param {string} xml
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsXml = function(xml, opt_filename) {
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = xml;
  options['dataType'] = 'xml';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/xml', options);
};


/**
 * Saves chart config as XML document.
 * @param {string} json
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsJson = function(json, opt_filename) {
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = json;
  options['dataType'] = 'json';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/json', options);
};


/**
 * Saves chart data as csv.
 * @param {string} csv
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsCsv = function(csv, opt_filename) {
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = csv;
  options['dataType'] = 'csv';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/csv', options);
};


/**
 * Saves chart data as excel document.
 * @param {string} csv
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsXlsx = function(csv, opt_filename) {
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = csv;
  options['dataType'] = 'xlsx';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/xlsx', options);
};


//exports
(function() {
  var obj = {
    'filename': anychart.exports.filename,
    'image': anychart.exports.image,
    'facebook': anychart.exports.facebook,
    'twitter': anychart.exports.twitter,
    'linkedin': anychart.exports.linkedin,
    'pinterest': anychart.exports.pinterest,
    'server': anychart.exports.server,
    'saveAsPng': anychart.exports.saveAsPng,
    'saveAsJpg': anychart.exports.saveAsJpg,
    'saveAsPdf': anychart.exports.saveAsPdf,
    'saveAsSvg': anychart.exports.saveAsSvg,
    'toSvg': anychart.exports.toSvg,
    'shareAsPng': anychart.exports.shareAsPng,
    'shareAsJpg': anychart.exports.shareAsJpg,
    'shareAsSvg': anychart.exports.shareAsSvg,
    'shareAsPdf': anychart.exports.shareAsPdf,
    'getPngBase64String': anychart.exports.getPngBase64String,
    'getJpgBase64String': anychart.exports.getJpgBase64String,
    'getSvgBase64String': anychart.exports.getSvgBase64String,
    'getPdfBase64String': anychart.exports.getPdfBase64String,
    'print': anychart.exports.print,
    'shareWithFacebook': anychart.exports.shareWithFacebook,
    'shareWithTwitter': anychart.exports.shareWithTwitter,
    'shareWithLinkedIn': anychart.exports.shareWithLinkedIn,
    'shareWithPinterest': anychart.exports.shareWithPinterest,
    'saveAsXml': anychart.exports.saveAsXml,
    'saveAsJson': anychart.exports.saveAsJson,
    'saveAsCsv': anychart.exports.saveAsCsv,
    'saveAsXlsx': anychart.exports.saveAsXlsx
  };
  goog.exportSymbol('anychart.exports', obj);
})();
