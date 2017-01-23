goog.provide('anychart.core.series.RenderingSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



/**
 * Series renderer settings class.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.series.RenderingSettings = function(series) {
  anychart.core.series.RenderingSettings.base(this, 'constructor');

  /**
   * Series reference.
   * @type {anychart.core.series.Base}
   * @private
   */
  this.series_ = series;

  /**
   * Settings obj.
   * @type {Object}
   */
  this.settings = {};

  /**
   * Defaults.
   * @type {Object}
   */
  this.defaultSettings = {};

  /**
   * Shapes settings.
   * @type {?Array.<anychart.core.shapeManagers.ShapeConfig>}
   * @private
   */
  this.shapes_ = null;
};
goog.inherits(anychart.core.series.RenderingSettings, anychart.core.Base);


//region --- Types
//------------------------------------------------------------------------------
//
//  Types
//
//------------------------------------------------------------------------------
/**
 * Shape config.
 * @typedef {{
 *   name: string,
 *   shapeType: anychart.enums.ShapeType,
 *   fillNames: ?Array.<string>,
 *   strokeNames: ?Array.<string>,
 *   isHatchFill: boolean,
 *   zIndex: number
 * }}
 */
anychart.core.series.RenderingSettings.ShapeConfig;


//endregion
//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.series.RenderingSettings.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.series.RenderingSettings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEEDS_REAPPLICATION;


//endregion
//region --- Internal methods
//------------------------------------------------------------------------------
//
//  Internal methods
//
//------------------------------------------------------------------------------
/**
 * If the settings object requires custom drawing protocol.
 * @return {boolean}
 */
anychart.core.series.RenderingSettings.prototype.needsCustomPointDrawer = function() {
  return this.hasOwnOption('point');
};


/**
 * Calls start function if it exists.
 * @param {anychart.core.series.Base} series
 */
anychart.core.series.RenderingSettings.prototype.callStart = function(series) {
  this.callFunc_(/** @type {Function} */(this.getOption('start')), series);
};


/**
 * Calls point function if it exists.
 * @param {anychart.core.series.Base} series
 * @param {anychart.data.IRowInfo} point
 * @param {number} pointState
 */
anychart.core.series.RenderingSettings.prototype.callPoint = function(series, point, pointState) {
  this.callFunc_(/** @type {Function} */(this.getOption('point')), series, point, pointState);
};


/**
 * Calls updatePoint function if it exists.
 * @param {anychart.core.series.Base} series
 * @param {anychart.data.IRowInfo} point
 * @param {number} pointState
 */
anychart.core.series.RenderingSettings.prototype.callUpdate = function(series, point, pointState) {
  this.callFunc_(/** @type {Function} */(this.getOption('updatePoint')), series, point, pointState, true);
};


/**
 * Calls finish function if it exists.
 * @param {anychart.core.series.Base} series
 */
anychart.core.series.RenderingSettings.prototype.callFinish = function(series) {
  this.callFunc_(/** @type {Function} */(this.getOption('finish')), series);
};


/**
 * Calls passed function.
 * @param {Function} func
 * @param {anychart.core.series.Base} series
 * @param {anychart.data.IRowInfo=} opt_point
 * @param {number=} opt_pointState
 * @param {boolean=} opt_update
 * @private
 */
anychart.core.series.RenderingSettings.prototype.callFunc_ = function(func, series, opt_point, opt_pointState, opt_update) {
  if (func) {
    var shapes = undefined;
    if (opt_update) {
      shapes = /** @type {Object} */(opt_point.meta('shapes'));
      if (!shapes) return;
    }
    var context = opt_point ?
        new anychart.core.series.RenderingSettings.PointContext(series, opt_point, opt_pointState || anychart.PointState.NORMAL, shapes) :
        new anychart.core.series.RenderingSettings.Context(series);
    func.call(context, context);
  }
};


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Shapes settings getter/setter.
 * @param {?Array.<anychart.core.series.RenderingSettings.ShapeConfig>=} opt_value
 * @return {anychart.core.series.RenderingSettings|Array.<anychart.core.series.RenderingSettings.ShapeConfig>}
 */
anychart.core.series.RenderingSettings.prototype.shapes = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.shapes_ = goog.isArray(opt_value) ? /** @type {!Array.<anychart.core.shapeManagers.ShapeConfig>} */(
        goog.array.map(opt_value, function(item) {
          return {
            name: String(item['name']),
            shapeType: String(item['shapeType']),
            fillNames: goog.isArray(item['fillNames']) ? item['fillNames'] : null,
            strokeNames: goog.isArray(item['strokeNames']) ? item['strokeNames'] : null,
            isHatchFill: !!item['isHatchFill'],
            zIndex: +item['zIndex'] || 0
          };
        })) :
        null;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return /** @type {!Array.<anychart.core.shapeManagers.ShapeConfig>} */(
      goog.array.map(this.getShapesConfig(), function(item) {
        return {
          'name': item.name,
          'shapeType': item.shapeType,
          'fillNames': item.fillNames,
          'strokeNames': item.strokeNames,
          'isHatchFill': item.isHatchFill,
          'zIndex': item.zIndex
        };
      })
  );
};


/**
 * Returns shapes config. Internal method.
 * @return {!Array.<anychart.core.shapeManagers.ShapeConfig>}
 */
anychart.core.series.RenderingSettings.prototype.getShapesConfig = function() {
  return this.shapes_ || this.series_.config.shapesConfig;
};


/**
 * Resets rendering settings to default values.
 */
anychart.core.series.RenderingSettings.prototype.setDefaults = function() {
  this.defaultSettings['needsZero'] = this.series_.check(anychart.core.drawers.Capabilities.NEEDS_ZERO);
  this.defaultSettings['needsWidth'] = this.series_.check(anychart.core.drawers.Capabilities.IS_WIDTH_BASED);
  this.defaultSettings['yValues'] = goog.array.slice(this.series_.drawer.getYValueNames(), 0);
};


/**
 * Properties that should be defined in annotation.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.series.RenderingSettings.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['start'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'start',
      anychart.core.settings.functionNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map['point'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'point',
      anychart.core.settings.functionNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map['updatePoint'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'updatePoint',
      anychart.core.settings.functionNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map['finish'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'finish',
      anychart.core.settings.functionNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map['needsZero'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'needsZero',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_RECALCULATION);

  map['needsWidth'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'needsWidth',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_RECALCULATION);

  map['yValues'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'yValues',
      anychart.core.settings.arrayNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_RECALCULATION);

  return map;
})();
anychart.core.settings.populate(anychart.core.series.RenderingSettings, anychart.core.series.RenderingSettings.DESCRIPTORS);


//endregion
//region IObjectWithSettings impl
//----------------------------------------------------------------------------------------------------------------------
//
//  IObjectWithSettings impl
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns option value if it was set directly to the object.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.RenderingSettings.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/**
 * Returns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.series.RenderingSettings.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]);
};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.RenderingSettings.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/**
 * Returns option value by priorities.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.RenderingSettings.prototype.getOption = function(name) {
  return this.hasOwnOption(name) ? this.getOwnOption(name) : this.getThemeOption(name);
};


/**
 * Sets option value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.series.RenderingSettings.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/**
 * Performs checks on the instance to determine whether the state should be invalidated after option change.
 * @param {number} flags
 * @return {boolean}
 */
anychart.core.series.RenderingSettings.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.RenderingSettings.prototype.serialize = function() {
  var json = anychart.core.series.RenderingSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.series.RenderingSettings.DESCRIPTORS, json, 'Series Rendering Settings');
  if (this.shapes_)
    json['shapes'] = this.shapes();
  return json;
};


/** @inheritDoc */
anychart.core.series.RenderingSettings.prototype.setupByJSON = function(config) {
  anychart.core.series.RenderingSettings.base(this, 'setupByJSON', config);
  anychart.core.settings.deserialize(this, anychart.core.series.RenderingSettings.DESCRIPTORS, config);
  var shapes = config['shapes'];
  if (goog.isDef(shapes))
    this.shapes(shapes);
};


/** @inheritDoc */
anychart.core.series.RenderingSettings.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isFunction(value)) {
    this['point'](value);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.series.RenderingSettings.prototype.disposeInternal = function() {
  anychart.core.series.RenderingSettings.base(this, 'disposeInternal');
  this.settings = null;
  this.series_ = null;
  this.shapes_ = null;
};



//endregion
//region --- Context
//------------------------------------------------------------------------------
//
//  Context
//
//------------------------------------------------------------------------------
/**
 * Rendering functions context.
 * @param {anychart.core.series.Base} series
 * @constructor
 */
anychart.core.series.RenderingSettings.Context = function(series) {
  /**
   * Series reference.
   * @type {anychart.core.series.Base}
   */
  this['series'] = series;

  /**
   * Series state.
   * @type {anychart.PointState}
   */
  this['seriesState'] = series.getSeriesState();
};


/**
 * Generates a shapes group.
 * @param {anychart.PointState=} opt_state
 * @param {number=} opt_baseZIndex
 * @param {Array.<string>=} opt_restrictShapes
 * @return {Object.<string, acgraph.vector.Shape>}
 */
anychart.core.series.RenderingSettings.Context.prototype.getShapesGroup = function(opt_state, opt_baseZIndex, opt_restrictShapes) {
  var only;
  if (opt_restrictShapes) {
    only = {};
    for (var i = 0; i < opt_restrictShapes.length; i++)
      only[opt_restrictShapes[i]] = true;
  }
  return this['series'].shapeManager.getShapesGroup(opt_state || anychart.PointState.NORMAL, only, opt_baseZIndex);
};


/**
 * Fetch statistics value by its key or a whole object if no key provided.
 * @param {string=} opt_key Key.
 * @return {*}
 */
anychart.core.series.RenderingSettings.Context.prototype.getStat = function(opt_key) {
  var series = this['series'];
  series.chart.ensureStatisticsReady();
  return series.statistics(opt_key);
};



//endregion
//region --- PointContext
//------------------------------------------------------------------------------
//
//  PointContext
//
//------------------------------------------------------------------------------
/**
 * Rendering functions context.
 * @param {anychart.core.series.Base} series
 * @param {anychart.data.IRowInfo} point
 * @param {number} pointState
 * @param {Object=} opt_updateShapes
 * @constructor
 * @extends {anychart.core.series.RenderingSettings.Context}
 */
anychart.core.series.RenderingSettings.PointContext = function(series, point, pointState, opt_updateShapes) {
  anychart.core.series.RenderingSettings.PointContext.base(this, 'constructor', series);

  /**
   * Point reference.
   * @type {anychart.data.IRowInfo}
   * @private
   */
  this.point_ = point;

  // populating context with calculated coords
  var names = series.getYValueNames();
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    this[name] = point.meta(name);
  }
  if (series.check(anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE))
    this['size'] = point.meta('size');
  this['x'] = point.meta('x');
  this['pointState'] = pointState;
  this['missing'] = !!point.meta('missing');
  this['categoryWidth'] = series.categoryWidthCache;
  if (series.isWidthBased())
    this['pointWidth'] = series.pointWidthCache;
  if (series.needsZero())
    this['zero'] = point.meta('zero');
  if (opt_updateShapes)
    this['shapes'] = opt_updateShapes;
};
goog.inherits(anychart.core.series.RenderingSettings.PointContext, anychart.core.series.RenderingSettings.Context);


/**
 * Returns data value by name.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.RenderingSettings.PointContext.prototype.getDataValue = function(name) {
  return this.point_.get(name);
};


/**
 * Returns stacked value if the series is stacked.
 * @return {*}
 */
anychart.core.series.RenderingSettings.PointContext.prototype.getStackedValue = function() {
  var val = this.point_.meta('stackedValue');
  return goog.isDef(val) ? val : this.point_.get('value');
};


/**
 * Returns stacked zero value if the series is stacked.
 * @return {*}
 */
anychart.core.series.RenderingSettings.PointContext.prototype.getStackedZero = function() {
  var val = this.point_.meta('stackedZero');
  return goog.isDef(val) ? val : 0;
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
(function() {
  var proto = anychart.core.series.RenderingSettings.prototype;
  //proto['start'] = proto.start;
  //proto['point'] = proto.point;
  //proto['finish'] = proto.finish;
  //proto['needsZero'] = proto.needsZero;
  //proto['needsWidth'] = proto.needsWidth;
  //proto['yValues'] = proto.yValues;
  proto['shapes'] = proto.shapes;

  proto = anychart.core.series.RenderingSettings.Context.prototype;
  proto['getShapesGroup'] = proto.getShapesGroup;
  proto['getStat'] = proto.getStat;

  proto = anychart.core.series.RenderingSettings.PointContext.prototype;
  proto['getDataValue'] = proto.getDataValue;
  proto['getStackedValue'] = proto.getStackedValue;
  proto['getStackedZero'] = proto.getStackedZero;
})();

//endregion
