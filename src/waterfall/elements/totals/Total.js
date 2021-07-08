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
 * Return string value that will be displayed in x axis under total value.
 *
 * @return {string}
 */
anychart.waterfallModule.totals.Total.prototype.getCategoryValue = function() {
  return /**@type {string}*/(this.name());
};


/**
 * Return category values that total reserves.
 *
 * @return {Array.<string>}
 */
anychart.waterfallModule.totals.Total.prototype.getReservedCategories = function() {
  return [this.getCategoryValue()];
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
anychart.waterfallModule.totals.Total.prototype.chartHasLabelOverrides = function() {
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
anychart.waterfallModule.totals.Total.prototype.getContextProviderValues = function(provider, rowInfo) {
  var allTotals = this.controller_.getAllTotals();
  var value = rowInfo.get('value');

  return {
    'name': {
      value: this.name(),
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
    }
  };
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
