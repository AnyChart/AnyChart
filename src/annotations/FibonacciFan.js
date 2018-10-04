goog.provide('anychart.annotationsModule.FibonacciFan');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.FibonacciBase');
goog.require('anychart.enums');
goog.require('anychart.format.Context');



/**
 * FibonacciFan annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.FibonacciBase}
 */
anychart.annotationsModule.FibonacciFan = function(chartController) {
  anychart.annotationsModule.FibonacciFan.base(this, 'constructor', chartController);

  /**
   * Time levels.
   * @type {Array.<number>}
   * @private
   */
  this.timeLevels_ = [];

  /**
   * Grid paths.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.gridPaths_ = null;

  /**
   * Grid resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @param {number=} opt_level
   * @return {acgraph.vector.Stroke}
   */
  this.gridResolver = /** @type {function(anychart.annotationsModule.Base,number,number=):acgraph.vector.Stroke} */(
      anychart.annotationsModule.Base.getColorResolver('grid', anychart.enums.ColorType.STROKE, true));
};
goog.inherits(anychart.annotationsModule.FibonacciFan, anychart.annotationsModule.FibonacciBase);
anychart.core.settings.populateAliases(anychart.annotationsModule.FibonacciFan, ['grid'], 'normal');
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.FIBONACCI_FAN] = anychart.annotationsModule.FibonacciFan;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.type = anychart.enums.AnnotationTypes.FIBONACCI_FAN;


/**
 * Time levels getter/setter.
 * @param {Array.<*>=} opt_values
 * @return {Array.<number>|anychart.annotationsModule.FibonacciBase}
 */
anychart.annotationsModule.FibonacciFan.prototype.timeLevels = function(opt_values) {
  if (goog.isDef(opt_values)) {
    if (goog.isArray(opt_values)) {
      this.timeLevels_.length = 0;
      for (var i = 0; i < opt_values.length; i++) {
        var value = anychart.utils.toNumber(opt_values[i]);
        if (!isNaN(value))
          this.timeLevels_.push(value);
      }
      this.invalidate(
          anychart.ConsistencyState.ANNOTATIONS_LEVELS |
          anychart.ConsistencyState.ANNOTATIONS_SHAPES |
          anychart.ConsistencyState.ANNOTATIONS_LABELS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return goog.array.slice(this.timeLevels_, 0);
};


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.FibonacciFan.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(base, anychart.annotationsModule.GRID_DESCRIPTORS_META);
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.drawLevels = function(mainFactory, stateFactory, drawLabels) {
  var i, index;
  for (i = 0; i < this.gridPaths_.length; i++) {
    this.gridPaths_[i].clear();
  }
  anychart.annotationsModule.FibonacciFan.base(this, 'drawLevels', mainFactory, stateFactory, drawLabels);
  for (i = 0, index = this.levelsInternal.length; i < this.timeLevels_.length; i++, index++) {
    var levelPath = this.levelPaths[index];
    var stroke = /** @type {acgraph.vector.Stroke} */(levelPath.stroke());
    this.drawTimeLevel(index, this.timeLevels_[i], levelPath, this.paths[1],
        mainFactory, stateFactory, drawLabels, anychart.utils.extractThickness(stroke));
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.drawLevel = function(levelIndex, levelValue, path, hoverPath,
                                                                      mainFactory, stateFactory, drawLabels,
                                                                      strokeThickness) {
  var x1 = this.coords['xAnchor'];
  var y1 = this.coords['valueAnchor'];
  var x2 = this.coords['secondXAnchor'];
  var y2 = this.coords['secondValueAnchor'];
  var baseHeight = y2 - y1;
  var y = y1 + baseHeight * levelValue;
  var gridPath = this.gridPaths_[levelIndex];
  var gridStroke = /** @type {acgraph.vector.Stroke} */(gridPath.stroke());
  y2 = y;
  if (y1 == y2) {
    y2 = y1 = anychart.utils.applyPixelShift(y1, strokeThickness);
  }
  y = anychart.utils.applyPixelShift(y, anychart.utils.extractThickness(gridStroke));
  var line = anychart.math.clipRayByRect(x1, y1, x2, y2, this.pixelBoundsCache);
  var grid = anychart.math.clipSegmentByRect(x1, y, x2, y, this.pixelBoundsCache);
  if (line) {
    path.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
    hoverPath.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
  }
  if (grid) {
    gridPath.moveTo(grid[0], grid[1]).lineTo(grid[2], grid[3]);
    hoverPath.moveTo(grid[0], grid[1]).lineTo(grid[2], grid[3]);
  }

  if (drawLabels && this.pixelBoundsCache.left <= x1 && x1 <= this.pixelBoundsCache.getRight()) {
    var position = {'value': {'x': x1, 'y': y}};
    this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelValue, this.getValueFromPixY(y), false), position,
        x1 < x2 ? anychart.enums.Anchor.RIGHT_CENTER : anychart.enums.Anchor.LEFT_CENTER);
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
anychart.annotationsModule.FibonacciFan.prototype.drawTimeLevel = function(levelIndex, levelValue, path, hoverPath,
                                                                          mainFactory, stateFactory, drawLabels,
                                                                          strokeThickness) {
  var x1 = this.coords['xAnchor'];
  var y1 = this.coords['valueAnchor'];
  var x2 = this.coords['secondXAnchor'];
  var y2 = this.coords['secondValueAnchor'];
  var baseWidth = x2 - x1;
  var x = x1 + baseWidth * levelValue;
  var gridPath = this.gridPaths_[levelIndex];
  var gridStroke = /** @type {acgraph.vector.Stroke} */(gridPath.stroke());
  x2 = x;
  if (x1 == x2) {
    x2 = x1 = anychart.utils.applyPixelShift(x1, strokeThickness);
  }
  x = anychart.utils.applyPixelShift(x, anychart.utils.extractThickness(gridStroke));
  var line = anychart.math.clipRayByRect(x1, y1, x2, y2, this.pixelBoundsCache);
  var grid = anychart.math.clipSegmentByRect(x, y1, x, y2, this.pixelBoundsCache);
  if (line) {
    path.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
    hoverPath.moveTo(line[0], line[1]).lineTo(line[2], line[3]);
  }
  if (grid) {
    gridPath.moveTo(grid[0], grid[1]).lineTo(grid[2], grid[3]);
    hoverPath.moveTo(grid[0], grid[1]).lineTo(grid[2], grid[3]);
  }

  if (drawLabels && this.pixelBoundsCache.left <= x && x <= this.pixelBoundsCache.getRight()) {
    var position = {'value': {'x': x, 'y': y1}};
    this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelValue, this.getValueFromPixX(x), true), position,
        y1 < y2 ? anychart.enums.Anchor.CENTER_BOTTOM : anychart.enums.Anchor.CENTER_TOP);
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.checkVisible = function() {
  var res = anychart.annotationsModule.FibonacciFan.base(this, 'checkVisible');
  if (!res) {
    var x1 = this.coords['xAnchor'];
    var x2 = this.coords['secondXAnchor'];
    var dx = x2 - x1;
    res = !isNaN(dx) && !((x1 < this.pixelBoundsCache.left && dx <= 0) ||
        (x1 > this.pixelBoundsCache.getRight() && dx >= 0));
  }
  return res;
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.colorize = function(state) {
  anychart.annotationsModule.FibonacciFan.base(this, 'colorize', state);
  // trend stroke defaults to a level stroke without a level
  for (var i = 0; i < this.gridPaths_.length; i++) {
    var stroke = this.gridResolver(this, state, i);
    if (!goog.isDef(stroke))
      stroke = this.levelsStrokeResolver(this, state, i);
    this.gridPaths_[i]
        .fill(null)
        .stroke(stroke);
  }
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.getColorResolutionContext = function(opt_baseColor, opt_level) {
  var res = {
    'sourceColor': opt_baseColor || this.getOption('color') || 'blue'
  };
  if (goog.isDef(opt_level)) {
    res['isTimeLevel'] = opt_level >= this.levelsInternal.length;
    var levelRatio = res['isTimeLevel'] ? this.timeLevels_[opt_level - this.levelsInternal.length] : this.levelsInternal[opt_level];
    res['levelRatio'] = levelRatio;
    if (res['isTimeLevel']) {
      res['timeLevel'] = levelRatio;
    } else {
      res['level'] = levelRatio;
    }
  }
  return res;
};


/**
 * Creates label format provider.
 * @param {number} levelRatio
 * @param {*} levelValue
 * @param {boolean} isX
 * @return {!anychart.format.Context}
 */
anychart.annotationsModule.FibonacciFan.prototype.createFormatProvider = function(levelRatio, levelValue, isX) {
  if (!this.pointProvider_)
    this.pointProvider_ = new anychart.format.Context();

  var context = {
    'annotation': {
      value: this,
      type: anychart.enums.TokenType.UNKNOWN
    },
    'level': {
      value: levelRatio,
      type: anychart.enums.TokenType.NUMBER
    },
    'levelRatio': {
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
  };

  context['isTimeLevel'] = {
    value: isX,
    type: anychart.enums.TokenType.UNKNOWN
  };

  this.pointProvider_.propagate(context);

  return this.pointProvider_;
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.resolveCustomPreDrawingStates = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_LEVELS)) {
    if (!this.levelPaths) this.levelPaths = [];
    if (!this.gridPaths_) this.gridPaths_ = [];
    var i;
    var totalLevelsCount = this.levelsInternal.length + this.timeLevels_.length;
    // creating missing paths
    for (i = this.levelPaths.length; i < totalLevelsCount; i++) {
      this.levelPaths.push(this.rootLayer.path().zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX));
    }
    // disposing extra paths
    for (i = totalLevelsCount; i < this.levelPaths.length; i++) {
      goog.dispose(this.levelPaths[i]);
    }
    this.levelPaths.length = totalLevelsCount;
    // creating missing paths
    for (i = this.gridPaths_.length; i < totalLevelsCount; i++) {
      this.gridPaths_.push(this.rootLayer.path().zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX));
    }
    // disposing extra paths
    for (i = totalLevelsCount; i < this.gridPaths_.length; i++) {
      goog.dispose(this.gridPaths_[i]);
    }
    this.gridPaths_.length = totalLevelsCount;
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES | anychart.ConsistencyState.ANNOTATIONS_LABELS);
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_LEVELS);
  }
  anychart.annotationsModule.FibonacciFan.base(this, 'resolveCustomPreDrawingStates');
};


//endregion
//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.setDefaultSettings = function(value) {
  anychart.annotationsModule.FibonacciFan.base(this, 'setDefaultSettings', value);
  this.timeLevels(/** @type {Array<*>} */(this.getOption('timeLevels')));
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.serialize = function() {
  var json = anychart.annotationsModule.FibonacciFan.base(this, 'serialize');
  json['timeLevels'] = this.timeLevels();
  return json;
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.FibonacciFan.base(this, 'setupByJSON', config, opt_default);
  this.timeLevels(config['timeLevels']);
};


/** @inheritDoc */
anychart.annotationsModule.FibonacciFan.prototype.disposeInternal = function() {
  anychart.annotationsModule.FibonacciFan.base(this, 'disposeInternal');

  goog.disposeAll(this.gridPaths_);
  this.gridPaths_ = null;
  delete this.gridResolver;
};


//endregion
//export
(function() {
  var proto = anychart.annotationsModule.FibonacciFan.prototype;
  proto['timeLevels'] = proto.timeLevels;
})();
