goog.provide('anychart.cartesian3dModule.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Range');



/**
 * Range marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.Range}
 */
anychart.cartesian3dModule.axisMarkers.Range = function() {
  anychart.cartesian3dModule.axisMarkers.Range.base(this, 'constructor');
};
goog.inherits(anychart.cartesian3dModule.axisMarkers.Range, anychart.core.axisMarkers.Range);


/** @inheritDoc */
anychart.cartesian3dModule.axisMarkers.Range.prototype.boundsInvalidated = function() {
  var layout = this.layout();
  var minValue = this.getOption('from'), maxValue = this.getOption('to');
  if (this.getOption('from') > this.getOption('to')) {
    minValue = this.getOption('to');
    maxValue = this.getOption('from');
  }
  // clamping to prevent range marker go out from the bounds. Ratio should be between 0 and 1.
  var ratioMinValue = goog.math.clamp(this.scale().transform(minValue, 0), 0, 1);
  var ratioMaxValue = goog.math.clamp(this.scale().transform(maxValue, 1), 0, 1);

  if (isNaN(ratioMinValue) || isNaN(ratioMaxValue)) return;

  var bounds = this.parentBounds();
  var axesLinesSpace = this.axesLinesSpace();
  this.markerElement().clear();

  var x3dShift = this.getChart().x3dShift;
  var y3dShift = this.getChart().y3dShift;

  if (layout == anychart.enums.Layout.HORIZONTAL) {
    var y_max = Math.floor(bounds.getBottom() - bounds.height * ratioMaxValue);
    var y_min = Math.ceil(bounds.getBottom() - bounds.height * ratioMinValue);
    var x_start = bounds.getLeft();
    var x_end = bounds.getRight();

    this.markerElement()
        .moveTo(x_start, y_max)
        .lineTo(x_start + x3dShift, y_max - y3dShift)
        .lineTo(x_end + x3dShift, y_max - y3dShift)
        .lineTo(x_end + x3dShift, y_min - y3dShift)
        .lineTo(x_start + x3dShift, y_min - y3dShift)
        .lineTo(x_start, y_min)
        .close();
  } else if (layout == anychart.enums.Layout.VERTICAL) {
    var y_start = bounds.getBottom();
    var y_end = bounds.getTop();
    var x_min = Math.floor(bounds.getLeft() + (bounds.width * ratioMinValue));
    var x_max = Math.ceil(bounds.getLeft() + (bounds.width * ratioMaxValue));

    this.markerElement()
        .moveTo(x_min, y_start)
        .lineTo(x_min + x3dShift, y_start - y3dShift)
        .lineTo(x_min + x3dShift, y_end - y3dShift)
        .lineTo(x_max + x3dShift, y_end - y3dShift)
        .lineTo(x_max + x3dShift, y_start - y3dShift)
        .lineTo(x_max, y_start)
        .close();

  }

  bounds.top -= y3dShift;
  bounds.height += y3dShift;
  bounds.width += x3dShift;

  this.markerElement().clip(axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds)));
};
