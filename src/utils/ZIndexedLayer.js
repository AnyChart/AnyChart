goog.provide('anychart.utils.ZIndexedLayer');

goog.require('acgraphexport');


//Extending vector.Element to have zIndex property.
/**
 * @param {number=} opt_zIndex .
 * @return {number|acgraph.vector.IElement} .
 */
acgraph.vector.IElement.prototype.zIndex;


/**
 * @param {number=} opt_zIndex .
 * @return {number|acgraph.vector.Element} .
 */
acgraph.vector.Element.prototype.zIndex = function(opt_zIndex) {
  if (goog.isDef(opt_zIndex)) {
    this['zIndex_'] = +opt_zIndex || 0;
    var parent = this.parent();
    if (parent) {
      var reIndexer = parent[anychart.utils.ZIndexedLayer.REINDEXER_PROP];
      if (goog.isFunction(reIndexer))
        reIndexer();
    }
    return this;
  }
  return this['zIndex_'] || 0;
};



/**
 * @param {!acgraph.vector.Layer=} opt_layer .
 * @constructor
 * @implements {acgraph.vector.ILayer}
 * @implements {acgraph.vector.IElement}
 */
anychart.utils.ZIndexedLayer = function(opt_layer) {
  /**
   * @type {!acgraph.vector.Layer}
   * @private
   */
  this.layer_ = opt_layer || new acgraph.vector.Layer();

  /**
   * К сожалению, нам приходится хранить список детей, чтобы поддерживать оригинальный порядок среди элементов
   * с одинаковым zIndex.
   * @type {!Array.<(!acgraph.vector.IElement)>}
   * @private
   */
  this.children_ = [];

  this.layer_[anychart.utils.ZIndexedLayer.REINDEXER_PROP] = goog.bind(anychart.utils.ZIndexedLayer.REINDEXER, this);
};


/**
 * @type {string}
 */
anychart.utils.ZIndexedLayer.REINDEXER_PROP = '__zIndexer';


/**
 * @this {anychart.utils.ZIndexedLayer}
 */
anychart.utils.ZIndexedLayer.REINDEXER = function() {
  // TODO(Anton Saukh): optimize this shit
  this.layer_.removeChildren();
  goog.array.forEach(this.children_, this.addChild_, this);
};


/**
 @param {acgraph.vector.ILayer=} opt_parentElement .
 @return {acgraph.vector.ILayer} .
 */
anychart.utils.ZIndexedLayer.prototype.parent = function(opt_parentElement) {
  var res = /** @type {acgraph.vector.ILayer} */(this.layer_.parent(opt_parentElement));
  if (goog.isDef(opt_parentElement))
    return this;
  return res;
};


/**
 * @return {!acgraph.vector.Layer} .
 */
anychart.utils.ZIndexedLayer.prototype.getUnderlyingLayer = function() {
  return this.layer_;
};


/**
 * Устанавливает родительский элемент для данного.
 * @param {acgraph.vector.ILayer} parent Родительская группа.
 * @return {!anychart.utils.ZIndexedLayer} Возвращает себя для цепочечности.
 */
anychart.utils.ZIndexedLayer.prototype.setParent = function(parent) {
  this.layer_.setParent(parent);
  return this;
};


/**
 * Возвращает DOM элемент, если он определен.
 * @return {Element} DOM элемент.
 */
anychart.utils.ZIndexedLayer.prototype.domElement = function() {
  return this.layer_.domElement();
};


/**
 * @param {boolean} doCry True, if the element should tell the prev parent to seek and remove itself from DOM cache.
 * @return {!anychart.utils.ZIndexedLayer} .
 */
anychart.utils.ZIndexedLayer.prototype.notifyPrevParent = function(doCry) {
  this.layer_.notifyPrevParent(doCry);
  return this;
};


/**
 * @return {!anychart.utils.ZIndexedLayer} .
 */
anychart.utils.ZIndexedLayer.prototype.remove = function() {
  this.layer_.remove();
  return this;
};


/**
 * @return {!anychart.utils.ZIndexedLayer} .
 */
anychart.utils.ZIndexedLayer.prototype.render = function() {
  this.layer_.render();
  return this;
};


/**
 * @return {boolean} .
 */
anychart.utils.ZIndexedLayer.prototype.isDirty = function() {
  return this.layer_.isDirty();
};


/**
 * @param {!acgraph.vector.IElement} child .
 * @return {!anychart.utils.ZIndexedLayer} .
 */
anychart.utils.ZIndexedLayer.prototype.addChild = function(child) {
  this.children_.push(child);
  this.addChild_(child);
  return this;
};


/**
 * @param {acgraph.vector.IElement} child .
 */
anychart.utils.ZIndexedLayer.prototype.notifyRemoved = function(child) {
  this.layer_.notifyRemoved(child);
};


/**
 * @return {acgraph.vector.Stage} .
 */
anychart.utils.ZIndexedLayer.prototype.getStage = function() {
  return this.layer_.getStage();
};


/**
 * @return {anychart.utils.ZIndexedLayer} .
 */
anychart.utils.ZIndexedLayer.prototype.removeChildren = function() {
  this.layer_.removeChildren();
  return this;
};


/**
 * Удаляет дочерний элемент из группы. Реальный эффект на DOM структуру происходит при вызове
 * функции render().
 * @param {acgraph.vector.IElement} element Элемент, который нужно удалить.
 * @return {acgraph.vector.IElement} Элемент, который был удален.
 *
 */
anychart.utils.ZIndexedLayer.prototype.removeChild = function(element) {
  var res = this.layer_.removeChild(element);
  var index = goog.array.indexOf(this.children_, res);
  if (index >= 0)
    goog.array.splice(this.children_, index, 1);
  return res;
};


/**
 * @param {!acgraph.vector.IElement} child .
 * @private
 */
anychart.utils.ZIndexedLayer.prototype.addChild_ = function(child) {
  if (child instanceof anychart.utils.ZIndexedLayer)
    child = (/** @type {anychart.utils.ZIndexedLayer} */(child)).getUnderlyingLayer();
  child.remove();
  var zIndex = child.zIndex();
  for (var i = this.layer_.numChildren(); i--;) {
    if (this.layer_.getChildAt(i).zIndex() <= zIndex) {
      this.layer_.addChildAt(child, i + 1);
      return;
    }
  }
  this.layer_.addChildAt(child, 0);
};


/**
 * @param {number=} opt_zIndex .
 * @return {number|anychart.utils.ZIndexedLayer} .
 */
anychart.utils.ZIndexedLayer.prototype.zIndex = function(opt_zIndex) {
  if (goog.isDef(opt_zIndex)) {
    this.layer_.zIndex(opt_zIndex);
    return this;
  }
  return /** @type {number} */ (this.layer_.zIndex());
};
