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
  map['color'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'color',
      anychart.core.settings.colorNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['allowEdit'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'allowEdit',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_INTERACTIVITY,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverGap'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hoverGap',
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
  map['xAnchor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'xAnchor',
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
  map['valueAnchor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'valueAnchor',
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
  map['secondXAnchor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'secondXAnchor',
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
      anychart.Signal.NEEDS_REDRAW);

  map['secondValueAnchor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'secondValueAnchor',
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
  map['thirdXAnchor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'thirdXAnchor',
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_ANCHORS,
      anychart.Signal.NEEDS_REDRAW);

  map['thirdValueAnchor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'thirdValueAnchor',
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
  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['selectStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectStroke',
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
  map['trend'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'trend',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverTrend'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverTrend',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['selectTrend'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectTrend',
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
  map['grid'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'grid',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverGrid'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverGrid',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['selectGrid'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectTrend',
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
  map['fill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['selectFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['hatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['selectHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectHatchFill',
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
  map['markerType'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'markerType',
      anychart.enums.normalizeMarkerType,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['anchor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'anchor',
      anychart.enums.normalizeAnchor,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['offsetX'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offsetX',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['offsetY'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offsetY',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['size'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'size',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hoverSize',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['selectSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'selectSize',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
//endregion
