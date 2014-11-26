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
  goog.base(this);

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
 */
anychart.palettes.Markers.prototype.markerAt = function(index, opt_marker) {
  if (!this.markers_) this.markers_ = [];

  var count = this.markers_.length;

  if (index >= count && count > 0) index = index % count;

  // work as setter
  if (goog.isDef(opt_marker)) {
    opt_marker = opt_marker.toLowerCase();
    this.markers_[index] = opt_marker;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  // work as getter
  } else {
    var marker = this.markers_[index];
    return marker ? marker : null;
  }
};


/**
 * Getter/setter for markers list of palette.
 * @example <t>listingOnly</t>
 * var palette = anychart.utils.markerPalette();
 * palette.markers(); // ['star4', 'star5', 'star6', ...]
 * palette.markers(['cross', 'diagonalcross']).markers(); // ['cross', 'diagonalcross']
 * palette.markers('diamond', 'circle', 'square').markers(); // ['diamond', 'circle', 'square']
 * @param {(Array.<string>)=} opt_markers
 * @return {Array.<string>|anychart.palettes.Markers} Markers list or self for method chaining.
 */
anychart.palettes.Markers.prototype.markers = function(opt_markers) {
  if (goog.isDef(opt_markers)) {
    if (arguments.length > 1) {
      opt_markers = goog.array.slice(arguments, 0);
    }
    if (goog.isArray(opt_markers)) {
      this.markers_ = goog.array.map(opt_markers, function(marker) {
        return marker.toLowerCase();
      });
    }
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
  var json = goog.base(this, 'serialize');
  json['markers'] = this.markers();
  return json;
};


/**
 * @inheritDoc
 */
anychart.palettes.Markers.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();
  this.markers(config['markers']);
  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Constructor function.
 * @return {!anychart.palettes.Markers}
 */
anychart.palettes.markers = function() {
  return new anychart.palettes.Markers();
};


//exports
goog.exportSymbol('anychart.palettes.markers', anychart.palettes.markers);
anychart.palettes.Markers.prototype['markerAt'] = anychart.palettes.Markers.prototype.markerAt;
anychart.palettes.Markers.prototype['markers'] = anychart.palettes.Markers.prototype.markers;
