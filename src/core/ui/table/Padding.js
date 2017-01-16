goog.provide('anychart.core.ui.table.Padding');



/**
 * Padding settings proxy. Doesn't store anything - just passes settings to and from the parent object.
 * @param {anychart.core.ui.table.IProxyUser} parent Object to pass settings to.
 * @constructor
 */
anychart.core.ui.table.Padding = function(parent) {
  /**
   * @type {anychart.core.ui.table.IProxyUser}
   * @private
   */
  this.parent_ = parent;
};


/**
 * Property names for padding settings.
 * @type {!Array.<string>}
 */
anychart.core.ui.table.Padding.propNames = ['topPadding', 'rightPadding', 'bottomPadding', 'leftPadding'];


/**
 * Gets or sets top padding. Returns previously set padding, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|!anychart.core.ui.table.Padding)} Value, or itself for chaining.
 */
anychart.core.ui.table.Padding.prototype.top = function(opt_value) {
  if (goog.isDef(opt_value))
    opt_value = anychart.utils.toNumberOrString(opt_value) || 0;
  return /** @type {(number|string|undefined|!anychart.core.ui.table.Padding)} */(this.parent_.settings(
      anychart.core.ui.table.Padding.propNames[0], opt_value, anychart.ConsistencyState.TABLE_CONTENT));
};


/**
 * Gets or sets right padding. Returns previously set padding, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|!anychart.core.ui.table.Padding)} Value, or itself for chaining.
 */
anychart.core.ui.table.Padding.prototype.right = function(opt_value) {
  if (goog.isDef(opt_value))
    opt_value = anychart.utils.toNumberOrString(opt_value) || 0;
  return /** @type {(number|string|undefined|!anychart.core.ui.table.Padding)} */(this.parent_.settings(
      anychart.core.ui.table.Padding.propNames[1], opt_value, anychart.ConsistencyState.TABLE_CONTENT));
};


/**
 * Gets or sets bottom padding. Returns previously set padding, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|!anychart.core.ui.table.Padding)} Value, or itself for chaining.
 */
anychart.core.ui.table.Padding.prototype.bottom = function(opt_value) {
  if (goog.isDef(opt_value))
    opt_value = anychart.utils.toNumberOrString(opt_value) || 0;
  return /** @type {(number|string|undefined|!anychart.core.ui.table.Padding)} */(this.parent_.settings(
      anychart.core.ui.table.Padding.propNames[2], opt_value, anychart.ConsistencyState.TABLE_CONTENT));
};


/**
 * Gets or sets left padding. Returns previously set padding, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|!anychart.core.ui.table.Padding)} Value, or itself for chaining.
 */
anychart.core.ui.table.Padding.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value))
    opt_value = anychart.utils.toNumberOrString(opt_value) || 0;
  return /** @type {(number|string|undefined|!anychart.core.ui.table.Padding)} */(this.parent_.settings(
      anychart.core.ui.table.Padding.propNames[3], opt_value, anychart.ConsistencyState.TABLE_CONTENT));
};


//exports
(function() {
  var proto = anychart.core.ui.table.Padding.prototype;
  proto['top'] = proto.top;
  proto['right'] = proto.right;
  proto['bottom'] = proto.bottom;
  proto['left'] = proto.left;
})();
