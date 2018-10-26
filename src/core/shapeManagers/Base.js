goog.provide('anychart.core.shapeManagers.Base');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.shapeManagers');
goog.require('goog.Disposable');



/**
 * Series paths manager.
 * @param {anychart.core.IShapeManagerUser} series
 * @param {!Array.<anychart.core.shapeManagers.ShapeConfig>} config
 * @param {boolean} interactive
 * @param {?string=} opt_shapesFieldName
 * @param {?function(anychart.core.IShapeManagerUser, Object.<string, acgraph.vector.Shape>, number)=} opt_postProcessor
 * @param {boolean=} opt_disableStrokeScaling
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.shapeManagers.Base = function(series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling) {
  anychart.core.shapeManagers.Base.base(this, 'constructor');

  /**
   * A name of a series meta field where the shape manager should write
   * @type {string}
   */
  this.shapesFieldName = opt_shapesFieldName || 'shapes';

  /**
   * A post processor function to make complex coloring on shapes.
   * @type {function(anychart.core.IShapeManagerUser, Object.<string, acgraph.vector.Shape>, number)}
   * @protected
   */
  this.postProcessor = opt_postProcessor || goog.nullFunction;

  /**
   * Series reference
   * @type {anychart.core.IShapeManagerUser}
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

  /**
   * Whether to disable stroke scaling.
   * @type {boolean}
   * @private
   */
  this.disableStrokeScaling_ = !!opt_disableStrokeScaling;

  for (var i = 0; i < config.length; i++) {
    var shapeConfig = config[i];
    var fill = anychart.color.getColorResolver(shapeConfig.fillName,
        shapeConfig.isHatchFill ? anychart.enums.ColorType.HATCH_FILL : anychart.enums.ColorType.FILL,
        shapeConfig.canBeHoveredSelected, shapeConfig.scrollerSelected);
    var stroke = anychart.color.getColorResolver(shapeConfig.strokeName,
        anychart.enums.ColorType.STROKE, shapeConfig.canBeHoveredSelected, shapeConfig.scrollerSelected);
    var type = shapeConfig.shapeType;
    var val = String(type).toLowerCase();
    var cls;
    switch (val) {
      case anychart.enums.ShapeType.NONE:
        cls = null;
        break;
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
      shapeType: type,
      fillName: shapeConfig.fillName,
      strokeName: shapeConfig.strokeName
    };
  }
};
goog.inherits(anychart.core.shapeManagers.Base, goog.Disposable);


/**
 * @typedef {{
 *   fill: function(anychart.core.IShapeManagerUser, number, boolean=, boolean=, string=):acgraph.vector.AnyColor,
 *   stroke: function(anychart.core.IShapeManagerUser, number, boolean=, boolean=, string=):acgraph.vector.AnyColor,
 *   zIndex: (number),
 *   isHatchFill: boolean,
 *   cls: function():acgraph.vector.Shape,
 *   shapeType: string,
 *   fillName: string,
 *   strokeName: string
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

  return this.configureShape(name, state, indexOrGlobal, baseZIndex, shape, true);
};


/**
 *
 * @param {string} name
 * @param {number} state
 * @param {number|boolean} indexOrGlobal
 * @param {number} baseZIndex
 * @param {acgraph.vector.Shape} shape
 * @param {boolean=} opt_needLayer
 * @return {acgraph.vector.Shape}
 * @protected
 */
anychart.core.shapeManagers.Base.prototype.configureShape = function(name, state, indexOrGlobal, baseZIndex, shape, opt_needLayer) {
  var descriptor = this.defs[name];

  var fill = /** @type {acgraph.vector.Fill|acgraph.vector.PatternFill} */(descriptor.fill(this.series, state));
  var stroke = /** @type {acgraph.vector.Stroke} */(descriptor.stroke(this.series, state));

  shape.fill(fill);
  shape.stroke(stroke);
  shape.disableStrokeScaling(this.disableStrokeScaling_);
  shape.zIndex(descriptor.zIndex + baseZIndex);

  if (this.addInterctivityInfo) {
    this.setupInteractivity(shape, descriptor.isHatchFill, indexOrGlobal);
  }

  if (!descriptor.isHatchFill) {
    var names = {};
    names[name] = descriptor;
    this.updateMetaColors(fill, stroke, names, state);
  }

  var fillCondition = !(fill ||
      (state != anychart.PointState.NORMAL && descriptor.fill(this.series, anychart.PointState.NORMAL)) ||
      (state != anychart.PointState.HOVER && descriptor.fill(this.series, anychart.PointState.HOVER)) ||
      (state != anychart.PointState.SELECT && descriptor.fill(this.series, anychart.PointState.SELECT)));

  var layerCondition = opt_needLayer ? descriptor.isHatchFill && fillCondition : descriptor.isHatchFill;

  if (layerCondition) {
    if (fillCondition) {
      shape.parent(null);
    } else {
      shape.parent(this.layer);
    }
  } else if (opt_needLayer) {
    shape.parent(this.layer);
  }
  return shape;
};


/**
 * Clears handled paths.
 */
anychart.core.shapeManagers.Base.prototype.clearShapes = function() {
  var type, shapes, shape, i;
  for (type in this.usedShapes) {
    shapes = this.usedShapes[type];
    for (i = 0; i < shapes.length; i++) {
      shape = shapes[i];
      shape.parent(null);
      if (anychart.utils.instanceOf(shape, acgraph.vector.Path)) {
        shape.clear();
        shape.setTransformationMatrix(1, 0, 0, 1, 0, 0);
      }
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
 * @param {acgraph.vector.Shape=} opt_shape Foreign shape.
 * @return {Object.<string, acgraph.vector.Shape>}
 */
anychart.core.shapeManagers.Base.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex, opt_shape) {
  return this.getShapesGroupInternal(state, opt_only, opt_baseZIndex, opt_shape);
};


/**
 * getShapesGroup method for internal usage.
 * @param {number} state - Shapes group state.
 * @param {Object.<string>=} opt_only If set - contains a subset of shape names that should be returned.
 * @param {number=} opt_baseZIndex - zIndex that is used as a base zIndex for all shapes of the group.
 * @param {acgraph.vector.Shape=} opt_shape Foreign shape.
 * @return {Object.<string, acgraph.vector.Shape>}
 */
anychart.core.shapeManagers.Base.prototype.getShapesGroupInternal = function(state, opt_only, opt_baseZIndex, opt_shape) {
  var res = {};
  var names = opt_only || this.defs;
  var atPoint = this.series.isDiscreteBased();
  var indexOrGlobal;
  if (atPoint) {
    indexOrGlobal = this.series.getIterator().getIndex();
  } else {
    indexOrGlobal = true;
  }
  for (var name in names) {
    var descriptor = names[name];
    if (descriptor.shapeType == anychart.enums.ShapeType.NONE && opt_shape) {
      if (anychart.utils.instanceOf(opt_shape, acgraph.vector.Shape))
        res[name] = this.configureShape(name, state, indexOrGlobal, opt_baseZIndex || 0, opt_shape);
    } else {
      res[name] = this.createShape(name, state, indexOrGlobal, opt_baseZIndex || 0);
    }
  }
  this.postProcessor(this.series, res, state);
  return res;
};


/**
 * Returns a new object with all defined paths for the next point.
 * @param {number} state - Shapes group state.
 * @param {number=} opt_baseZIndex - zIndex that is used as a base zIndex for all shapes of the group.
 * @return {Object.<string, acgraph.vector.Shape>}
 */
anychart.core.shapeManagers.Base.prototype.addShapesGroup = function(state, opt_baseZIndex) {
  return this.getShapesGroup(state, undefined, opt_baseZIndex);
};


/**
 * Updates z indexed for the passed shapes group.
 * @param {number} newBaseZIndex
 * @param {(Object.<string, acgraph.vector.Shape>|Array.<Object.<string, acgraph.vector.Shape>>)=} opt_shapesGroup
 */
anychart.core.shapeManagers.Base.prototype.updateZIndex = function(newBaseZIndex, opt_shapesGroup) {
  if (goog.isArray(opt_shapesGroup)) {
    for (var i = 0; i < opt_shapesGroup.length; i++) {
      this.updateZIndex(newBaseZIndex, opt_shapesGroup[i]);
    }
  } else if (opt_shapesGroup) {
    for (var name in opt_shapesGroup) {
      opt_shapesGroup[name].zIndex(this.defs[name].zIndex + newBaseZIndex);
    }
  }
};


/**
 * Updates coloring for the passed shapes group.
 * @param {number} state
 * @param {(Object.<string, acgraph.vector.Shape>|Array.<Object.<string, acgraph.vector.Shape>>)=} opt_shapesGroup
 */
anychart.core.shapeManagers.Base.prototype.updateColors = function(state, opt_shapesGroup) {
  if (goog.isArray(opt_shapesGroup)) {
    for (var i = 0; i < opt_shapesGroup.length; i++) {
      this.updateColors_(state, opt_shapesGroup[i]);
    }
  } else if (opt_shapesGroup) {
    this.updateColors_(state, opt_shapesGroup);
  }
};


/**
 * Updates coloring for the passed shapes group.
 * @param {number} state
 * @param {Object.<string, acgraph.vector.Shape>} shapesGroup
 * @private
 */
anychart.core.shapeManagers.Base.prototype.updateColors_ = function(state, shapesGroup) {
  for (var name in shapesGroup) {
    var descriptor = this.defs[name]; // if it is undefined - something went wrong
    var shape = shapesGroup[name];

    var fill = /** @type {acgraph.vector.Fill|acgraph.vector.PatternFill} */(descriptor.fill(this.series, state));
    var stroke = /** @type {acgraph.vector.Stroke} */(descriptor.stroke(this.series, state));
    shape.fill(fill);
    shape.stroke(stroke);

    // we want to avoid adding invisible hatchFill shapes to the layer.
    if (descriptor.isHatchFill) {
      if (shape.fill() == 'none' && shape.stroke() == 'none') {
        shape.visible(false);
      } else {
        shape.visible(true);
      }
    }

    if (!descriptor.isHatchFill) {
      this.updateMetaColors(fill, stroke, shapesGroup, state);
    }
  }
  this.postProcessor(this.series, shapesGroup, state);
};


/**
 * @param {(acgraph.vector.Fill|acgraph.vector.PatternFill)=} opt_fill .
 * @param {acgraph.vector.Stroke=} opt_stroke .
 * @param {Object.<string, *>=} opt_only If set - contains a subset of shape names.
 * @param {number=} opt_state .
 */
anychart.core.shapeManagers.Base.prototype.updateMetaColors = function(opt_fill, opt_stroke, opt_only, opt_state) {
  var iterator = this.series.getIterator();
  if (goog.isDef(opt_fill))
    iterator.meta('fill', opt_fill);
  if (goog.isDef(opt_stroke))
    iterator.meta('stroke', opt_stroke);
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
