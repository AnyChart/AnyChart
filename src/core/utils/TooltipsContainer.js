goog.provide('anychart.core.utils.TooltipsContainer');
goog.require('acgraph');
goog.require('anychart.core.ui.TooltipItem');
goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.userAgent');



/**
 * Top-level container has the same size as the document.
 * It should not block any events on a page.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.utils.TooltipsContainer = function() {
  goog.base(this);
  var document = goog.dom.getDocument();
  if (goog.userAgent.IE && (!goog.userAgent.isVersionOrHigher('7') || document.documentMode && document.documentMode <= 6)) {
    this.root_ = goog.dom.createDom('div', {'style': 'position:absolute; left:0; top:0; z-index: 9999;'});
  } else {
    this.root_ = goog.dom.createDom('div', {'style': 'position:absolute; z-index: 9999; left: -10000px; top: -10000px'});
  }
  var aw = goog.dom.getWindow().screen.availWidth;
  var ah = goog.dom.getWindow().screen.availHeight;

  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')) {
    this.stage_ = acgraph.create(this.root_, 1, 1);
  } else {
    this.stage_ = acgraph.create(this.root_, aw, ah);
  }
  this.children_ = [];
  this.stage_.domElement()['style']['cssText'] = 'position:fixed; left:0; top:0; opacity:1; pointer-events: none';
  // do not wrap TooltipsContainer stage into relative div
  // DVF-791
  this.stage_.wrapped_ = true;
  goog.dom.appendChild(goog.dom.getDocument().body, this.root_);
};
goog.inherits(anychart.core.utils.TooltipsContainer, goog.Disposable);
goog.addSingletonGetter(anychart.core.utils.TooltipsContainer);


/**
 * @type {Element}
 * @private
 */
anychart.core.utils.TooltipsContainer.prototype.root_ = null;


/**
 * @type {acgraph.vector.Stage}
 * @private
 */
anychart.core.utils.TooltipsContainer.prototype.stage_ = null;


/**
 * @type {Array.<anychart.core.ui.TooltipItem>}
 * @private
 */
anychart.core.utils.TooltipsContainer.prototype.children_ = null;


/**
 * Create and return new tooltip item.
 * @return {anychart.core.ui.TooltipItem} New tooltip item.
 */
anychart.core.utils.TooltipsContainer.prototype.alloc = function() {
  var item = new anychart.core.ui.TooltipItem();
  item.container(this.stage_);
  this.children_.push(item);
  return item;
};


/**
 * Release passed tooltip item
 * @param {anychart.core.ui.TooltipItem} item Tooltip item to release.
 */
anychart.core.utils.TooltipsContainer.prototype.release = function(item) {
  if (item) {
    var index = goog.array.indexOf(this.children_, item);
    if (index >= 0) {
      item.dispose();
      goog.array.splice(this.children_, index, 1);
    }
  }
};


/**
 * Clear all elements from TooltipsContainer (dispose them).
 */
anychart.core.utils.TooltipsContainer.prototype.clear = function() {
  for (var i = 0, count = this.children_.length; i < count; i++) {
    this.children_[i].dispose();
  }
  this.children_ = [];
};


/** @inheritDoc */
anychart.core.utils.TooltipsContainer.prototype.disposeInternal = function() {
  this.stage_.dispose();
  this.stage_ = null;
  //we don't need to iterate  children and dispose them, it is done by this.stage_.dispose() call
  this.children_ = null;
  goog.dom.removeNode(this.root_);
  this.root_ = null;
};


