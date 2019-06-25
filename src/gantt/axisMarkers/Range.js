goog.provide('anychart.ganttModule.axisMarkers.Range');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.axisMarkers.PathBase');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');



/**
 * Gantt range marker.
 * @param {anychart.scales.GanttDateTime} scale - Gantt date times cale.
 * @constructor
 * @extends {anychart.core.axisMarkers.PathBase}
 */
anychart.ganttModule.axisMarkers.Range = function(scale) {
  anychart.ganttModule.axisMarkers.Range.base(this, 'constructor');

  this.addThemes('defaultRangeMarkerSettings');

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

  /**
   * @type {anychart.core.axisMarkers.PathBase.Range}
   */
  this.val = {from: 0, to: 0};

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['from', anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['to', anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.ganttModule.axisMarkers.Range, anychart.core.axisMarkers.PathBase);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.axisMarkers.Range.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'from', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'to', anychart.core.settings.asIsNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.axisMarkers.Range, anychart.ganttModule.axisMarkers.Range.PROPERTY_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//  Events
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Range.prototype.getFormattedValue = function() {
  return 'From: ' + this.getOption('from') + ' to: ' + this.getOption('to');
};


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Range.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Range.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Range.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == anychart.enums.Layout.HORIZONTAL)
      anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_LAYOUT);
    return this;
  }
  return /** @type {anychart.enums.Layout} */ (anychart.enums.Layout.VERTICAL);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for scale.
 * @param {anychart.scales.GanttDateTime=} opt_value Scale.
 * @return {anychart.scales.GanttDateTime|!anychart.ganttModule.axisMarkers.Range} - Scale or itself for method chaining.
 */
anychart.ganttModule.axisMarkers.Range.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_SCALE);
    return this;
  }
  return /** @type {anychart.scales.GanttDateTime} */ (this.scaleInternal());
};


/**
 * Deos nothing.
 * @param {acgraph.vector.Fill} value - Default fill value.
 */
anychart.ganttModule.axisMarkers.Range.prototype.setDefaultFill = function(value) {};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Range.prototype.boundsInvalidated = function() {
  this.drawRange();
};


/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Range.prototype.appearanceInvalidated = function() {
  this.markerElement().stroke(null).fill(/** @type {acgraph.vector.Fill} */(this.getOption('fill')));
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.ganttModule.axisMarkers.Range.prototype.disposeInternal = function() {
  this.setOption('fill', null);
  anychart.ganttModule.axisMarkers.Range.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Range.prototype.serialize = function() {
  var json = anychart.ganttModule.axisMarkers.Range.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.axisMarkers.Range.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Range.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.axisMarkers.Range.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.axisMarkers.Range.PROPERTY_DESCRIPTORS, config, opt_default);
};


//exports
(function() {
  var proto = anychart.ganttModule.axisMarkers.Range.prototype;
  // auto generated
  //proto['from'] = proto.from;
  //proto['to'] = proto.to;
  //proto['fill'] = proto.fill;
  proto['scale'] = proto.scale;
  proto['layout'] = proto.layout;
  proto['isHorizontal'] = proto.isHorizontal;
})();
