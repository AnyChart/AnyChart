goog.provide('anychart.core.annotations.FibonacciFan');
goog.require('anychart.core.annotations');
goog.require('anychart.core.annotations.FibonacciBase');
goog.require('anychart.enums');



/**
 * FibonacciFan annotation.
 * @param {!anychart.core.annotations.ChartController} chartController
 * @constructor
 * @extends {anychart.core.annotations.FibonacciBase}
 */
anychart.core.annotations.FibonacciFan = function(chartController) {
  anychart.core.annotations.FibonacciFan.base(this, 'constructor', chartController);

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
   * @param {anychart.core.annotations.Base} annotation
   * @param {number} state
   * @param {number=} opt_level
   * @return {acgraph.vector.Stroke}
   */
  this.gridResolver = /** @type {function(anychart.core.annotations.Base,number,number=):acgraph.vector.Stroke} */(
      anychart.core.annotations.Base.getColorResolver(
          ['grid', 'hoverGrid', 'selectGrid'],
          anychart.enums.ColorType.STROKE));
};
goog.inherits(anychart.core.annotations.FibonacciFan, anychart.core.annotations.FibonacciBase);
anychart.core.settings.populate(anychart.core.annotations.FibonacciFan, anychart.core.annotations.GRID_DESCRIPTORS);
anychart.core.annotations.AnnotationTypes[anychart.enums.AnnotationTypes.FIBONACCI_FAN] = anychart.core.annotations.FibonacciFan;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.type = anychart.enums.AnnotationTypes.FIBONACCI_FAN;


/**
 * Time levels getter/setter.
 * @param {Array.<*>=} opt_values
 * @return {Array.<number>|anychart.core.annotations.FibonacciBase}
 */
anychart.core.annotations.FibonacciFan.prototype.timeLevels = function(opt_values) {
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


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.drawLevels = function(mainFactory, stateFactory, drawLabels) {
  var i, index;
  for (i = 0; i < this.gridPaths_.length; i++) {
    this.gridPaths_[i].clear();
  }
  anychart.core.annotations.FibonacciFan.base(this, 'drawLevels', mainFactory, stateFactory, drawLabels);
  for (i = 0, index = this.levelsInternal.length; i < this.timeLevels_.length; i++, index++) {
    var levelPath = this.levelPaths[index];
    var stroke = /** @type {acgraph.vector.Stroke} */(levelPath.stroke());
    this.drawTimeLevel(index, this.timeLevels_[i], levelPath, this.paths[1],
        mainFactory, stateFactory, drawLabels, anychart.utils.extractThickness(stroke));
  }
};


/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.drawLevel = function(levelIndex, levelValue, path, hoverPath,
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
    this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelValue), position,
        {
          'anchor': x1 < x2 ? anychart.enums.Anchor.RIGHT_CENTER : anychart.enums.Anchor.LEFT_CENTER
        });
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
anychart.core.annotations.FibonacciFan.prototype.drawTimeLevel = function(levelIndex, levelValue, path, hoverPath,
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
    this.drawLabel(levelIndex, mainFactory, stateFactory, this.createFormatProvider(levelValue), position,
        {
          'anchor': y1 < y2 ? anychart.enums.Anchor.CENTER_BOTTOM : anychart.enums.Anchor.CENTER_TOP
        });
  }
};


/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.checkVisible = function() {
  var res = anychart.core.annotations.FibonacciFan.base(this, 'checkVisible');
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
anychart.core.annotations.FibonacciFan.prototype.colorize = function(state) {
  anychart.core.annotations.FibonacciFan.base(this, 'colorize', state);
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
anychart.core.annotations.FibonacciFan.prototype.getColorResolutionContext = function(opt_baseColor, opt_level) {
  var res = {
    'sourceColor': opt_baseColor || this.getOption('color') || 'blue'
  };
  if (goog.isDef(opt_level)) {
    if (opt_level >= this.levelsInternal.length) {
      res['timeLevel'] = this.timeLevels_[opt_level - this.levelsInternal.length];
    } else {
      res['level'] = this.levelsInternal[opt_level];
    }
  }
  return res;
};


/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.resolveCustomPreDrawingStates = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_LEVELS)) {
    if (!this.levelPaths) this.levelPaths = [];
    if (!this.gridPaths_) this.gridPaths_ = [];
    var i;
    var totalLevelsCount = this.levelsInternal.length + this.timeLevels_.length;
    // creating missing paths
    for (i = this.levelPaths.length; i < totalLevelsCount; i++) {
      this.levelPaths.push(this.rootLayer.path().zIndex(anychart.core.annotations.Base.SHAPES_ZINDEX));
    }
    // disposing extra paths
    for (i = totalLevelsCount; i < this.levelPaths.length; i++) {
      goog.dispose(this.levelPaths[i]);
    }
    this.levelPaths.length = totalLevelsCount;
    // creating missing paths
    for (i = this.gridPaths_.length; i < totalLevelsCount; i++) {
      this.gridPaths_.push(this.rootLayer.path().zIndex(anychart.core.annotations.Base.SHAPES_ZINDEX));
    }
    // disposing extra paths
    for (i = totalLevelsCount; i < this.gridPaths_.length; i++) {
      goog.dispose(this.gridPaths_[i]);
    }
    this.gridPaths_.length = totalLevelsCount;
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES | anychart.ConsistencyState.ANNOTATIONS_LABELS);
    this.markConsistent(anychart.ConsistencyState.ANNOTATIONS_LEVELS);
  }
  anychart.core.annotations.FibonacciFan.base(this, 'resolveCustomPreDrawingStates');
};
//endregion


//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.setDefaultSettings = function(value) {
  anychart.core.annotations.FibonacciFan.base(this, 'setDefaultSettings', value);
  this.timeLevels(value['timeLevels']);
};


/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.serialize = function() {
  var json = anychart.core.annotations.FibonacciFan.base(this, 'serialize');

  json['timeLevels'] = this.timeLevels();
  anychart.core.settings.serialize(this, anychart.core.annotations.GRID_DESCRIPTORS, json, 'Annotation');

  return json;
};


/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.setupByJSON = function(config, opt_default) {

  this.timeLevels(config['timeLevels']);
  anychart.core.settings.deserialize(this, anychart.core.annotations.GRID_DESCRIPTORS, config);

  anychart.core.annotations.FibonacciFan.base(this, 'setupByJSON', config, opt_default);
};


/** @inheritDoc */
anychart.core.annotations.FibonacciFan.prototype.disposeInternal = function() {
  anychart.core.annotations.FibonacciFan.base(this, 'disposeInternal');

  goog.disposeAll(this.gridPaths_);
  this.gridPaths_ = null;
  delete this.gridResolver;
};
//endregion


//export
(function() {
  var proto = anychart.core.annotations.FibonacciFan.prototype;
  proto['timeLevels'] = proto.timeLevels;
})();
