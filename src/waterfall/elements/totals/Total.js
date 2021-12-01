goog.provide('anychart.waterfallModule.totals.Total');

goog.require('anychart.core.series.Cartesian');
goog.require('anychart.waterfallModule.totals.StateSettings');



/**
 * Series that uses for total drawing.
 *
 * @param {anychart.waterfallModule.totals.Controller} controller - Totals controller.
 * @param {!anychart.waterfallModule.Chart} chart - Waterfall chart instance.
 *
 * @constructor
 *
 * @extends {anychart.core.series.Cartesian}
 */
anychart.waterfallModule.totals.Total = function(controller, chart) {
  anychart.waterfallModule.totals.Total.base(this, 'constructor', chart, chart, anychart.waterfallModule.totals.Total.seriesType, {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    capabilities:
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  }, false);


  /**
   * Totals controller.
   *
   * @type {anychart.waterfallModule.totals.Controller}
   * @private
   */
  this.controller_ = controller;


  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['x', anychart.ConsistencyState.SERIES_DATA, anychart.Signal.DATA_CHANGED, anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS]
  ]);
};
goog.inherits(anychart.waterfallModule.totals.Total, anychart.core.series.Cartesian);


/**
 * Series type
 * @type {string}
 */
anychart.waterfallModule.totals.Total.seriesType = 'total';


/**
 * Property descriptors.
 *
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.waterfallModule.totals.Total.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'x', anychart.core.settings.stringNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.waterfallModule.totals.Total, anychart.waterfallModule.totals.Total.PROPERTY_DESCRIPTORS);
anychart.core.settings.populateAliases(anychart.waterfallModule.totals.Total, [
  'label'
], 'normal');


/**
 * @typedef {{
 *   x: string,
 *   name: string,
 *   label: (Object|string),
 *   fill: acgraph.vector.Fill,
 *   stroke: acgraph.vector.Stroke,
 *   hatchFill: acgraph.vector.HatchFill.HatchFillType
 * }}
 */
anychart.waterfallModule.totals.Total.Config;


/**
 * @typedef {{
 *   name: string,
 *   value: number,
 * }}
 */
anychart.waterfallModule.totals.Total.SplitConfig;


/**
 * Return string value that will be displayed in x axis under total value.
 *
 * @return {string}
 */
anychart.waterfallModule.totals.Total.prototype.getCategoryValue = function() {
  return /**@type {string}*/(this.name());
};

/**
 * Validate total correctness.
 *
 * @return {boolean}
 *
 * @private
 */
anychart.waterfallModule.totals.Total.prototype.validate_ = function() {
  var name = this.name();
  var self = this;

  var valid = !goog.array.some(this.controller_.getAllTotals(), function(total) {
    return !!(total !== self && total.getOption('enabled') && name === total.name());
  });

  return valid && !goog.array.some(this.chart.getSeriesCategories(), function(seriesCategory) {
    return name === seriesCategory;
  });
};


/**
 * Return total and splits points data.
 *
 * @return {Array.<Object>}
 */
anychart.waterfallModule.totals.Total.prototype.getData = function() {
  var data = [];
  var seriesCategories = this.chart.getSeriesCategories();
  var x = /**@type {string}*/(this.getOption('x'));

  var name = this.name();

  if (this.validate_()) {
    var totalValue = this.chart.getTotalValue(x);

    data.push({
      'x': this.getCategoryValue(),
      'name': name,
      'isTotal': true,
      'value': totalValue
    });

    var totalSplit = this.chart.splitTotal();
    var categoryOfLastPoint = seriesCategories[seriesCategories.length - 1];
    if (this.validateSplits_(totalValue, totalSplit) && categoryOfLastPoint === x) {
      var splits = this.getSplitsData(totalValue, totalSplit);
      for (var i = 0; i < splits.length; i++) {
        data.push(splits[i]);
      }
    }
  }

  return data;
};


/**
 * Update data.
 */
anychart.waterfallModule.totals.Total.prototype.updateData = function() {
  this.suspendSignalsDispatching();
  this.data(this.getData());
  this.resumeSignalsDispatching(false);
};


/**
 * Return array of scale values reserved by total and splits.
 *
 * @return {Array.<string>}
 */
anychart.waterfallModule.totals.Total.prototype.getReservedCategories = function() {
  var rv = [];

  var data = this.data();
  if (data) {
    var iterator = data.getIterator();
    while (iterator.advance()) {
      rv.push(/** @type {string} */(iterator.get('x')));
    }
  }

  return rv;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.instantiateStateSettings = function(stateHolder, descriptorsMeta, stateType, opt_descriptorsOverride) {
  return new anychart.waterfallModule.totals.StateSettings(stateHolder, descriptorsMeta, stateType, opt_descriptorsOverride);
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.supportsStack = function() {
  return false;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.needsExtremums = function() {
  return false;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  return this;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.resolveAutoAnchor = function(position, rotation) {
  if (position == anychart.enums.Position.AUTO) {
    var value = /** @type {number}*/(this.getIterator().get('value'));

    position = value >= 0 ?
      anychart.enums.Anchor.CENTER_TOP :
      anychart.enums.Anchor.CENTER_BOTTOM;

    position = anychart.utils.rotateAnchor(position, this.getOption('isVertical') ? -90 : 0);
    position = anychart.utils.rotateAnchor(position, this.yScale().inverted() ? -180 : 0);
  }

  return anychart.waterfallModule.totals.Total.base(this, 'resolveAutoAnchor', position, rotation);
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.createPositionProvider = function(position, opt_shift3D) {
  if (position === anychart.enums.Position.AUTO) {
    var value = /** @type {number}*/(this.getIterator().get('value'));

    position = value >= 0 ?
      anychart.enums.Position.CENTER_TOP :
      anychart.enums.Position.CENTER_BOTTOM;

    position = anychart.utils.rotateAnchor(position, this.getOption('isVertical') ? -90 : 0);
    position = anychart.utils.rotateAnchor(position, this.yScale().inverted() ? -180 : 0);
  }
  return anychart.waterfallModule.totals.Total.base(this, 'createPositionProvider', position, opt_shift3D);
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.getThemesList = function() {
  var themes = anychart.waterfallModule.totals.Total.base(this, 'getThemesList');

  themes.push('waterfall.total');

  return themes;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.initPostProcessingMeta = function() {
  return {
    valueOfPreviousPoint: 0
  };
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.postProcessPoint = function(iterator, point, processingMeta) {
  var isSplitPoint = !!point.meta['rawIndex'];

  point.meta['isSplit'] = isSplitPoint;
  point.meta['isTotal'] = !isSplitPoint;

  if (isSplitPoint) {
    var splitZero = processingMeta.valueOfPreviousPoint - point.data['value'];
    point.meta['valueOfPreviousPoint'] = splitZero;
    processingMeta.valueOfPreviousPoint = splitZero;
  } else {
    processingMeta.valueOfPreviousPoint = point.data['value'];
  }

  point.meta['connectorValue'] = processingMeta.valueOfPreviousPoint;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.getPointValue = function(point) {
  return point.get('value') + (point.meta('valueOfPreviousPoint') || 0);
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.makeUnstackedMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var map = {};

  map[yNames[0]] = yScale.transform(yScale.applyComparison(this.getPointValue(rowInfo), this.comparisonZero), 0.5);

  this.makePointsMetaFromMap(rowInfo, map, xRatio);

  return pointMissing;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.makeZeroMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  anychart.waterfallModule.totals.Total.base(this, 'makeZeroMeta', rowInfo, yNames, yColumns, pointMissing, xRatio);

  if (rowInfo.meta('isSplit')) {
    var zero = rowInfo.meta('valueOfPreviousPoint');
    var ratioOfPrevPointValue = goog.math.clamp(this.yScale().transform(zero, 0.5), 0, 1);
    rowInfo.meta('zero', this.ratiosToPixelPairs(xRatio, [ratioOfPrevPointValue])[1]);
  }

  return pointMissing;
};


/**
 * Validate splits configs.
 *
 * @param {number} totalValue - Value of total to split.
 * @param {Array.<anychart.waterfallModule.totals.Total.SplitConfig>} splits - Array of split configs.
 *
 * @return {boolean} - Whether configs correct.
 *
 * @private
 */
anychart.waterfallModule.totals.Total.prototype.validateSplits_ = function(totalValue, splits) {
  var names = this.chart.getSeriesCategories();

  var totals = this.controller_.getAllTotals();
  for (var i = 0; i < totals.length; i++) {
    var total = totals[i];
    names.push(total.name());
  }

  if (goog.isArray(splits)) {
    var isCorrect = true;
    for (i = 0; i < splits.length; i++) {
      var split = splits[i];
      var splitValue = split['value'];
      var splitName = split['name'];

      var hasValidValue = goog.isNumber(splitValue) && ((totalValue >= 0 && splitValue >= 0) || (totalValue < 0 && splitValue < 0));
      var hasUniqName = goog.isDef(splitName) && goog.array.indexOf(names, splitName) === -1;

      names.push(splitName);

      isCorrect = isCorrect && hasUniqName && hasValidValue;
    }
    return isCorrect;
  }

  return false;
};


/**
 * Return array of split point data.
 *
 * @param {number} totalValue
 * @param {Array.<anychart.waterfallModule.totals.Total.SplitConfig>} splits
 *
 * @return {Array.<Object>}
 */
anychart.waterfallModule.totals.Total.prototype.getSplitsData = function(totalValue, splits) {
  var rv = [];

  var splitsSum = 0;
  for (var i = 0; i < splits.length; i++) {
    var split = splits[i];
    split['isSplit'] = true;
    split['x'] = split['name'];
    splitsSum += split['value'];

    rv.push(split);
  }

  if (rv.length) {
    if (Math.abs(splitsSum) > Math.abs(totalValue)) {
      return [];
    } else if (Math.abs(splitsSum) < Math.abs(totalValue)) {
      var otherSplit = {};
      otherSplit['name'] = 'Other';
      otherSplit['x'] = 'Other';
      otherSplit['isSplit'] = true;
      otherSplit['value'] = -(splitsSum - totalValue);
      rv.push(otherSplit);
    }
  }
  return rv;
};


/**
 * Return context for total point.
 *
 * @param {anychart.data.IRowInfo} rowInfo
 *
 * @return {Object.<string, anychart.core.BaseContext.TypedValue>}
 */
anychart.waterfallModule.totals.Total.prototype.getTotalContext = function(rowInfo) {
  var allTotals = this.controller_.getAllTotals();
  var value = rowInfo.get('value');
  var pointIndex = rowInfo.getIndex();

  var names = this.xScale().names();
  var categoryName = goog.isDef(names[pointIndex]) ? names[pointIndex] : rowInfo.get('name');

  return {
    'name': {
      value: categoryName,
      type: anychart.enums.TokenType.STRING
    },
    'value': {
      value: value,
      type: anychart.enums.TokenType.NUMBER
    },
    'index': {
      value: goog.array.indexOf(allTotals, this),
      type: anychart.enums.TokenType.NUMBER
    },
    'x': {
      value: this.getOption('x'),
      type: anychart.enums.TokenType.STRING
    },
    'isTotal': {
      value: true,
      type: anychart.enums.TokenType.UNKNOWN
    }
  };
};


/**
 * Return context for split point.
 *
 * @param {anychart.data.IRowInfo} rowInfo
 *
 * @return {Object.<string, anychart.core.BaseContext.TypedValue>}
 */
anychart.waterfallModule.totals.Total.prototype.getSplitContext = function(rowInfo) {
  var value = rowInfo.get('value');
  var pointIndex = rowInfo.getIndex();

  var names = this.xScale().names();
  var categoryName = goog.isDef(names[pointIndex]) ? names[pointIndex] : rowInfo.get('name');

  return {
    'name': {
      value: categoryName,
      type: anychart.enums.TokenType.STRING
    },
    'value': {
      value: value,
      type: anychart.enums.TokenType.NUMBER
    },
    'index': {
      value: rowInfo.getIndex() - 1,
      type: anychart.enums.TokenType.NUMBER
    },
    'isSplit': {
      value: true,
      type: anychart.enums.TokenType.UNKNOWN
    }
  };
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.getContextProviderValues = function(provider, rowInfo) {
  return rowInfo.meta('isSplit') ?
    this.getSplitContext(rowInfo) :
    this.getTotalContext(rowInfo);
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.applyDefaultsToElements = function(defaults, opt_resetLegendItem, opt_default, opt_reapplyClip) {
  anychart.waterfallModule.totals.Total.base(this, 'applyDefaultsToElements', defaults, opt_resetLegendItem, opt_default, opt_reapplyClip);

  this.name(defaults['name']);
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.nameInvalidated = function() {
  this.invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.DATA_CHANGED);
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.serialize = function() {
  var json = anychart.waterfallModule.totals.Total.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.waterfallModule.totals.Total.PROPERTY_DESCRIPTORS, json);

  json['normal'] = this.normal().serialize();
  json['hovered'] = this.hovered().serialize();

  return json;
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.disposeInternal = function() {
  this.controller_ = null;
  anychart.waterfallModule.totals.Total.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.waterfallModule.totals.Total.prototype.setupByJSON = function(json, opt_default) {
  anychart.waterfallModule.totals.Total.base(this, 'setupByJSON', json, opt_default);

  anychart.core.settings.deserialize(this, anychart.waterfallModule.totals.Total.PROPERTY_DESCRIPTORS, json, opt_default);

  this.normal().setupByJSON(json);

  if ('normal' in json) {
    this.normal().setupByJSON(json['normal'], opt_default);
  }

  if ('hovered' in json) {
    this.hovered().setupByJSON(json['hovered'], opt_default);
  }
};


//endregion
//region --- exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.waterfallModule.totals.Total.prototype;

  proto['x'] = proto.x;
  proto['label'] = proto.label;
})();
//endregion
