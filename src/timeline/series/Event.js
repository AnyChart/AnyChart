goog.provide('anychart.timelineModule.series.Event');
goog.require('anychart.timelineModule.ConnectorSettings');
goog.require('anychart.timelineModule.drawers.Event');
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
anychart.timelineModule.series.Event = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Event.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.timelineModule.series.Event, anychart.timelineModule.series.Base);


//endregion
//region --- Meta
/** @inheritDoc */
anychart.timelineModule.series.Event.prototype.makeTimelineMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  anychart.timelineModule.series.Event.base(this, 'makeTimelineMeta', rowInfo, yNames, yColumns, pointMissing, xRatio);
  var bounds = this.parentBounds();
  var connectorLength = /** @type {string|number} */(this.connector().getOption('length'));
  rowInfo.meta('length', anychart.utils.normalizeSize(connectorLength, bounds.height));
  rowInfo.meta('x', bounds.left + bounds.width * xRatio);
};


/** @inheritDoc */
anychart.timelineModule.series.Event.prototype.makePointMeta = function(rowInfo, yNames, yColumns) {
  var xRatio = this.getXScale().transform(rowInfo.getX());
  rowInfo.meta('xRatio', xRatio);
  for (var i = 0; i < this.metaMakers.length; i++) {
    this.metaMakers[i].call(this, rowInfo, yNames, yColumns, 0, xRatio);
  }
};


//endregion
//region --- Infrastructure
/**
 * Event connector getter\setter.
 * @param {Object=} opt_config
 * @return {anychart.timelineModule.series.Event|anychart.timelineModule.ConnectorSettings}
 */
anychart.timelineModule.series.Event.prototype.connector = function(opt_config) {
  if (!this.connector_) {
    this.connector_ = new anychart.timelineModule.ConnectorSettings();
    this.connector_.setParentEventTarget(this);
    this.connector_.listenSignals(this.connectorInvalidated_, this);
    this.setupCreated('connector', this.connector_);
  }

  if (goog.isDef(opt_config)) {
    this.connector_.setup(opt_config);
    return this;
  }

  return this.connector_;
};


/**
 * Listens connector invalidation.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.series.Event.prototype.connectorInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.timelineModule.series.Event.prototype.pushSeriesBasedPointData = function(data, dataPusher, xNormalizer) {
  var dataSource = /** @type {anychart.data.IView} */(this.data());
  var iterator = dataSource.getIterator();

  while (iterator.advance()) {
    var xValue = xNormalizer(iterator.get('x'));
    var pointData = {};
    var meta = {};
    pointData['x'] = xValue;
    meta['rawIndex'] = iterator.getIndex();
    dataPusher(data, {data: pointData, meta: meta});
  }
};


/** @inheritDoc */
anychart.timelineModule.series.Event.prototype.transformY = function(value, opt_subRangeRatio) {
  var iterator = this.getIterator();
  var minLength = /** @type {number} */(iterator.meta('minLength'));
  var bounds = this.parentBounds();
  var zero = bounds.top + bounds.height / 2;
  // var length = /** @type {number|string} */(this.connector().getOption('length'));
  var directionUp = this.getFinalDirection() == anychart.enums.EventMarkerDirection.UP;
  var halfAxisHeight = /** @type {number} */(iterator.meta('axisHeight')) / 2;
  // length = anychart.utils.normalizeSize(length, this.parentBounds().height);
  return directionUp ? zero - minLength - halfAxisHeight : zero + minLength + halfAxisHeight;
};


/** @inheritDoc */
anychart.timelineModule.series.Event.prototype.resolveAutoAnchor = function(position, rotation) {
  var direction = this.getFinalDirection();

  if (direction == anychart.enums.EventMarkerDirection.UP) {
    return anychart.enums.Anchor.CENTER_BOTTOM;
  } else {
    return anychart.enums.Anchor.CENTER_TOP;
  }
};


/** @inheritDoc */
anychart.timelineModule.series.Event.prototype.getContextProviderValues = function(provider, rowInfo) {
  var values = anychart.timelineModule.series.Event.base(this, 'getContextProviderValues', provider, rowInfo);
  values['date'] = {
    value: anychart.format.parseDateTime(rowInfo.get('x')),
    type: anychart.enums.TokenType.DATE_TIME
  };
  return values;
};


//endregion
//region --- Disposing
/** @inheritDoc */
anychart.timelineModule.series.Event.prototype.disposeInternal = function() {
  this.connector_.unlistenSignals(this.connectorInvalidated_, this);
  goog.disposeAll(this.connector_);
  this.connector_ = null;
  anychart.timelineModule.series.Event.base(this, 'disposeInternal');
};
//endregion
