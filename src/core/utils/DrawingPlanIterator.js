goog.provide('anychart.core.utils.DrawingPlanIterator');
goog.require('anychart.data.Iterator');



/**
 *
 * @param {Object} drawingPlan
 * @param {!anychart.data.View} view The view to iterate through.
 * @constructor
 * @extends {anychart.data.Iterator}
 */
anychart.core.utils.DrawingPlanIterator = function(drawingPlan, view) {
  anychart.core.utils.DrawingPlanIterator.base(this, 'constructor', view);

  /**
   * Data to be drawn.
   * @type {Array.<*>}
   * @private
   */
  this.drawingData_ = drawingPlan.data;
};
goog.inherits(anychart.core.utils.DrawingPlanIterator, anychart.data.Iterator);


/** @inheritDoc */
anychart.core.utils.DrawingPlanIterator.prototype.advance = function() {
  this.currentIndex++;
  this.currentPoint_ = this.drawingData_[this.currentIndex];
  this.currentRow = undefined;
  return this.currentIndex < this.drawingData_.length;
};


/**
 * Returns raw data index for the current row.
 * @return {number}
 */
anychart.core.utils.DrawingPlanIterator.prototype.getRawDataIndex = function() {
  return this.currentPoint_ ? this.currentPoint_['rawIndex'] : NaN;
};


/** @inheritDoc */
anychart.core.utils.DrawingPlanIterator.prototype.get = function(fieldName) {
  var res = undefined;
  if (this.currentPoint_) {
    if (fieldName in this.currentPoint_) {
      res = this.currentPoint_[fieldName];
    } else {
      //anychart.core.utils.DrawingPlanIterator.misses[fieldName] = true;
      var rawIndex = this.currentPoint_['rawIndex'];
      if (!this.currentRow) {
        if (goog.isDef(rawIndex))
          this.currentRow = this.view.row(rawIndex);
        else
          return res;//undefined
      }
      res = this.view.getRowMapping(rawIndex).getInternal(this.currentRow, rawIndex, fieldName);
    }
  }
  return res;
};


/** @inheritDoc */
anychart.core.utils.DrawingPlanIterator.prototype.getRowsCount = function() {
  return this.drawingData_.length;
};


/** @inheritDoc */
anychart.core.utils.DrawingPlanIterator.prototype.meta = function(name, opt_value) {
  var isSetter = arguments.length > 1;
  if (this.currentPoint_) {
    var meta = this.currentPoint_['meta'];
    if (!meta)
      this.currentPoint_['meta'] = meta = {};
  } else {
    if (isSetter)
      return this;
    else
      return undefined;
  }
  if (isSetter) {
    meta[name] = opt_value;
    return this;
  } else
    return meta[name];
};


//exports
anychart.core.utils.DrawingPlanIterator.prototype['reset'] = anychart.core.utils.DrawingPlanIterator.prototype.reset;//doc|ex
anychart.core.utils.DrawingPlanIterator.prototype['advance'] = anychart.core.utils.DrawingPlanIterator.prototype.advance;//doc|ex
anychart.core.utils.DrawingPlanIterator.prototype['get'] = anychart.core.utils.DrawingPlanIterator.prototype.get;//doc|ex
anychart.core.utils.DrawingPlanIterator.prototype['meta'] = anychart.core.utils.DrawingPlanIterator.prototype.meta;//doc|need-ex
anychart.core.utils.DrawingPlanIterator.prototype['getRowsCount'] = anychart.core.utils.DrawingPlanIterator.prototype.getRowsCount;//doc|ex
