goog.provide('anychart.cartesian.series.Column');

goog.require('anychart.cartesian.series.WidthBased');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.WidthBased}
 */
anychart.cartesian.series.Column = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value', 'value'];
  this.referenceValueMeanings = ['x', 'z', 'y'];
  this.referenceValuesSupportStack = true;
};
goog.inherits(anychart.cartesian.series.Column, anychart.cartesian.series.WidthBased);
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.COLUMN] = anychart.cartesian.series.Column;


/** @inheritDoc */
anychart.cartesian.series.Column.prototype.drawSubsequentPoint = function() {
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

    rect.setX(x - barWidth / 2).setY(Math.min(zero, y)).setWidth(barWidth).setHeight(Math.abs(zero - y));

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


/**
 * @inheritDoc
 */
anychart.cartesian.series.Column.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = anychart.cartesian.series.Type.COLUMN;
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Column.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.Column}
 */
anychart.cartesian.series.column = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.Column(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.column', anychart.cartesian.series.column);
anychart.cartesian.series.Column.prototype['fill'] = anychart.cartesian.series.Column.prototype.fill;
anychart.cartesian.series.Column.prototype['hoverFill'] = anychart.cartesian.series.Column.prototype.hoverFill;
anychart.cartesian.series.Column.prototype['stroke'] = anychart.cartesian.series.Column.prototype.stroke;
anychart.cartesian.series.Column.prototype['hoverStroke'] = anychart.cartesian.series.Column.prototype.hoverStroke;
anychart.cartesian.series.Column.prototype['hatchFill'] = anychart.cartesian.series.Column.prototype.hatchFill;
anychart.cartesian.series.Column.prototype['hoverHatchFill'] = anychart.cartesian.series.Column.prototype.hoverHatchFill;
