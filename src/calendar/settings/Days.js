goog.provide('anychart.calendarModule.settings.Days');
goog.require('anychart.calendarModule.settings.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');


/**
 * Class represents days settings.
 *
 * @extends {anychart.calendarModule.settings.Base}
 * @constructor
 */
anychart.calendarModule.settings.Days = function() {
  anychart.calendarModule.settings.Days.base(this, 'constructor');

  /**
   * Labels settings.
   * @type {anychart.core.ui.LabelsSettings}
   * @private
   */
  this.labels_ = null;

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW]
  ]);

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, 0],
    ['stroke', 0, 0],
    ['hatchFill', 0, 0]
  ]);

  // todo(anton.kagakin)
  // override fill, stroke, hatchFill to be simple normalized, no need functions here
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['spacing', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED],
    ['noDataFill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['noDataStroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['noDataHatchFill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);
};
goog.inherits(anychart.calendarModule.settings.Days, anychart.calendarModule.settings.Base);
anychart.core.settings.populateAliases(anychart.calendarModule.settings.Days, ['fill', 'stroke', 'hatchFill'], 'normal');


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.calendarModule.settings.Days.prototype.SUPPORTED_SIGNALS =
  anychart.calendarModule.settings.Base.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.BOUNDS_CHANGED |
  anychart.Signal.NEEDS_REDRAW_APPEARANCE;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.calendarModule.settings.Days.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'spacing', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'noDataFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'noDataStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'noDataHatchFill', anychart.core.settings.hatchFillNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.calendarModule.settings.Days, anychart.calendarModule.settings.Days.PROPERTY_DESCRIPTORS);


/**
 * Setup state settings for days settings.
 */
anychart.calendarModule.settings.Days.prototype.setupStateSettings = function() {
  // this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setupInternal(true, {});

  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setupInternal(true, {});

  this.setupCreated('selected', this.selected_);
  this.selected_.setupInternal(true, {});
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.calendarModule.settings.Days}
 */
anychart.calendarModule.settings.Days.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.calendarModule.settings.Days}
 */
anychart.calendarModule.settings.Days.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.calendarModule.settings.Days}
 */
anychart.calendarModule.settings.Days.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//exports
(function() {
  var proto = anychart.calendarModule.settings.Days.prototype;
  // common
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;

  // auto generated
  // proto['spacing'] = proto.spacing;
  // proto['noDataFill'] = proto.noDataFill;
  // proto['noDataStroke'] = proto.noDataStroke;
  // proto['noDataHatchFill'] = proto.noDataHatchFill;
})();
