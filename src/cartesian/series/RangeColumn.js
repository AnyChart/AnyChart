goog.provide('anychart.cartesian.series.RangeColumn');

goog.require('anychart.cartesian.series.WidthBased');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.WidthBased}
 */
anychart.cartesian.series.RangeColumn = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference points for a series
  this.referenceValueNames = ['x', 'low', 'high'];
  this.referenceValueMeanings = ['x', 'y', 'y'];
  this.referenceValuesSupportStack = false;

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.content().useHtml(true);
  tooltip.textFormatter(function() {
    return this['x'] + '<br>low: ' + this['low'] + '<br>high: ' + this['high'];
  });
  tooltip.resumeSignalsDispatching(false);
};
goog.inherits(anychart.cartesian.series.RangeColumn, anychart.cartesian.series.WidthBased);


/** @inheritDoc */
anychart.cartesian.series.RangeColumn.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {

    var x = referenceValues[0];
    var low = referenceValues[1];
    var high = referenceValues[2];

    /** @type {!acgraph.vector.Rect} */
    var rect = /** @type {!acgraph.vector.Rect} */(this.rootElement.genNextChild());
    var barWidth = this.getPointWidth();

    this.getIterator().meta('x', x).meta('low', low).meta('high', high).meta('shape', rect);

    rect.setX(x - barWidth / 2).setY(Math.min(low, high)).setWidth(barWidth).setHeight(Math.abs(low - high));

    this.colorizeShape(false);

    this.makeHoverable(rect);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    var iterator = this.getIterator();
    iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }

    this.applyHatchFill(false);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.RangeColumn.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    return anychart.utils.getCoordinateByAnchor(shapeBounds, position);
  } else {
    return {x: iterator.meta('x'), y: iterator.meta('high')};
  }
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeColumn.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = 'rangecolumn';
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeColumn.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};
