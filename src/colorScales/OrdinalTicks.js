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
    // exclude the default range from the logic
    var len = ranges.length - 1;
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
  // exclude the default range from the logic
  var valuesLen = values.length - 1;
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

    var currEqual = values[curr].equal;
    // when equal field is boolean then start/end are always number
    if (goog.isBoolean(currEqual)) {
      var currValue = (values[curr].start + values[curr].end) / 2;
      var nextValue = (values[next].start + values[next].end) / 2;
    } else {
      var currValue = currEqual;
      var nextValue = values[next].equal;
    }

    result.push(curr == next ? currValue : [currValue, nextValue]);
  }
  return result;
};
