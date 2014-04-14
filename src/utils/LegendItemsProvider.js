goog.provide('anychart.utils.LegendItemsProvider');
goog.require('goog.Disposable');



/**
 * Default legend items provider interface.
 * @constructor
 * @param {Array} data Data array.
 * @extends {goog.Disposable}
 */
anychart.utils.LegendItemsProvider = function(data) {
  goog.base(this);
  this.dataArray_ = goog.isDef(data) ? data : [];
  this.palette_ = new anychart.utils.DistinctColorPalette();
  this.registerDisposable(this.palette_);
};
goog.inherits(anychart.utils.LegendItemsProvider, goog.Disposable);


/**
 * Returns original array of data.
 * @return {Array} Array of data passed to provider.
 */
anychart.utils.LegendItemsProvider.prototype.getData = function() {
  return this.dataArray_;
};


/**
 * Gets item icon fill.
 * @param {number} index Legend item index.
 * @return {acgraph.vector.Fill} Fill of an icon.
 */
anychart.utils.LegendItemsProvider.prototype.getItemIconColor = function(index) {
  if (this.dataArray_[index] && this.dataArray_[index]['iconColor']) {
    return /** @type {acgraph.vector.Fill} */ (this.dataArray_[index]['iconColor']);
  }
  return /** @type {acgraph.vector.Fill} */ (this.palette_.colorAt(index));
};


/**
 * Gets item text.
 * @param {number} index Legend item text.
 * @return {string} Text of an item.
 */
anychart.utils.LegendItemsProvider.prototype.getItemText = function(index) {
  if (this.dataArray_[index] && this.dataArray_[index]['text']) {
    return this.dataArray_[index]['text'];
  } else if (goog.isObject(this.dataArray_[index])) {
    return 'Item';
  }
  if (this.dataArray_[index] === undefined) {
    return 'undefined';
  } else if (this.dataArray_[index] === null) {
    return 'null';
  } else if (this.dataArray_[index].toString) {
    return this.dataArray_[index].toString();
  } else {
    return (typeof this.dataArray_[index]);
  }
};


/**
 * Gets object representing legend item.
 * @param {number} index Index of legend item.
 * @return {*} Object representing legend item.
 */
anychart.utils.LegendItemsProvider.prototype.getItem = function(index) {
  return this.dataArray_[index];
};


/**
 * Gets legend items count.
 * @return {number} Count of legend items.
 */
anychart.utils.LegendItemsProvider.prototype.getItemsCount = function() {
  return this.dataArray_.length;
};
