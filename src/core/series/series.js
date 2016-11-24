goog.provide('anychart.core.series');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.enums');


/**
 * Series configuration enum. Values can be combined. STARTS ON anychart.core.drawers.Capabilities last flag number.
 * @enum {number}
 */
anychart.core.series.Capabilities = {
  ALLOW_INTERACTIVITY: 1 << 19,
  ALLOW_POINT_SETTINGS: 1 << 20,
  ALLOW_ERROR: 1 << 21,
  SUPPORTS_MARKERS: 1 << 22,
  SUPPORTS_LABELS: 1 << 23,
  /**
   * Combination of all states.
   */
  ANY: 0xFFFFFFFF
};


/**
 * Series type config.
 * @typedef {{
 *   drawerType: anychart.enums.SeriesDrawerTypes,
 *   shapeManagerType: anychart.enums.ShapeManagerTypes,
 *   shapesConfig: !Array.<anychart.core.shapeManagers.ShapeConfig>,
 *   secondaryShapesConfig: (undefined|Array.<anychart.core.shapeManagers.ShapeConfig>),
 *   postProcessor: (undefined|function(anychart.core.series.Base, Object.<string, acgraph.vector.Shape>)),
 *   capabilities: (anychart.core.series.Capabilities|number),
 *   anchoredPositionTop: string,
 *   anchoredPositionBottom: string
 * }}
 */
anychart.core.series.TypeConfig;


/**
 * Series points missing flag enum.
 * @enum {number}
 */
anychart.core.series.PointAbsenceReason = {
  // required value field is undefined or not valid due to scale
  VALUE_FIELD_MISSING: 1 << 0,
  // point is artificial
  ARTIFICIAL_POINT: 1 << 1,
  // point is excluded
  EXCLUDED_POINT: 1 << 2,
  // X value is out of visible range or SIZE is negative for bubble
  OUT_OF_RANGE: 1 << 3,

  EXCLUDED_OR_ARTIFICIAL: (1 << 1) | (1 << 2),
  ANY_BUT_RANGE: (1 << 0) | (1 << 1) | (1 << 2)
};


/**
 * Checks if the passed missingState is really missing. Can also check if the missingState is missing because of the
 * passed reason.
 * @param {number|anychart.core.series.PointAbsenceReason|undefined|*} missingState
 * @param {anychart.core.series.PointAbsenceReason|number} reasonFilter
 * @return {boolean} If the point is still missing.
 */
anychart.core.series.filterPointAbsenceReason = function(missingState, reasonFilter) {
  return !!((Number(missingState) || 0) & (reasonFilter || 0xff));
};


/**
 * Returns clarified mix of passed missing reasons.
 * @param {number|anychart.core.series.PointAbsenceReason|undefined|*} reason1
 * @param {number|anychart.core.series.PointAbsenceReason|undefined|*} reason2
 * @return {number}
 */
anychart.core.series.mixPointAbsenceReason = function(reason1, reason2) {
  return (Number(reason1) || 0) | (Number(reason2) || 0);
};

