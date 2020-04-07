goog.provide('anychart.timelineModule.series.Range');

// goog.require('anychart.timelineModule.drawers.Event');
goog.require('anychart.timelineModule.drawers.Range');
goog.require('anychart.timelineModule.series.Base');



//region --- Constructor
/**
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.timelineModule.series.Base}
 */
anychart.timelineModule.series.Range = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Range.base(this, 'constructor', chart, plot, type, config, sortedMode);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['height', 0, 0]
  ]);
};
goog.inherits(anychart.timelineModule.series.Range, anychart.timelineModule.series.Base);


//endregion
//region --- Descriptors
/**
 * Range series property descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.timelineModule.series.Range.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.HEIGHT
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.series.Range, anychart.timelineModule.series.Range.PROPERTY_DESCRIPTORS);


//endregion
//region --- Meta
/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.makePointMeta = function(rowInfo, yNames, yColumns) {
  var scale = this.getXScale();
  var startXRatio = scale.transform(rowInfo.get('start'));
  var endXRatio = scale.transform(rowInfo.get('end'));
  rowInfo.meta('startXRatio', startXRatio);
  rowInfo.meta('endXRatio', endXRatio);
  for (var i = 0; i < this.metaMakers.length; i++) {
    this.metaMakers[i].call(this, rowInfo, yNames, yColumns, 0);
  }
};


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.makeTimelineMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  anychart.timelineModule.series.Range.base(this, 'makeTimelineMeta', rowInfo, yNames, yColumns, pointMissing, xRatio);
  var bounds = this.parentBounds();
  var startXRatio = /** @type {number} */(rowInfo.meta('startXRatio'));
  var startX = bounds.left + bounds.width * startXRatio;
  var endXRatio = rowInfo.meta('endXRatio');
  if (!goog.isNumber(endXRatio) || isNaN(endXRatio)) {
    var scale = /** @type {anychart.scales.GanttDateTime} */(this.getXScale());
    var trMax = scale.getTotalRange()['max'];
    endXRatio = scale.transform(trMax);
  }
  var endX = bounds.left + bounds.width * endXRatio;
  rowInfo.meta('startX', startX);
  rowInfo.meta('endX', endX);

  var height = anychart.utils.normalizeSize(/** @type {number} */(this.getOption('height')), bounds.height);
  rowInfo.meta('height', height);
};


//endregion
//region --- Infrastructure
/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.pushSeriesBasedPointData = function(data, dataPusher, xNormalizer) {
  var dataSource = /** @type {anychart.data.IView} */(this.data());
  var iterator = dataSource.getIterator();

  while (iterator.advance()) {
    var start = xNormalizer(iterator.get('start'));
    var end = xNormalizer(iterator.get('end'));
    var pointData = {};
    var meta = {};
    pointData['start'] = start;
    pointData['end'] = end;
    meta['rawIndex'] = iterator.getIndex();
    dataPusher(data, {data: pointData, meta: meta});
  }
};


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.createPositionProvider = function(position, opt_shift3d) {
  var iterator = this.getIterator();
  var x, y;
  var height = /** @type {number} */(iterator.meta('height'));
  var zero = /** @type {number} */(iterator.meta('zero'));
  var axisHeight = /** @type {number} */(iterator.meta('axisHeight'));
  var startX = /** @type {number} */(iterator.meta('startX'));
  var endY = /** @type {number} */(iterator.meta('endY'));

  var direction = /** @type {anychart.enums.Direction} */(iterator.get('direction') || this.getFinalDirection());
  var isDirectionUp = direction == anychart.enums.Direction.UP;

  var halfAxisHeight = axisHeight / 2;
  zero += isDirectionUp ? -halfAxisHeight : halfAxisHeight;

  var yOffset = endY - height / 2;
  x = startX;
  y = zero + (isDirectionUp ? -yOffset : yOffset);

  var viewPortLeft = this.chart.getDataBounds().left + this.chart.getHorizontalTranslate();
  if (viewPortLeft > x) {
    x = viewPortLeft;
  }

  return {
    'value': {
      'x': x || 0,
      'y': y || 0
    }
  };
};


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.getContextProviderValues = function(provider, rowInfo) {
  var values = anychart.timelineModule.series.Range.base(this, 'getContextProviderValues', provider, rowInfo);
  values['start'] = {
    value: anychart.format.parseDateTime(rowInfo.get('start')),
    type: anychart.enums.TokenType.DATE_TIME
  };

  values['end'] = {
    value: anychart.format.parseDateTime(rowInfo.get('end')),
    type: anychart.enums.TokenType.DATE_TIME
  };
  return values;
};


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.applyAdditionalLabelSettings = function(label, index) {
  var it = this.getDetachedIterator();
  it.select(index);
  var startX = /** @type {number} */(it.meta('startX'));

  var viewPortLeft = this.chart.getDataBounds().left + this.chart.getHorizontalTranslate();
  if (viewPortLeft > startX) {
    startX = viewPortLeft;
  }

  var endX = /** @type {number} */(it.meta('endX'));
  var height = /** @type {number} */(it.meta('height'));

  label.width(endX - startX);
  label.height(height);
};
//endregion
