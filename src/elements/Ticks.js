goog.provide('anychart.elements.Ticks');

goog.require('anychart.utils');
goog.require('anychart.utils.Invalidatable');



/**
 * Axis ticks.
 * @constructor
 * @extends {anychart.utils.Invalidatable}
 */
anychart.elements.Ticks = function() {
  goog.base(this);

  /**
   * Ticks length.
   * @type {number}
   * @private
   */
  this.length_;

  /**
   * Ticks stroke.
   * @type {acgraph.vector.Stroke|string}
   * @private
   */
  this.stroke_;

  /**
   * Ticks position.
   * @type {anychart.elements.Ticks.Position|string}
   * @private
   */
  this.position_;
  this.restoreDefaults();
};
goog.inherits(anychart.elements.Ticks, anychart.utils.Invalidatable);


//----------------------------------------------------------------------------------------------------------------------
//
//  Enums.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @enum {string}
 */
anychart.elements.Ticks.Position = {
  INSIDE: 'inside',
  OUTSIDE: 'outside'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets ticks length.
 * @param {number=} opt_value Length to set.
 * @return {(number|!anychart.elements.Ticks)} Length, or itself for chaining.
 */
anychart.elements.Ticks.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.length_ = opt_value;
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.BOUNDS);
    return this;
  } else
    return this.length_;
};


/**
 * Gets or sets ticks stroke.
 * @param {(acgraph.vector.Stroke|string)=} opt_value Stroke to set.
 * @return {(string|acgraph.vector.Stroke|!anychart.elements.Ticks)} Stroke, or itself for chaining.
 */
anychart.elements.Ticks.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.stroke_ = opt_value;
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.APPEARANCE);
    return this;
  } else
    return this.stroke_;
};


/**
 * Gets or sets ticks position.
 * @param {(anychart.elements.Ticks.Position|string)=} opt_value Position to set.
 * @return {(anychart.elements.Ticks.Position|string|!anychart.elements.Ticks)} Position, or itself for chaining.
 */
anychart.elements.Ticks.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.position_ = opt_value.toLowerCase();
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.BOUNDS);
    return this;
  } else
    return this.position_;
};


/**
 * Restore labels default settings.
 */
anychart.elements.Ticks.prototype.restoreDefaults = function() {
  this.position_ = anychart.elements.Ticks.Position.OUTSIDE;
  this.stroke_ = 'black';
  this.length_ = 5;
};


/**
 * Copies labels settings from the passed labels instance to itself.
 * @param {anychart.elements.Ticks} ticks Ticks to copy settings from.
 * @return {!anychart.elements.Ticks} Returns itself for chaining.
 */
anychart.elements.Ticks.prototype.clonFrom = function(ticks) {
  if (goog.isDefAndNotNull(ticks)) {
    this.length(ticks.length_);
    this.position(ticks.position_);
    this.stroke(ticks.stroke_);
  } else {
    this.restoreDefaults();
  }
  return this;
};
