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
  map[anychart.opt.COLOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.COLOR,
    normalizer: anychart.core.settings.colorNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.ALLOW_EDIT] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.ALLOW_EDIT,
    normalizer: anychart.core.settings.booleanNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_INTERACTIVITY,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.HOVER_GAP] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.HOVER_GAP,
    normalizer: anychart.core.settings.naturalNumberNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support first X anchor.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.X_ANCHOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.X_ANCHOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.X_ANCHOR,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support first Value anchor.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.VALUE_ANCHOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.VALUE_ANCHOR,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support second anchor point.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.SECOND_X_ANCHOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.SECOND_X_ANCHOR,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.SECOND_VALUE_ANCHOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.SECOND_VALUE_ANCHOR,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support third anchor point.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.THIRD_X_ANCHOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.THIRD_X_ANCHOR,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.THIRD_VALUE_ANCHOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.THIRD_VALUE_ANCHOR,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support stroke.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.STROKE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.STROKE] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.STROKE,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.HOVER_STROKE] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.HOVER_STROKE,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.SELECT_STROKE] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.SELECT_STROKE,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support trend stroke.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.TREND_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.TREND] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.TREND,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.HOVER_TREND] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.HOVER_TREND,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.SELECT_TREND] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.SELECT_TREND,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support grid strokes.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.GRID_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.GRID] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.GRID,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.HOVER_GRID] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.HOVER_GRID,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.SELECT_GRID] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.SELECT_TREND,
    normalizer: anychart.core.settings.strokeOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support fill.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.FILL_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.FILL] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.FILL,
    normalizer: anychart.core.settings.fillOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.HOVER_FILL] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.HOVER_FILL,
    normalizer: anychart.core.settings.fillOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.SELECT_FILL] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.SELECT_FILL,
    normalizer: anychart.core.settings.fillOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.HATCH_FILL] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.HATCH_FILL,
    normalizer: anychart.core.settings.hatchFillOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.HOVER_HATCH_FILL] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.HOVER_HATCH_FILL,
    normalizer: anychart.core.settings.hatchFillOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.SELECT_HATCH_FILL] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.SELECT_HATCH_FILL,
    normalizer: anychart.core.settings.hatchFillOrFunctionNormalizer,
    consistency: anychart.ConsistencyState.APPEARANCE,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();


/**
 * Properties that should be defined in annotation prototype to support marker annotation settings.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.MARKER_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.MARKER_TYPE] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.MARKER_TYPE,
    normalizer: anychart.enums.normalizeMarkerType,
    consistency: anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.ANCHOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.ANCHOR,
    normalizer: anychart.enums.normalizeAnchor,
    consistency: anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.OFFSET_X] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.OFFSET_X,
    normalizer: anychart.core.settings.numberNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.OFFSET_Y] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.OFFSET_Y,
    normalizer: anychart.core.settings.numberNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.SIZE] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.SIZE,
    normalizer: anychart.core.settings.numberNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.HOVER_SIZE] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.HOVER_SIZE,
    normalizer: anychart.core.settings.numberNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  map[anychart.opt.SELECT_SIZE] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.SELECT_SIZE,
    normalizer: anychart.core.settings.numberNormalizer,
    consistency: anychart.ConsistencyState.ANNOTATIONS_SHAPES,
    signal: anychart.Signal.NEEDS_REDRAW
  };
  return map;
})();
//endregion
