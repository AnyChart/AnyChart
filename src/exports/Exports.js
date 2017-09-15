goog.provide('anychart.exportsModule.Exports');



/**
 * Composition view, that concatenates two different views.
 * @constructor
 */
anychart.exportsModule.Exports = function() {
  /**
   * File name for exported files.
   * @type {string}
   * @private
   */
  this.filename_;

  /**
   * Dimensions for exported images and pdf-s.
   * @type {Object}
   * @private
   */
  this.image_ = {};

  /**
   * Facebook sharing settings.
   * @type {Object}
   * @private
   */
  this.facebook_ = {};

  /**
   * Twitter sharing settings.
   * @type {Object}
   * @private
   */
  this.twitter_ = {};

  /**
   * LinkedIn sharing settings.
   * @type {Object}
   * @private
   */
  this.linkedIn_ = {};

  /**
   * Pinterest sharing settings.
   * @type {Object}
   * @private
   */
  this.pinterest_ = {};
};


//region --- Settings
/**
 * Get/set file name for exported files.
 * @param {string=} opt_value New file name.
 * @return {string} Current file name.
 */
anychart.exportsModule.Exports.prototype.filename = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.filename_ = opt_value;
  }
  return this.filename_;
};


/**
 * Get/set dimensions for exported images and pdf-s.
 * @param {(string|Object)=} opt_widthOrOptions New image or pdf width. Or object with options.
 * @param {string=} opt_height New image or pdf height.
 * @return {Object} Current image dimensions.
 */
anychart.exportsModule.Exports.prototype.image = function(opt_widthOrOptions, opt_height) {
  this.image_ = anychart.utils.decomposeArguments({
    'width': opt_widthOrOptions,
    'height': opt_height
  }, opt_widthOrOptions, this.image_);

  return this.image_;
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
anychart.exportsModule.Exports.prototype.facebook = function(opt_captionOrOptions, opt_link, opt_name, opt_description, opt_width, opt_height, opt_appId) {
  this.facebook_ = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'link': opt_link,
    'name': opt_name,
    'description': opt_description,
    'width': opt_width,
    'height': opt_height,
    'appId': opt_appId
  }, opt_captionOrOptions, this.facebook_);

  return this.facebook_;
};


/**
 * Get/set facebook sharing settings.
 * @param {(string|Object)=} opt_urlOrOptions Twitter sharing application export server url or object with options.
 * @param {string=} opt_width Image width.
 * @param {string=} opt_height Image height.
 * @return {Object} Current settings.
 */
anychart.exportsModule.Exports.prototype.twitter = function(opt_urlOrOptions, opt_width, opt_height) {
  this.twitter_ = anychart.utils.decomposeArguments({
    'url': opt_urlOrOptions,
    'width': opt_width,
    'height': opt_height
  }, opt_urlOrOptions, this.twitter_);

  return this.twitter_;
};


/**
 * Get/set LinkedIn sharing settings.
 * @param {(string|Object)=} opt_captionOrOptions Caption for publication or object with options.
 * @param {string=} opt_description Description.
 * @param {string=} opt_width Image width.
 * @param {string=} opt_height Image height.
 * @return {Object} Current settings.
 */
anychart.exportsModule.Exports.prototype.linkedin = function(opt_captionOrOptions, opt_description, opt_width, opt_height) {
  this.linkedIn_ = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'description': opt_description,
    'width': opt_width,
    'height': opt_height
  }, opt_captionOrOptions, this.linkedIn_);

  return this.linkedIn_;
};


/**
 * Get/set Pinterest sharing settings.
 * @param {(string|Object)=} opt_linkOrOptions Attached link or object with options.
 * @param {string=} opt_description Description.
 * @param {string=} opt_width Image width.
 * @param {string=} opt_height Image height.
 * @return {Object} Current settings.
 */
anychart.exportsModule.Exports.prototype.pinterest = function(opt_linkOrOptions, opt_description, opt_width, opt_height) {
  this.pinterest_ = anychart.utils.decomposeArguments({
    'link': opt_linkOrOptions,
    'description': opt_description,
    'width': opt_width,
    'height': opt_height
  }, opt_linkOrOptions, this.pinterest_);

  return this.pinterest_;
};


//endregion

/**
 * Applying defaults.
 */
anychart.exportsModule.Exports.prototype.applyDefaults = function() {
  this.filename_ = 'anychart';

  this.image_ = {
    'width': undefined,
    'height': undefined
  };

  this.facebook_ = {
    'caption': anychart.window['location'] ? anychart.window['location']['hostname'] : '',
    'link': undefined,
    'name': undefined,
    'description': undefined,
    'appId': 1167712323282103,
    'width': 1200,
    'height': 630
  };

  this.twitter_ = {
    'url': 'https://export.anychart.com/sharing/twitter',
    'width': 1024,
    'height': 800
  };

  this.linkedIn_ = {
    'caption': 'AnyChart',
    'description': undefined,
    'width': 1200,
    'height': 630
  };

  this.pinterest_ = {
    'link': undefined,
    'description': undefined,
    'width': 1200,
    'height': 800
  };
};


/**
 * @param {Object} json .
 * @param {string} name .
 * @param {*} value .
 * @private
 */
anychart.exportsModule.Exports.prototype.serializeInternal_ = function(json, name, value) {
  if (goog.isObject(value)) {
    var result = {};
    goog.object.forEach(value, function(v, k) {
      if (goog.isDef(v))
        result[k] = v;
    });

    if (!goog.object.isEmpty(result))
      json[name] = result;
  } else if (goog.isDef(value)) {
    json[name] = value;
  }
};


/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.exportsModule.Exports.prototype.serialize = function() {
  var json = {};

  this.serializeInternal_(json, 'filename', this.filename_);
  this.serializeInternal_(json, 'image', this.image_);
  this.serializeInternal_(json, 'facebook', this.facebook_);
  this.serializeInternal_(json, 'twitter', this.twitter_);
  this.serializeInternal_(json, 'linkedin', this.linkedIn_);
  this.serializeInternal_(json, 'pinterest', this.pinterest_);

  return json;
};


/**
 * Setups current instance using passed JSON object.
 * @param {!Object} json .
 */
anychart.exportsModule.Exports.prototype.setupByJSON = function(json) {
  this.filename(json['filename']);
  this.image(json['image']);
  this.facebook(json['facebook']);
  this.twitter(json['twitter']);
  this.linkedin(json['linkedin']);
  this.pinterest(json['pinterest']);
};


//exports
(function() {
  var proto = anychart.exportsModule.Exports.prototype;
  proto['filename'] = proto.filename;
  proto['image'] = proto.image;
  proto['facebook'] = proto.facebook;
  proto['twitter'] = proto.twitter;
  proto['linkedin'] = proto.linkedin;
  proto['pinterest'] = proto.pinterest;
})();