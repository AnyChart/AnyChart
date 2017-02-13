goog.provide('anychart.exports');
goog.require('anychart');
goog.require('anychart.utils');


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
  'url': 'http://export.anychart.stg/sharing/twitter',
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


goog.exportSymbol('anychart.exports.filename', anychart.exports.filename);
goog.exportSymbol('anychart.exports.image', anychart.exports.image);
goog.exportSymbol('anychart.exports.facebook', anychart.exports.facebook);
goog.exportSymbol('anychart.exports.twitter', anychart.exports.twitter);
goog.exportSymbol('anychart.exports.linkedin', anychart.exports.linkedin);
goog.exportSymbol('anychart.exports.pinterest', anychart.exports.pinterest);
goog.exportSymbol('anychart.exports.server', anychart.exports.server);
