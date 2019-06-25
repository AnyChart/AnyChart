goog.provide('anychart.ganttModule.axisMarkers.Line');

goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.axisMarkers.PathBase');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');



/**
 * Gantt chart line marker.
 * @param {anychart.scales.GanttDateTime} scale - Gantt date times cale.
 * @constructor
 * @extends {anychart.core.axisMarkers.PathBase}
 */
anychart.ganttModule.axisMarkers.Line = function(scale) {
  anychart.ganttModule.axisMarkers.Line.base(this, 'constructor');
  this.addThemes('defaultLineMarkerSettings');

  this.scaleInternal(scale);

  /*
     This is pretty hacky for gantt timeline (DVF-4087).
     Fixes multiple similar signals dispatching on timeline zoom.
     The problem is:
     - chart.zoomTo() invalidates scale.
     - scale dispatches 'i_am_changed' signal.
     - each markers hears it and dispatches 'needs_redraw' signal.
     - chart redraws timeline as many times as markers signals received.

     Timeline controls markers redraw itself instead.
   */
  scale.unlistenSignals(this.scaleInvalidated, this);

  var valueBeforeInvalidationHook = function() {
    this.invalidate(anychart.ConsistencyState.BOUNDS, this.getValueChangeSignals());
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['value', 0, 0, 0, valueBeforeInvalidationHook]
  ]);
};
goog.inherits(anychart.ganttModule.axisMarkers.Line, anychart.core.axisMarkers.PathBase);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.axisMarkers.Line.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'value', anychart.core.settings.asIsNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.axisMarkers.Line, anychart.ganttModule.axisMarkers.Line.PROPERTY_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Line.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Line.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for scale.
 * @param {anychart.scales.GanttDateTime=} opt_value Scale.
 * @return {anychart.scales.GanttDateTime|!anychart.ganttModule.axisMarkers.Line} - Scale or itself for method chaining.
 */
anychart.ganttModule.axisMarkers.Line.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_SCALE);
    return this;
  }
  return /** @type {anychart.scales.GanttDateTime} */ (this.scaleInternal());
};


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Line.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == anychart.enums.Layout.HORIZONTAL)
      anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_LAYOUT);
    return this;
  }
  return /** @type {anychart.enums.Layout} */ (anychart.enums.Layout.VERTICAL);
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Line.prototype.boundsInvalidated = function() {
  this.drawLine();
};


/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Line.prototype.appearanceInvalidated = function() {
  this.markerElement().stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.ganttModule.axisMarkers.Line.prototype.disposeInternal = function() {
  this.setOption('stroke', null);
  anychart.ganttModule.axisMarkers.Line.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Line.prototype.serialize = function() {
  var json = anychart.ganttModule.axisMarkers.Line.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.axisMarkers.Line.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Line.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.axisMarkers.Line.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.axisMarkers.Line.PROPERTY_DESCRIPTORS, config);
};


//exports
(function() {
  var proto = anychart.ganttModule.axisMarkers.Line.prototype;
  // auto generated
  //proto['value'] = proto.value;
  //proto['stroke'] = proto.stroke;
  proto['scale'] = proto.scale;
  proto['layout'] = proto.layout;
  proto['isHorizontal'] = proto.isHorizontal;
})();
