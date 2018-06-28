goog.provide('anychart.annotationsModule');

goog.require('anychart.core.Base');
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
anychart.annotationsModule.PropertyDescriptor;


/**
 * A set of possible anchor dependencies:
 *    1st bit is for the first X,
 *    2nd bit is for the first Y,
 *    3rd bit is for the second point,
 *    4th bit is for the third point
 * @enum {number}
 */
anychart.annotationsModule.AnchorSupport = {
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
anychart.annotationsModule.AnnotationTypes = {};


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
 *    trend: (acgraph.vector.Stroke|Function),
 *    grid: (acgraph.vector.Stroke|Function),
 *    fill: (acgraph.vector.Fill|Function),
 *    hatchFill: (acgraph.vector.PatternFill|Function),
 *    size: number,
 *    hovered: anychart.core.StateSettings,
 *    selected: anychart.core.StateSettings,
 *    markerType: anychart.enums.MarkerType,
 *    anchor: anychart.enums.Anchor,
 *    offsetX: number,
 *    offsetY: number
 * }}
 */
anychart.annotationsModule.AnnotationJSONFormat;


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
anychart.annotationsModule.BASE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'color',
      anychart.core.settings.colorNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'allowEdit',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hoverGap',
      anychart.core.settings.naturalNumberNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.BASE_DESCRIPTORS_META = (function() {
  return [
    ['color', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['allowEdit', anychart.ConsistencyState.ANNOTATIONS_INTERACTIVITY, anychart.Signal.NEEDS_REDRAW],
    ['hoverGap', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support first X anchor.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.annotationsModule.X_ANCHOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'xAnchor',
      anychart.core.settings.asIsNormalizer);
  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.X_ANCHOR_DESCRIPTORS_META = (function() {
  return [
    ['xAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS | anychart.ConsistencyState.ANNOTATIONS_LAST_POINT, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support first Value anchor.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'valueAnchor',
      anychart.core.settings.asIsNormalizer);
  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS_META = (function() {
  return [
    ['valueAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS | anychart.ConsistencyState.ANNOTATIONS_LAST_POINT, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support second anchor point.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'secondXAnchor',
      anychart.core.settings.asIsNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'secondValueAnchor',
      anychart.core.settings.asIsNormalizer);
  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS_META = (function() {
  return [
    ['secondXAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS | anychart.ConsistencyState.ANNOTATIONS_LAST_POINT, anychart.Signal.NEEDS_REDRAW],
    ['secondValueAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS | anychart.ConsistencyState.ANNOTATIONS_LAST_POINT, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support third anchor point.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'thirdXAnchor',
      anychart.core.settings.asIsNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'thirdValueAnchor',
      anychart.core.settings.asIsNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS_META = (function() {
  return [
    ['thirdXAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS | anychart.ConsistencyState.ANNOTATIONS_LAST_POINT, anychart.Signal.NEEDS_REDRAW],
    ['thirdValueAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS | anychart.ConsistencyState.ANNOTATIONS_LAST_POINT, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support marker annotation settings.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.annotationsModule.MARKER_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'markerType',
      anychart.enums.normalizeMarkerType);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'anchor',
      anychart.enums.normalizeAnchor);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offsetX',
      anychart.core.settings.numberNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offsetY',
      anychart.core.settings.numberNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.MARKER_DESCRIPTORS_META = (function() {
  return [
    ['markerType', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['anchor', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['offsetX', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['offsetY', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support label annotation settings.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.annotationsModule.LABEL_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = anychart.core.settings.createTextPropertiesDescriptors();
  // delete this properties because they are state properties (for proper serialization/deserialization)
  delete map['fontFamily'];
  delete map['fontStyle'];
  delete map['fontVariant'];
  delete map['fontWeight'];
  delete map['fontSize'];
  delete map['fontColor'];
  delete map['fontOpacity'];

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'text', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anychart.enums.normalizeAnchor],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrNullNormalizer]
  ]);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.LABEL_DESCRIPTORS_META = (function() {
  return [
    ['text', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['anchor', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['offsetX', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['offsetY', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['width', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['height', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();


//endregion
//region Descriptors state meta
//region --- STROKE
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.STROKE_DESCRIPTORS_META = (function() {
  return [
    ['stroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();


//endregion
//region --- TREND
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.TREND_DESCRIPTORS_META = (function() {
  return [
    ['trend', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ];
})();


//endregion
//region --- GRID
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.GRID_DESCRIPTORS_META = (function() {
  return [
    ['grid', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ];
})();


//endregion
//region --- FILL
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.FILL_DESCRIPTORS_META = (function() {
  return [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ];
})();


//endregion
//region --- MARKER
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.MARKER_DESCRIPTORS_STATE_META = (function() {
  return [
    ['size', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();


//endregion
//region --- LABEL
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.LABEL_DESCRIPTORS_STATE_META = (function() {
  return [
    ['fontFamily', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['fontStyle', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['fontVariant', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['fontWeight', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['fontSize', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['fontColor', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fontOpacity', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fontDecoration', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();


//endregion
//region --- FILL STROKE
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.FILL_STROKE_DESCRIPTORS_META = (function() {
  return goog.array.concat(anychart.annotationsModule.FILL_DESCRIPTORS_META, anychart.annotationsModule.STROKE_DESCRIPTORS_META);
})();


//endregion
//region --- STROKE TREND
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.STROKE_TREND_DESCRIPTORS_META = (function() {
  return goog.array.concat(anychart.annotationsModule.STROKE_DESCRIPTORS_META, anychart.annotationsModule.TREND_DESCRIPTORS_META);
})();


//endregion
//region --- LABELS
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.LABELS_DESCRIPTORS_META = (function() {
  return [
    ['labels', 0, 0]
  ];
})();


//endregion
//region --- MARKERS
/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.annotationsModule.MARKERS_DESCRIPTORS_META = (function() {
  return [
    ['markers', 0, 0]
  ];
})();


//endregion
//endregion
