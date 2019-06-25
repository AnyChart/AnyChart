goog.provide('anychart.ganttModule.axisMarkers.Text');
goog.require('anychart.core.axisMarkers.TextBase');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');



/**
 * Gantt range marker.
 * @param {anychart.scales.GanttDateTime} scale - Gantt date times cale.
 * @constructor
 * @extends {anychart.core.axisMarkers.TextBase}
 */
anychart.ganttModule.axisMarkers.Text = function(scale) {
  anychart.ganttModule.axisMarkers.Text.base(this, 'constructor');

  this.addThemes('defaultTextMarkerSettings');

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
    ['value', 0, 0, 0, valueBeforeInvalidationHook]
  ]);

};
goog.inherits(anychart.ganttModule.axisMarkers.Text, anychart.core.axisMarkers.TextBase);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.axisMarkers.Text.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'value', anychart.core.settings.asIsNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.axisMarkers.Text, anychart.ganttModule.axisMarkers.Text.PROPERTY_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Text.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Text.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for scale.
 * @param {anychart.scales.GanttDateTime=} opt_value Scale.
 * @return {anychart.scales.GanttDateTime|!anychart.ganttModule.axisMarkers.Text} - Scale or itself for method chaining.
 */
anychart.ganttModule.axisMarkers.Text.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_SCALE);
    return this;
  }
  return /** @type {anychart.scales.GanttDateTime} */ (this.scaleInternal());
};


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get line marker layout.
 * @param {anychart.enums.Layout=} opt_value - LineMarker layout.
 * @return {anychart.enums.Layout|anychart.ganttModule.axisMarkers.Text} - Layout or this.
 */
anychart.ganttModule.axisMarkers.Text.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == anychart.enums.Layout.HORIZONTAL)
      anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_LAYOUT);
    return this;
  }
  return /** @type {anychart.enums.Layout} */ (anychart.enums.Layout.VERTICAL);
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Text.prototype.serialize = function() {
  var json = anychart.ganttModule.axisMarkers.Text.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.axisMarkers.Text.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Text.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.axisMarkers.Text.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.axisMarkers.Text.PROPERTY_DESCRIPTORS, config, opt_default);
};


//exports
(function() {
  var proto = anychart.ganttModule.axisMarkers.Text.prototype;
  // auto generated
  //proto['value'] = proto.value;
  proto['scale'] = proto.scale;
  proto['layout'] = proto.layout;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['isHorizontal'] = proto.isHorizontal;
})();
