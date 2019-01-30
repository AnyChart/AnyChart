goog.provide('anychart.core.ui.Text');
goog.require('anychart.math.Rect');



/**
 * @constructor
 */
anychart.core.ui.Text = function() {
  this.renderer = acgraph.getRenderer();
  this.text_ = '';
  this.style_ = {};
  this.baseLine = 0;
};


/**
 * Text.
 * @param {string} value
 */
anychart.core.ui.Text.prototype.text = function(value) {
  this.text_ = value;
};


/**
 * @param {number=} opt_value
 * @return {number|anychart.core.ui.Text}
 */
anychart.core.ui.Text.prototype.width = function(opt_value) {
  return this.bounds ? this.bounds.width : 0;
};


/**
 *
 * @param {number=} opt_value
 * @return {number|anychart.core.ui.Text}
 */
anychart.core.ui.Text.prototype.height = function(opt_value) {
  return this.bounds ? this.bounds.height : 0;
};


/**
 *
 * @param {acgraph.vector.Path=} opt_value .
 * @return {acgraph.vector.Path|anychart.core.ui.Text}
 */
anychart.core.ui.Text.prototype.path = function(opt_value) {
  return null;
};


/**
 * Style object.
 * @param {Object} value
 */
anychart.core.ui.Text.prototype.style = function(value) {
  this.style_ = value;
};


/**
 * Creating DOM element.
 */
anychart.core.ui.Text.prototype.createDom = function() {
  this.domElement = this.renderer.createTextElement();
};


/**
 * Render to container
 * @param {Element} element
 */
anychart.core.ui.Text.prototype.renderTo = function(element) {
  element.appendChild(this.getDomElement());
};


/**
 * Setting position.
 * @param {number} x
 * @param {number} y
 */
anychart.core.ui.Text.prototype.setPosition = function(x, y) {
  var dom = this.getDomElement();

  if (goog.isDef(x) && x != this.x_) {
    this.x_ = x;
    dom.setAttribute('x', this.x_);
  }

  if (goog.isDef(y) && y != this.y_) {
    this.y_ = y;
    dom.setAttribute('y', this.y_ + this.baseLine);
  }
};


/**
 * Returns text DOM element.
 * @return {Element}
 */
anychart.core.ui.Text.prototype.getDomElement = function() {
  if (!this.domElement)
    this.createDom();

  return this.domElement;
};


/**
 * Applying settings.
 */
anychart.core.ui.Text.prototype.applySettings = function() {
  var style = this.style_;
  var dom = this.getDomElement();

  if (!goog.object.isEmpty(style)) {
    style['fontStyle'] ?
      dom.setAttribute('font-style', style['fontStyle']) :
      dom.removeAttribute('font-style');

    style['fontVariant'] ?
      dom.setAttribute('font-variant', style['fontVariant']) :
      dom.removeAttribute('font-variant');

    style['fontFamily'] ?
      dom.setAttribute('font-family', style['fontFamily']) :
      dom.removeAttribute('font-family');

    goog.isDef(style['fontSize']) ?
      dom.setAttribute('font-size', style['fontSize']) :
      dom.removeAttribute('font-size');

    goog.isDef(style['fontWeight']) ?
      dom.setAttribute('font-weight', style['fontWeight']) :
      dom.removeAttribute('font-weight');

    goog.isDef(style['letterSpacing']) ?
      dom.setAttribute('letter-spacing', style['letterSpacing']) :
      dom.removeAttribute('letter-spacing');

    style['fontDecoration'] ?
      dom.setAttribute('text-decoration', style['fontDecoration']) :
      dom.removeAttribute('font-decoration');

    style['fontColor'] ?
      dom.setAttribute('fill', style['fontColor']) :
      dom.removeAttribute('font-color');

    goog.isDef(style['fontOpacity']) ?
      dom.setAttribute('opacity', style['fontOpacity']) :
      dom.removeAttribute('font-opacity');

    style['disablePointerEvents'] ?
      dom.setAttribute('pointer-events', (style['disablePointerEvents'] ? 'none' : '')) :
      dom.removeAttribute('pointer-events');
  }
  dom.textContent = this.text_;
};


/**
 * Getting bounds.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.Text.prototype.getBounds = function() {
  if (!this.bounds) {
    var dom = this.getDomElement();

    //We need bBox without x and y offsets.
    dom.removeAttribute('x');
    dom.removeAttribute('y');

    var bbox = dom['getBBox']();

    this.bounds = new anychart.math.Rect(bbox.x, -bbox.y, bbox.width, bbox.height);
    this.baseLine = -bbox.y;
  }
  return this.bounds;
};


/**
 * Drop bounds.
 */
anychart.core.ui.Text.prototype.dropBounds = function() {
  this.baseLine = 0;
  this.bounds = null;
};
