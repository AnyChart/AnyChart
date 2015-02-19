goog.provide('anychart.core.cartesian.series.RangeColumn');

goog.require('anychart.core.cartesian.series.WidthBased');



/**
 * Define RangeColumn series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#rangeColumn} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.WidthBased}
 */
anychart.core.cartesian.series.RangeColumn = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference points for a series
  this.referenceValueNames = ['x', 'low', 'high'];
  this.referenceValueMeanings = ['x', 'y', 'y'];
  this.referenceValuesSupportStack = false;
};
goog.inherits(anychart.core.cartesian.series.RangeColumn, anychart.core.cartesian.series.WidthBased);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.RANGE_COLUMN] = anychart.core.cartesian.series.RangeColumn;


/** @inheritDoc */
anychart.core.cartesian.series.RangeColumn.prototype.drawSubsequentPoint = function() {
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
    var iterator = this.getIterator();
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
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
anychart.core.cartesian.series.RangeColumn.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('high')}};
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.RangeColumn.prototype.isErrorAvailable = function() {
  return false;
};


/** @inheritDoc */
anychart.core.cartesian.series.RangeColumn.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.content().hAlign('left');
  tooltip.contentFormatter(function() {
    return 'High: ' + parseFloat(this['high']).toFixed(2) + '\n' +
        'Low: ' + parseFloat(this['low']).toFixed(2);
  });

  return result;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.cartesian.series.RangeColumn.prototype.calculateStatistics = function() {
  this.statistics('seriesMax', -Infinity);
  this.statistics('seriesMin', Infinity);
  this.statistics('seriesSum', 0);
  this.statistics('seriesAverage', 0);
  this.statistics('seriesPointsCount', this.getIterator().getRowsCount());
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.RangeColumn.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.RANGE_COLUMN;
};


//exports
anychart.core.cartesian.series.RangeColumn.prototype['fill'] = anychart.core.cartesian.series.RangeColumn.prototype.fill;//inherited
anychart.core.cartesian.series.RangeColumn.prototype['hoverFill'] = anychart.core.cartesian.series.RangeColumn.prototype.hoverFill;//inherited
anychart.core.cartesian.series.RangeColumn.prototype['stroke'] = anychart.core.cartesian.series.RangeColumn.prototype.stroke;//inherited
anychart.core.cartesian.series.RangeColumn.prototype['hoverStroke'] = anychart.core.cartesian.series.RangeColumn.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.RangeColumn.prototype['hatchFill'] = anychart.core.cartesian.series.RangeColumn.prototype.hatchFill;//inherited
anychart.core.cartesian.series.RangeColumn.prototype['hoverHatchFill'] = anychart.core.cartesian.series.RangeColumn.prototype.hoverHatchFill;//inherited
