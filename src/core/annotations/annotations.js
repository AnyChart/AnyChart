goog.provide('anychart.core.annotations');

goog.require('anychart.core.settings');
goog.require('anychart.enums');


/**
 * Annotation property descriptor.
 * @typedef {{
 *    handler: number,
 *    propName: string,
 *    normalizer: Function,
 *    consistency: (anychart.ConsistencyState|number),
 *    signal: number
 * }}
 */
anychart.core.annotations.PropertyDescriptor;


/**
 * A set of possible anchor dependencies:
 *    1st bit is for the first X,
 *    2nd bit is for the first Y,
 *    3rd bit is for the second point,
 *    4th bit is for the third point
 * @enum {number}
 */
anychart.core.annotations.AnchorSupport = {
  NONE: 0, // for base
  X: 1,
  VALUE: 2,
  SECOND_POINT: 4,
  THIRD_POINT: 8,
  ONE_POINT: 3,
  TWO_POINTS: 7,
  THREE_POINTS: 15
};


/**
 * Annotation constructors by type.
 * @type {Object.<anychart.enums.AnnotationTypes, Function>}
 */
anychart.core.annotations.AnnotationTypes = {};


/**
 * @typedef {{
 *    color: acgraph.vector.AnyColor,
 *    allowEdit: boolean,
 *    hoverGap: number,
 *    xAnchor: number,
 *    valueAnchor: number,
 *    secondXAnchor: number,
 *    secondValueAnchor: number,
 *    thirdXAnchor: number,
 *    thirdValueAnchor: number,
 *    stroke: (acgraph.vector.Stroke|Function),
 *    hoverStroke: (acgraph.vector.Stroke|Function),
 *    selectStroke: (acgraph.vector.Stroke|Function),
 *    trend: (acgraph.vector.Stroke|Function),
 *    hoverTrend: (acgraph.vector.Stroke|Function),
 *    selectTrend: (acgraph.vector.Stroke|Function),
 *    grid: (acgraph.vector.Stroke|Function),
 *    hoverGrid: (acgraph.vector.Stroke|Function),
 *    selectGrid: (acgraph.vector.Stroke|Function),
 *    fill: (acgraph.vector.Fill|Function),
 *    hoverFill: (acgraph.vector.Fill|Function),
 *    selectFill: (acgraph.vector.Fill|Function),
 *    hatchFill: (acgraph.vector.PatternFill|Function),
 *    hoverHatchFill: (acgraph.vector.PatternFill|Function),
 *    selectHatchFill: (acgraph.vector.PatternFill|Function),
 *    markerType: anychart.enums.MarkerType,
 *    anchor: anychart.enums.Anchor,
 *    offsetX: number,
 *    offsetY: number,
 *    size: number,
 *    hoverSize: number,
 *    selectSize: number
 * }}
 */
anychart.core.annotations.AnnotationJSONFormat;


//region Property sets for different annotation types
//----------------------------------------------------------------------------------------------------------------------
//
//  Property sets for different annotation types
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Properties that should be defined in annotation.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.BASE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.COLOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.COLOR,
      anychart.core.settings.colorNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.ALLOW_EDIT] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.ALLOW_EDIT,
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_INTERACTIVITY,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.HOVER_GAP] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.HOVER_GAP,
      anychart.core.settings.naturalNumberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support first X anchor.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.X_ANCHOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.X_ANCHOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.X_ANCHOR,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
      anychart.Signal.NEEDS_REDRAW);
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support first Value anchor.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.VALUE_ANCHOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.VALUE_ANCHOR,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
      anychart.Signal.NEEDS_REDRAW);
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support second anchor point.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.SECOND_X_ANCHOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.SECOND_X_ANCHOR,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SECOND_VALUE_ANCHOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.SECOND_VALUE_ANCHOR,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
      anychart.Signal.NEEDS_REDRAW);
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support third anchor point.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.THIRD_X_ANCHOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.THIRD_X_ANCHOR,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.THIRD_VALUE_ANCHOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.THIRD_VALUE_ANCHOR,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support stroke.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.STROKE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.STROKE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.STROKE,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.HOVER_STROKE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.HOVER_STROKE,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SELECT_STROKE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.SELECT_STROKE,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support trend stroke.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.TREND_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.TREND] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.TREND,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.HOVER_TREND] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.HOVER_TREND,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SELECT_TREND] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.SELECT_TREND,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support grid strokes.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.GRID_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.GRID] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.GRID,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.HOVER_GRID] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.HOVER_GRID,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SELECT_GRID] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.SELECT_TREND,
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support fill.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.FILL_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.FILL,
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.HOVER_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.HOVER_FILL,
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SELECT_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.SELECT_FILL,
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.HATCH_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.HATCH_FILL,
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.HOVER_HATCH_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.HOVER_HATCH_FILL,
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SELECT_HATCH_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.SELECT_HATCH_FILL,
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support marker annotation settings.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.MARKER_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.MARKER_TYPE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.MARKER_TYPE,
      anychart.enums.normalizeMarkerType,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.ANCHOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.ANCHOR,
      anychart.enums.normalizeAnchor,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.OFFSET_X] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.OFFSET_X,
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.OFFSET_Y] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.OFFSET_Y,
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SIZE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.SIZE,
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.HOVER_SIZE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.HOVER_SIZE,
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SELECT_SIZE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.SELECT_SIZE,
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
//endregion
