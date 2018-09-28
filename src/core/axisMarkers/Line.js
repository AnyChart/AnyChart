goog.provide('anychart.core.axisMarkers.Line');
goog.provide('anychart.standalones.axisMarkers.Line');

goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.axisMarkers.PathBase');



/**
 * Line marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.PathBase}
 */
anychart.core.axisMarkers.Line = function() {
  anychart.core.axisMarkers.Line.base(this, 'constructor');

  this.val = 0;

  this.addThemes('defaultLineMarkerSettings');


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

  var valueBeforeInvalidationHook = function() {
    this.invalidate(anychart.ConsistencyState.BOUNDS, this.getValueChangeSignals());
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['value', 0, 0, 0, valueBeforeInvalidationHook]
  ]);
};
goog.inherits(anychart.core.axisMarkers.Line, anychart.core.axisMarkers.PathBase);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.axisMarkers.Line.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'value', anychart.core.settings.asIsNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.axisMarkers.Line, anychart.core.axisMarkers.Line.PROPERTY_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.Line.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.Line.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set line marker layout.
 * @param {anychart.enums.Layout=} opt_value - LineMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.Line} - Layout or this.
 */
anychart.core.axisMarkers.Line.prototype.layout = function(opt_value) {
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
anychart.core.axisMarkers.Line.prototype.setDefaultLayout = function(value) {
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
 * @return {anychart.scales.Base|!anychart.core.axisMarkers.Line} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Line.prototype.scale = function(opt_value) {
  return /** @type {anychart.scales.Base|!anychart.core.axisMarkers.Line} */ (this.scaleInternal(opt_value));
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Line.prototype.boundsInvalidated = function() {
  this.drawLine();
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Line.prototype.appearanceInvalidated = function() {
  this.markerElement().stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.Line.prototype.disposeInternal = function() {
  this.setOption('stroke', null);
  anychart.core.axisMarkers.Line.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.axisMarkers.Line.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.Line.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.axisMarkers.Line.PROPERTY_DESCRIPTORS, json);
  if (this.layout_) json['layout'] = this.layout_;
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Line.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.Line.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.axisMarkers.Line.PROPERTY_DESCRIPTORS, config);
};



//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.core.axisMarkers.Line}
 */
anychart.standalones.axisMarkers.Line = function() {
  anychart.standalones.axisMarkers.Line.base(this, 'constructor');

  this.addThemes('standalones.lineAxisMarker');
};
goog.inherits(anychart.standalones.axisMarkers.Line, anychart.core.axisMarkers.Line);
anychart.core.makeStandalone(anychart.standalones.axisMarkers.Line, anychart.core.axisMarkers.Line);


/**
 * Constructor function.
 * @return {!anychart.standalones.axisMarkers.Line}
 */
anychart.standalones.axisMarkers.line = function() {
  return new anychart.standalones.axisMarkers.Line();
};


//endregion
//exports
(function() {
  var proto = anychart.core.axisMarkers.Line.prototype;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
  proto['layout'] = proto.layout;
  // auto generated
  //proto['stroke'] = proto.stroke;
  //proto['value'] = proto.value;
  proto['isHorizontal'] = proto.isHorizontal;

  proto = anychart.standalones.axisMarkers.Line.prototype;
  goog.exportSymbol('anychart.standalones.axisMarkers.line', anychart.standalones.axisMarkers.line);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
