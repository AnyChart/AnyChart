goog.provide('anychart.ganttModule.rendering.Context');



/**
 *
 * @param {anychart.ganttModule.elements.TimelineElement} element - Related element.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Related data item.
 * @param {anychart.math.Rect} predictedBounds - Default predicted bounds to display element.
 * @param {Object} tag - Tag data object. NOTE: not optional because current implementation (16 Jan 2018) depends on this data a lot.
 * @param {number=} opt_periodIndex - Period index for resources timeline.
 * @param {boolean=} opt_selected - Whether is selected. TODO (A.Kudryavtsev): Replace this with State in future implementation.
 * @param {number=} opt_initializerUid - UID of item that has initialized the milestone preview drawing.
 * @constructor
 */
anychart.ganttModule.rendering.Context = function(element, item, predictedBounds, tag, opt_periodIndex, opt_selected, opt_initializerUid) {
  /**
   *
   * @type {anychart.ganttModule.elements.TimelineElement}
   */
  this.element = element;

  /**
   *
   * @type {Object}
   */
  this.tag = tag;

  /**
   *
   * @type {number|undefined}
   */
  this.initializerUid = opt_initializerUid;

  /**
   *
   * @type {anychart.math.Rect}
   */
  this['predictedBounds'] = predictedBounds;

  /**
   *
   * @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
   */
  this['item'] = item;
  var state = opt_selected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;

  this['shapes'] = this.element.shapeManager.getShapesGroup(item, tag, state, void 0, void 0, void 0, opt_periodIndex, opt_initializerUid);

  if (goog.isDef(opt_periodIndex)) {
    /**
     *
     * @type {number}
     */
    this['periodIndex'] = opt_periodIndex;

    /**
     *
     * @type {Object}
     */
    this['period'] = item.get(anychart.enums.GanttDataFields.PERIODS, opt_periodIndex);
  }

  var type = element.getType();
  if (type == anychart.enums.TLElementTypes.MILESTONES_PREVIEW || type == anychart.enums.TLElementTypes.MILESTONES) {
    var pointSetting = element.getPointSettings(item, opt_periodIndex);
    if (pointSetting) pointSetting = pointSetting['markerType'];
    this['markerType'] = pointSetting || element.getOption('markerType');
  }
};


/**
 * Generates a shapes group.
 * @param {anychart.PointState} state - State.
 * @param {Object.<string>=} opt_only If set - contains a subset of shape names that should be returned.
 * @param {number=} opt_baseZIndex - zIndex that is used as a base zIndex for all shapes of the group.
 * @param {acgraph.vector.Shape=} opt_shape Foreign shape.
 * @return {Object.<string, acgraph.vector.Shape>}
 */
anychart.ganttModule.rendering.Context.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex, opt_shape) {
  return this.element.shapeManager.getShapesGroup(this['item'], this.tag, state, opt_only, opt_baseZIndex, opt_shape, this['periodIndex'], this.initializerUid);
};
