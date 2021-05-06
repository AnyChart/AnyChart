goog.provide('anychart.calendarModule.DataView');
goog.require('anychart.data.View');
goog.require('anychart.format');


/**
 * Class representing calendar view.
 *
 * @constructor
 * @param {!anychart.data.IView} parentView
 * @extends {anychart.data.View}
 */
anychart.calendarModule.DataView = function(parentView) {
  anychart.calendarModule.DataView.base(this, 'constructor', parentView);
};
goog.inherits(anychart.calendarModule.DataView, anychart.data.View);


/** @inheritDoc */
anychart.calendarModule.DataView.prototype.buildMask = function() {
  var mask = [];

  var x;
  var parsedX;
  var value;

  /**
   * @type {anychart.data.Iterator}
   */
  var iterator = (/** @type {anychart.data.View} */ (this.parentView)).getIterator();
  while (iterator.advance()) {
    x = iterator.get('x');
    value = Number(iterator.get('value'));

    parsedX = anychart.format.parseDateTime(x);
    if (goog.isDefAndNotNull(parsedX) && !isNaN(value)) {
      var index = iterator.getIndex();
      mask.push({value: +parsedX, index: index});
    }
  }

  mask.sort(function(v1, v2) {
    return v1.value - v2.value;
  });

  for (var i = mask.length; i--;)
    mask[i] = mask[i].index;

  return mask;
};
