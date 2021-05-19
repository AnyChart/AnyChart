goog.provide('anychart.graphModule.elements.arrows.Controller');

goog.require('anychart.core.Base');
goog.require('anychart.graphModule.elements.arrows.Arrow');
goog.require('goog.math.Coordinate');

/**
 * Arrow settings storage.
 *
 * @param {anychart.graphModule.elements.Edge} controller Used to resolve some arrows settings.
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.graphModule.elements.arrows.Controller = function(controller) {
  anychart.graphModule.elements.arrows.Controller.base(this, 'constructor');

  this.edgesController_ = controller;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['size', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['position', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);
};
goog.inherits(anychart.graphModule.elements.arrows.Controller, anychart.core.Base);

anychart.graphModule.elements.arrows.Controller.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW_APPEARANCE;

anychart.graphModule.elements.arrows.Controller.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.utils.normalizeToRatio]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.arrows.Controller, anychart.graphModule.elements.arrows.Controller.PROPERTY_DESCRIPTORS);


/**
 * Return arrow instance.
 *
 * @return {anychart.graphModule.elements.arrows.Arrow}
 */
anychart.graphModule.elements.arrows.Controller.prototype.getArrow = function() {
  var arrow = new anychart.graphModule.elements.arrows.Arrow(this);
  arrow.container(this.container());
  return arrow;
};


/**
 * Getter/Setter for arrows container.
 *
 * @param {acgraph.vector.Layer=} opt_container
 * @return {acgraph.vector.Layer}
 */
anychart.graphModule.elements.arrows.Controller.prototype.container = function(opt_container) {
  if (opt_container) {
    this.container_ = opt_container;
  }
  return this.container_;
};


/**
 * Return arrow pointer position.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 *
 * @return {!goog.math.Coordinate}
 */
anychart.graphModule.elements.arrows.Controller.prototype.getArrowPointerPosition = function(arrow) {
  return this.edgesController_.getArrowPointerPosition(arrow);
};


/**
 * Return arrow rotation angle.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 *
 * @return {number}
 */
anychart.graphModule.elements.arrows.Controller.prototype.getArrowRotation = function(arrow) {
  return this.edgesController_.getArrowRotation(arrow);
};


/**
 * Return arrow stroke color.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 * @return {acgraph.vector.Stroke}
 */
anychart.graphModule.elements.arrows.Controller.prototype.getArrowStroke = function(arrow) {
  var dataOption = this.resolveDataOption(arrow, 'stroke');

  return /** @type {acgraph.vector.Stroke} */ (goog.isDef(dataOption) ? dataOption : this.edgesController_.getArrowStroke(arrow));
};


/**
 * Return arrow fill color.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 * @return {acgraph.vector.Fill}
 */
anychart.graphModule.elements.arrows.Controller.prototype.getArrowFill = function(arrow) {
  var dataOption = this.resolveDataOption(arrow, 'fill');

  return /** @type {acgraph.vector.Fill} */ (goog.isDef(dataOption) ? dataOption : this.edgesController_.getArrowFill(arrow));
};


/**
 * Resolve size for passed arrow.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 * @return {number}
 */
anychart.graphModule.elements.arrows.Controller.prototype.getArrowSize = function(arrow) {
  var dataOption = this.resolveDataOption(arrow, 'size');

  return /** @type {number} */ (goog.isDef(dataOption) ? dataOption : this.getOption('size'));
};


/**
 * Resolve arrow enabled state for passed arrow.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 * @return {number}
 */
anychart.graphModule.elements.arrows.Controller.prototype.getArrowEnabledState = function(arrow) {
  var dataOption = this.resolveDataOption(arrow, 'enabled');

  return  /** @type {number} */ (goog.isDef(dataOption) ? dataOption : this.getOption('enabled'));
};


/**
 * Resolve position for passed arrow.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow
 * @return {number}
 */
anychart.graphModule.elements.arrows.Controller.prototype.getArrowPositionRatio = function(arrow) {
  var dataOption = this.resolveDataOption(arrow, 'position');

  return anychart.utils.normalizeToRatio(
    /** @type {number} */ (goog.isDef(dataOption) ? dataOption : this.getOption('position'))
  );
};


/**
 * Resolve data option.
 *
 * @param {anychart.graphModule.elements.arrows.Arrow} arrow Arrow instance.
 * @param {string} option Option name.
 *
 * @return {anychart.graphModule.elements.arrows.Arrow}
 */
anychart.graphModule.elements.arrows.Controller.prototype.resolveDataOption = function(arrow, option) {
  var iterator = this.edgesController_.getIterator();
  iterator.select(arrow.edge().dataRow);

  var arrowSettings = iterator.get('arrow') || {};
  return arrowSettings[option];
};


/** @inheritDoc */
anychart.graphModule.elements.arrows.Controller.prototype.serialize = function() {
  var json = {};
  anychart.core.settings.serialize(this, anychart.graphModule.elements.arrows.Controller.PROPERTY_DESCRIPTORS, json);

  return json;
};


/** @inheritDoc */
anychart.graphModule.elements.arrows.Controller.prototype.setupByJSON = function(json, opt_default) {
  anychart.core.settings.deserialize(this, anychart.graphModule.elements.arrows.Controller.PROPERTY_DESCRIPTORS, json, opt_default);
};
