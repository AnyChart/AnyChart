goog.provide('anychart.utils.TypedLayer');
goog.require('acgraph');



/**
 * @param {function():!acgraph.vector.Element} constructChild .
 * @param {function(!acgraph.vector.Element)=} opt_cleanChild .
 * @param {!acgraph.vector.Layer=} opt_layer .
 * @param {*=} opt_context .
 * @constructor
 * @extends {acgraph.vector.Layer}
 */
anychart.utils.TypedLayer = function(constructChild, opt_cleanChild, opt_layer, opt_context) {
  goog.base(this);

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
goog.inherits(anychart.utils.TypedLayer, acgraph.vector.Layer);


/**
 * @return {anychart.utils.TypedLayer} .
 */
anychart.utils.TypedLayer.prototype.clear = function() {
  this.childrenPool_.push.apply(this.childrenPool_, this.removeChildren());
  return this;
};


/**
 * @return {!acgraph.vector.Element} .
 */
anychart.utils.TypedLayer.prototype.genNextChild = function() {
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
anychart.utils.TypedLayer.prototype.disposeInternal = function() {
  for (var i = this.childrenPool_.length; i--; )
    goog.dispose(this.childrenPool_[i]);
  this.childrenPool_ = null;
  delete this.constructChild_;
  delete this.cleanChild_;
  this.context_ = null;

  goog.base(this, 'disposeInternal');
};
