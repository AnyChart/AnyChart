goog.provide('anychart.core.shapeManagers.Base');
goog.require('acgraph');
goog.require('anychart.core.shapeManagers');
goog.require('goog.Disposable');



/**
 * Series paths manager.
 * @param {anychart.core.series.Base} series
 * @param {!Array.<anychart.core.shapeManagers.ShapeConfig>} config
 * @param {boolean} interactive
 * @param {?string=} opt_shapesFieldName
 * @param {?function(anychart.core.series.Base, Object.<string, acgraph.vector.Shape>, number)=} opt_postProcessor
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.shapeManagers.Base = function(series, config, interactive, opt_shapesFieldName, opt_postProcessor) {
  anychart.core.shapeManagers.Base.base(this, 'constructor');

  /**
   * A name of a series meta field where the shape manager should write
   * @type {string}
   * @protected
   */
  this.shapesFieldName = opt_shapesFieldName || 'shapes';

  /**
   * A post processor function to make complex coloring on shapes.
   * @type {function(anychart.core.series.Base, Object.<string, acgraph.vector.Shape>, number)}
   * @protected
   */
  this.postProcessor = opt_postProcessor || goog.nullFunction;

  /**
   * Series reference
   * @type {anychart.core.series.Base}
   * @protected
   */
  this.series = series;

  /**
   * Parent layer.
   * @type {acgraph.vector.Layer}
   * @protected
   */
  this.layer = null;

  /**
   * If the manager should produce interactive shapes.
   * @type {boolean}
   * @protected
   */
  this.addInterctivityInfo = interactive;

  /**
   * Used shapes by type.
   * @type {!Object.<string, !Array.<acgraph.vector.Shape>>}
   */
  this.usedShapes = {};

  /**
   * Shapes pool by type.
   * @type {!Object.<string, !Array.<acgraph.vector.Shape>>}
   */
  this.shapePools = {};

  /**
   * Shape pool pointers by shape type.
   * @type {!Object.<string, number>}
   */
  this.shapePoolPointers = {};

  /**
   * Shape definitions storage.
   * @type {Object.<anychart.core.shapeManagers.Base.ShapeDescriptor>}
   */
  this.defs = {};

  for (var i = 0; i < config.length; i++) {
    var shapeConfig = config[i];
    var fill = anychart.core.series.Base.getColorResolver(shapeConfig.fillNames,
        shapeConfig.isHatchFill ? anychart.enums.ColorType.HATCH_FILL : anychart.enums.ColorType.FILL);
    var stroke = anychart.core.series.Base.getColorResolver(shapeConfig.strokeNames, anychart.enums.ColorType.STROKE);
    var type = shapeConfig.shapeType;
    var val = String(type).toLowerCase();
    var cls;
    switch (val) {
      case anychart.enums.ShapeType.RECT:
        cls = acgraph.rect;
        break;
      case anychart.enums.ShapeType.CIRCLE:
        cls = acgraph.circle;
        break;
      case anychart.enums.ShapeType.ELLIPSE:
        cls = acgraph.ellipse;
        break;
        // case 'path':
      default:
        cls = acgraph.path;
        break;
    }
    if (!this.usedShapes[type]) {
      this.usedShapes[type] = [];
      this.shapePools[type] = [];
      this.shapePoolPointers[type] = 0;
    }
    this.defs[shapeConfig.name] = {
      fill: fill,
      stroke: stroke,
      zIndex: +shapeConfig.zIndex,
      isHatchFill: shapeConfig.isHatchFill,
      cls: cls,
      shapeType: type
    };
  }
};
goog.inherits(anychart.core.shapeManagers.Base, goog.Disposable);


/**
 * @typedef {{
 *   fill: function(anychart.core.series.Base, number):acgraph.vector.AnyColor,
 *   stroke: function(anychart.core.series.Base, number):acgraph.vector.AnyColor,
 *   zIndex: (number),
 *   isHatchFill: boolean,
 *   cls: function():acgraph.vector.Shape,
 *   shapeType: string
 * }}
 */
anychart.core.shapeManagers.Base.ShapeDescriptor;


/**
 * Checks if current shapeManager shapes configuration conforms passed shape requirements.
 * @param {Object.<string, anychart.enums.ShapeType>} requiredShapes
 * @return {boolean}
 */
anychart.core.shapeManagers.Base.prototype.checkRequirements = function(requiredShapes) {
  for (var i in requiredShapes) {
    var def = this.defs[i];
    if (!def || def.shapeType != requiredShapes[i])
      return false;
  }
  return true;
};


/**
 * Makes passed shape interactive.
 * @param {acgraph.vector.Shape} shape
 * @param {boolean} nonInteractive
 * @param {number|boolean} indexOrGlobal
 */
anychart.core.shapeManagers.Base.prototype.setupInteractivity = function(shape, nonInteractive, indexOrGlobal) {
  if (shape) {
    if (nonInteractive) {
      delete shape.tag;
    } else {
      shape.tag = {
        series: this.series,
        index: indexOrGlobal
      };
    }
    shape.disablePointerEvents(nonInteractive);
  }
};


/**
 * Sets path manager container.
 * @param {acgraph.vector.Layer} value
 */
anychart.core.shapeManagers.Base.prototype.setContainer = function(value) {
  if (this.layer != value) {
    this.layer = value;
    for (var type in this.usedShapes) {
      var shapes = this.usedShapes[type];
      for (var i = 0; i < shapes.length; i++) {
        shapes[i].parent(value);
      }
    }
  }
};


/**
 * Creates a shape by the name of the descriptor and shape state.
 * @param {string} name
 * @param {number} state
 * @param {number|boolean} indexOrGlobal
 * @param {number} baseZIndex
 * @return {acgraph.vector.Shape}
 * @protected
 */
anychart.core.shapeManagers.Base.prototype.createShape = function(name, state, indexOrGlobal, baseZIndex) {
  var descriptor = this.defs[name];
  var shapeType = descriptor.shapeType;
  /** @type {acgraph.vector.Shape} */
  var shape;
  // we use pool in a bit different manner - the pool is a global storage of all shapes created by the manager
  // and we manage the reusage using a pointer to an element we can reuse next.
  if (this.shapePools[shapeType].length > this.shapePoolPointers[shapeType]) {
    shape = this.shapePools[shapeType][this.shapePoolPointers[shapeType]];
  } else {
    this.shapePools[shapeType].push(shape = descriptor.cls());
  }
  this.shapePoolPointers[shapeType]++;
  this.usedShapes[shapeType].push(shape);
  var fill = /** @type {acgraph.vector.Fill|acgraph.vector.PatternFill} */(descriptor.fill(this.series, state));
  shape.fill(fill);
  shape.stroke(/** @type {acgraph.vector.Stroke} */(descriptor.stroke(this.series, state)));
  shape.zIndex(descriptor.zIndex + baseZIndex);
  if (this.addInterctivityInfo)
    this.setupInteractivity(shape, descriptor.isHatchFill, indexOrGlobal);

  // we want to avoid adding invisible hatchFill shapes to the layer.
  if (descriptor.isHatchFill && !(
      fill ||
      (state != anychart.PointState.NORMAL && descriptor.fill(this.series, anychart.PointState.NORMAL)) ||
      (state != anychart.PointState.HOVER && descriptor.fill(this.series, anychart.PointState.HOVER)) ||
      (state != anychart.PointState.SELECT && descriptor.fill(this.series, anychart.PointState.SELECT)))) {
    shape.parent(null);
  } else {
    shape.parent(this.layer);
  }
  return shape;
};


/**
 * Clears handled paths.
 */
anychart.core.shapeManagers.Base.prototype.clearShapes = function() {
  for (var type in this.usedShapes) {
    var shapes = this.usedShapes[type];
    for (var i = 0; i < shapes.length; i++) {
      var shape = shapes[i];
      shape.parent(null);
      if (shape instanceof acgraph.vector.Path)
        shape.clear();
    }
    this.shapePoolPointers[type] = 0;
    shapes.length = 0;
  }
};


/**
 * Returns an object with all defined paths for the next point.
 * @param {number} state - Shapes group state.
 * @param {Object.<string>=} opt_only If set - contains a subset of shape names that should be returned.
 * @param {number=} opt_baseZIndex - zIndex that is used as a base zIndex for all shapes of the group.
 * @return {Object.<string, acgraph.vector.Shape>}
 */
anychart.core.shapeManagers.Base.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex) {
  var res = {};
  var names = opt_only || this.defs;
  var atPoint = this.series.isDiscreteBased();
  var iterator, indexOrGlobal;
  if (atPoint) {
    iterator = this.series.getIterator();
    indexOrGlobal = iterator.getIndex();
  } else {
    iterator = null;
    indexOrGlobal = true;
  }
  for (var name in names) {
    res[name] = this.createShape(name, state, indexOrGlobal, opt_baseZIndex || 0);
  }
  this.postProcessor(this.series, res, state);
  if (iterator)
    iterator.meta(this.shapesFieldName, res);
  return res;
};


/**
 * Updates z indexed for the passed shapes group.
 * @param {number} newBaseZIndex
 * @param {Object.<string, acgraph.vector.Shape>=} opt_shapesGroup
 */
anychart.core.shapeManagers.Base.prototype.updateZIndex = function(newBaseZIndex, opt_shapesGroup) {
  if (opt_shapesGroup)
    for (var name in opt_shapesGroup) {
      var descriptor = this.defs[name]; // if it is undefined - something went wrong
      opt_shapesGroup[name].zIndex(descriptor.zIndex + newBaseZIndex);
    }
};


/**
 * Updates coloring for the passed shapes group.
 * @param {number} state
 * @param {Object.<string, acgraph.vector.Shape>=} opt_shapesGroup
 */
anychart.core.shapeManagers.Base.prototype.updateColors = function(state, opt_shapesGroup) {
  if (opt_shapesGroup) {
    for (var name in opt_shapesGroup) {
      var descriptor = this.defs[name]; // if it is undefined - something went wrong
      var shape = opt_shapesGroup[name];
      shape.fill(/** @type {acgraph.vector.Fill|acgraph.vector.PatternFill} */(descriptor.fill(this.series, state)));
      shape.stroke(/** @type {acgraph.vector.Stroke} */(descriptor.stroke(this.series, state)));
      // we want to avoid adding invisible hatchFill shapes to the layer.
      if (descriptor.isHatchFill) {
        if (shape.fill() == 'none' && shape.stroke() == 'none') {
          shape.visible(false);
        } else {
          shape.visible(true);
        }
      }
    }
    this.postProcessor(this.series, opt_shapesGroup, state);
  }
};


/**
 * Replaces original shape descriptor zIndex with a new one.
 * @param {string} name
 * @param {number} newZIndex
 */
anychart.core.shapeManagers.Base.prototype.replaceZIndex = function(name, newZIndex) {
  var descriptor = this.defs[name];
  if (descriptor)
    descriptor.zIndex = newZIndex;
};


/**
 * Apply clip to shape. Used for 3d shapes.
 * @param {acgraph.vector.Clip} clipElement
 */
anychart.core.shapeManagers.Base.prototype.applyClip = function(clipElement) {
  for (var type in this.usedShapes) {
    var shapes = this.usedShapes[type];
    for (var i = 0; i < shapes.length; i++) {
      shapes[i].clip(clipElement);
    }
  }
};


/** @inheritDoc */
anychart.core.shapeManagers.Base.prototype.disposeInternal = function() {
  for (var type in this.shapePools) {
    goog.disposeAll(this.shapePools[type]);
    this.shapePools[type].length = 0;
    this.usedShapes[type].length = 0;
  }
  this.layer = null;
  this.defs = null;
  anychart.core.shapeManagers.Base.base(this, 'disposeInternal');
};
