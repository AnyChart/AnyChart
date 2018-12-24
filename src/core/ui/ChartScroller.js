goog.provide('anychart.core.ui.ChartScroller');
goog.require('anychart.core.ui.Scroller');
goog.require('anychart.enums');



/**
 * Chart scroller class that also exposes position method that is used by chart.
 * @constructor
 * @extends {anychart.core.ui.Scroller}
 */
anychart.core.ui.ChartScroller = function() {
  anychart.core.ui.ChartScroller.base(this, 'constructor', true);

  /**
   * Position.
   * @type {anychart.enums.ChartScrollerPosition}
   * @private
   */
  this.position_ = anychart.enums.ChartScrollerPosition.AFTER_AXES;

  anychart.core.settings.createDescriptorMeta(this.descriptorsMeta, 'position',
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
};
goog.inherits(anychart.core.ui.ChartScroller, anychart.core.ui.Scroller);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.ChartScroller.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(map, anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'position', anychart.enums.normalizeChartScrollerPosition);
  return map;
})();
anychart.core.settings.populate(anychart.core.ui.ChartScroller, anychart.core.ui.ChartScroller.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.core.ui.ChartScroller.prototype.serialize = function() {
  var json = anychart.core.ui.ChartScroller.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.ChartScroller.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.ui.ChartScroller.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.ChartScroller.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.ui.ChartScroller.PROPERTY_DESCRIPTORS, config, opt_default);
};


//exports
(function() {
  var proto = anychart.core.ui.ChartScroller.prototype;
  // auto generated
  // proto['position'] = proto.position;
})();
