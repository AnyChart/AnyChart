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

  this.addThemes('markerPalette');

  /**
   * Marker palette.
   * @type {Array.<string>}
   * @private
   */
  this.markers_;

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
 * @param {string=} opt_item Type of the marker to set.
 * @return {anychart.enums.MarkerType|anychart.enums.BulletMarkerType|anychart.palettes.Markers} Marker by index or self for chaining.
 */
anychart.palettes.Markers.prototype.itemAt = function(index, opt_item) {
  var markersList = this.items();

  var count = markersList.length;

  if (index >= count && count > 0) index = index % count;

  var marker;

  // work as setter
  if (goog.isDef(opt_item)) {
    marker = anychart.enums.normalizeAnyMarkerType(opt_item);
    if (marker != markersList[index]) {
      markersList[index] = marker;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  // work as getter
  } else {
    marker = markersList[index];
    return marker || null;
  }
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
  if (!this.markers_) {
    this.markers_ = [];
    if (goog.isDef(this.themeSettings['items'])) {
      for (var i = 0; i < this.themeSettings['items'].length; i++) {
        this.markers_.push(this.themeSettings['items'][i]);
      }
    } else { // Initialize default marker palette using all marker types framework supports.
      for (var key in anychart.enums.MarkerType) {
        this.markers_.push(anychart.enums.MarkerType[key]);
      }
    }
  }

  if (goog.isDef(opt_items)) {
    if (!goog.isArray(opt_items)) {
      opt_items = goog.array.slice(arguments, 0);
    }
    goog.disposeAll(this.markers_);
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
anychart.palettes.Markers.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isArray(arg0)) {
    return {'items': arg0};
  } else if (anychart.utils.instanceOf(arg0, anychart.palettes.Markers)) {
    return {'items': arg0.items()};
  }
  return null;
};


/** @inheritDoc */
anychart.palettes.Markers.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    this.items(/** @type {Array.<string>} */(resolvedValue['items']));
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.palettes.Markers.prototype.setupByJSON = function(config, opt_default) {
  anychart.palettes.Markers.base(this, 'setupByJSON', config, opt_default);
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
(function() {
  var proto = anychart.palettes.Markers.prototype;
  goog.exportSymbol('anychart.palettes.markers', anychart.palettes.markers);
  proto['itemAt'] = proto.itemAt;
  proto['items'] = proto.items;
})();
