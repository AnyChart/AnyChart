goog.provide('anychart.core.utils.TypedLayer');
goog.require('acgraph.vector.Layer');



/**
 * @param {function():!acgraph.vector.Element} constructChild .
 * @param {function(!acgraph.vector.Element)=} opt_cleanChild .
 * @param {!acgraph.vector.Layer=} opt_layer .
 * @param {*=} opt_context .
 * @constructor
 * @extends {acgraph.vector.Layer}
 */
anychart.core.utils.TypedLayer = function(constructChild, opt_cleanChild, opt_layer, opt_context) {
  anychart.core.utils.TypedLayer.base(this, 'constructor');

  /**
   * @return {!acgraph.vector.Element} .
   * @private
   * @this {*}
   */
  this.constructChild_ = constructChild;

  /**
   * @param {!acgraph.vector.Element} element .
   * @private
   * @this {*}
   */
  this.cleanChild_ = opt_cleanChild || goog.nullFunction;

  /**
   * @type {*}
   * @private
   */
  this.context_ = goog.isDef(opt_context) ? opt_context : this;

  /**
   * @type {Array.<acgraph.vector.Element>}
   * @private
   */
  this.childrenPool_ = [];
};
goog.inherits(anychart.core.utils.TypedLayer, acgraph.vector.Layer);


/**
 * @return {anychart.core.utils.TypedLayer} .
 */
anychart.core.utils.TypedLayer.prototype.clear = function() {
  var len;
  while (len = this.numChildren()) {
    this.childrenPool_.push(this.removeChildAt(len - 1));
  }
  return this;
};


/**
 * @return {!acgraph.vector.Element} .
 */
anychart.core.utils.TypedLayer.prototype.genNextChild = function() {
  var child = this.childrenPool_.pop();
  if (child)
    this.cleanChild_.call(this.context_, child);
  else
    child = this.constructChild_.call(this.context_);
  this.addChild(child);
  return child;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.utils.TypedLayer.prototype.disposeInternal = function() {
  for (var i = this.childrenPool_.length; i--; )
    goog.dispose(this.childrenPool_[i]);
  this.childrenPool_ = null;
  delete this.constructChild_;
  delete this.cleanChild_;
  this.context_ = null;

  anychart.core.utils.TypedLayer.base(this, 'disposeInternal');
};
