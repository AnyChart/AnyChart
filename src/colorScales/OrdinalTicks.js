goog.provide('anychart.colorScalesModule.OrdinalTicks');

goog.require('anychart.scales.OrdinalTicks');



/**
 * Scale ticks settings.
 * @param {!anychart.colorScalesModule.Ordinal} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.scales.OrdinalTicks}
 */
anychart.colorScalesModule.OrdinalTicks = function(scale) {
  anychart.colorScalesModule.OrdinalTicks.base(this, 'constructor', scale);
};
goog.inherits(anychart.colorScalesModule.OrdinalTicks, anychart.scales.OrdinalTicks);


/** @inheritDoc */
anychart.colorScalesModule.OrdinalTicks.prototype.calcAutoTicks = function() {
  var res = [];
  var ranges = this.scale.ranges();
  if (!ranges.length)
    ranges = this.scale.getProcessedRanges();
  if (ranges) {
    var interval;
    var len = ranges.length;
    if (isNaN(this.interval())) {
      interval = Math.ceil(len / this.maxCount()) || 1;
    } else {
      interval = this.interval();
    }
    for (var i = 0; i < len; i += interval) {
      res.push(i);
    }
  }
  return res;
};


/** @inheritDoc */
anychart.colorScalesModule.OrdinalTicks.prototype.makeValues = function(indexes) {
  var len = indexes.length || 0;
  var values = this.scale.getProcessedRanges();
  var valuesLen = values.length;
  if (!len || !valuesLen) return [];
  var result = [], last = false;
  for (var i = 0; i < len && !last; i++) {
    var curr = indexes[i];
    var next = indexes[i + 1];
    if (isNaN(next) || next >= valuesLen) {
      next = valuesLen - 1;
      last = true;
    } else {
      next--;
    }

    var currValue = goog.isDef(values[curr].equal) ? values[curr].equal : (values[curr].start + values[curr].end) / 2;
    var nextValue = goog.isDef(values[next].equal) ? values[next].equal : (values[next].start + values[next].end) / 2;

    result.push(curr == next ? currValue : [currValue, nextValue]);
  }
  return result;
};
