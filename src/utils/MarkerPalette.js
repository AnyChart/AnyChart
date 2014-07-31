goog.provide('anychart.utils.MarkerPalette');
goog.require('anychart.Base');
goog.require('anychart.elements.Marker.Type');
goog.require('goog.array');



/**
 * Marker palette.
 * @constructor
 * @extends {anychart.Base}
 */
anychart.utils.MarkerPalette = function() {
  goog.base(this);

  /**
   * Marker palette.
   * @type {Array.<string>}
   * @private
   */
  this.markers_ = [];

  // Initialize default marker palette using all marker types framework supports.
  for (var key in anychart.elements.Marker.Type) {
    this.markers_.push(anychart.elements.Marker.Type[key]);
  }
};
goog.inherits(anychart.utils.MarkerPalette, anychart.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.utils.MarkerPalette.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Setter for the marker at index if the opt_marker set, getter otherwise.
 * @param {number} index Index of marker to get/set.
 * @param {string=} opt_marker Type of the marker to set.
 * @return {anychart.elements.Marker.Type|anychart.utils.MarkerPalette} Marker by index or self for chaining.
 */
anychart.utils.MarkerPalette.prototype.markerAt = function(index, opt_marker) {
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
 * @example <t>simple</t>
 * var palette = new anychart.utils.MarkerPalette();
 * palette.markers(); // ['star4', 'star5', 'star6', ...]
 * palette.markers(['cross', 'diagonalcross']).markers(); // ['cross', 'diagonalcross']
 * palette.markers('diamond', 'circle', 'square').markers(); // ['diamond', 'circle', 'square']
 * @param {(Array.<string>)=} opt_markers
 * @return {Array.<string>|anychart.utils.MarkerPalette} Markers list or self for method chaining.
 */
anychart.utils.MarkerPalette.prototype.markers = function(opt_markers) {
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
anychart.utils.MarkerPalette.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['markers'] = this.markers();
  return json;
};


/**
 * @inheritDoc
 */
anychart.utils.MarkerPalette.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();
  this.markers(config['markers']);
  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Constructor function.
 * @return {!anychart.utils.MarkerPalette}
 */
anychart.utils.markerPalette = function() {
  return new anychart.utils.MarkerPalette();
};


//exports
goog.exportSymbol('anychart.utils.markerPalette', anychart.utils.markerPalette);
anychart.utils.MarkerPalette.prototype['markerAt'] = anychart.utils.MarkerPalette.prototype.markerAt;
anychart.utils.MarkerPalette.prototype['markers'] = anychart.utils.MarkerPalette.prototype.markers;
anychart.utils.MarkerPalette.prototype['serialize'] = anychart.utils.MarkerPalette.prototype.serialize;
anychart.utils.MarkerPalette.prototype['deserialize'] = anychart.utils.MarkerPalette.prototype.deserialize;
