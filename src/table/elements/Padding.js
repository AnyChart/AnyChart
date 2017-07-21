goog.provide('anychart.tableModule.elements.Padding');



/**
 * Padding settings proxy. Doesn't store anything - just passes settings to and from the parent object.
 * @param {anychart.tableModule.elements.IProxyUser} parent Object to pass settings to.
 * @constructor
 */
anychart.tableModule.elements.Padding = function(parent) {
  /**
   * @type {anychart.tableModule.elements.IProxyUser}
   * @private
   */
  this.parent_ = parent;
};


/**
 * Property names for padding settings.
 * @type {!Array.<string>}
 */
anychart.tableModule.elements.Padding.propNames = ['topPadding', 'rightPadding', 'bottomPadding', 'leftPadding'];


/**
 * Gets or sets top padding. Returns previously set padding, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|!anychart.tableModule.elements.Padding)} Value, or itself for chaining.
 */
anychart.tableModule.elements.Padding.prototype.top = function(opt_value) {
  if (goog.isDef(opt_value))
    opt_value = anychart.utils.toNumberOrString(opt_value) || 0;
  return /** @type {(number|string|undefined|!anychart.tableModule.elements.Padding)} */(this.parent_.settings(
      anychart.tableModule.elements.Padding.propNames[0], opt_value, anychart.ConsistencyState.TABLE_CONTENT));
};


/**
 * Gets or sets right padding. Returns previously set padding, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|!anychart.tableModule.elements.Padding)} Value, or itself for chaining.
 */
anychart.tableModule.elements.Padding.prototype.right = function(opt_value) {
  if (goog.isDef(opt_value))
    opt_value = anychart.utils.toNumberOrString(opt_value) || 0;
  return /** @type {(number|string|undefined|!anychart.tableModule.elements.Padding)} */(this.parent_.settings(
      anychart.tableModule.elements.Padding.propNames[1], opt_value, anychart.ConsistencyState.TABLE_CONTENT));
};


/**
 * Gets or sets bottom padding. Returns previously set padding, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|!anychart.tableModule.elements.Padding)} Value, or itself for chaining.
 */
anychart.tableModule.elements.Padding.prototype.bottom = function(opt_value) {
  if (goog.isDef(opt_value))
    opt_value = anychart.utils.toNumberOrString(opt_value) || 0;
  return /** @type {(number|string|undefined|!anychart.tableModule.elements.Padding)} */(this.parent_.settings(
      anychart.tableModule.elements.Padding.propNames[2], opt_value, anychart.ConsistencyState.TABLE_CONTENT));
};


/**
 * Gets or sets left padding. Returns previously set padding, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|!anychart.tableModule.elements.Padding)} Value, or itself for chaining.
 */
anychart.tableModule.elements.Padding.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value))
    opt_value = anychart.utils.toNumberOrString(opt_value) || 0;
  return /** @type {(number|string|undefined|!anychart.tableModule.elements.Padding)} */(this.parent_.settings(
      anychart.tableModule.elements.Padding.propNames[3], opt_value, anychart.ConsistencyState.TABLE_CONTENT));
};


//exports
(function() {
  var proto = anychart.tableModule.elements.Padding.prototype;
  proto['top'] = proto.top;
  proto['right'] = proto.right;
  proto['bottom'] = proto.bottom;
  proto['left'] = proto.left;
})();
