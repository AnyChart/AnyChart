goog.provide('anychart.ganttModule.rendering.ShapeManager');

goog.require('acgraph');
goog.require('anychart.ganttModule.BaseGrid');

goog.require('goog.Disposable');



//region -- Constructor.
/**
 * Gantt timeline shape manager.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @param {anychart.ganttModule.elements.TimelineElement} visualElement - Visual element.
 * @param {!Array.<anychart.ganttModule.rendering.shapes.ShapeConfig>=} opt_config - Config.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.ganttModule.rendering.ShapeManager = function(timeline, visualElement, opt_config) {
  anychart.ganttModule.rendering.ShapeManager.base(this, 'constructor');

  /**
   * Related timeline.
   * @type {anychart.ganttModule.TimeLine}
   * @private
   */
  this.tl_ = timeline;

  /**
   * Visual element.
   * @type {anychart.ganttModule.elements.TimelineElement}
   * @private
   */
  this.visualElement_ = visualElement;

  /**
   * Content layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

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
   * @type {Object.<anychart.ganttModule.rendering.ShapeManager.ShapeDescriptor>}
   */
  this.defs = {};

  if (goog.isArray(opt_config)) {
    for (var i = 0; i < opt_config.length; i++) {
      var shapeConfig = opt_config[i];

      var type = shapeConfig['shapeType'];
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

      this.defs[shapeConfig['name']] = {
        zIndex: +shapeConfig['zIndex'],
        cls: cls,
        shapeType: type,
        disablePointerEvents: !!shapeConfig['disablePointerEvents']
      };
    }
  }

  /**
   *
   * @type {Object.<string, anychart.ganttModule.TimeLine.Tag>}
   * @private
   */
  this.tagsData_ = {};
};
goog.inherits(anychart.ganttModule.rendering.ShapeManager, goog.Disposable);


//endregion
//region -- Type definitions.
/**
 * @typedef {{
 *   zIndex: number,
 *   cls: function():acgraph.vector.Shape,
 *   shapeType: string,
 *   disablePointerEvents: boolean
 * }}
 */
anychart.ganttModule.rendering.ShapeManager.ShapeDescriptor;


//endregion
//region -- Internal API.
/**
 * Sets path manager container.
 * @param {acgraph.vector.Layer} value
 */
anychart.ganttModule.rendering.ShapeManager.prototype.setContainer = function(value) {
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
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item
 * @param {number} baseZIndex
 * @param {anychart.PointState} state - State.
 * @param {number=} opt_periodIndex
 * @return {acgraph.vector.Shape}
 */
anychart.ganttModule.rendering.ShapeManager.prototype.createShape = function(name, item, baseZIndex, state, opt_periodIndex) {
  var descriptor = this.defs[name];
  var shapeType = descriptor.shapeType;

  /** @type {acgraph.vector.Shape} */
  var shape;
  if (this.shapePools[shapeType].length > this.shapePoolPointers[shapeType]) {
    shape = this.shapePools[shapeType][this.shapePoolPointers[shapeType]];
  } else {
    this.shapePools[shapeType].push(shape = descriptor.cls());
  }
  this.shapePoolPointers[shapeType]++;
  this.usedShapes[shapeType].push(shape);

  return this.configureShape(name, item, baseZIndex, shape, state, opt_periodIndex);
};


/**
 *
 * @param {string} name
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item
 * @param {number} baseZIndex
 * @param {acgraph.vector.Shape} shape
 * @param {anychart.PointState} state - State.
 * @param {number=} opt_periodIndex
 * @return {acgraph.vector.Shape}
 * @protected
 */
anychart.ganttModule.rendering.ShapeManager.prototype.configureShape = function(name, item, baseZIndex, shape, state, opt_periodIndex) {
  var descriptor = this.defs[name];

  var fill = this.visualElement_.getFill(item, state, opt_periodIndex);
  var stroke = this.visualElement_.getStroke(item, state, opt_periodIndex);

  shape.fill(fill);
  shape.stroke(stroke);
  shape.setParentEventTarget(this.tl_);
  shape.disablePointerEvents(!!descriptor.disablePointerEvents);
  shape.zIndex(descriptor.zIndex + baseZIndex);

  shape.parent(this.layer);
  return shape;
};


/**
 * Clears handled paths.
 */
anychart.ganttModule.rendering.ShapeManager.prototype.clearShapes = function() {
  var type, shapes, shape, i;
  this.tagsData_ = {};
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
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item
 * @param {anychart.ganttModule.TimeLine.Tag} tag - Tag data object. NOTE: not optional because current implementation (16 Jan 2018) depends on this data a lot.
 * @param {anychart.PointState} state - State.
 * @param {Object.<string>=} opt_only If set - contains a subset of shape names that should be returned.
 * @param {number=} opt_baseZIndex - zIndex that is used as a base zIndex for all shapes of the group.
 * @param {acgraph.vector.Shape=} opt_shape Foreign shape.
 * @param {number=} opt_periodIndex - .
 * @param {number=} opt_initializerUid - UID of item that has initialized the milestone preview drawing.
 * @return {Object.<string, acgraph.vector.Shape>}
 */
anychart.ganttModule.rendering.ShapeManager.prototype.getShapesGroup = function(item, tag, state, opt_only, opt_baseZIndex, opt_shape, opt_periodIndex, opt_initializerUid) {
  var res = {};
  var names = opt_only || this.defs;
  var uid = goog.getUid(item) + '_' + tag.type + (goog.isDef(opt_periodIndex) ? ('_' + String(opt_periodIndex)) : '');

  /*
    Magic in this "if" allows to identify milestone preview by its initializer (grouping
    task that milestone preview belongs to).
    It allows to draw preview labels for each parent task, not only to closest by keeping
    the uid unique (see anychart.ganttModule.TimeLine.prototype.drawLabels_ that uses tagsData
    to draw labels).
   */
  if (tag.type == anychart.enums.TLElementTypes.MILESTONES_PREVIEW || tag.type == anychart.enums.TLElementTypes.BASELINE_MILESTONES_PREVIEW) {
    var iterItem = item;
    while (iterItem.getParent()) {
      var parent = iterItem.getParent();
      uid += ('_' + goog.getUid(parent));
      iterItem = parent;
    }

    if (goog.isDef(opt_initializerUid))
      uid += ('_' + opt_initializerUid);
  }
  this.tagsData_[uid] = tag;

  for (var name in names) {
    var descriptor = names[name];
    if (descriptor.shapeType == anychart.enums.ShapeType.NONE && opt_shape) {
      if (anychart.utils.instanceOf(opt_shape, acgraph.vector.Shape)) {
        res[name] = this.configureShape(name, item, opt_baseZIndex || 0, opt_shape, state, opt_periodIndex);
        res[name].tag = tag;
      }
    } else {
      res[name] = this.createShape(name, item, opt_baseZIndex || 0, state, opt_periodIndex);
      res[name].tag = tag;
    }
  }

  return res;
};


/**
 * Returns current tags data.
 * @return {Object.<string, anychart.ganttModule.TimeLine.Tag>}
 */
anychart.ganttModule.rendering.ShapeManager.prototype.getTagsData = function() {
  return this.tagsData_;
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.ganttModule.rendering.ShapeManager.prototype.disposeInternal = function() {
  for (var type in this.shapePools) {
    goog.disposeAll(this.shapePools[type]);
    this.shapePools[type].length = 0;
    this.usedShapes[type].length = 0;
  }

  this.layer = null;
  this.defs = null;
  this.tagsData_ = null;

  anychart.ganttModule.rendering.ShapeManager.base(this, 'disposeInternal');
};


//endregion
