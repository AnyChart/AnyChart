goog.provide('anychart.palettes.Markers');
goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('goog.array');



/**
 * Marker palette.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.palettes.Markers = function() {
  anychart.palettes.Markers.base(this, 'constructor');

  /**
   * Marker palette.
   * @type {Array.<string>}
   * @private
   */
  this.markers_ = [];

  // Initialize default marker palette using all marker types framework supports.
  for (var key in anychart.enums.MarkerType) {
    this.markers_.push(anychart.enums.MarkerType[key]);
  }
};
goog.inherits(anychart.palettes.Markers, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.palettes.Markers.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Setter for the marker at index if the opt_marker set, getter otherwise.
 * @param {number} index Index of marker to get/set.
 * @param {string=} opt_marker Type of the marker to set.
 * @return {anychart.enums.MarkerType|anychart.enums.BulletMarkerType|anychart.palettes.Markers} Marker by index or self for chaining.
 * @deprecated Since 7.7.0. Use itemAt() method instead.
 */
anychart.palettes.Markers.prototype.markerAt = function(index, opt_marker) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['markerAt()', 'itemAt()'], true);
  return this.itemAt(index, opt_marker);
};


/**
 * Setter for the marker at index if the opt_marker set, getter otherwise.
 * @param {number} index Index of marker to get/set.
 * @param {string=} opt_item Type of the marker to set.
 * @return {anychart.enums.MarkerType|anychart.enums.BulletMarkerType|anychart.palettes.Markers} Marker by index or self for chaining.
 */
anychart.palettes.Markers.prototype.itemAt = function(index, opt_item) {
  if (!this.markers_) this.markers_ = [];

  var count = this.markers_.length;

  if (index >= count && count > 0) index = index % count;

  var marker;

  // work as setter
  if (goog.isDef(opt_item)) {
    marker = anychart.enums.normalizeAnyMarkerType(opt_item);
    if (marker != this.markers_[index]) {
      this.markers_[index] = marker;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  // work as getter
  } else {
    marker = this.markers_[index];
    return marker || null;
  }
};


/**
 * Getter/setter for markers list of palette.
 * @example <t>listingOnly</t>
 * var palette = anychart.utils.markerPalette();
 * palette.markers(); // ['star4', 'star5', 'star6', ...]
 * palette.markers(['cross', 'diagonalcross']).markers(); // ['cross', 'diagonalcross']
 * palette.markers('diamond', 'circle', 'square').markers(); // ['diamond', 'circle', 'square']
 * @param {(Array.<string>|string)=} opt_markers
 * @param {...string} var_args .
 * @return {Array.<string>|anychart.palettes.Markers} Markers list or self for method chaining.
 * @deprecated Since 7.7.0. Use items() method instead.
 */
anychart.palettes.Markers.prototype.markers = function(opt_markers, var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['markers()', 'items()'], true);
  return this.items.apply(this, arguments);
};


/**
 * Getter/setter for markers list of palette.
 * @example <t>listingOnly</t>
 * var palette = anychart.utils.markerPalette();
 * palette.items(); // ['star4', 'star5', 'star6', ...]
 * palette.items(['cross', 'diagonalcross']).items(); // ['cross', 'diagonalcross']
 * palette.items('diamond', 'circle', 'square').items(); // ['diamond', 'circle', 'square']
 * @param {(Array.<string>|string)=} opt_items .
 * @param {...string} var_args .
 * @return {Array.<string>|anychart.palettes.Markers} Markers list or self for method chaining.
 */
anychart.palettes.Markers.prototype.items = function(opt_items, var_args) {
  if (goog.isDef(opt_items)) {
    if (!goog.isArray(opt_items)) {
      opt_items = goog.array.slice(arguments, 0);
    }
    this.markers_ = goog.array.map(opt_items, function(marker) {
      return anychart.enums.normalizeAnyMarkerType(marker);
    });
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    return this.markers_;
  }
};


/**
 * @inheritDoc
 */
anychart.palettes.Markers.prototype.serialize = function() {
  var json = anychart.palettes.Markers.base(this, 'serialize');
  json['items'] = this.items();
  return json;
};


/** @inheritDoc */
anychart.palettes.Markers.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isArray(args[0])) {
    this.items(args[0]);
    return true;
  }
  if (args[0] instanceof anychart.palettes.Markers) {
    this.items(args[0].items());
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, args);
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.palettes.Markers.prototype.setupByJSON = function(config, opt_default) {
  anychart.palettes.Markers.base(this, 'setupByJSON', config, opt_default);
  if (goog.isDef(config['markers']))
    this.markers(config['markers']);
  this.items(config['items']);
};


/**
 * Constructor function.
 * @param {(Array.<string>|string)=} opt_value Array of markers.
 * @param {...string} var_args Markers enumeration.
 * @return {!anychart.palettes.Markers}
 */
anychart.palettes.markers = function(opt_value, var_args) {
  var palette = new anychart.palettes.Markers();
  if (goog.isDef(opt_value)) {
    palette.items.apply(palette, arguments);
  }
  return palette;
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.palettes.Markers.prototype;
  goog.exportSymbol('anychart.palettes.markers', anychart.palettes.markers);
  proto['markerAt'] = proto.markerAt;
  proto['itemAt'] = proto.itemAt;
  proto['markers'] = proto.markers;
  proto['items'] = proto.items;
})();
