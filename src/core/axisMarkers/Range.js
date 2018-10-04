goog.provide('anychart.core.axisMarkers.Range');
goog.provide('anychart.standalones.axisMarkers.Range');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.axisMarkers.PathBase');



/**
 * Range marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.PathBase}
 */
anychart.core.axisMarkers.Range = function() {
  anychart.core.axisMarkers.Range.base(this, 'constructor');

  this.addThemes('defaultRangeMarkerSettings');

  /**
   * @type {anychart.core.axisMarkers.PathBase.Range}
   */
  this.val = {from: 0, to: 0};

  /**
   * @type {?(string|acgraph.vector.Fill)}
   * @private
   */
  this.fill_;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.defaultFill_ = 'black';

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_ = anychart.enums.Layout.HORIZONTAL;

  var fromToBeforeInvalidationHook = function() {
    this.invalidate(anychart.ConsistencyState.BOUNDS, this.getValueChangeSignals());
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['from', 0, 0, 0, fromToBeforeInvalidationHook],
    ['to', 0, 0, 0, fromToBeforeInvalidationHook]
  ]);

};
goog.inherits(anychart.core.axisMarkers.Range, anychart.core.axisMarkers.PathBase);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.axisMarkers.Range.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'from', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'to', anychart.core.settings.asIsNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.axisMarkers.Range, anychart.core.axisMarkers.Range.PROPERTY_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//  Events
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Range.prototype.getFormattedValue = function() {
    return 'From: ' + this.getOption('from') + ' to: ' + this.getOption('to');
};


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.Range.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.Range.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set layout.
 * @param {anychart.enums.Layout=} opt_value - RangeMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.Range} - Layout or this.
 */
anychart.core.axisMarkers.Range.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis()) {
    var axisOrientation = this.axis().orientation();
    var isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
    return isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
  } else {
    return this.defaultLayout_;
  }
};


/**
 * Set Default layout.
 * @param {anychart.enums.Layout} value Layout value.
 */
anychart.core.axisMarkers.Range.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for scale.
 * @param {(anychart.scales.Base|Object|anychart.enums.ScaleTypes)=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axisMarkers.Range} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Range.prototype.scale = function(opt_value) {
  return /** @type {anychart.scales.Base|!anychart.core.axisMarkers.Range} */ (this.scaleInternal(opt_value));
};


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.getReferenceValues = function() {
  return [this.getOption('from'), this.getOption('to')];
};


/**
 * Writes default fill setting to theme settings
 * @param {string|acgraph.vector.Fill} value
 */
anychart.core.axisMarkers.Range.prototype.setDefaultFill = function(value) {
  value = acgraph.vector.normalizeFill(value);
  if (value != this.getThemeOption('fill')) {
    anychart.core.settings.copy(this.themeSettings, anychart.core.axisMarkers.Range.PROPERTY_DESCRIPTORS, {'fill': value});
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * @param {*=} opt_value
 * @returns {{from: *, to: *}}
 */
anychart.core.axisMarkers.Range.prototype.valueInternal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isDef(opt_value['from']))
      this['from'](opt_value['from']);
    if (goog.isDef(opt_value['to']))
      this['to'](opt_value['to']);
  }
  return {
    'from': this.getOption('from'),
    'to': this.getOption('to')
  };
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Range.prototype.boundsInvalidated = function() {
  this.drawRange();
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Range.prototype.appearanceInvalidated = function() {
  this.markerElement().stroke(null).fill(/** @type {acgraph.vector.Fill} */(this.getOption('fill')));
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.disposeInternal = function() {
  this.setOption('fill', null);
  anychart.core.axisMarkers.Range.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.Range.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.axisMarkers.Range.PROPERTY_DESCRIPTORS, json, void 0, void 0, true);
  if (this.layout_) json['layout'] = this.layout_;
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.Range.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.axisMarkers.Range.PROPERTY_DESCRIPTORS, config);
};



//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.core.axisMarkers.Range}
 */
anychart.standalones.axisMarkers.Range = function() {
  anychart.standalones.axisMarkers.Range.base(this, 'constructor');

  this.addThemes('standalones.rangeAxisMarker');
};
goog.inherits(anychart.standalones.axisMarkers.Range, anychart.core.axisMarkers.Range);
anychart.core.makeStandalone(anychart.standalones.axisMarkers.Range, anychart.core.axisMarkers.Range);


/**
 * Constructor function.
 * @return {!anychart.standalones.axisMarkers.Range}
 */
anychart.standalones.axisMarkers.range = function() {
  return new anychart.standalones.axisMarkers.Range();
};


//endregion
//exports
(function() {
  var proto = anychart.core.axisMarkers.Range.prototype;
  // auto generated
  //proto['from'] = proto.from;
  //proto['to'] = proto.to;
  //proto['fill'] = proto.fill;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
  proto['layout'] = proto.layout;
  proto['isHorizontal'] = proto.isHorizontal;

  proto = anychart.standalones.axisMarkers.Range.prototype;
  goog.exportSymbol('anychart.standalones.axisMarkers.range', anychart.standalones.axisMarkers.range);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
