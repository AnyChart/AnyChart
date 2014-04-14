goog.provide('anychart.cartesian.series.Bar');

goog.require('anychart.cartesian.series.BarBase');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.BarBase}
 */
anychart.cartesian.series.Bar = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Определяем значения опорных полей серии.
  this.referenceValueNames = ['x', 'value', 'value'];
  this.referenceValueMeanings = ['x', 'z', 'y'];
  this.referenceValuesSupportStack = true;
};
goog.inherits(anychart.cartesian.series.Bar, anychart.cartesian.series.BarBase);


/** @inheritDoc */
anychart.cartesian.series.Bar.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    /** @type {!acgraph.vector.Rect} */
    var rect = /** @type {!acgraph.vector.Rect} */(this.rootElement.genNextChild());
    var barWidth = this.getPointWidth();

    this.getIterator().meta('x', x).meta('zero', zero).meta('y', y).meta('shape', rect);

    rect.setY(x - barWidth / 2).setX(Math.min(zero, y)).setHeight(barWidth).setWidth(Math.abs(zero - y));

    this.colorizeShape(false);

    this.makeHoverable(rect);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.Bar.prototype.createPositionProvider = function() {
  var shape = this.getIterator().meta('shape');
  if (shape) {
    var position = anychart.utils.NinePositions.RIGHT_CENTER;
    var shapeBounds = shape.getBounds();
    return anychart.utils.getCoordinateByAnchor(shapeBounds, position);
  } else {
    var iterator = this.getIterator();
    return {x: iterator.meta('x'), y: iterator.meta('y')};
  }
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Bar.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = 'bar';
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Bar.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


