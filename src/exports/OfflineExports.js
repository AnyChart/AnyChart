goog.provide('anychart.exportsModule.offline');


/**
 *
 * @enum {string}
 */
anychart.exportsModule.offline.MIME_TYPES = {
  PNG: 'image/png',
  JPG: 'image/jpeg',
  SVG: 'image/svg+xml'
};


/**
 *
 * @param {acgraph.vector.Stage} stage
 * @param {Element|string} svgDomElementOrDataUrl
 * @param {Object} args
 * @param {Function} successCallback
 * @param {Function} failCallback
 */
anychart.exportsModule.offline.saveAsPdf = function(stage, svgDomElementOrDataUrl, args, successCallback, failCallback) {
  var paperSize = args['paperSize'];
  var landscape = args['landscape'];
  var x = args['x'] || 0;
  var y = args['y'] || 0;
  var opt_filename = args['filename'] || 'anychart';
  opt_filename += '.pdf';
  var pdf;

  try {
    if (goog.isDef(paperSize) || goog.isDef(landscape)) {
      var size = acgraph.vector.normalizePageSize(paperSize, landscape);
      var pixelWidth, pixelHeight;

      if (goog.isString(paperSize)) {
        pixelWidth = acgraph.utils.exporting.PdfPaperSize[paperSize].width;
        pixelHeight = acgraph.utils.exporting.PdfPaperSize[paperSize].height;

        if ((landscape && (pixelHeight > pixelWidth)) || (!landscape && (pixelHeight < pixelWidth))) {
          pixelWidth = [pixelHeight, pixelHeight = pixelWidth][0];
        }
      } else {
        pixelWidth = parseFloat(size.width);
        pixelHeight = parseFloat(size.height);
      }

      pdf = new goog.global['jsPDF'](landscape ? 'l' : 'p', 'pt', paperSize || [pixelWidth, pixelHeight]);

      if (goog.isString(svgDomElementOrDataUrl)) {
        pdf['addImage'](svgDomElementOrDataUrl, 'png', x, y, pixelWidth, pixelHeight);
      } else {
        goog.global['svg2pdf'](svgDomElementOrDataUrl, pdf, {'xOffset': x, 'yOffset': y, 'scale': 1});
      }

      pdf.save(opt_filename);
    } else {
      var width = stage.width();
      var height = stage.height();
      var orientation = width > height ? 'l' : 'p';
      pdf = new goog.global['jsPDF'](orientation, 'pt', [width, height]);
      if (goog.isString(svgDomElementOrDataUrl)) {
        pdf['addImage'](svgDomElementOrDataUrl, 'png', x, y, width, height);
      } else {
        goog.global['svg2pdf'](svgDomElementOrDataUrl, pdf, {'xOffset': x, 'yOffset': y, 'scale': 1});
      }
      pdf.save(opt_filename);
    }
    successCallback();
  } catch (e) {
    failCallback(args);
  }

};


/**
 * Renders svg on canvas and passes dataUrl to success callback.
 * @param {anychart.core.VisualBase} target
 * @param {Element} svgElement
 * @param {Object} args
 * @param {acgraph.vector.Stage.ExportType} fileType
 * @param {number} width
 * @param {number} height
 * @param {Function} successCallback
 * @param {Function} failCallback
 */
anychart.exportsModule.offline.renderSvgAsImage = function(target, svgElement, args, fileType, width, height, successCallback, failCallback) {
  var mimeType;
  switch (fileType) {
    case acgraph.vector.Stage.ExportType.JPG:
      mimeType = anychart.exportsModule.offline.MIME_TYPES.JPG;
      break;
    case acgraph.vector.Stage.ExportType.PNG:
    default:
      fileType = acgraph.vector.Stage.ExportType.PNG;
      mimeType = anychart.exportsModule.offline.MIME_TYPES.PNG;
      break;
  }

  var canvas = goog.dom.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  goog.style.setStyle(canvas, {
    'width': width,
    'height': height,
    'visibility': 'hidden',
    'position': 'fixed',
    'right': 0,
    'bottom': 0
  });
  goog.dom.appendChild(anychart.document.body, canvas);
  var ctx = canvas.getContext('2d');
  var image = new Image();
  var quality = args['quality'] || 0.92;

  /*
  these fix issue with firefox not drawing svg element to canvas, due to missing (in our case set as '100%')
  values of width and height
  */
  svgElement.setAttribute('width', width);
  svgElement.setAttribute('height', height);

  var svgString = new XMLSerializer().serializeToString(svgElement);
  var blob = new Blob([svgString], {'type': 'image/svg+xml'});
  var svgUrl = goog.fs.url.createObjectUrl(blob);

  image.onload = function() {
    try {
      if (canvas['msToBlob'] && ctx['drawSvg']) {
        //this method is imported by canvg
        ctx['drawSvg'](svgString, 0, 0, width, height);
        var imageDataUrl = canvas.toDataURL(mimeType, quality);
        successCallback(imageDataUrl);
      } else {
        //calling drawSvg in chrome led to errors from time to time, whereas drawImage works fine
        ctx.drawImage(image, 0, 0, width, height);

        var imageDataUrl = canvas.toDataURL(mimeType, quality);
        successCallback(imageDataUrl);
      }

      goog.dom.removeNode(canvas);
      goog.fs.url.revokeObjectUrl(svgUrl);
    } catch (e) {
      failCallback(args);
    }
  };


  image.src = svgUrl;
};


/**
 *
 * @param {anychart.core.VisualBase} target
 * @param {Element} svgElement
 * @param {acgraph.vector.Stage.ExportType} fileType
 * @param {Object} args
 * @param {number} width
 * @param {number} height
 * @param {Function} successCallback
 * @param {Function} failCallback
 */
anychart.exportsModule.offline.saveSvgToFileType = function(target, svgElement, fileType, args, width, height, successCallback, failCallback) {
  var fileName = args['filename'] || 'anychart';//last arg is always opt_filename
  var stage = target.container().getStage();

  var hasImages = svgElement.getElementsByTagName('image').length > 0;

  var saveDataUrl = function(imageDataUrl) {
    anychart.exportsModule.offline.downloadDataUrl(imageDataUrl, fileName);
    successCallback();
  };

  try {
    switch (fileType) {
      case acgraph.vector.Stage.ExportType.SVG:
        var svgString = new XMLSerializer().serializeToString(svgElement);
        var blob = new Blob([svgString], {'type': 'image/svg+xml'});
        anychart.exportsModule.offline.downloadDataUrl(blob, fileName);
        successCallback();
        break;
      case acgraph.vector.Stage.ExportType.PNG:
        anychart.exportsModule.offline.renderSvgAsImage(target, svgElement, args, fileType, width, height, saveDataUrl, failCallback);
        break;
      case acgraph.vector.Stage.ExportType.JPG:
        anychart.exportsModule.offline.renderSvgAsImage(target, svgElement, args, fileType, width, height, saveDataUrl, failCallback);
        break;
      case acgraph.vector.Stage.ExportType.PDF:
        if (hasImages) {
          var saveAsPdfCallback = function(imageDataUrl) {
            anychart.exportsModule.offline.saveAsPdf(stage, imageDataUrl, args, successCallback, failCallback);
          };
          anychart.exportsModule.offline.renderSvgAsImage(target, svgElement, args, fileType, width, height, saveAsPdfCallback, failCallback);
        } else {
          anychart.exportsModule.offline.saveAsPdf(stage, svgElement, args, successCallback, failCallback);
        }

        break;
    }

  } catch (e) {
    failCallback(args);
  }
};


/**
 *
 * @param {anychart.core.VisualBase} target
 * @param {acgraph.vector.Stage.ExportType} exportType
 * @param {Object} args these are arguments, that export module passes to stage.saveAs{Png,Jpg,Svg,Pdf} methods.
 * @param {Function} successCallback
 * @param {Function} failCallback handles falling back to export server, should accept args param.
 */
anychart.exportsModule.offline.exportChartOffline = function(target, exportType, args, successCallback, failCallback) {
  anychart.exports.loadExternalDependencies()
      .then(function() {
        anychart.exports.isExternLoaded = true;

        var stageDomElementClone;
        var stage = target.container().getStage();
        var exportPixelWidth, exportPixelHeight;
        var paperSize = args['paperSize'];
        var landscape = args['landscape'];

        //size is passed as paper size (a{0,1,2,3,4,etc})
        if (goog.isString(paperSize)) {
          exportPixelWidth = acgraph.utils.exporting.PdfPaperSize[paperSize].width;
          exportPixelHeight = acgraph.utils.exporting.PdfPaperSize[paperSize].height;
        } else {
          exportPixelWidth = args['width'] || stage.width();
          exportPixelHeight = args['height'] || stage.height();
        }

        var stageOrigWidth = /** @type {number} */(stage.width());
        var stageOrigHeight = /** @type {number} */(stage.height());


        /*
        If landscape true - width should be longer than height.
        Otherwise height > width.
        It should be switched only if paperSize is given as string ('a4', 'a5', etc).
         */
        if (exportType == acgraph.vector.Stage.ExportType.PDF && goog.isString(paperSize) &&
            ((landscape && (exportPixelHeight > exportPixelWidth)) || (!landscape && (exportPixelHeight < exportPixelWidth)))) {
          exportPixelWidth = [exportPixelHeight, exportPixelHeight = exportPixelWidth][0];//switch width <-> height
        }

        stage.resize(exportPixelWidth, exportPixelHeight);
        stageDomElementClone = stage.domElement().cloneNode(true);
        stage.resize(goog.isString(stageOrigWidth) ? stageOrigWidth : '100%' , goog.isString(stageOrigHeight) ? stageOrigHeight : '100%');

        stageDomElementClone.setAttribute('width', exportPixelWidth);
        stageDomElementClone.setAttribute('height', exportPixelHeight);

        //number of images converted into base64 string
        var imagesConverted = 0;
        var images = stageDomElementClone.getElementsByTagName('image');

        var svgPrepared = function() {
          anychart.exportsModule.offline.saveSvgToFileType(target, stageDomElementClone, exportType, args, exportPixelWidth, exportPixelHeight, successCallback, failCallback);
        };

        var conversionSuccess = function() {
          imagesConverted++;

          if (imagesConverted == images.length) {
            svgPrepared();
          }
        };


        var convertImage = function(image) {
          var link = image.getAttribute('href');
          var newImage = new Image();
          var width = parseFloat(image.getAttribute('width'));
          var height = parseFloat(image.getAttribute('height'));
          width = width || 1;//sometimes images have zero width/height, wich results in empty imageDataUrl
          height = height || 1;

          newImage.onload = function() {
            var canvas = (goog.dom.createElement(goog.dom.TagName.CANVAS));
            goog.dom.appendChild(anychart.document.body, canvas);
            var ctx = goog.dom.getCanvasContext2D(canvas);
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(newImage, 0, 0, width, height);
            var imageDataUrl = canvas.toDataURL();
            image.setAttribute('href', imageDataUrl);
            image.setAttribute('src', imageDataUrl);
            conversionSuccess();
            goog.dom.removeNode(canvas);
          };
          newImage.crossOrigin = 'anonymous';
          newImage.src = link;
        };

        var exportToImagesOrPdf = goog.array.contains([
          acgraph.vector.Stage.ExportType.PNG,
          acgraph.vector.Stage.ExportType.JPG,
          acgraph.vector.Stage.ExportType.PDF
        ], exportType);


        try {
          if (images.length > 0) {

            //There are problems exporting chart with images in IE browsers to images or pdf.
            if (goog.labs.userAgent.engine.isTrident() && exportToImagesOrPdf) {
              throw 'Internet explorer can\'t export chart with images to pdf, jpg or png';
            }

            for (var i = 0; i < images.length; i++) {
              convertImage(images[i]);
            }
          } else {
            svgPrepared();
          }
        } catch (e) {
          anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_EXPORT_FAILED, null, [], true);
          failCallback();
        }
      })
      .thenCatch(function() {
        anychart.core.reporting.warning(anychart.enums.WarningCode.OFFLINE_EXPORT_FAILED, null, [], true);
        failCallback();
      });

};


/**
 * Tries to open url using <a> element, falls back to window.open() if <a>.download not supported.
 * @param {string|Blob} dataUrlOrBlob
 * @param {string=} opt_filename
 */
anychart.exportsModule.offline.downloadDataUrl = function(dataUrlOrBlob, opt_filename) {
  var a = goog.dom.createElement('a');
  var blob = goog.isString(dataUrlOrBlob) ? anychart.exportsModule.offline.dataURItoBlob(dataUrlOrBlob) : dataUrlOrBlob;
  switch (blob.type) {
    case 'image/svg+xml':
      opt_filename += '.svg';
      break;
    case 'image/png':
      opt_filename += '.png';
      break;
    case 'image/jpeg':
      opt_filename += '.jpg';
      break;
    case 'application/pdf':
      opt_filename += '.pdf';
      break;
  }

  dataUrlOrBlob = goog.fs.url.createObjectUrl(blob);
  if (goog.isDef(a['download'])) {
    goog.dom.appendChild(anychart.document.body, a);
    a.href = dataUrlOrBlob;
    a.download = opt_filename || '';
    a.click();
    goog.dom.removeNode(a);
  } else if (goog.isDef(goog.global.navigator.msSaveOrOpenBlob)) {
    goog.global.navigator.msSaveOrOpenBlob(blob, opt_filename);
  } else {
    anychart.global['open'](dataUrlOrBlob, opt_filename);
  }

  goog.fs.url.revokeObjectUrl(dataUrlOrBlob);
};


/**
 * Converts base64 dataURI to Blob.
 * @param {string} dataURI
 * @return {Blob}
 */
anychart.exportsModule.offline.dataURItoBlob = function(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);

  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  var ab = new ArrayBuffer(byteString.length);

  /*
  Array buffer, we created above, only allocates peace of memory and doesn't allow us to write there.
  To manipulate this memory we have to use typed arrays, like: Uint{8,16,32,64}Array and Float64Array, or DataView.
  Typed arrays allow us to read and write data in array buffer, using array-like syntax: uintArray[i].
  As we are writing byte sized data (char codes, limited to 255 max value), we use here Uint8Array.
  More info:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
   */
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], {type: mimeString});
};
