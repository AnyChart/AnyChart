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
};
goog.inherits(anychart.cartesian.series.RangeColumn, anychart.cartesian.series.WidthBased);
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.RANGE_COLUMN] = anychart.cartesian.series.RangeColumn;


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
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('high')}};
  }
};


/** @inheritDoc */
anychart.cartesian.series.RangeColumn.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.content().hAlign('left');
  tooltip.contentFormatter(function() {
    return 'High: ' + parseFloat(this.high).toFixed(2) + '\n' +
        'Low: ' + parseFloat(this.low).toFixed(2);
  });

  return result;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.cartesian.series.RangeColumn.prototype.calculateStatistics = function() {
  this.statistics('seriesMax', -Infinity);
  this.statistics('seriesMin', Infinity);
  this.statistics('seriesSum', 0);
  this.statistics('seriesAverage', 0);
  this.statistics('seriesPointsCount', this.getIterator().getRowsCount());
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeColumn.prototype.getType = function() {
  return anychart.cartesian.series.Type.RANGE_COLUMN;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeColumn.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = this.getType();
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.RangeColumn.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.RangeColumn}
 */
anychart.cartesian.series.rangeColumn = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.RangeColumn(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.rangeColumn', anychart.cartesian.series.rangeColumn);
anychart.cartesian.series.RangeColumn.prototype['fill'] = anychart.cartesian.series.RangeColumn.prototype.fill;
anychart.cartesian.series.RangeColumn.prototype['hoverFill'] = anychart.cartesian.series.RangeColumn.prototype.hoverFill;
anychart.cartesian.series.RangeColumn.prototype['stroke'] = anychart.cartesian.series.RangeColumn.prototype.stroke;
anychart.cartesian.series.RangeColumn.prototype['hoverStroke'] = anychart.cartesian.series.RangeColumn.prototype.hoverStroke;
anychart.cartesian.series.RangeColumn.prototype['hatchFill'] = anychart.cartesian.series.RangeColumn.prototype.hatchFill;
anychart.cartesian.series.RangeColumn.prototype['hoverHatchFill'] = anychart.cartesian.series.RangeColumn.prototype.hoverHatchFill;
