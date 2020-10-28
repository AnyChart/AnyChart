goog.provide('anychart.exportsModule.entry');
goog.require('acgraph.exporting');
goog.require('anychart');
goog.require('anychart.base');
goog.require('anychart.core.Chart');
goog.require('anychart.core.VisualBase');
goog.require('anychart.exportsModule.Exports');
goog.require('anychart.exportsModule.offline');
goog.require('anychart.utils');
goog.require('goog.dom');


/**
 *
 * @type {anychart.exportsModule.Exports}
 */
anychart.exports = new anychart.exportsModule.Exports();
anychart.exports.applyDefaults();


/**
 * Creates exports settings object.
 * @return {anychart.exportsModule.Exports}
 */
anychart.exports.create = function() {
  return new anychart.exportsModule.Exports();
};


//region --- Utils
/**
 * Settings resolver.
 * @param {*} target .
 * @param {string} name .
 * @return {!Object}
 */
anychart.exports.getFinalSettings = function(target, name) {
  var targetSettings = (target && target['exports']) ? target['exports']()[name]() : void 0;
  var globalSettings = goog.global['anychart']['exports'][name]();

  var resultSettings;
  if (goog.typeOf(targetSettings) == 'object') {
    resultSettings = anychart.utils.decomposeArguments(globalSettings, targetSettings, globalSettings);
  } else {
    resultSettings = goog.isDef(targetSettings) ? targetSettings : globalSettings;
  }

  return resultSettings;
};


//endregion
//region --- Saving
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
anychart.exports.server = goog.global['IS_ANYCHART_AMD'] ?
    anychart.module['acgraph']['server'] : // Takes acgraph from amd module.
    anychart.window['acgraph']['server'];


/**
 * Returns function that send request to export server.
 *
 * @param {string} data - Data to send.
 * @param {string} fileName - Filename to save.
 * @param {string} type - File type.
 *
 * @return {Function} - Function that send request.
 */
anychart.exports.createRequestFunction = function (data, fileName, type) {
  return function () {
    var options = {
      'file-name': fileName,
      'data': data,
      'dataType': type,
      'responseType': 'file'
    };

    acgraph.sendRequestToExportServer(acgraph.exportServer + '/' + type, options);
  };
};

/**
 * Create and return wrapper function that write warnings in console over passed function.
 *
 * @param {Object} clientside - Object with data about client side export.
 * @param {Function} fallbackFn - Fallback function.
 *
 * @return {Function}
 */
anychart.exports.createOnFailFallback = function(clientside, fallbackFn) {
  return function (args) {
    if (clientside['fallback']) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_EXPORT_FAILED, null, [], true);
      fallbackFn.call(null, arguments);
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_EXPORT_FAILED_SERVER_DISABLED, null, [], true);
    }
  };
};


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
 * @param {?(anychart.core.VisualBase|acgraph.vector.Stage)} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(number|Object)=} opt_widthOrOptions Image width or object with options.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsPng = function(target, container, opt_widthOrOptions, opt_height, opt_quality, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
    var args = anychart.utils.decomposeArguments({
      'width': opt_widthOrOptions,
      'height': opt_height,
      'quality': opt_quality,
      'filename': opt_filename
    }, opt_widthOrOptions, {
      'width': imageSettings['width'],
      'height': imageSettings['height'],
      'filename': anychart.exports.getFinalSettings(target, 'filename')
    });

    var clientside = anychart.exports.getFinalSettings(target, 'clientside');

    var failCallback = anychart.exports.createOnFailFallback(clientside, function (args) {
      stage.defaultSaveAsPng(args['width'], args['height'], args['quality'], args['filename']);
    });

    if (clientside['enabled']) {
      anychart.exportsModule.offline.exportChartOffline(target, acgraph.vector.Stage.ExportType.PNG, args, goog.nullFunction, failCallback);
    } else if (clientside['fallback']) { // Only use export server if fallback enabled in clientside settings.
      stage.defaultSaveAsPng(args['width'], args['height'], args['quality'], args['filename']);
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_AND_SERVER_EXPORT_DISABLED, null, [], true);
    }
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
 * @param {?(anychart.core.VisualBase|acgraph.vector.Stage)} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(number|Object)=} opt_widthOrOptions Image width or object with options.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsJpg = function(target, container, opt_widthOrOptions, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
    var args = anychart.utils.decomposeArguments(
        {
          'width': opt_widthOrOptions,
          'height': opt_height,
          'quality': opt_quality,
          'forceTransparentWhite': opt_forceTransparentWhite,
          'filename': opt_filename
        },
        opt_widthOrOptions, {
          'width': imageSettings['width'],
          'height': imageSettings['height'],
          'filename': anychart.exports.getFinalSettings(target, 'filename')
        });

    var clientside = anychart.exports.getFinalSettings(target, 'clientside');

    var failCallback = anychart.exports.createOnFailFallback(clientside, function (args) {
      stage.defaultSaveAsJpg(args['width'], args['height'], args['quality'], args['forceTransparentWhite'], args['filename']);
    });

    if (clientside['enabled']) {
      anychart.exportsModule.offline.exportChartOffline(target, acgraph.vector.Stage.ExportType.JPG, args, goog.nullFunction, failCallback);
    } else if (clientside['fallback']) { // Only use export server if fallback enabled in clientside settings.
      stage.defaultSaveAsJpg(args['width'], args['height'], args['quality'], args['forceTransparentWhite'], args['filename']);
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_AND_SERVER_EXPORT_DISABLED, null, [], true);
    }
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
 * @param {?(anychart.core.VisualBase|acgraph.vector.Stage)} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(number|string|Object)=} opt_paperSizeOrWidthOrOptions Any paper format like 'a0', 'tabloid', 'b4', etc or width, or object with options.
 * @param {(number|boolean)=} opt_landscapeOrHeight Define, is landscape or pdf height.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsPdf = function(target, container, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
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
          'width': imageSettings['width'],
          'height': imageSettings['height'],
          'filename': anychart.exports.getFinalSettings(target, 'filename')
        });

    var clientside = anychart.exports.getFinalSettings(target, 'clientside');

    var failCallback = anychart.exports.createOnFailFallback(clientside, function (args) {
      stage.defaultSaveAsPdf(args['paperSize'] || args['width'], args['landscape'] || args['height'], args['x'], args['y'], args['filename']);
    });

    if (clientside['enabled']) {
      anychart.exportsModule.offline.exportChartOffline(target, acgraph.vector.Stage.ExportType.PDF, args, goog.nullFunction, failCallback);
    } else if (clientside['fallback']) { // Only use export server if fallback enabled in clientside settings.
      stage.defaultSaveAsPdf(args['paperSize'] || args['width'], args['landscape'] || args['height'], args['x'], args['y'], args['filename']);
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_AND_SERVER_EXPORT_DISABLED, null, [], true);
    }
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
 * @param {?(anychart.core.VisualBase|acgraph.vector.Stage)} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|number|Object)=} opt_paperSizeOrWidthOrOptions Paper Size or width or object with options.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsSvg = function(target, container, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrWidthOrOptions,
          'width': opt_paperSizeOrWidthOrOptions,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'filename': opt_filename
        },
        opt_paperSizeOrWidthOrOptions, {
          'width': imageSettings['width'],
          'height': imageSettings['height'],
          'filename': anychart.exports.getFinalSettings(target, 'filename')
        });

    var clientside = anychart.exports.getFinalSettings(target, 'clientside');

    var failCallback = anychart.exports.createOnFailFallback(clientside, function(args) {
      stage.defaultSaveAsSvg(args['paperSize'] || args['width'], args['landscape'] || args['height'], args['filename']);
    });

    if (clientside['enabled']) {
      anychart.exportsModule.offline.exportChartOffline(target, acgraph.vector.Stage.ExportType.SVG, args, goog.nullFunction, failCallback);
    } else if (clientside['fallback']) { // Only use export server if fallback enabled in clientside settings.
      stage.defaultSaveAsSvg(args['paperSize'] || args['width'], args['landscape'] || args['height'], args['filename']);
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_AND_SERVER_EXPORT_DISABLED, null, [], true);
    }
  }
};


/**
 * Returns SVG string if type of content SVG otherwise returns empty string.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|number|Object)=} opt_paperSizeOrWidthOrOptions Paper Size or width or object of options.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @return {string}
 */
anychart.exports.toSvg = function(target, container, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrWidthOrOptions,
          'width': opt_paperSizeOrWidthOrOptions,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight
        },
        opt_paperSizeOrWidthOrOptions, {
          'width': imageSettings['width'],
          'height': imageSettings['height']
        });

    return stage.toSvg(args['paperSize'] || args['width'], args['landscape'] || args['height']);
  }
  return '';
};

/**
 * Save passed data as text file.
 *
 * @param {?anychart.core.VisualBase} target - Object that contains data about clientside export.
 * @param {string} data - Text data to save.
 * @param {string} type - File type.
 * @param {string=} opt_filename - Name of file to save.
 */
anychart.exports.exportTextData = function (target, data, type, opt_filename) {
  var fileName = /**@type {string}*/(opt_filename || anychart.exports.getFinalSettings(target, 'filename'));
  var clientside = anychart.exports.getFinalSettings(target, 'clientside');

  var exportRequestFn = anychart.exports.createRequestFunction(data, fileName, type);
  var failCallback = anychart.exports.createOnFailFallback(clientside, exportRequestFn);

  if (clientside['enabled']) {
    anychart.exportsModule.offline.exportTextData(data, fileName, type, failCallback);
  } else if (clientside['fallback']) { // Only use export server if fallback enabled in clientside settings.
    exportRequestFn();
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_AND_SERVER_EXPORT_DISABLED, null, [], true);
  }
};

/**
 * Saves chart config as XML document.
 *
 * @param {?anychart.core.VisualBase} target - Chart instance.
 * @param {string} xml - Xml to save.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsXml = function (target, xml, opt_filename) {
  anychart.exports.exportTextData(target, xml, 'xml', opt_filename);
};


/**
 * Saves chart config as XML document.
 *
 * @param {?anychart.core.VisualBase} target - Chart instance.
 * @param {string} json - Json to save
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsJson = function (target, json, opt_filename) {
  anychart.exports.exportTextData(target, json, 'json', opt_filename);
};


/**
 * Saves chart data as csv.
 *
 * @param {?anychart.core.VisualBase} target - Chart instance.
 * @param {string} csv - Csv chart data.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsCsv = function (target, csv, opt_filename) {
  anychart.exports.exportTextData(target, csv, 'csv', opt_filename);
};


/**
 * Saves chart data as excel document.
 *
 * @param {?anychart.core.VisualBase} target - Chart instance.
 * @param {string} csv - Csv chart data.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.saveAsXlsx = function (target, csv, opt_filename) {
  var clientside = anychart.exports.getFinalSettings(target, 'clientside');
  var filename = /**@type {string}*/(opt_filename || anychart.exports.getFinalSettings(target, 'filename'));

  var exportRequestFn = anychart.exports.createRequestFunction(csv, filename, 'xlsx');
  var failCallback = anychart.exports.createOnFailFallback(clientside, exportRequestFn);

  if (clientside['enabled']) {
    anychart.exportsModule.offline.saveAsXlsx(target, csv, filename, failCallback);
  } else if (clientside['fallback']) { // Only use export server if fallback enabled in clientside settings.
    exportRequestFn();
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_AND_SERVER_EXPORT_DISABLED, null, [], true);
  }
};


//endregion
//region --- Sharing
/**
 * Share container's stage as png and return link to shared image.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.shareAsPng = function(target, container, onSuccessOrOptions, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_filename) {
  var stage = container ? container.getStage() : null;
  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
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
          'width': imageSettings['width'],
          'height': imageSettings['height'],
          'filename': anychart.exports.getFinalSettings(target, 'filename')
        });

    stage.shareAsPng(args['onSuccess'], args['onError'], args['asBase64'], args['width'], args['height'], args['quality'], args['filename']);
  }
};


/**
 * Share container's stage as jpg and return link to shared image.
 * @param {?anychart.core.VisualBase} target
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
anychart.exports.shareAsJpg = function(target, container, onSuccessOrOptions, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
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
          'width': imageSettings['width'],
          'height': imageSettings['height'],
          'filename': anychart.exports.getFinalSettings(target, 'filename')
        });

    stage.shareAsJpg(args['onSuccess'], args['onError'], args['asBase64'], args['width'], args['height'], args['quality'], args['forceTransparentWhite'], args['filename']);
  }
};


/**
 * Share container's stage as svg and return link to shared image.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 */
anychart.exports.shareAsSvg = function(target, container, onSuccessOrOptions, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
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
          'width': imageSettings['width'],
          'height': imageSettings['height'],
          'filename': anychart.exports.getFinalSettings(target, 'filename')
        });

    stage.shareAsSvg(args['onSuccess'], args['onError'], args['asBase64'], args['paperSize'] || args['width'], args['landscape'] || args['height'], args['filename']);
  }
};


/**
 * Share container's stage as pdf and return link to shared pdf document.
 * @param {?anychart.core.VisualBase} target
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
anychart.exports.shareAsPdf = function(target, container, onSuccessOrOptions, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
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
          'width': imageSettings['width'],
          'height': imageSettings['height'],
          'filename': anychart.exports.getFinalSettings(target, 'filename')
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
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 */
anychart.exports.getPngBase64String = function(target, container, onSuccessOrOptions, opt_onError, opt_width, opt_height, opt_quality) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality
        },
        onSuccessOrOptions, {
          'width': imageSettings['width'],
          'height': imageSettings['height']
        });

    stage.getPngBase64String(args['onSuccess'], args['onError'], args['width'], args['height'], args['quality']);
  }
};


/**
 * Returns base64 string for jpg.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 */
anychart.exports.getJpgBase64String = function(target, container, onSuccessOrOptions, opt_onError, opt_width, opt_height, opt_quality, opt_forceTransparentWhite) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
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
          'width': imageSettings['width'],
          'height': imageSettings['height']
        });

    stage.getJpgBase64String(args['onSuccess'], args['onError'], args['width'], args['height'], args['quality'], args['forceTransparentWhite']);
  }
};


/**
 * Returns base64 string for svg.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 */
anychart.exports.getSvgBase64String = function(target, container, onSuccessOrOptions, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
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
          'width': imageSettings['width'],
          'height': imageSettings['height']
        });

    stage.getSvgBase64String(args['onSuccess'], args['onError'], args['paperSize'] || args['width'], args['landscape'] || args['height']);
  }
};


/**
 * Returns base64 string for pdf.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Define, is landscape.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 */
anychart.exports.getPdfBase64String = function(target, container, onSuccessOrOptions, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y) {
  var stage = container ? container.getStage() : null;

  if (stage) {
    var imageSettings = anychart.exports.getFinalSettings(target, 'image');
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
          'width': imageSettings['width'],
          'height': imageSettings['height']
        });

    stage.getPdfBase64String(args['onSuccess'], args['onError'], args['paperSize'] || args['width'], args['landscape'] || args['height'], args['x'], args['y']);
  }
};


/**
 * Print all element on related stage.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(acgraph.vector.PaperSize|Object)=} opt_paperSizeOrOptions Paper size or object with options/
 * @param {boolean=} opt_landscape
 */
anychart.exports.print = function(target, container, opt_paperSizeOrOptions, opt_landscape) {
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
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|Object)=} opt_captionOrOptions Caption for main link. If not set hostname will be used. Or object with options.
 * @param {string=} opt_link Url of the link attached to publication.
 * @param {string=} opt_name Title for the attached link. If not set hostname or opt_link url will be used.
 * @param {string=} opt_description Description for the attached link.
 */
anychart.exports.shareWithFacebook = function(target, container, opt_captionOrOptions, opt_link, opt_name, opt_description) {
  var exportOptions = anychart.exports.getFinalSettings(target, 'facebook');
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
  var popup = anychart.window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

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
  anychart.exports.shareAsPng(target, container, onSuccess, undefined, false, imageWidth, imageHeight);
};


/**
 * Opens Twitter sharing dialog.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 */
anychart.exports.shareWithTwitter = function(target, container) {
  var exportOptions = anychart.exports.getFinalSettings(target, 'twitter');
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
    dataInput.value = anychart.exports.toSvg(target, container, exportOptions['width'], exportOptions['height']);
    var mapWindow = anychart.window.open('', 'Map', 'status=0,title=0,height=520,width=600,scrollbars=1, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    if (mapWindow) mapForm.submit();
  }
};


/**
 * Opens LinkedIn sharing dialog.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|Object)=} opt_captionOrOptions Caption for publication. If not set 'AnyChart' will be used. Or object with options.
 * @param {string=} opt_description Description. If not set opt_caption will be used.
 */
anychart.exports.shareWithLinkedIn = function(target, container, opt_captionOrOptions, opt_description) {
  var exportOptions = anychart.exports.getFinalSettings(target, 'linkedin');
  var args = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'description': opt_description
  }, opt_captionOrOptions, exportOptions);

  var w = 550;
  var h = 520;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var popup = anychart.window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

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

  anychart.exports.shareAsPng(target, container, onSuccess, undefined, false, exportOptions['width'], exportOptions['height']);
};


/**
 * Opens Pinterest sharing dialog.
 * @param {?anychart.core.VisualBase} target
 * @param {?acgraph.vector.ILayer} container
 * @param {(string|Object)=} opt_linkOrOptions Attached link. If not set, the image url will be used. Or object with options.
 * @param {string=} opt_description Description.
 */
anychart.exports.shareWithPinterest = function(target, container, opt_linkOrOptions, opt_description) {
  var exportOptions = anychart.exports.getFinalSettings(target, 'pinterest');
  var args = anychart.utils.decomposeArguments({
    'link': opt_linkOrOptions,
    'description': opt_description
  }, opt_linkOrOptions, exportOptions);

  var w = 550;
  var h = 520;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var popup = anychart.window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

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

  anychart.exports.shareAsPng(target, container, onSuccess, undefined, false, exportOptions['width'], exportOptions['height']);
};
//endregion
//region --- Client-side



//endregion


//exports
goog.exportSymbol('anychart.exports', anychart.exports);
goog.exportSymbol('anychart.exports.server', anychart.exports.server);
