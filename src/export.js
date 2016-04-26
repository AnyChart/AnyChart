goog.provide('anychart.exports');
goog.require('anychart');


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
 Sets and returns an address export server script, which is used to export to an image
 or PDF.
 @see acgraph.vector.Stage#saveAsPdf
 @see acgraph.vector.Stage#saveAsPng
 @see acgraph.vector.Stage#saveAsJpg
 @see acgraph.vector.Stage#saveAsSvg
 @param {string=} opt_address Export server script URL.
 @return {string} Export server script URL.
 */
anychart.exports.server = anychart.server;


goog.exportSymbol('anychart.exports.filename', anychart.exports.filename);
goog.exportSymbol('anychart.exports.server', anychart.exports.server);
