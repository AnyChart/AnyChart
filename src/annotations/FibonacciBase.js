goog.provide('anychart.annotationsModule.FibonacciBase');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.format.Context');



/**
 * Fibonacci annotations base.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.FibonacciBase = function(chartController) {
  anychart.annotationsModule.FibonacciBase.base(this, 'constructor', chartController);

  /**
   * Paths array.
   * @type {Array.<acgraph.vector.Path>}
   * @protected
   */
  this.paths = null;

  /**
   * Level paths array. An instance for each level (but they can be shared).
   * @type {Array.<acgraph.vector.Path>}
   */
  this.levelPaths = null;

  /**
   * Levels.
   * @type {Array.<number>}
   * @protected
   */
  this.levelsInternal = [];

  /**
   * Stroke resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @param {number=} opt_level
   * @return {acgraph.vector.Stroke}
   */
  this.levelsStrokeResolver = /** @type {function(anychart.annotationsModule.Base,number,number=):acgraph.vector.Stroke} */(
      anychart.annotationsModule.Base.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true));

  /**
   * Trend stroke resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @param {number=} opt_level
   * @return {acgraph.vector.Stroke}
   */
  this.trendResolver = /** @type {function(anychart.annotationsModule.Base,number,number=):acgraph.vector.Stroke} */(
      anychart.annotationsModule.Base.getColorResolver('trend', anychart.enums.ColorType.STROKE, true));

  /**
   * This is a flag that is setup in labels invalidation processing and that means that the labels should be redrawn
   * after processing
   * @type {boolean}
   * @protected
   */
  this.shouldDrawLabels = false;
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS_META);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);
};
goog.inherits(anychart.annotationsModule.FibonacciBase, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.FibonacciBase, ['stroke', 'trend', 'labels'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.FibonacciBase, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.FibonacciBase, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.FibonacciBase, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported states.
 * @type {number}
 */
anychart.annotationsModule.FibonacciBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.annotationsModule.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.ANNOTATIONS_LABELS |
        anychart.ConsistencyState.ANNOTATIONS_LEVELS;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.FibonacciBase.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.TWO_POINTS;


/**
 * Levels getter/setter.
 * @param {Array.<*>=} opt_values
 * @return {Array.<number>|anychart.annotationsModule.FibonacciBase}
 */
anychart.annotationsModule.FibonacciBase.prototype.levels = function(opt_values) {
  if (goog.isDef(opt_values)) {
    if (goog.isArray(opt_values)) {
      this.levelsInternal.length = 0;
      for (var i = 0; i < opt_values.length; i++) {
        var value = anychart.utils.toNumber(opt_values[i]);
        if (!isNaN(value))
          this.levelsInternal.push(value);
      }
      this.invalidate(
          anychart.ConsistencyState.ANNOTATIONS_LEVELS |
          anychart.ConsistencyState.ANNOTATIONS_SHAPES |
          anychart.ConsistencyState.ANNOTATIONS_LABELS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return goog.array.slice(this.levelsInternal, 0);
};


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.FibonacciBase.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(
      base,
      anychart.annotationsModule.LABELS_DESCRIPTORS_META,
      anychart.annotationsModule.STROKE_TREND_DESCRIPTORS_META,
      anychart.annotationsModule.LABELS_DESCRIPTORS_META);
};


//endregion
//region Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.setState = function(state) {
  anychart.annotationsModule.FibonacciBase.base(this, 'setState', state);
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_LABELS);
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.ensureCreated = function() {
  anychart.annotationsModule.FibonacciBase.base(this, 'ensureCreated');

  if (!this.paths) {
    // trend only
    this.paths = [this.rootLayer.path(), this.rootLayer.path()];
    this.paths[0].zIndex(anychart.annotationsModule.Base.STROKE_ZINDEX);
    this.paths[1].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.resolveCustomPreDrawingStates = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_LEVELS)) {
    if (!this.levelPaths) {
      this.levelPaths = [];
    }
    var i;
    // creating missing paths
    for (i = this.levelPaths.length; i < this.levelsInternal.length; i++) {
      this.levelPaths.push(this.rootLayer.path().zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX));
    }
    // disposing extra paths
    for (i = this.levelsInternal.length; i < this.levelPaths.length; i++) {
      goog.dispose(this.levelPaths[i]);
    }
    this.levelPaths.length = this.levelsInternal.length;
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES | anychart.ConsistencyState.ANNOTATIONS_LABELS);
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_LEVELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_SHAPES)) {
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_LABELS)) {
    this.shouldDrawLabels = false;
    var factory = /** @type {anychart.core.ui.LabelsFactory} */(this.normal().labels());
    var stateFactoriesEnabled = /** @type {boolean} */(this.hovered().labels().enabled() || /** @type {anychart.core.ui.LabelsFactory} */(this.selected().labels()).enabled());
    factory.suspendSignalsDispatching();
    if (this.anchorsWithLastPoint == anychart.annotationsModule.AnchorSupport.TWO_POINTS &&
        ((factory.enabled() !== false) || stateFactoriesEnabled)) {
      factory.container(this.rootLayer);
      factory.clear();
      factory.parentBounds(this.pixelBoundsCache);
      factory.setAutoZIndex(anychart.annotationsModule.Base.LABELS_ZINDEX);
      this.shouldDrawLabels = true;
      this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES);
    } else {
      factory.clear();
      factory.container(null);
    }
    factory.draw();
    var layer = factory.getRootLayer();
    if (layer) layer.disablePointerEvents(true);
    factory.resumeSignalsDispatching(false);
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_LABELS);
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.drawOnePointShape = function(x, y) {
  for (var i = 0; i < this.paths.length; i++) {
    var path = this.paths[i];
    path.clear();
    path.moveTo(x, y).lineTo(x, y);
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.drawTwoPointsShape = function(firstX, firstY, secondX, secondY) {
  // trend on trend and hover paths
  for (var i = 0; i < this.paths.length; i++) {
    var path = this.paths[i];
    path.clear();
    path.moveTo(firstX, firstY).lineTo(secondX, secondY);
  }
  for (i = 0; i < this.levelPaths.length; i++) {
    this.levelPaths[i].clear();
  }

  var mainFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.normal().labels());
  var stateFactory;
  if (!!(this.state & anychart.PointState.SELECT)) {
    stateFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selected().labels());
  } else if (!!(this.state & anychart.PointState.HOVER)) {
    stateFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hovered().labels());
  } else {
    stateFactory = null;
  }

  var canDrawLabels = /** @type {boolean} */(this.shouldDrawLabels && (!stateFactory || goog.isNull(stateFactory.enabled())) ?
      mainFactory.enabled() :
      stateFactory.enabled());

  mainFactory.suspendSignalsDispatching();
  this.drawLevels(mainFactory, stateFactory, canDrawLabels);
  if (!canDrawLabels) {
    mainFactory.clear();
  }
  mainFactory.draw();
  mainFactory.resumeSignalsDispatching(false);
};


/**
 * Draws levels. If drawLabels is passed - should calculate format and position providers and call drawLabel().
 * @param {anychart.core.ui.LabelsFactory} mainFactory
 * @param {anychart.core.ui.LabelsFactory} stateFactory
 * @param {boolean} drawLabels
 */
anychart.annotationsModule.FibonacciBase.prototype.drawLevels = function(mainFactory, stateFactory, drawLabels) {
  for (var i = 0; i < this.levelsInternal.length; i++) {
    var levelPath = this.levelPaths[i];
    var stroke = /** @type {acgraph.vector.Stroke} */(levelPath.stroke());
    this.drawLevel(i, this.levelsInternal[i], levelPath, this.paths[1], mainFactory, stateFactory,
        drawLabels, anychart.utils.extractThickness(stroke));
  }
};


/**
 * Draws levels. If labelPosition is passed - should calculate format and position providers and call drawLabel().
 * @param {number} levelIndex Level number.
 * @param {number} levelValue Level value.
 * @param {acgraph.vector.Path} path
 * @param {acgraph.vector.Path} hoverPath
 * @param {anychart.core.ui.LabelsFactory} mainFactory
 * @param {anychart.core.ui.LabelsFactory} stateFactory
 * @param {boolean} drawLabels
 * @param {number} strokeThickness
 */
anychart.annotationsModule.FibonacciBase.prototype.drawLevel = function(levelIndex, levelValue, path, hoverPath,
                                                                       mainFactory, stateFactory, drawLabels, strokeThickness) {
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.colorize = function(state) {
  anychart.annotationsModule.FibonacciBase.base(this, 'colorize', state);
  // trend stroke defaults to a level stroke without a level
  var stroke = this.trendResolver(this, state);
  if (!goog.isDef(stroke))
    stroke = this.levelsStrokeResolver(this, state);
  this.paths[0]
      .fill(null)
      .stroke(stroke);
  this.paths[1]
      .fill(anychart.color.TRANSPARENT_HANDLER)
      .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2);
  for (var i = 0; i < this.levelPaths.length; i++) {
    this.levelPaths[i]
        .fill(null)
        .stroke(this.levelsStrokeResolver(this, state, i));
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.getColorResolutionContext = function(opt_baseColor, opt_level) {
  var res = anychart.annotationsModule.FibonacciBase.base(this, 'getColorResolutionContext', opt_baseColor, opt_level);
  if (goog.isDef(opt_level))
    res['level'] = this.levelsInternal[opt_level];
  return res;
};


//endregion
//region Labels
/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.annotationsModule.FibonacciBase.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Creates label format provider.
 * @param {number} levelRatio
 * @param {*} levelValue
 * @param {boolean} isX
 * @return {!anychart.format.Context}
 */
anychart.annotationsModule.FibonacciBase.prototype.createFormatProvider = function(levelRatio, levelValue, isX) {
  if (!this.pointProvider_)
    this.pointProvider_ = new anychart.format.Context();

  this.pointProvider_.propagate({
    'annotation': {
      value: this,
      type: anychart.enums.TokenType.UNKNOWN
    },
    'level': {
      value: levelRatio,
      type: anychart.enums.TokenType.NUMBER
    },
    'levelValue': {
      value: isX ? levelValue : this.yScale().roundToTicksPrecision(levelValue, 2),
      type: isX ? anychart.enums.TokenType.DATE_TIME : anychart.enums.TokenType.NUMBER
    },
    'rawLevelValue': {
      value: levelValue,
      type: isX ? anychart.enums.TokenType.DATE_TIME : anychart.enums.TokenType.NUMBER
    }
  });

  return this.pointProvider_;
};


/**
 * @param {number} pixY
 * @return {*}
 */
anychart.annotationsModule.FibonacciBase.prototype.getValueFromPixY = function(pixY) {
  var bounds = this.getPlot().getPlotBounds();
  var ratio = 1 - (pixY - bounds.top) / bounds.height;
  return this.yScale().inverseTransform(ratio);
};


/**
 * @param {number} pixY
 * @return {*}
 */
anychart.annotationsModule.FibonacciBase.prototype.getValueFromPixX = function(pixY) {
  var bounds = this.getPlot().getPlotBounds();
  var ratio = (pixY - bounds.left) / bounds.width;
  return this.xScale().inverseTransform(ratio);
};



/**
 * Draws a label for passed providers and index.
 * @param {number} index
 * @param {anychart.core.ui.LabelsFactory} mainFactory
 * @param {anychart.core.ui.LabelsFactory} stateFactory
 * @param {*} formatProvider
 * @param {*} positionProvider
 * @param {anychart.enums.Anchor=} opt_autoAnchor
 */
anychart.annotationsModule.FibonacciBase.prototype.drawLabel = function(index, mainFactory, stateFactory, formatProvider, positionProvider, opt_autoAnchor) {
  if (formatProvider && positionProvider) {
    var element = mainFactory.getLabel(/** @type {number} */(index));
    if (element) {
      element.formatProvider(formatProvider);
      element.positionProvider(positionProvider);
    } else {
      element = mainFactory.add(formatProvider, positionProvider, index);
    }
    element.resetSettings();
    element.currentLabelsFactory(stateFactory);
    if (opt_autoAnchor)
      element.autoAnchor(opt_autoAnchor);
    element.draw();
    var bounds = mainFactory.measureWithTransform(element);
    if (bounds && bounds.length) {
      var path = this.paths[1];
      path.moveTo(bounds[0], bounds[1]);
      for (var i = 2; i < bounds.length; i += 2) {
        path.lineTo(bounds[i], bounds[i + 1]);
      }
      path.close();
    }
  } else {
    mainFactory.clear(index);
  }
};


//endregion
//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.setDefaultSettings = function(value) {
  anychart.annotationsModule.FibonacciBase.base(this, 'setDefaultSettings', value);
  this.levels(/** @type {Array<*>} */(this.getOption('levels')));
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.serialize = function() {
  var json = anychart.annotationsModule.FibonacciBase.base(this, 'serialize');

  json['levels'] = this.levels();
  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.FibonacciBase.base(this, 'setupByJSON', config, opt_default);
  this.levels(config['levels']);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciBase.prototype.disposeInternal = function() {
  anychart.annotationsModule.FibonacciBase.base(this, 'disposeInternal');

  goog.disposeAll(this.paths);
  goog.disposeAll(this.levelPaths);
  this.paths = null;
  this.levelPaths = null;
  delete this.levelsStrokeResolver;
  delete this.trendResolver;
};


//endregion
//export
(function() {
  var proto = anychart.annotationsModule.FibonacciBase.prototype;
  proto['levels'] = proto.levels;
  //proto['labels'] = proto.labels;
  //proto['hoverLabels'] = proto.hoverLabels;
  //proto['selectLabels'] = proto.selectLabels;
})();
